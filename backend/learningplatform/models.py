from django.conf import settings
from django.contrib.auth.models import AbstractUser, Group, Permission
from django.db import models
from django.utils.translation import gettext_lazy as _


class User(AbstractUser):
    """
    Custom User model for the Learning Platform
    """

    class Meta:
        app_label = "learningplatform"
        verbose_name = "Platform User"
        verbose_name_plural = "Platform Users"

    groups = models.ManyToManyField(
        Group,
        verbose_name=_("groups"),
        blank=True,
        help_text=_(
            "The groups this user belongs to. A user will get all permissions "
            "granted to each of their groups."
        ),
        related_name="learningplatform_user_set",
        related_query_name="learningplatform_user",
    )

    user_permissions = models.ManyToManyField(
        Permission,
        verbose_name=_("user permissions"),
        blank=True,
        help_text=_("Specific permissions for this user."),
        related_name="learningplatform_user_set",
        related_query_name="learningplatform_user",
    )

    # Optional: Conditionally add profile_picture only if Pillow is available
    try:
        from PIL import Image

        profile_picture = models.ImageField(
            _("Profile Picture"),
            upload_to="platform_profile_pictures/",
            null=True,
            blank=True,
        )
    except ImportError:
        # Placeholder field if Pillow is not installed
        profile_picture = models.CharField(
            _("Profile Picture URL"), max_length=255, null=True, blank=True
        )


class Course(models.Model):
    """
    Represents a learning course in the platform
    """

    class Status(models.TextChoices):
        DRAFT = "DRAFT", _("Draft")
        PUBLISHED = "PUBLISHED", _("Published")
        ARCHIVED = "ARCHIVED", _("Archived")

    class Visibility(models.TextChoices):
        PRIVATE = "PRIVATE", _("Private")
        PUBLIC = "PUBLIC", _("Public")
        RESTRICTED = "RESTRICTED", _("Restricted")

    title = models.CharField(_("Course Title"), max_length=255)
    description = models.TextField(_("Course Description"), blank=True)
    instructor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="learningplatform_courses_instructed",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.DRAFT
    )
    visibility = models.CharField(
        max_length=20, choices=Visibility.choices, default=Visibility.PRIVATE
    )

    learning_objectives = models.TextField(
        _("Learning Objectives"),
        blank=True,
        default="No specific learning objectives defined.",
    )
    prerequisites = models.TextField(
        _("Prerequisites"), blank=True, default="No prerequisites specified."
    )

    duration = models.DurationField(_("Course Duration"), null=True, blank=True)
    difficulty_level = models.CharField(
        max_length=50,
        choices=[
            ("BEGINNER", _("Beginner")),
            ("INTERMEDIATE", _("Intermediate")),
            ("ADVANCED", _("Advanced")),
        ],
        default="BEGINNER",
    )

    class Meta:
        app_label = "learningplatform"
        verbose_name = _("Platform Course")
        verbose_name_plural = _("Platform Courses")
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["instructor", "status"]),
            models.Index(fields=["created_at"]),
            models.Index(fields=["difficulty_level"]),
        ]

    def __str__(self):
        return str(self.title)


class Task(models.Model):
    """
    Represents a generic task in the learning platform
    """

    title = models.CharField(_("Task Title"), max_length=255)
    description = models.TextField(_("Task Description"), blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="learningplatform_created_tasks",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # New fields from old task models
    difficulty_level = models.CharField(
        max_length=50,
        choices=[
            ("BEGINNER", _("Beginner")),
            ("INTERMEDIATE", _("Intermediate")),
            ("ADVANCED", _("Advanced")),
        ],
        default="BEGINNER",
    )
    max_score = models.DecimalField(
        max_digits=5, decimal_places=2, null=True, blank=True
    )
    passing_score = models.DecimalField(
        max_digits=5, decimal_places=2, null=True, blank=True
    )
    time_limit = models.IntegerField(null=True, blank=True)
    is_randomized = models.BooleanField(default=False)

    class Meta:
        app_label = "learningplatform"
        verbose_name = _("Platform Task")
        verbose_name_plural = _("Platform Tasks")
        ordering = ["-created_at"]

    def __str__(self):
        return str(self.title)


class Submission(models.Model):
    """
    Represents a submission for a task
    """

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="learningplatform_submissions",
    )
    task = models.ForeignKey(
        Task, on_delete=models.CASCADE, related_name="learningplatform_submissions"
    )
    submitted_at = models.DateTimeField(auto_now_add=True)
    content = models.TextField(_("Submission Content"), blank=True)

    class Meta:
        app_label = "learningplatform"
        unique_together = ("user", "task")
        verbose_name = _("Platform Submission")
        verbose_name_plural = _("Platform Submissions")

    def __str__(self):
        return f"{self.user.username} - {self.task.title}"
