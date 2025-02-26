from django.db import models
from django.utils.translation import gettext_lazy as _
from django.conf import settings
from django.apps import apps
from django.core.validators import MinLengthValidator
from django.core.exceptions import ObjectDoesNotExist
from typing import List, TYPE_CHECKING, Optional, Dict, Any

if TYPE_CHECKING:
    from tasks.models import LearningTask
    from users.models import User
    from core.services.course_status_service import CourseStatusService
    from core.services.version_control_service import VersionControlService


class InstructorRoleManager(models.Manager):
    """Manager for InstructorRole model."""

    def get_by_natural_key(self, role_name):
        return self.get(role_name=role_name)


class InstructorRole(models.Model):
    """Defines roles and permissions for course instructors."""

    class Meta:
        app_label = "learning"
        constraints = [
            models.UniqueConstraint(fields=["role_name"], name="unique_role_name")
        ]

    class StandardRoles(models.TextChoices):
        """Standard predefined instructor roles."""

        LEAD = "LEAD", _("Lead Instructor")
        ASSISTANT = "ASSISTANT", _("Assistant Instructor")
        GUEST = "GUEST", _("Guest Instructor")

    role_name = models.CharField(
        _("Role Name"), max_length=50, choices=StandardRoles.choices, unique=True
    )
    description = models.TextField(_("Role Description"), blank=True)
    can_edit_course = models.BooleanField(_("Can Edit Course"), default=False)
    can_manage_tasks = models.BooleanField(_("Can Manage Tasks"), default=False)
    can_grade_submissions = models.BooleanField(
        _("Can Grade Submissions"), default=False
    )

    objects = InstructorRoleManager()

    def __str__(self) -> str:
        return self.get_role_name_display()

    def get_role_name_display(self) -> str:
        """Returns the display name for the role."""
        return dict(self.StandardRoles.choices).get(self.role_name, self.role_name)


class CourseInstructorAssignmentManager(models.Manager):
    """Manager for CourseInstructorAssignment model."""

    def get_active_assignments(self, course=None):
        """
        Get all active instructor assignments, optionally filtered by course.
        
        :param course: Optional course to filter assignments by
        :return: QuerySet of active assignments
        """
        queryset = self.filter(is_active=True)
        if course:
            queryset = queryset.filter(course=course)
        return queryset
    
    def get_by_role(self, role_name, course=None):
        """
        Get assignments by role name, optionally filtered by course.
        
        :param role_name: Role name to filter by
        :param course: Optional course to filter assignments by
        :return: QuerySet of assignments with the specified role
        """
        queryset = self.filter(role__role_name=role_name, is_active=True)
        if course:
            queryset = queryset.filter(course=course)
        return queryset


class CourseInstructorAssignment(models.Model):
    """Tracks instructor assignments to courses with roles and dates."""

    class Meta:
        app_label = "learning"
        unique_together = ["course", "instructor"]

    course = models.ForeignKey(
        "Course", on_delete=models.CASCADE, related_name="instructor_assignments"
    )
    instructor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="course_instructor_assignments",
    )
    role = models.ForeignKey(
        InstructorRole, on_delete=models.PROTECT, related_name="course_assignments"
    )
    assigned_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    objects = CourseInstructorAssignmentManager()

    def __str__(self) -> str:
        return f"{self.instructor} - {self.role} for {self.course}"


class CourseManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset()


class Course(models.Model):
    """Enhanced Course model with multi-instructor support, status tracking, and comprehensive metadata."""

    class Meta:
        app_label = "learning"
        unique_together = ["title", "version"]

    class Status(models.TextChoices):
        """Enumeration of possible course statuses."""

        DRAFT = "DRAFT", _("Draft")
        PUBLISHED = "PUBLISHED", _("Published")
        ARCHIVED = "ARCHIVED", _("Archived")
        DEPRECATED = "DEPRECATED", _("Deprecated")

    class Visibility(models.TextChoices):
        """Enumeration of course visibility levels."""

        PRIVATE = "PRIVATE", _("Private")
        INTERNAL = "INTERNAL", _("Internal")
        PUBLIC = "PUBLIC", _("Public")

    title = models.CharField(
        _("Course Title"), max_length=200, validators=[MinLengthValidator(3)]
    )
    description = models.TextField(_("Course Description"), blank=True)
    instructors = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name="courses_taught",
        through="CourseInstructorAssignment",
        blank=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Existing fields...
    version = models.PositiveIntegerField(
        _("Current Version"),
        default=1,
        help_text=_("Current version number of the course"),
    )
    created_from = models.ForeignKey(
        "self",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="derived_versions",
        help_text=_("Original course this was created from"),
    )
    version_notes = models.TextField(_("Version Notes"), blank=True)
    status = models.CharField(
        _("Course Status"), max_length=20, choices=Status.choices, default=Status.DRAFT
    )
    visibility = models.CharField(
        _("Course Visibility"),
        max_length=20,
        choices=Visibility.choices,
        default=Visibility.PRIVATE,
    )
    learning_objectives = models.TextField(
        _("Learning Objectives"),
        blank=True,
        help_text=_("Detailed learning objectives for the course"),
    )
    prerequisites = models.TextField(
        _("Prerequisites"),
        blank=True,
        help_text=_("Required knowledge or courses before taking this course"),
    )

    # Relationship with tasks
    tasks = models.ManyToManyField(
        "tasks.LearningTask", related_name="courses", blank=True
    )

    objects = CourseManager()

    def __str__(self) -> str:
        """String representation of the Course model."""
        return f"{self.title} (v{self.version})"

    def get_instructors_by_role(self, role: str) -> List["User"]:
        """Retrieve instructors for the course with a specific role.

        :param role: Role to filter instructors by
        :return: List of instructors with the specified role
        """
        # Use the manager method for better reusability and caching potential
        assignments = CourseInstructorAssignment.objects.get_by_role(role, self)
        return list(
            assignments.select_related("instructor")
            .values_list("instructor", flat=True)
        )

    def add_instructor(self, user: "User", role: str) -> "CourseInstructorAssignment":
        """Add an instructor to the course with a specific role.

        :param user: User to add as an instructor
        :param role: Role for the instructor
        :return: Created CourseInstructorAssignment instance
        """
        role_obj = InstructorRole.objects.get(role_name=role)
        return CourseInstructorAssignment.objects.create(
            course=self, instructor=user, role=role_obj
        )

    def remove_instructor(self, user: "User") -> None:
        """Remove an instructor from the course.

        :param user: User to remove from instructors
        """
        CourseInstructorAssignment.objects.filter(course=self, instructor=user).update(
            is_active=False
        )

    def update_instructor_role(
        self, user: "User", new_role: str
    ) -> "CourseInstructorAssignment":
        """Update an instructor's role for the course.

        :param user: User whose role is being updated
        :param new_role: New role for the instructor
        :return: Updated CourseInstructorAssignment instance
        """
        assignment = CourseInstructorAssignment.objects.get(
            course=self, instructor=user, is_active=True
        )
        new_role_obj = InstructorRole.objects.get(role_name=new_role)
        assignment.role = new_role_obj
        assignment.save()
        return assignment

    def has_instructor_permission(self, user: "User", permission: str) -> bool:
        """Check if an instructor has a specific permission for the course.

        :param user: User to check permissions for
        :param permission: Permission to check
        :return: Boolean indicating if the user has the specified permission
        """
        try:
            assignment = CourseInstructorAssignment.objects.get(
                course=self, instructor=user, is_active=True
            )
            role = assignment.role

            permission_map = {
                "edit_course": "can_edit_course",
                "manage_tasks": "can_manage_tasks",
                "grade_submissions": "can_grade_submissions",
            }

            return getattr(role, permission_map.get(permission, ""), False)
        except models.ObjectDoesNotExist:
            return False

    def get_total_tasks(self) -> int:
        """Returns the total number of tasks in the course."""
        # Revert to original implementation to avoid Pylint errors
        return self.tasks.model.objects.filter(courses=self).count()

    def get_learning_tasks(self) -> List["LearningTask"]:
        """Returns all learning tasks for this course."""
        # Add select_related for better performance
        return list(self.tasks.model.objects.filter(courses=self).select_related('created_by'))

    def increment_version(self):
        """Increment the course version when significant changes are made."""
        self.version += 1
        self.save()

    def can_transition_to(self, new_status: str) -> bool:
        """Checks if course can transition to the given status.

        :param new_status: Target status to transition to
        :return: Boolean indicating if transition is allowed
        """
        # Import the service directly
        from core.services.course_status_service import CourseStatusService
        
        service = CourseStatusService(self)
        return service.can_transition_to(new_status)

    def transition_to(self, new_status: str, reason: str, user) -> None:
        """Transitions course to new status with validation.

        :param new_status: Target status to transition to
        :param reason: Reason for the status change
        :param user: User initiating the transition
        """
        # Import the service directly
        from core.services.course_status_service import CourseStatusService
        
        service = CourseStatusService(self)
        service.transition_to(new_status, reason, user)

    def get_status_history(self):
        """Returns the complete status transition history.

        :return: QuerySet of status transitions
        """
        # Use direct reference to avoid circular import
        return StatusTransition.objects.filter(course=self).order_by("-changed_at")

    def get_allowed_transitions(self):
        """Returns list of allowed status transitions.

        :return: List of allowed status transitions
        """
        # Import the service directly
        from core.services.course_status_service import CourseStatusService

        service = CourseStatusService(self)
        return service.get_allowed_transitions()


class StatusTransition(models.Model):
    """Tracks the history of course status changes with metadata."""

    class Meta:
        app_label = "learning"
        ordering = ["-changed_at"]
        verbose_name_plural = "Status Transitions"

    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name="status_transitions",
        verbose_name=_("Course"),
    )
    from_status = models.CharField(
        _("From Status"), max_length=20, choices=Course.Status.choices
    )
    to_status = models.CharField(
        _("To Status"), max_length=20, choices=Course.Status.choices
    )
    changed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        verbose_name=_("Changed By"),
    )
    changed_at = models.DateTimeField(_("Changed At"), auto_now_add=True)
    reason = models.TextField(_("Transition Reason"), blank=True)

    objects = models.Manager()

    def __str__(self):
        return (
            f"{self.course} status changed from {self.from_status} to {self.to_status}"
        )


class CourseVersionManager(models.Manager):
    """Manager for CourseVersion model."""

    def get_latest_for_course(self, course):
        """Get the latest version for a course."""
        return self.filter(course=course).order_by("-version_number").first()


class CourseVersion(models.Model):
    """Tracks version history for courses with content snapshots."""

    class Meta:
        app_label = "learning"
        unique_together = ["course", "version_number"]
        ordering = ["-version_number"]
        get_latest_by = "version_number"

    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name="versions",
        verbose_name=_("Course"),
    )
    version_number = models.PositiveIntegerField(
        _("Version Number"), help_text=_("Sequential version number for this course")
    )
    created_at = models.DateTimeField(_("Created At"), auto_now_add=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        verbose_name=_("Created By"),
        related_name="course_versions_created",
    )
    notes = models.TextField(
        _("Version Notes"),
        blank=True,
        help_text=_("Notes about changes in this version"),
    )
    content_snapshot = models.JSONField(
        _("Content Snapshot"),
        help_text=_("Snapshot of course content at this version"),
        default=dict
    )

    objects = CourseVersionManager()

    def __str__(self) -> str:
        return f"{self.course} v{self.version_number}"

    def get_changes_from_previous(self) -> Optional[Dict[str, Any]]:
        """Get changes between this version and the previous one.

        Returns:
            Dict of changes or None if this is the first version
        """
        previous = (
            CourseVersion.objects.filter(
                course=self.course, version_number__lt=self.version_number
            )
            .order_by("-version_number")
            .first()
        )

        if not previous:
            return None

        # Import the service using relative import
        from core.services.version_control_service import VersionControlService

        service = VersionControlService(self.course)
        # Use compare_versions method instead of _compare_snapshots
        # This is a public method that should be available
        return service.compare_versions(previous, self)

    def is_current(self) -> bool:
        """Returns whether this is the current version of the course."""
        # Use a more Django-idiomatic approach to check if this is the current version
        # This avoids direct ForeignKey access issues
        
        # Get the course's current version from the database
        from django.db.models import F
        
        # Use a query that doesn't rely on accessing self.course directly
        course_version = Course.objects.filter(
            versions__pk=self.pk  # Use the reverse relation with pk instead of id
        ).values_list('version', flat=True).first()
        
        return self.version_number == course_version

    def save(self, *args, **kwargs):
        """Override save to ensure validation is called."""
        self.full_clean()
        super().save(*args, **kwargs)

    objects = CourseVersionManager()

    def __str__(self) -> str:
        return f"{self.course} v{self.version_number}"

    def get_changes_from_previous(self) -> Optional[Dict[str, Any]]:
        """Get changes between this version and the previous one.

        Returns:
            Dict of changes or None if this is the first version
        """
        previous = (
            CourseVersion.objects.filter(
                course=self.course, version_number__lt=self.version_number
            )
            .order_by("-version_number")
            .first()
        )

        if not previous:
            return None

        # Import the service using relative import
        from core.services.version_control_service import VersionControlService

        service = VersionControlService(self.course)
        # Use compare_versions method instead of _compare_snapshots
        # This is a public method that should be available
        return service.compare_versions(previous, self)

    def is_current(self) -> bool:
        """Returns whether this is the current version of the course."""
        # Use a more Django-idiomatic approach to check if this is the current version
        # This avoids direct ForeignKey access issues
        
        # Get the course's current version from the database
        from django.db.models import F
        
        # Use a query that doesn't rely on accessing self.course directly
        course_version = Course.objects.filter(
            versions__pk=self.pk  # Use the reverse relation with pk instead of id
        ).values_list('version', flat=True).first()
        
        return self.version_number == course_version
