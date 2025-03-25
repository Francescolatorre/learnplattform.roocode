LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "verbose": {
            "format": "{levelname} {asctime} {module} {message}",
            "style": "{",
        },
        "simple": {
            "format": "{levelname} {message}",
            "style": "{",
        },
    },
    "handlers": {
        "file_debug": {
            "level": "DEBUG",
            "class": "logging.FileHandler",
            "filename": "logs/debug.log",
            "formatter": "verbose",
        },
        "file_api": {
            "level": "INFO",
            "class": "logging.FileHandler",
            "filename": "logs/api.log",
            "formatter": "verbose",
        },
        "file_auth": {
            "level": "INFO",
            "class": "logging.FileHandler",
            "filename": "logs/auth.log",
            "formatter": "verbose",
        },
        "console": {
            "level": "WARNING",
            "class": "logging.StreamHandler",
            "formatter": "simple",
        },
    },
    "loggers": {
        "django": {
            "handlers": ["console"],
            "level": "WARNING",
            "propagate": True,
        },
        "core.views": {
            "handlers": ["file_debug", "file_api"],
            "level": "DEBUG",
            "propagate": False,
        },
        "core.permissions": {
            "handlers": ["file_auth"],
            "level": "INFO",
            "propagate": False,
        },
    },
}
