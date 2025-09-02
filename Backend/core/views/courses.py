"""
Course management API views for the Learning Platform backend.

Includes:
- Course CRUD operations
- Course details and instructor/student-specific endpoints
"""

import logging
from typing import Any, Optional

from django.contrib.auth import get_user_model
from django.db import models
from django.http import Http404
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response

from ..models import Course, CourseEnrollment, CourseVersion, LearningTask, TaskProgress
from ..pagination import SafePageNumberPagination
from ..permissions import IsInstructorOrAdmin
from ..serializers import (
    CourseSerializer,
    CourseVersionSerializer,
    TaskProgressSerializer,
)

logger = logging.getLogger(__name__)


class CourseViewSet(viewsets.ModelViewSet):
    """
    API endpoint for courses
    """

    queryset = Course.objects.all().order_by("id")
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = SafePageNumberPagination

    def perform_create(self, serializer: CourseSerializer) -> None:
        """Create a new course with the current user as creator"""
        serializer.save(creator=self.request.user)

    def get_queryset(self) -> Any:
        """
        Filter queryset based on user role and permissions:
        - Admins and staff see all courses with status indicator
        - Instructors see all published courses and their own courses (with status)
        - Students see all courses they can potentially enroll in (published only)
        """
        queryset = Course.objects.select_related("creator").all()
        if not self.request.user or not self.request.user.is_authenticated:
            return Course.objects.none()
        if self.request.user.is_staff or self.request.user.is_superuser:
            pass
        elif getattr(self.request.user, "role", None) == "instructor":
            queryset = queryset.filter(
                models.Q(status="published") | models.Q(creator=self.request.user)
            )
        else:
            queryset = queryset.filter(status="published")
        search_query = self.request.query_params.get("search", "").strip()
        if search_query:
            queryset = queryset.filter(
                models.Q(title__icontains=search_query)
                | models.Q(description__icontains=search_query)
                | models.Q(creator__first_name__icontains=search_query)
                | models.Q(creator__last_name__icontains=search_query)
            )
        return queryset.order_by("id")

    @action(
        detail=False,
        methods=["get"],
        url_path="instructor/courses",
        permission_classes=[IsInstructorOrAdmin],
    )
    def instructor_courses(self, request: Request) -> Response:
        """
        Fetch courses created by the instructor or all courses for admin.
        Supports filtering through query parameters:
        - search: Text search in title and description
        - status: Filter by course status (draft/published/archived)
        """
        try:
            if request.user.role not in ["instructor", "admin"]:
                return Response(
                    {"error": "You do not have permission to access this resource."},
                    status=403,
                )

            logger.info(
                "Fetching instructor courses for user ID: %s, username: %s, role: %s",
                request.user.id,
                request.user.username,
                request.user.role,
            )

            # Start with base queryset of all courses created by this instructor
            queryset = Course.objects.filter(creator=request.user)

            # Handle status filter
            status_filter = request.query_params.get("status", None)
            if status_filter is not None:
                status_filter = status_filter.strip()
                if status_filter:  # Only apply filter for non-empty status
                    logger.info(
                        "Applying status filter '%s' for instructor courses",
                        status_filter,
                    )
                    queryset = queryset.filter(status=status_filter)
                else:
                    logger.info("No status filter applied (showing all courses)")

            # Apply search filter if provided
            search_query = request.query_params.get("search", "").strip()
            if search_query:
                logger.info(
                    "Applying search filter '%s' for instructor courses", search_query
                )
                queryset = queryset.filter(
                    models.Q(title__icontains=search_query)
                    | models.Q(description__icontains=search_query)
                )

            course_count = queryset.count()
            logger.info(
                "Found %d courses for instructor with ID %s",
                course_count,
                request.user.id,
            )

            page = self.paginate_queryset(queryset)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)
            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)
        except Exception as e:
            logger.error(
                "Error fetching instructor courses for user ID %s: %s",
                (
                    request.user.id
                    if hasattr(request, "user") and hasattr(request.user, "id")
                    else "unknown"
                ),
                str(e),
                exc_info=True,
            )
            return Response(
                {"error": "An unexpected error occurred while fetching courses."},
                status=500,
            )

    @action(
        detail=True,
        methods=["get"],
        url_path="student-progress/(?P<user_id>[^/.]+)",
        permission_classes=[IsAuthenticated],
    )
    def student_progress(
        self, request: Request, pk: Optional[str] = None, user_id: Optional[str] = None
    ) -> Response:
        """
        Fetch student progress for a specific course and user.
        """
        try:
            course = self.get_object()
            user = get_user_model().objects.get(id=user_id)

            progress = TaskProgress.objects.filter(
                task__course=course, student=user
            ).select_related("task")

            serializer = TaskProgressSerializer(progress, many=True)
            return Response(serializer.data)
        except Http404:
            return Response({"error": "Course not found."}, status=404)
        except get_user_model().DoesNotExist:
            return Response({"error": "Student not found."}, status=404)
        except Exception as e:
            logger.error("Error fetching student progress: %s", str(e), exc_info=True)
            return Response(
                {"error": "An error occurred while fetching progress."}, status=500
            )

    @action(
        detail=True,
        methods=["get"],
        url_path="details",
        permission_classes=[IsAuthenticated],
    )
    def course_details(self, request: Request, pk: Optional[str] = None) -> Response:
        """Get detailed course information including enrollment status"""
        try:
            course = self.get_object()
            serializer = self.get_serializer(course)
            data = serializer.data

            if request.user.is_authenticated:
                enrollment = CourseEnrollment.objects.filter(
                    course=course, user=request.user
                ).first()
                data["is_enrolled"] = enrollment is not None
                if enrollment:
                    data["enrollment_date"] = enrollment.created_at

            return Response(data)
        except Http404:
            return Response({"error": "Course not found."}, status=404)
        except Exception as e:
            logger.error("Error fetching course details: %s", str(e), exc_info=True)
            return Response(
                {"error": "An error occurred while fetching course details."},
                status=500,
            )

    @action(detail=True, methods=["post"])
    def enroll(self, request: Request, pk: Optional[str] = None) -> Response:
        """Enroll the current user in a course"""
        try:
            course = self.get_object()
            if not course.is_published:
                return Response(
                    {"error": "Cannot enroll in unpublished course."}, status=400
                )

            enrollment, created = CourseEnrollment.objects.get_or_create(
                course=course, user=request.user
            )

            if created:
                return Response({"message": "Successfully enrolled in course."})
            return Response({"message": "Already enrolled in this course."}, status=400)
        except Http404:
            return Response({"error": "Course not found."}, status=404)
        except Exception as e:
            logger.error("Error enrolling in course: %s", str(e), exc_info=True)
            return Response({"error": "An error occurred while enrolling."}, status=500)

    @action(detail=True, methods=["post"])
    def unenroll(self, request: Request, pk: Optional[str] = None) -> Response:
        """Remove the current user's enrollment from a course"""
        try:
            course = self.get_object()
            enrollment = CourseEnrollment.objects.filter(
                course=course, user=request.user
            ).first()

            if enrollment:
                enrollment.delete()
                return Response({"message": "Successfully unenrolled from course."})
            return Response({"error": "Not enrolled in this course."}, status=400)
        except Http404:
            return Response({"error": "Course not found."}, status=404)
        except Exception as e:
            logger.error("Error unenrolling from course: %s", str(e), exc_info=True)
            return Response(
                {"error": "An error occurred while unenrolling."}, status=500
            )

    def get_permissions(self) -> list[permissions.BasePermission]:
        """Get the list of permissions that the current action requires"""
        if self.action == "instructor_courses":
            return [IsInstructorOrAdmin()]
        return [IsAuthenticated()]


class CourseVersionViewSet(viewsets.ModelViewSet):
    """
    API endpoint for course versions
    """

    queryset = CourseVersion.objects.all().order_by("created_at")
    serializer_class = CourseVersionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer: CourseVersionSerializer) -> None:
        serializer.save(created_by=self.request.user)


def get_course_details(request: Request, course_id: str) -> Response:
    """Get detailed course information including enrollment status and progress"""
    is_enrolled = CourseEnrollment.objects.filter(
        user=request.user, course_id=course_id
    ).exists()

    try:
        course = Course.objects.get(id=course_id)
        if not is_enrolled:
            return Response(
                {
                    "course": {
                        "id": course.id,
                        "title": course.title,
                        "description": course.description,
                    },
                    "progress": [],
                }
            )

        tasks = LearningTask.objects.filter(course=course)
        progress = TaskProgress.objects.filter(
            user=request.user, task__course_id=course_id
        )
        return Response(
            {
                "course": {
                    "id": course.id,
                    "title": course.title,
                    "description": course.description,
                    "tasks": [{"id": task.id, "title": task.title} for task in tasks],
                },
                "progress": [
                    {"task_id": p.task_id, "status": p.status} for p in progress
                ],
            }
        )
    except Course.DoesNotExist:
        return Response({"error": "Course not found."}, status=404)
    except Exception as e:
        logger.error("Error getting course details: %s", str(e), exc_info=True)
        return Response(
            {"error": "An error occurred while fetching course details."}, status=500
        )
