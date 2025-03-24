import json
import logging
import os
import sys
import time

# Add the parent directory to the Python path so we can import logs_setup
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from logs_setup import api_logger, auth_logger, log_request, log_response


class RequestLoggingMiddleware:
    """Middleware to log all requests and responses"""
    
    def __init__(self, get_response):
        self.get_response = get_response
        self.logger = logging.getLogger('api')
    
    def __call__(self, request):
        # Log the request
        start_time = time.time()
        request_data = log_request(request)
        
        # Process the request
        response = self.get_response(request)
        
        # Calculate request duration
        duration = time.time() - start_time
        
        # Log the response
        response_data = log_response(response, request_data)
        
        # Log the duration separately
        self.logger.info(f"Request to {request.path} completed in {duration:.3f}s")
        
        return response

class AuthLoggingMiddleware:
    """Middleware to specifically log authentication-related requests"""
    
    def __init__(self, get_response):
        self.get_response = get_response
        self.logger = logging.getLogger('auth')
        
        # Paths that are related to authentication
        self.auth_paths = [
            '/auth/login/',
            '/auth/logout/',
            '/auth/token/refresh/',
            '/auth/register/',
            '/api/token/',
            '/token/',
        ]
    
    def __call__(self, request):
        # Only log auth-related requests
        if any(request.path.startswith(path) for path in self.auth_paths):
            # Log detailed auth request
            request_data = log_request(request, logger=self.logger)
            
            # Process the request
            response = self.get_response(request)
            
            # Log the response without sensitive data
            response_data = {
                'status_code': response.status_code,
                'path': request.path,
                'method': request.method,
                'user': str(request.user) if hasattr(request, 'user') else 'Anonymous',
            }
            
            # Don't log the actual tokens, just indicate success or failure
            if response.status_code >= 200 and response.status_code < 300:
                self.logger.info(f"Authentication success: {json.dumps(response_data)}")
            else:
                self.logger.warning(f"Authentication failure: {json.dumps(response_data)}")
            
            return response
        else:
            # For non-auth requests, just pass through
            return self.get_response(request)

class DebugLoggingMiddleware:
    """Middleware to log detailed debugging information in development"""
    
    def __init__(self, get_response):
        self.get_response = get_response
        self.logger = logging.getLogger('django')
    
    def __call__(self, request):
        # Log basic request info
        self.logger.debug(f"DEBUG: {request.method} {request.path}")
        
        # Process the request
        response = self.get_response(request)
        
        # Log the response status
        self.logger.debug(f"DEBUG: Response status {response.status_code}")
        
        return response