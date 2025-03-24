import json
import logging
import logging.config
import os

# Create logs directory if it doesn't exist
logs_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'logs')
if not os.path.exists(logs_dir):
    os.makedirs(logs_dir)

# Define the logging configuration
LOGGING_CONFIG = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
        'simple': {
            'format': '{levelname} {asctime} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'level': 'DEBUG',
            'class': 'logging.StreamHandler',
            'formatter': 'simple',
        },
        'file': {
            'level': 'DEBUG',
            'class': 'logging.FileHandler',
            'filename': os.path.join(logs_dir, 'debug.log'),
            'formatter': 'verbose',
        },
        'auth_file': {
            'level': 'DEBUG',
            'class': 'logging.FileHandler',
            'filename': os.path.join(logs_dir, 'auth.log'),
            'formatter': 'verbose',
        },
        'api_file': {
            'level': 'DEBUG',
            'class': 'logging.FileHandler',
            'filename': os.path.join(logs_dir, 'api.log'),
            'formatter': 'verbose',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['console', 'file'],
            'level': 'INFO',
            'propagate': True,
        },
        'django.request': {
            'handlers': ['console', 'file'],
            'level': 'DEBUG',
            'propagate': False,
        },
        'django.server': {
            'handlers': ['console', 'file'],
            'level': 'DEBUG',
            'propagate': False,
        },
        'auth': {
            'handlers': ['console', 'auth_file'],
            'level': 'DEBUG',
            'propagate': False,
        },
        'api': {
            'handlers': ['console', 'api_file'],
            'level': 'DEBUG',
            'propagate': False,
        },
    },
}

# Apply the logging configuration
logging.config.dictConfig(LOGGING_CONFIG)

# Create logger instances
django_logger = logging.getLogger('django')
auth_logger = logging.getLogger('auth')
api_logger = logging.getLogger('api')

def log_request(request, logger=api_logger):
    """Log details about an HTTP request"""
    # Create a dictionary of request information
    request_data = {
        'method': request.method,
        'path': request.path,
        'user': str(request.user) if hasattr(request, 'user') else 'Anonymous',
        'ip': request.META.get('REMOTE_ADDR', 'Unknown'),
        'headers': {k: v for k, v in request.META.items() if k.startswith('HTTP_')},
    }
    
    # Log request body for POST, PUT, PATCH requests (be careful with sensitive data)
    if request.method in ('POST', 'PUT', 'PATCH') and hasattr(request, 'body'):
        try:
            # Try to parse as JSON
            body = json.loads(request.body.decode('utf-8'))
            # Redact sensitive fields
            if 'password' in body:
                body['password'] = '[REDACTED]'
            request_data['body'] = body
        except:
            # If not JSON or other error, just note the content type
            request_data['body'] = f"[Content-Type: {request.content_type}]"
    
    # Log the request data
    logger.info(f"Request received: {json.dumps(request_data)}")
    
    return request_data

def log_response(response, request_data=None, logger=api_logger):
    """Log details about an HTTP response"""
    # Create a dictionary of response information
    response_data = {
        'status_code': response.status_code,
        'reason': getattr(response, 'reason_phrase', ''),
        'content_type': response.get('Content-Type', 'text/html'),
        'request': request_data or {},
    }
    
    # Log the response data
    logger.info(f"Response sent: {json.dumps(response_data)}")
    
    return response_data

# Print logging setup confirmation
print(f"Logging configured. Log files will be written to: {logs_dir}")
print(f"Available log files:")
print(f"  - {os.path.join(logs_dir, 'debug.log')}")
print(f"  - {os.path.join(logs_dir, 'auth.log')}")
print(f"  - {os.path.join(logs_dir, 'api.log')}")