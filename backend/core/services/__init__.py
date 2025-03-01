"""
Core services package.
"""
from .assessment_service import AssessmentService

# Import exceptions with error handling to avoid Pylint errors
try:
    from .exceptions import (DuplicateTaskError, NotAuthorizedError,
                             ProgressNotFoundError, QuizNotFoundError,
                             ServiceError, SubmissionNotFoundError,
                             TaskNotFoundError, TaskNotInQuizError,
                             VersionControlError)
except ImportError:
    # Define placeholder classes if imports fail
    # This helps with circular imports and Pylint errors
    class ServiceError(Exception): pass
    class NotAuthorizedError(Exception): pass
    class SubmissionNotFoundError(Exception): pass
    class QuizNotFoundError(Exception): pass
    class TaskNotFoundError(Exception): pass
    class DuplicateTaskError(Exception): pass
    class ProgressNotFoundError(Exception): pass
    class TaskNotInQuizError(Exception): pass
    class VersionControlError(Exception): pass

# Service registry to avoid circular imports
_SERVICE_REGISTRY = {}

def register_service(name, service_class):
    """
    Register a service in the service registry.
    
    :param name: Name of the service
    :param service_class: Service class to register
    """
    _SERVICE_REGISTRY[name] = service_class

def get_service(name):
    """
    Get a service from the registry.
    
    :param name: Name of the service to retrieve
    :return: Service class
    :raises KeyError: If service is not registered
    """
    if name not in _SERVICE_REGISTRY:
        # Lazy import services to avoid circular imports
        if name == 'course_status':
            from .course_status_service import CourseStatusService
            register_service('course_status', CourseStatusService)
        elif name == 'version_control':
            from .version_control_service import VersionControlService
            register_service('version_control', VersionControlService)
        else:
            raise KeyError(f"Service '{name}' not found in registry")
    
    return _SERVICE_REGISTRY[name]

__all__ = [
    'AssessmentService',
    'ServiceError',
    'NotAuthorizedError',
    'SubmissionNotFoundError',
    'QuizNotFoundError',
    'TaskNotFoundError',
    'DuplicateTaskError',
    'ProgressNotFoundError',
    'TaskNotInQuizError',
    'register_service',
    'get_service'
]
