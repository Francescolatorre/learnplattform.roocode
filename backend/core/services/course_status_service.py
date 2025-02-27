from django.core.exceptions import ValidationError
from django.contrib.auth import get_user_model

# Try both import paths to handle different environments
try:
    from courses.models import Course
except ImportError:
    try:
        from backend.courses.models import Course
    except ImportError:
        # Define a placeholder for Course to allow module loading
        from django.db import models
        class Course:
            class Status:
                DRAFT = 'DRAFT'
                PUBLISHED = 'PUBLISHED'
                ARCHIVED = 'ARCHIVED'
                DEPRECATED = 'DEPRECATED'
            class Visibility:
                PRIVATE = 'PRIVATE'

# Try both import paths for StatusTransition
try:
    from learning.models import StatusTransition as StatusTransitionModel
except ImportError:
    try:
        from backend.learning.models import StatusTransition as StatusTransitionModel
    except ImportError:
        # Define a placeholder for StatusTransitionModel
        from django.db import models
        class StatusTransitionModel:
            objects = models.Manager()

User = get_user_model()

class CourseStatusService:
    """
    Handles course status transitions and enforces business rules.
    """

    def __init__(self, course):
        """
        Initialize the service with a specific course.

        :param course: The Course instance to manage
        """
        self.course = course

    def can_transition_to(self, new_status: str) -> bool:
        """
        Validates if a status transition is allowed based on current status.

        :param new_status: The target status to transition to
        :return: Boolean indicating if the transition is allowed
        """
        ALLOWED_TRANSITIONS = {
            Course.Status.DRAFT: [Course.Status.PUBLISHED],
            Course.Status.PUBLISHED: [Course.Status.ARCHIVED, Course.Status.DEPRECATED],
            Course.Status.ARCHIVED: [Course.Status.PUBLISHED, Course.Status.DEPRECATED],
            Course.Status.DEPRECATED: []  # Terminal state
        }
        return new_status in ALLOWED_TRANSITIONS.get(self.course.status, [])

    def validate_transition(self, new_status: str):
        """
        Validates course state for the requested transition.

        :param new_status: The target status to transition to
        :raises ValidationError: If transition is not valid
        """
        if new_status == Course.Status.PUBLISHED:
            # Validate course completeness
            if not self._is_course_complete():
                raise ValidationError("Course must be complete before publishing")

        if new_status in [Course.Status.ARCHIVED, Course.Status.DEPRECATED]:
            # Additional validation for archiving/deprecating
            if self.course.status == Course.Status.DRAFT:
                raise ValidationError("Cannot archive or deprecate a draft course")

    def transition_to(self, new_status: str, reason: str, user: User) -> None:
        """
        Executes the status transition if allowed.

        :param new_status: The target status to transition to
        :param reason: Reason for the status change
        :param user: User initiating the transition
        :raises ValidationError: If transition is not valid
        """
        if not self.can_transition_to(new_status):
            raise ValidationError(f"Cannot transition from {self.course.status} to {new_status}")

        self.validate_transition(new_status)

        # Create transition record
        status_transition = StatusTransitionModel.objects.create(
            course=self.course,
            from_status=self.course.status,
            to_status=new_status,
            changed_by=user,
            reason=reason
        )

        # Update course status
        old_status = self.course.status
        self.course.status = new_status

        # Handle visibility changes
        if new_status == Course.Status.DEPRECATED:
            self.course.visibility = Course.Visibility.PRIVATE

        self.course.save()

    def _is_course_complete(self) -> bool:
        """
        Validates if course has all required components.

        :return: Boolean indicating course completeness
        """
        # Comprehensive course completeness validation
        checks = [
            bool(self.course.title),
            bool(self.course.description),
            hasattr(self.course, 'learning_objectives') and bool(self.course.learning_objectives),
            hasattr(self.course, 'instructors') and self.course.instructors.exists(),
            hasattr(self.course, 'tasks') and self.course.tasks.exists()
        ]

        return all(checks)

    def get_status_history(self):
        """
        Retrieves the complete status transition history for the course.

        :return: QuerySet of StatusTransition instances
        """
        return self.course.status_transitions.all().order_by('-changed_at')

    def get_allowed_transitions(self):
        """
        Returns list of allowed status transitions for the current course status.

        :return: List of allowed status transitions
        """
        return [
            status for status in Course.Status
            if self.can_transition_to(status)
        ]
