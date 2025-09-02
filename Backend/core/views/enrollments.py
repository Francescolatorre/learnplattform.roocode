"""
Course enrollment API views for the Learning Platform backend.

Includes:
- Enrollment creation, update, and deletion
- Enrollment status management
"""

import logging

from django.contrib.auth.models import AnonymousUser
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from ..models import CourseEnrollment
from ..serializers import CourseEnrollmentSerializer

logger = logging.getLogger(__name__)


class EnrollmentViewSet(viewsets.ModelViewSet):
    """
    API endpoint for course enrollments

    Provides a unified interface for managing all enrollment operations, including:
    - Creating enrollments (enroll)
    - Listing enrollments
    - Retrieving enrollment details
    - Updating enrollment status
    - Unenrolling from courses
    """

    queryset = CourseEnrollment.objects.all().order_by("id")
    serializer_class = CourseEnrollmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Handle schema generation for Swagger
        if getattr(self, "swagger_fake_view", False):
            return CourseEnrollment.objects.none()
        # Handle AnonymousUser
        if isinstance(self.request.user, AnonymousUser):
            return CourseEnrollment.objects.none()
        queryset = CourseEnrollment.objects.all()
        user_role = getattr(self.request.user, "role", None)
        is_staff = getattr(self.request.user, "is_staff", False)
        if is_staff or user_role == "admin":
            return queryset
        return queryset.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def create(self, request, *args, **kwargs):
        """
        Create a new enrollment record or re-activate an existing dropped enrollment.
        """
        user_id = request.user.id
        course_id = request.data.get("course")
        try:
            enrollment = CourseEnrollment.objects.filter(
                user_id=user_id, course_id=course_id
            ).first()
            if enrollment:
                if enrollment.status == "active":
                    return Response(
                        {"detail": "You are already enrolled in this course."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
                enrollment.status = "active"
                enrollment.save()
                logger.info("User %s re-enrolled in course %s", user_id, course_id)
                serializer = self.get_serializer(enrollment)
                return Response(serializer.data, status=status.HTTP_200_OK)
            return super().create(request, *args, **kwargs)
        except Exception as e:
            logger.error(
                "Error enrolling user %s in course %s: %s",
                user_id,
                course_id,
                str(e),
                exc_info=True,
            )
            return Response(
                {"detail": f"An error occurred during enrollment: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    @action(detail=False, methods=["post"], url_path="unenroll/(?P<course_id>[^/.]+)")
    def unenroll(self, request, course_id=None):
        """
        Unenroll the current user from a course by updating the existing enrollment record.

        Instead of deleting the enrollment or creating a new one, this endpoint updates
        the status of the existing enrollment to "dropped", maintaining data integrity
        and enrollment history while respecting the unique constraint on (user, course) pairs.
        """
        try:
            try:
                enrollment = CourseEnrollment.objects.get(
                    user=request.user, course_id=course_id
                )
            except CourseEnrollment.DoesNotExist:
                return Response(
                    {
                        "success": False,
                        "message": "You are not enrolled in this course",
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )
            if enrollment.status == "dropped":
                return Response(
                    {
                        "success": True,
                        "status": "unenrolled",
                        "message": "You were already unenrolled from this course",
                        "enrollmentId": enrollment.id,
                    }
                )
            enrollment.status = "dropped"
            enrollment.save()
            logger.info(
                "User %s (ID: %s) unenrolled from course %s",
                request.user.username,
                request.user.id,
                course_id,
            )
            return Response(
                {
                    "success": True,
                    "status": "unenrolled",
                    "message": "Successfully unenrolled from course",
                    "enrollmentId": enrollment.id,
                }
            )
        except Exception as e:
            logger.error("Error during unenrollment: %s", str(e))
            return Response(
                {"success": False, "message": f"Unenrollment failed: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
