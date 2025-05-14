"""
Course management API views for the Learning Platform backend.

Includes:
- Course CRUD operations
- Course details and instructor/student-specific endpoints
"""

import logging
from django.db import models
from django.contrib.auth import get_user_model
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from ..models import Course, CourseEnrollment, CourseVersion, LearningTask, TaskProgress
from ..serializers import (
    CourseSerializer,
    CourseVersionSerializer,
    TaskProgressSerializer,
)
from ..permissions import IsInstructorOrAdmin
from ..pagination import SafePageNumberPagination

logger = logging.getLogger(__name__)


class CourseViewSet(viewsets.ModelViewSet):
    """
    API endpoint for courses
    """

    queryset = Course.objects.all().order_by("id")
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = SafePageNumberPagination

    def perform_create(self, serializer: CourseSerializer):
        """Create a new course with the current user as creator"""
        serializer.save(creator=self.request.user)

    def get_queryset(self):
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
    def instructor_courses(self, request):
        """
        Fetch courses created by the instructor or all courses for admin.
        Supports search filtering through query parameter 'search'.
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
            queryset = self.get_queryset()
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
    def student_progress(self, request, pk=None, user_id=None):
        """
        Fetch student progress for a specific course and user.
        """
        try:
            course = self.get_object()
            is_enrolled = CourseEnrollment.objects.filter(
                user_id=user_id, course_id=course.id
            ).exists()
            if not is_enrolled:
                return Response(
                    {
                        "course_title": course.title,
                        "description": course.description,
                        "learning_objectives": course.learning_objectives,
                        "prerequisites": course.prerequisites,
                        "message": "Enroll in the course to access progress details.",
                    },
                    status=200,
                )
            progress = TaskProgress.objects.filter(
                user_id=user_id, task__course_id=course.id
            )
            if not progress.exists():
                return Response(
                    {"message": "No progress found for this course."}, status=404
                )
            serializer = TaskProgressSerializer(progress, many=True)
            return Response(serializer.data)
        except Exception as e:
            logger.error(
                "Error fetching student progress for course %s: %s",
                pk,
                str(e),
                exc_info=True,
            )
            return Response(
                {"error": "An unexpected error occurred while fetching progress."},
                status=500,
            )

    @action(
        detail=True,
        methods=["get"],
        url_path="details",
        permission_classes=[IsAuthenticated],
    )
    def course_details(self, request, pk=None):
        """
        Fetch course details including enrollment status for the current user.
        """
        try:
            logger.info("Fetching course details for course ID: %s", pk)
            course = self.get_object()
            is_enrolled = CourseEnrollment.objects.filter(
                user=request.user, course=course, status="active"
            ).exists()
            is_completed = False
            if is_enrolled:
                total_tasks = LearningTask.objects.filter(course=course).count()
                completed_tasks = TaskProgress.objects.filter(
                    user=request.user, task__course=course, status="completed"
                ).count()
                is_completed = total_tasks > 0 and total_tasks == completed_tasks
            tasks = LearningTask.objects.filter(course=course)
            response_data = {
                "id": course.id,
                "title": course.title,
                "description": course.description,
                "learning_objectives": course.learning_objectives,
                "prerequisites": course.prerequisites,
                "isEnrolled": is_enrolled,
                "isCompleted": is_completed,
                "tasks": [
                    {"id": task.id, "title": task.title, "type": task.type}
                    for task in tasks
                ],
            }
            if (
                request.user.is_staff
                or request.user.is_superuser
                or getattr(request.user, "role", None) == "instructor"
            ):
                response_data["status"] = course.status
            else:
                response_data["enrollmentStatus"] = (
                    "enrolled" if is_enrolled else "not_enrolled"
                )
                if is_enrolled and is_completed:
                    response_data["enrollmentStatus"] = "completed"
            return Response(response_data)
        except Course.DoesNotExist:
            logger.error("Course with ID %s does not exist.", pk)
            return Response({"error": "Course not found."}, status=404)
        except Exception as e:
            logger.error(
                "Error fetching course details for course ID %s: %s",
                pk,
                str(e),
                exc_info=True,
            )
            return Response(
                {
                    "error": "An unexpected error occurred while fetching course details."
                },
                status=500,
            )

    @action(
        detail=True,
        methods=["post"],
        url_path="enroll",
        permission_classes=[IsAuthenticated],
    )
    def enroll(self, request, pk=None):
        course = self.get_object()
        user = request.user
        enrollment, created = CourseEnrollment.objects.get_or_create(
            user=user, course=course, defaults={"status": "active"}
        )
        if not created:
            if enrollment.status == "active":
                return Response(
                    {"detail": "You are already enrolled in this course."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            enrollment.status = "active"
            enrollment.save()
            logger.info("User %s re-enrolled in course %s", user.id, course.id)
            return Response(
                {"detail": "Successfully re-enrolled in the course."},
                status=status.HTTP_200_OK,
            )
        logger.info("User %s enrolled in course %s", user.id, course.id)
        return Response(
            {"detail": "Successfully enrolled in the course."},
            status=status.HTTP_201_CREATED,
        )

    @action(
        detail=True,
        methods=["post"],
        url_path="unenroll",
        permission_classes=[IsAuthenticated],
    )
    def unenroll(self, request, pk=None):
        """
        Unenroll the current user from a course by setting enrollment status to 'dropped'.
        """
        course = self.get_object()
        user = request.user
        try:
            enrollment = CourseEnrollment.objects.get(user=user, course=course)
            enrollment.status = "dropped"
            enrollment.save()
            logger.info("User %s unenrolled from course %s", user.id, course.id)
            return Response(
                {
                    "success": True,
                    "message": "Successfully unenrolled from the course.",
                    "courseId": str(course.id),
                    "status": "unenrolled",
                },
                status=status.HTTP_200_OK,
            )
        except CourseEnrollment.DoesNotExist:
            logger.warning(
                "User %s attempted to unenroll from course %s but no enrollment exists",
                user.id,
                course.id,
            )
            return Response(
                {"success": False, "detail": "You are not enrolled in this course."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except Exception as e:
            logger.error(
                "Error unenrolling user %s from course %s: %s",
                user.id,
                course.id,
                str(e),
                exc_info=True,
            )
            return Response(
                {
                    "success": False,
                    "detail": "An error occurred while unenrolling from the course.",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def get_permissions(self):
        """
        Allow different permissions based on the action:
        - create: Only instructors and admins can create courses
        - retrieve: Students can view course details
        - other actions: Default to the class permissions
        """
        if self.action == "create":
            return [permissions.IsAuthenticated(), IsInstructorOrAdmin()]
        elif self.action == "retrieve" and self.request.user.is_authenticated:
            if self.request.user.role == "student":
                return [permissions.IsAuthenticated()]
        return super().get_permissions()


class CourseVersionViewSet(viewsets.ModelViewSet):
    """
    API endpoint for course versions
    """

    queryset = CourseVersion.objects.all().order_by("created_at")
    serializer_class = CourseVersionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


def get_course_details(request, course_id):
    is_enrolled = CourseEnrollment.objects.filter(
        user=request.user, course_id=course_id
    ).exists()
    if not is_enrolled:
        course = Course.objects.get(id=course_id)
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
    course = Course.objects.get(id=course_id)
    tasks = LearningTask.objects.filter(course=course)
    progress = TaskProgress.objects.filter(user=request.user, task__course_id=course_id)
    return Response(
        {
            "course": {
                "id": course.id,
                "title": course.title,
                "description": course.description,
                "tasks": [{"id": task.id, "title": task.title} for task in tasks],
            },
            "progress": [{"task_id": p.task_id, "status": p.status} for p in progress],
        }
    )
