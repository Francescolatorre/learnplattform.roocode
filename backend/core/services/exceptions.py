"""
Service layer exceptions.
"""


class ServiceError(Exception):
    """Base exception for all service layer errors."""
    pass


class NotAuthorizedError(ServiceError):
    """Raised when a user is not authorized to perform an action."""
    pass


class SubmissionNotFoundError(ServiceError):
    """Raised when a submission is not found."""
    pass


class QuizNotFoundError(ServiceError):
    """Raised when a quiz is not found."""
    pass


class TaskNotFoundError(ServiceError):
    """Raised when a task is not found."""
    pass


class DuplicateTaskError(ServiceError):
    """Raised when attempting to create a duplicate task."""
    pass


class ProgressNotFoundError(ServiceError):
    """Raised when progress is not found."""
    pass


class TaskNotInQuizError(ServiceError):
    """Raised when a task is not part of a quiz."""
    pass


class VersionControlError(ServiceError):
    """Custom exception for version control errors."""
    pass
