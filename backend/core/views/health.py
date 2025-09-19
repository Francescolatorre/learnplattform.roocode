"""
Health check endpoint for Railway deployment monitoring.
Created for REQ-078 Hosting Environment Setup.
"""

from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.db import connection
from django.conf import settings
import os


@csrf_exempt
@require_http_methods(["GET"])
def health_check(request):
    """
    Simple health check endpoint for Railway.
    Returns 200 OK if Django and database are working.
    """
    try:
        # Test database connection
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            db_status = "ok"
    except Exception as e:
        db_status = f"error: {str(e)}"

    # Get basic system info
    response_data = {
        "status": "ok" if db_status == "ok" else "degraded",
        "database": db_status,
        "debug": settings.DEBUG,
        "environment": os.getenv("RAILWAY_ENVIRONMENT", "unknown"),
        "django_version": settings.DJANGO_VERSION if hasattr(settings, 'DJANGO_VERSION') else "unknown",
    }

    status_code = 200 if db_status == "ok" else 503
    return JsonResponse(response_data, status=status_code)