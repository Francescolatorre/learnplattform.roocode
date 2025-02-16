"""
Custom exceptions for the service layer.
"""

class ServiceError(Exception):
    """Base class for service layer exceptions."""

class NotAuthorizedError(ServiceError):
    """Raised when a user is not authorized to perform an action."""

class SubmissionNotFoundError(ServiceError):
    """Raised when a submission cannot be found."""

class QuizNotFoundError(ServiceError):
    """Raised when a quiz cannot be found."""

class TaskNotFoundError(ServiceError):
    """Raised when a task cannot be found."""

class DuplicateTaskError(ServiceError):
    """Raised when attempting to add a duplicate task to a quiz."""

class ProgressNotFoundError(ServiceError):
    """Raised when a progress record cannot be found."""

class TaskNotInQuizError(ServiceError):
    """Raised when attempting to mark a task complete that isn't in the quiz."""