"""
Miscellaneous and utility API views for the Learning Platform backend.

Includes:
- Health check
- Any endpoints not fitting other modules
"""

import logging

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import (
    AllowAny,
    BasePermission,
    IsAuthenticated,
)
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models import Course, CourseEnrollment, TaskProgress
from ..permissions import IsEnrolledInCourse

logger = logging.getLogger(__name__)


@api_view(["GET"])
@permission_classes([AllowAny])
def health_check(request):
    """
    Simple health check endpoint to verify the API is running
    """
    logger.info("Health check endpoint accessed.")
    return Response({"status": "healthy"})


class StudentProgressView(APIView):
    permission_classes = [IsAuthenticated, IsEnrolledInCourse]

    def get(self, request, course_id):
        # Debug logging
        print(
            f"DEBUG: Accessing student progress for course {course_id} by user {request.user}"
        )
        # ...existing logic...
        return Response({"message": "Student progress data"})
