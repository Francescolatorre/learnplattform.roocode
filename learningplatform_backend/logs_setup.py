import json
import logging
import logging.config
import os

# Create logs directory if it doesn't exist
logs_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "logs")
if not os.path.exists(logs_dir):
    os.makedirs(logs_dir)
    print(f"Logs directory created at: {logs_dir}")

# Define the logging configuration
LOGGING_CONFIG = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "verbose": {
            "format": "{levelname} {asctime} {module} {process:d} {thread:d} {message}",
            "style": "{",
        },
        "simple": {
            "format": "{levelname} {asctime} {message}",
            "style": "{",
        },
    },
    "handlers": {
        "console": {
            "level": "DEBUG",
            "class": "logging.StreamHandler",
            "formatter": "simple",
        },
        "file": {
            "level": "DEBUG",
            "class": "logging.handlers.RotatingFileHandler",
            "filename": os.path.join(logs_dir, "debug.log"),
            "formatter": "verbose",
            "maxBytes": 10485760,  # 10MB
            "backupCount": 5,
        },
        "auth_file": {
            "level": "DEBUG",
            "class": "logging.handlers.RotatingFileHandler",
            "filename": os.path.join(logs_dir, "auth.log"),
            "formatter": "verbose",
            "maxBytes": 10485760,  # 10MB
            "backupCount": 5,
        },
        "api_file": {
            "level": "DEBUG",
            "class": "logging.handlers.RotatingFileHandler",
            "filename": os.path.join(logs_dir, "api.log"),
            "formatter": "verbose",
            "maxBytes": 10485760,  # 10MB
            "backupCount": 5,
        },
    },
    "loggers": {
        "django": {
            "handlers": ["console", "file"],
            "level": "INFO",
            "propagate": True,
        },
        "django.request": {
            "handlers": ["console", "file"],
            "level": "DEBUG",
            "propagate": False,
        },
        "django.server": {
            "handlers": ["console", "file"],
            "level": "DEBUG",
            "propagate": False,
        },
        "auth": {
            "handlers": ["auth_file"],
            "level": "DEBUG",
            "propagate": False,
        },
        "api": {
            "handlers": ["api_file"],
            "level": "DEBUG",
            "propagate": False,
        },
    },
}

# Apply the logging configuration
logging.config.dictConfig(LOGGING_CONFIG)

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
    except Exception as e:
        logger.warning("Failed to decode response body: %s", str(e))

    # Log the response data
    try:
        logger.info(f"Response sent: {json.dumps(response_data)}")
    except Exception as e:
        logger.error(f"Failed to log response: {str(e)}")

    return response_data


# Print logging setup confirmation
print(f"Logging configured. Log files will be written to: {logs_dir}")
print(f"Available log files:")
print(f"  - {os.path.join(logs_dir, 'debug.log')}")
print(f"  - {os.path.join(logs_dir, 'auth.log')}")
print(f"  - {os.path.join(logs_dir, 'api.log')}")

# Test logging
# django_logger.info("Test log entry for Django logger.")
# auth_logger.info("Test log entry for Auth logger.")
# api_logger.info("Test log entry for API logger.")
