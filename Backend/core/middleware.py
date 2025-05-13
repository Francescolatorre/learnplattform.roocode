"""
Middleware components for the Learning Platform.

This module provides Django middleware classes that process requests and responses
globally across the platform. Key features include:
- Request/response logging
- Authentication tracking
- Performance monitoring
- Error handling
"""

import json
import logging
import os
import sys
import time
from django.conf import settings
from django.utils.deprecation import MiddlewareMixin

logger = logging.getLogger(__name__)

# Add the parent directory to the Python path so we can import logs_setup
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from logs_setup import (
    log_request,
    log_response,
)  # Ensure this matches the updated definition


class RequestLoggingMiddleware(MiddlewareMixin):
    """
    Middleware for logging all HTTP requests to the platform.

    Records detailed information about each request including:
    - HTTP method and path
    - Request parameters
    - Response status and timing
    - User information (if authenticated)

    All requests are logged using the following format:
    [Timestamp] METHOD /path/ - Status: XXX - Duration: XXXms - User: username
    """

    def __init__(self, get_response):
        self.get_response = get_response
        self.logger = logging.getLogger("api")
        self.logger.setLevel(logging.DEBUG)
        self.verbose_routes = [
            "/api/v1/courses/",
            "/api/v1/tasks/course/",
            "/api/v1/enrollments/",  # Updated to use the consolidated endpoint
            "/api/v1/courses/student-progress/",
            "/api/v1/learning-tasks/",
            "/api/v1/learning-tasks/{id}/",
            "/api/v1/quiz-tasks/",
            "/api/v1/quiz-tasks/{id}/",
            "/api/v1/task-progress/",
            "/api/v1/task-progress/{id}/",
            "/api/v1/courses/analytics/",
            "/api/v1/users/",
            "/api/v1/users/{id}/",
            "/api/v1/roles/",
        ]
        self.log_headers = True  # Enable header logging

    def __call__(self, request):
        request_data = log_request(request, log_headers=self.log_headers)
        start_time = time.time()

        # Process the request
        response = self.get_response(request)

        # Calculate request duration
        duration = time.time() - start_time

        # Log the response
        response_data = log_response(response, request_data)

        # Log the duration separately
        self.logger.info("Request to %s completed in %.3fs", request.path, duration)

        # Add verbose logging for specific routes
        if any(request.path.startswith(route) for route in self.verbose_routes):
            self.logger.debug(
                "Verbose Logging: Request Data: %s", json.dumps(request_data)
            )
            self.logger.debug(
                "Verbose Logging: Response Data: %s", json.dumps(response_data)
            )

        return response

    def process_request(self, request):
        """
        Process and log incoming request details.

        Args:
            request: The Django request object

        Stores request start time for duration calculation.
        Logs basic request information.
        """
        request.start_time = time.time()

        logger.info(
            "Request started: %s %s from %s",
            request.method,
            request.path,
            request.META.get("REMOTE_ADDR"),
        )

        # Log request parameters if debug is enabled
        if settings.DEBUG:
            logger.debug(
                "Request parameters: GET=%s, POST=%s",
                json.dumps(dict(request.GET)),
                json.dumps(dict(request.POST)),
            )

    def process_response(self, request, response):
        """
        Process and log response details.

        Args:
            request: The Django request object
            response: The Django response object

        Returns:
            HttpResponse: The processed response object

        Calculates request duration and logs response details.
        """
        if hasattr(request, "start_time"):
            duration = time.time() - request.start_time

            logger.info(
                "Request completed: %s %s - Status: %s - Duration: %.2fms - User: %s",
                request.method,
                request.path,
                response.status_code,
                duration * 1000,
                request.user.username if request.user.is_authenticated else "anonymous",
            )

            # Log response content in debug mode
            if settings.DEBUG and hasattr(response, "data"):
                logger.debug("Response data: %s", json.dumps(response.data))

        return response


class AuthLoggingMiddleware(MiddlewareMixin):
    """
    Middleware for tracking authentication-related activities.

    Logs all authentication events including:
    - Login attempts (successful and failed)
    - Logout events
    - Token refresh events
    - Permission checks
    """

    def __init__(self, get_response):
        self.get_response = get_response
        self.logger = logging.getLogger("auth")
        self.auth_paths = [
            "/auth/login/",
            "/auth/logout/",
            "/auth/token/refresh/",
            "/auth/register/",
            "/api/token/",
            "/token/",
        ]
        self.log_headers = True  # Flag to enable/disable header logging

    def __call__(self, request):
        # Only log auth-related requests
        if any(request.path.startswith(path) for path in self.auth_paths):
            request_data = log_request(
                request, logger=self.logger, log_headers=self.log_headers
            )

            # Process the request
            response = self.get_response(request)

            # Log the response without sensitive data
            response_data = {
                "status_code": response.status_code,
                "path": request.path,
                "method": request.method,
                "user": str(request.user) if hasattr(request, "user") else "Anonymous",
            }

            # Don't log the actual tokens, just indicate success or failure
            if response.status_code >= 200 and response.status_code < 300:
                self.logger.info(
                    "Authentication success: %s", json.dumps(response_data)
                )
            else:
                self.logger.warning(
                    "Authentication failure: %s", json.dumps(response_data)
                )

            return response
        else:
            # For non-auth requests, just pass through
            return self.get_response(request)

    def process_request(self, request):
        """
        Process authentication-related aspects of requests.

        Args:
            request: The Django request object

        Logs authentication attempts and token usage.
        """
        # Log authentication attempts
        if request.path.endswith("/login/"):
            logger.info(
                "Login attempt from %s - User: %s",
                request.META.get("REMOTE_ADDR"),
                request.POST.get("username", "unknown"),
            )

        # Log token refresh attempts
        elif request.path.endswith("/token/refresh/"):
            logger.info(
                "Token refresh attempt from %s", request.META.get("REMOTE_ADDR")
            )

    def process_response(self, request, response):
        """
        Process authentication-related aspects of responses.

        Args:
            request: The Django request object
            response: The Django response object

        Returns:
            HttpResponse: The processed response object

        Logs authentication results and token operations.
        """
        # Log successful logins
        if request.path.endswith("/login/") and response.status_code == 200:
            logger.info(
                "Successful login for user %s from %s",
                request.POST.get("username"),
                request.META.get("REMOTE_ADDR"),
            )

        # Log failed login attempts
        elif request.path.endswith("/login/") and response.status_code != 200:
            logger.warning(
                "Failed login attempt for user %s from %s",
                request.POST.get("username"),
                request.META.get("REMOTE_ADDR"),
            )

        # Log successful token refreshes
        elif request.path.endswith("/token/refresh/") and response.status_code == 200:
            logger.info(
                "Successful token refresh from %s", request.META.get("REMOTE_ADDR")
            )

        return response


class DebugLoggingMiddleware(MiddlewareMixin):
    """Middleware to log detailed debugging information in development"""

    def __init__(self, get_response):
        self.get_response = get_response
        self.logger = logging.getLogger("debug")
        self.logger.setLevel(logging.DEBUG)
        self.log_headers = False  # Flag to enable/disable header logging

    def __call__(self, request):
        if self.logger.isEnabledFor(logging.DEBUG):
            request_data = log_request(request, log_headers=self.log_headers)
            self.logger.debug(
                "Request Payload: %s",
                json.dumps(request_data.get("body", "{}")),
            )
        response = self.get_response(request)
        return response


class PerformanceMonitoringMiddleware(MiddlewareMixin):
    """
    Middleware for monitoring application performance.

    Tracks key performance metrics including:
    - Request duration
    - Database query counts
    - Memory usage
    - Slow requests
    """

    SLOW_REQUEST_THRESHOLD = 1.0  # seconds

    def process_request(self, request):
        """
        Initialize performance monitoring for a request.

        Args:
            request: The Django request object

        Stores initial state for performance calculations.
        """
        request.start_time = time.time()

        if settings.DEBUG:
            from django.db import connection

            request.initial_queries = len(connection.queries)

    def process_response(self, request, response):
        """
        Calculate and log performance metrics.

        Args:
            request: The Django request object
            response: The Django response object

        Returns:
            HttpResponse: The processed response object

        Logs performance data and flags slow requests.
        """
        if hasattr(request, "start_time"):
            duration = time.time() - request.start_time

            # Log slow requests
            if duration > self.SLOW_REQUEST_THRESHOLD:
                logger.warning(
                    "Slow request detected: %s %s - Duration: %.2fms",
                    request.method,
                    request.path,
                    duration * 1000,
                )

            # Log query counts in debug mode
            if settings.DEBUG and hasattr(request, "initial_queries"):
                from django.db import connection

                final_queries = len(connection.queries)
                query_count = final_queries - request.initial_queries

                if query_count > 10:  # Arbitrary threshold for demonstration
                    logger.warning(
                        "High query count detected: %s %s - Queries: %d",
                        request.method,
                        request.path,
                        query_count,
                    )

                logger.debug(
                    "Request performance: Duration=%.2fms, Queries=%d",
                    duration * 1000,
                    query_count,
                )

        return response
