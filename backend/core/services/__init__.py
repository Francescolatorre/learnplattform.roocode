"""
Core services package.
"""
from .assessment_service import AssessmentService
from .exceptions import (
    ServiceError,
    NotAuthorizedError,
    SubmissionNotFoundError,
    QuizNotFoundError,
    TaskNotFoundError,
    DuplicateTaskError,
    ProgressNotFoundError,
    TaskNotInQuizError
)

__all__ = [
    'AssessmentService',
    'ServiceError',
    'NotAuthorizedError',
    'SubmissionNotFoundError',
    'QuizNotFoundError',
    'TaskNotFoundError',
    'DuplicateTaskError',
    'ProgressNotFoundError',
    'TaskNotInQuizError'
]