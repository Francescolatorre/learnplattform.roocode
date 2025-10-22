"""
Health check endpoint for deployment monitoring.

Provides comprehensive health status including:
- Database connectivity
- Django configuration
- System information
- Detailed diagnostics (when ?detailed=true)

Created for REQ-078 Hosting Environment Setup.
Enhanced with comprehensive checks for better monitoring.
"""

import sys
from datetime import datetime

import django
from django.conf import settings
from django.db import connection
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods


def check_database():
    """Check database connectivity and return status."""
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            row = cursor.fetchone()
            if row and row[0] == 1:
                return {
                    "status": "healthy",
                    "message": "Database connection successful",
                    "type": connection.settings_dict.get("ENGINE", "unknown").split(".")[-1],
                }
    except Exception as e:
        return {
            "status": "unhealthy",
            "message": f"Database connection failed: {str(e)}",
        }
    return {"status": "unhealthy", "message": "Database check failed"}


def get_system_info():
    """Get system information."""
    import os

    return {
        "python_version": sys.version.split()[0],
        "django_version": django.get_version(),
        "environment": os.getenv("RAILWAY_ENVIRONMENT") or os.getenv("ENVIRONMENT", "local"),
        "debug_mode": settings.DEBUG,
    }


def get_detailed_checks():
    """Run detailed health checks (only when requested)."""
    import os
    from django.contrib.auth import get_user_model

    checks = {}

    # Check if SECRET_KEY is set
    checks["secret_key"] = {
        "status": "healthy" if settings.SECRET_KEY and len(settings.SECRET_KEY) > 20 else "warning",
        "message": "SECRET_KEY is configured" if settings.SECRET_KEY else "SECRET_KEY not set",
    }

    # Check if static files are configured
    checks["static_files"] = {
        "status": "healthy" if settings.STATIC_ROOT else "warning",
        "message": f"STATIC_ROOT: {settings.STATIC_ROOT}" if settings.STATIC_ROOT else "STATIC_ROOT not set",
    }

    # Check user model
    try:
        User = get_user_model()
        user_count = User.objects.count()
        checks["users"] = {
            "status": "healthy",
            "message": f"{user_count} user(s) in database",
        }
    except Exception as e:
        checks["users"] = {
            "status": "warning",
            "message": f"Could not query users: {str(e)}",
        }

    # Check CORS configuration
    cors_configured = hasattr(settings, "CORS_ALLOWED_ORIGINS") or hasattr(settings, "CORS_ALLOW_ALL_ORIGINS")
    checks["cors"] = {
        "status": "healthy" if cors_configured else "warning",
        "message": "CORS configured" if cors_configured else "CORS not configured",
    }

    return checks


@csrf_exempt
@require_http_methods(["GET"])
def health_check(request):
    """
    Comprehensive health check endpoint.

    Query Parameters:
        detailed (bool): Include detailed diagnostic information

    Returns:
        200: All systems healthy
        503: One or more systems unhealthy
    """
    # Run core health checks
    db_check = check_database()
    system_info = get_system_info()

    # Determine overall health
    is_healthy = db_check["status"] == "healthy"

    # Build response
    response_data = {
        "status": "healthy" if is_healthy else "unhealthy",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "checks": {
            "database": db_check,
        },
        "system": system_info,
    }

    # Include detailed checks if requested
    if request.GET.get("detailed", "").lower() in ["true", "1", "yes"]:
        response_data["detailed_checks"] = get_detailed_checks()

    # Set appropriate status code
    status_code = 200 if is_healthy else 503

    return JsonResponse(response_data, status=status_code)
