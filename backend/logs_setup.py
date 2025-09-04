"""
Logging configuration for the Learning Platform.

This module configures logging for different aspects of the application:
- API request logging
- Authentication and authorization logging
- Debug information
- Django system logs

The configuration supports different log levels, formatters, and handlers
for development and production environments.
"""

import json
import logging
import logging.config
from pathlib import Path

# Use the current directory for logs
BASE_DIR = Path(__file__).resolve().parent

# Create logs directory if it doesn't exist
LOGS_DIR = BASE_DIR / "logs"
LOGS_DIR.mkdir(exist_ok=True)

# Define log file paths
API_LOG = LOGS_DIR / "api.log"
AUTH_LOG = LOGS_DIR / "auth.log"
DEBUG_LOG = LOGS_DIR / "debug.log"
DJANGO_LOG = LOGS_DIR / "django.log"

# Create log files if they don't exist
for log_file in [API_LOG, AUTH_LOG, DEBUG_LOG, DJANGO_LOG]:
    log_file.touch(exist_ok=True)

# Common formatters for logging
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "verbose": {
            "format": "%(asctime)s [%(levelname)s] %(name)s:%(lineno)d - %(message)s",
            "datefmt": "%Y-%m-%d %H:%M:%S",
        },
        "simple": {"format": "%(levelname)s %(message)s"},
    },
    "handlers": {
        "api_file": {
            "level": "INFO",
            "class": "logging.FileHandler",
            "filename": str(API_LOG),
            "formatter": "verbose",
        },
        "auth_file": {
            "level": "INFO",
            "class": "logging.FileHandler",
            "filename": str(AUTH_LOG),
            "formatter": "verbose",
        },
        "debug_file": {
            "level": "DEBUG",
            "class": "logging.FileHandler",
            "filename": str(DEBUG_LOG),
            "formatter": "verbose",
        },
        "django_file": {
            "level": "INFO",
            "class": "logging.FileHandler",
            "filename": str(DJANGO_LOG),
            "formatter": "verbose",
        },
        "console": {
            "level": "DEBUG",
            "class": "logging.StreamHandler",
            "formatter": "simple",
        },
    },
    "loggers": {
        "django": {
            "handlers": ["django_file", "console"],
            "level": "INFO",
            "propagate": True,
        },
        "django.request": {
            "handlers": ["django_file"],
            "level": "INFO",
            "propagate": False,
        },
        "core.api": {
            "handlers": ["api_file", "console"],
            "level": "INFO",
            "propagate": False,
        },
        "core.auth": {
            "handlers": ["auth_file", "console"],
            "level": "INFO",
            "propagate": False,
        },
        "debug": {
            "handlers": ["debug_file", "console"],
            "level": "DEBUG",
            "propagate": False,
        },
    },
}

# Apply the logging configuration
logging.config.dictConfig(LOGGING)

# Debug print to list handlers (useful for troubleshooting)
for logger_name in ["django", "auth", "api"]:
    logger = logging.getLogger(logger_name)
    print(f"Logger '{logger_name}' handlers: {logger.handlers}")

# Create logger instances
django_logger = logging.getLogger("django")
auth_logger = logging.getLogger("auth")
api_logger = logging.getLogger("api")

print("Logging configuration applied successfully.")


def log_request(request, logger=None, log_headers=True):
    """
    Logs the details of an incoming request.

    Args:
        request: The Django request object.
        logger: Optional logger to use for logging.
        log_headers: Boolean flag to enable/disable logging of headers.

    Returns:
        dict: A dictionary containing logged request data.
    """
    logger = logger or logging.getLogger("request")
    request_data = {
        "method": request.method,
        "path": request.path,
        "body": None,  # Default to None
    }

    # Log the body only for methods that typically include a payload
    if request.method in {"POST", "PUT", "PATCH"}:
        request_data["body"] = request.body.decode("utf-8") if request.body else None

    if log_headers:
        sensitive_headers = {"Authorization", "Cookie"}
        request_data["headers"] = {
            k: (v if k not in sensitive_headers else "[FILTERED]")
            for k, v in request.headers.items()
        }
    else:
        request_data["headers"] = "[HEADERS NOT LOGGED]"

    logger.info("Request Data: %s", json.dumps(request_data))
    return request_data


def log_response(response, request_data=None, logger=None):
    """
    Log details about an HTTP response.

    Args:
        response: The Django response object.
        request_data: Optional dictionary of request data.
        logger: Optional logger to use (defaults to api_logger).

    Returns:
        dict: Dictionary containing response data.
    """
    if logger is None:
        logger = api_logger

    # Skip logging auth-related paths in api.log
    auth_paths = [
        "/auth/login/",
        "/auth/logout/",
        "/auth/token/refresh/",
        "/auth/register/",
    ]
    if request_data and any(
        request_data.get("path", "").startswith(path) for path in auth_paths
    ):
        return {}

    # Create a dictionary of response information
    response_data = {
        "status_code": response.status_code,
        "reason": getattr(response, "reason_phrase", ""),
        "content_type": response.get("Content-Type", "text/html"),
        "body": None,  # Default to None
        "request": request_data or {},
    }

    # Log the response body if it exists and is JSON
    try:
        if response.get("Content-Type", "").startswith("application/json"):
            response_data["body"] = json.loads(response.content.decode("utf-8"))
        else:
            response_data["body"] = response.content.decode("utf-8")
    except Exception:
        logger.info("Response sent: %s", json.dumps(response_data))
    except Exception as e:
        logger.error("Failed to log response: %s", str(e))

    return response_data
