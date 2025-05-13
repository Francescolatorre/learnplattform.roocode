# pylint: disable=no-member


"""
Core views for the Learning Platform.

This module provides the primary view logic for the learning platform, including:
- User authentication and profile management
- Course management and enrollment
- Learning task tracking and progress
- Quiz handling and assessment
- Dashboard views for different user roles

All views follow REST principles and include proper permission checks.
"""

import logging
from typing import Any
from django.db import models
from django.db.models import Avg, Count, Case, When, Prefetch, QuerySet
from django.core.cache import cache
from django.http import JsonResponse
from django.contrib.auth.models import AnonymousUser
from rest_framework import generics, permissions, status, viewsets
from rest_framework.authentication import get_authorization_header
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.tokens import AccessToken, RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model

from .models import (
    Course,
    CourseEnrollment,
    CourseVersion,
    LearningTask,
    QuizAttempt,
    QuizOption,
    QuizQuestion,
    QuizResponse,
    QuizTask,
    TaskProgress,
)
from .serializers import (
    CourseEnrollmentSerializer,
    CourseSerializer,
    CourseVersionSerializer,
    CustomTokenObtainPairSerializer,
    LearningTaskSerializer,
    QuizAttemptSerializer,
    QuizOptionSerializer,
    QuizQuestionSerializer,
    QuizResponseSerializer,
    QuizTaskSerializer,
    RegisterSerializer,
    TaskProgressSerializer,
    UserSerializer,
)
from .permissions import IsEnrolledInCourse, IsInstructorOrAdmin
from .pagination import SafePageNumberPagination

# Configure logger for this module
logger = logging.getLogger(__name__)


# Example usage of logger
@api_view(["GET"])
@permission_classes([AllowAny])
def health_check(request):
    """
    Simple health check endpoint to verify the API is running
    """
    logger.info("Health check endpoint accessed.")  # Log to file
    return Response({"status": "healthy"}, status=status.HTTP_200_OK)


class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Custom token view that uses our enhanced JWT serializer
    """

    serializer_class = CustomTokenObtainPairSerializer


class RegisterView(generics.CreateAPIView):
    """
    API endpoint for user registration
    """

    queryset = get_user_model().objects.all()
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer


class LogoutView(APIView):
    """
    API endpoint for user logout (blacklists the refresh token)
    """

    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(status=status.HTTP_205_RESET_CONTENT)
        except TokenError:
            return Response(status=status.HTTP_400_BAD_REQUEST)


class UserViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing user resources.

    Provides CRUD operations for User model with appropriate permissions.
    """

    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self) -> QuerySet[Any]:
        """
        Filter queryset based on user role.
        Regular users can only see their own profile.
        Staff and admin users can see all users.
        """
        if self.request.user.is_staff or self.request.user.is_superuser:
            return get_user_model().objects.all()
        return get_user_model().objects.all().filter(id=self.request.user.id)


class CourseViewSet(viewsets.ModelViewSet):
    """
    API endpoint for courses
    """

    queryset = Course.objects.all().order_by("id")  # Ensure consistent ordering
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = SafePageNumberPagination  # Use our custom pagination class

    def perform_create(self, serializer):
        serializer.save(creator=self.request.user)

    @action(
        detail=False,
        methods=["get"],
        url_path="instructor/courses",
        permission_classes=[IsInstructorOrAdmin],  # Apply IsInstructorOrAdmin
    )
    def instructor_courses(self, request):
        """
        Fetch courses created by the instructor or all courses for admin.
        """
        try:
            # Allow access for both instructors and admins
            if request.user.role not in ["instructor", "admin"]:
                return Response(
                    {"error": "You do not have permission to access this resource."},
                    status=403,
                )

            # Add detailed logging to help diagnose user ID mismatch issues
            logger.info(
                "Fetching instructor courses for user ID: %s, username: %s, role: %s",
                request.user.id,
                request.user.username,
                request.user.role,
            )

            # Modified logic: Return all courses for instructors instead of filtering by creator
            # This allows instructors to see all courses in the system
            queryset = self.get_queryset()

            # Log how many courses were found
            course_count = queryset.count()
            logger.info(
                "Found %d courses for instructor with ID %s",
                course_count,
                request.user.id,
            )

            # Debug log to check for specific creator IDs
            creator_2_count = queryset.filter(creator_id=2).count()
            creator_3_count = queryset.filter(creator_id=3).count()
            logger.info(
                "Debug counts - Creator ID 2: %d courses, Creator ID 3: %d courses",
                creator_2_count,
                creator_3_count,
            )

            # Use the viewset's paginate_queryset method to paginate results
            page = self.paginate_queryset(queryset)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)

            # If pagination is not configured, still serialize all data
            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)
        except Exception as e:
            # Log the error for debugging
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
        url_path="student-progress/(?P<user_id>[^/.]+)",  # Add user_id to the URL
        permission_classes=[IsAuthenticated],  # Allow all authenticated users
    )
    def student_progress(self, request, pk=None, user_id=None):
        """
        Fetch student progress for a specific course and user.
        """
        try:
            course = self.get_object()

            # Check if the user is enrolled
            is_enrolled = CourseEnrollment.objects.filter(
                user_id=user_id, course_id=course.id
            ).exists()

            if not is_enrolled:
                # Return limited course details for non-enrolled users
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

            # Fetch progress for the specified user
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

            # Check if the current user is enrolled in this course
            is_enrolled = CourseEnrollment.objects.filter(
                user=request.user, course=course, status="active"
            ).exists()

            # Check if the current user has completed this course
            is_completed = False
            if is_enrolled:
                # Check if all tasks are completed
                total_tasks = LearningTask.objects.filter(course=course).count()
                completed_tasks = TaskProgress.objects.filter(
                    user=request.user, task__course=course, status="completed"
                ).count()
                is_completed = total_tasks > 0 and total_tasks == completed_tasks

            # Fetch tasks related to the course
            tasks = LearningTask.objects.filter(course=course)
            logger.info("Found %s tasks for course ID: %s", tasks.count(), pk)

            return Response(
                {
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
            )
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

        # Check if the user already has an enrollment record for this course
        enrollment, created = CourseEnrollment.objects.get_or_create(
            user=user, course=course, defaults={"status": "active"}
        )

        # If an enrollment record already existed and wasn't created
        if not created:
            # Check if the current status is already active
            if enrollment.status == "active":
                return Response(
                    {"detail": "You are already enrolled in this course."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Update status from dropped to active for re-enrollment
            enrollment.status = "active"
            enrollment.save()

            logger.info("User %s re-enrolled in course %s", user.id, course.id)
            return Response(
                {"detail": "Successfully re-enrolled in the course."},
                status=status.HTTP_200_OK,
            )

        # For newly created enrollments
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
            # Find the enrollment record
            enrollment = CourseEnrollment.objects.get(user=user, course=course)

            # Update the enrollment status to 'dropped'
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
            return [IsAuthenticated(), IsInstructorOrAdmin()]
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


class LearningTaskViewSet(viewsets.ModelViewSet):
    """
    API endpoint for learning tasks
    """

    queryset = LearningTask.objects.all()
    serializer_class = LearningTaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = LearningTask.objects.all()
        course_id = self.request.query_params.get("course")
        if course_id is not None:
            queryset = queryset.filter(course_id=course_id)
        return queryset

    @action(detail=False, methods=["get"], url_path="course/(?P<course_id>[^/.]+)")
    def tasks_by_course(self, request, course_id=None):
        """
        Fetch tasks for a specific course.
        """
        try:
            tasks = LearningTask.objects.filter(course_id=course_id).order_by("order")
            if not tasks.exists():
                return Response(
                    {"error": "No tasks found for this course."}, status=404
                )
            serializer = self.get_serializer(tasks, many=True)
            return Response(serializer.data)
        except Exception as e:
            logger.error(
                "Error fetching tasks for course %s: %s",
                course_id,
                str(e),
                exc_info=True,
            )
            return Response(
                {"error": "An unexpected error occurred while fetching tasks."},
                status=500,
            )


class QuizTaskViewSet(viewsets.ModelViewSet):
    """
    API endpoint for quiz tasks
    """

    queryset = QuizTask.objects.all()
    serializer_class = QuizTaskSerializer
    permission_classes = [permissions.IsAuthenticated]


class QuizQuestionViewSet(viewsets.ModelViewSet):
    """
    API endpoint for quiz questions
    """

    queryset = QuizQuestion.objects.all()
    serializer_class = QuizQuestionSerializer
    permission_classes = [permissions.IsAuthenticated]


class QuizOptionViewSet(viewsets.ModelViewSet):
    """
    API endpoint for quiz options
    """

    queryset = QuizOption.objects.all()
    serializer_class = QuizOptionSerializer
    permission_classes = [permissions.IsAuthenticated]


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

        # Regular queryset logic
        queryset = CourseEnrollment.objects.all()

        # Safely check user role and staff status
        user_role = getattr(self.request.user, "role", None)
        is_staff = getattr(self.request.user, "is_staff", False)

        if is_staff or user_role == "admin":
            return queryset

        # Filter enrollments for the current user
        return queryset.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def create(self, request, *args, **kwargs):
        """
        Create a new enrollment record or re-activate an existing dropped enrollment.
        """
        # Extract data from the request
        user_id = request.user.id
        course_id = request.data.get("course")

        try:
            # Check if an enrollment record already exists
            enrollment = CourseEnrollment.objects.filter(
                user_id=user_id, course_id=course_id
            ).first()

            if enrollment:
                # If enrollment exists and is already active, return error
                if enrollment.status == "active":
                    return Response(
                        {"detail": "You are already enrolled in this course."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                # If enrollment exists but was dropped, update it to active
                enrollment.status = "active"
                enrollment.save()

                logger.info("User %s re-enrolled in course %s", user_id, course_id)
                serializer = self.get_serializer(enrollment)
                return Response(serializer.data, status=status.HTTP_200_OK)

            # If no enrollment exists, create a new one
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
            # Find the existing enrollment
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

            # If already dropped, just return success
            if enrollment.status == "dropped":
                return Response(
                    {
                        "success": True,
                        "status": "unenrolled",
                        "message": "You were already unenrolled from this course",
                        "enrollmentId": enrollment.id,
                    }
                )

            # Update the status to dropped instead of creating a new record
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


class TaskProgressViewSet(viewsets.ModelViewSet):
    """
    API endpoint for task progress
    """

    queryset = TaskProgress.objects.all()
    serializer_class = TaskProgressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Filter progress to only show those belonging to the current user
        return TaskProgress.objects.filter(user=self.request.user)

    def partial_update(self, request, *args, **kwargs):
        # Allow updating the status of a task
        instance = self.get_object()
        instance.status = request.data.get("status", instance.status)
        instance.save()
        return Response({"status": "Task progress updated"})


class QuizAttemptViewSet(viewsets.ModelViewSet):
    """
    API endpoint for quiz attempts
    """

    queryset = QuizAttempt.objects.all()
    serializer_class = QuizAttemptSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        Filter attempts to only show those belonging to the current user
        unless the user is staff/admin
        """
        if self.request.user.is_staff or self.request.user.role == "admin":
            return QuizAttempt.objects.all()
        return QuizAttempt.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class QuizResponseViewSet(viewsets.ModelViewSet):
    """
    API endpoint for quiz responses
    """

    queryset = QuizResponse.objects.all()
    serializer_class = QuizResponseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        Filter responses to only show those belonging to the current user's attempts
        unless the user is staff/admin
        """
        if self.request.user.is_staff or self.request.user.role == "admin":
            return QuizResponse.objects.all()
        return QuizResponse.objects.filter(attempt__user=self.request.user)


@api_view(["GET"])
def validate_token(request):
    """
    Validate the access token.
    """
    auth_header = get_authorization_header(request).split()
    if not auth_header or auth_header[0].lower() != b"bearer":
        return Response(
            {"detail": "Authorization header missing or invalid."}, status=401
        )
    try:
        token = auth_header[1].decode("utf-8")
        AccessToken(token)  # Validate the token
        return Response({"detail": "Token is valid."}, status=200)
    except (TokenError, InvalidToken) as e:
        return Response({"detail": str(e)}, status=401)


class UserTaskProgressAPI(APIView):
    """
    API endpoint to retrieve task progress for the authenticated user.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Use the authenticated user to filter data
        user = request.user
        task_progress = TaskProgress.objects.filter(user=user)
        data = [{"task_id": tp.task.id, "status": tp.status} for tp in task_progress]
        return Response(data)


class InstructorDashboardAPI(APIView):
    """
    API endpoint for instructor-specific dashboard data.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != "instructor":
            return Response(
                {"error": "You do not have permission to access this resource."},
                status=403,
            )

        # Fetch courses created by the instructor
        courses_created = Course.objects.filter(creator=request.user).count()
        # Fetch students enrolled in the instructor's courses
        students_enrolled = (
            CourseEnrollment.objects.filter(course__creator=request.user)
            .values("user")
            .distinct()
            .count()
        )
        # Fetch recent activity in the instructor's courses
        recent_activity = (
            TaskProgress.objects.filter(task__course__creator=request.user)
            .order_by("-updated_at")[:5]
            .values("task__title", "status", "updated_at")
        )

        data = {
            "courses_created": courses_created,
            "students_enrolled": students_enrolled,
            "recent_activity": list(recent_activity),
        }
        return Response(data)


class AdminDashboardAPI(APIView):
    """
    API endpoint for admin-specific dashboard data.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != "admin":
            return Response(
                {"error": "You do not have permission to access this resource."},
                status=403,
            )

        # Example data for the admin dashboard
        data = {
            "totalTasks": TaskProgress.objects.count(),
            "completedTasks": TaskProgress.objects.filter(status="completed").count(),
            "averageScore": QuizAttempt.objects.aggregate(Avg("score"))["score__avg"]
            or 0,
        }
        return Response(data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def admin_dashboard_summary(request):
    """
    API endpoint for admin dashboard summary.
    """
    if request.user.role != "admin":
        return Response(
            {"error": "You do not have permission to access this resource."},
            status=403,
        )

    data = {
        "total_completed_tasks": TaskProgress.objects.filter(
            status="completed"
        ).count(),
        "total_tasks": TaskProgress.objects.count(),
        "overall_average_score": QuizAttempt.objects.aggregate(Avg("score"))[
            "score__avg"
        ]
        or 0,
        "overall_completion_percentage": (
            (
                TaskProgress.objects.filter(status="completed").count()
                / TaskProgress.objects.count()
            )
            * 100
            if TaskProgress.objects.count() > 0
            else 0
        ),
        "total_time_spent": TaskProgress.objects.aggregate(
            total_time=models.Sum("time_spent")
        )["total_time"]
        or 0,
    }
    return Response(data)


class StudentProgressView(APIView):
    permission_classes = [IsAuthenticated, IsEnrolledInCourse]

    def get(self, request, course_id):
        # Debug logging
        print(
            f"DEBUG: Accessing student progress for course {course_id} by user {request.user}"
        )

        # ...existing logic...
        return Response({"message": "Student progress data"})


def get_course_details(request, course_id):
    # Check if the user is enrolled
    is_enrolled = CourseEnrollment.objects.filter(
        user=request.user, course_id=course_id
    ).exists()

    if not is_enrolled:
        # Return limited course details for non-enrolled users
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

    # Fetch full course details including progress for enrolled users
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


class UserProfileAPI(APIView):
    """
    API endpoint to fetch the authenticated user's profile.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


class StudentDashboardAPI(APIView):
    """
    API endpoint for student-specific dashboard data.
    Returns a comprehensive overview of student's courses, progress, and recent activity.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request, pk=None):
        try:
            # Determine which user's data to retrieve
            user = request.user if pk is None else get_user_model().objects.get(id=pk)

            # Check permissions
            if user != request.user and not (
                request.user.is_staff
                or request.user.groups.filter(name__in=["instructor", "admin"]).exists()
            ):
                return Response(
                    {"error": "You do not have permission to view this dashboard"},
                    status=403,
                )

            # Try to get cached data first
            cache_key = f"student_dashboard_{user.id}"
            cached_data = cache.get(cache_key)
            if cached_data:
                return Response(cached_data)

            # Get enrolled courses with optimized queries
            enrolled_courses = (
                CourseEnrollment.objects.filter(user=user)
                .select_related("course")
                .prefetch_related(
                    "course__learning_tasks",
                    Prefetch(
                        "course__learning_tasks__progress",
                        queryset=TaskProgress.objects.filter(user=user),
                        to_attr="user_progress",
                    ),
                )
                .order_by("-enrollment_date")
            )

            # Get quiz performance data
            quiz_performance = (
                QuizAttempt.objects.filter(user=user, completion_status="completed")
                .values("quiz__course")
                .annotate(
                    avg_score=Avg("score"),
                    total_attempts=Count("id"),
                    passed_count=Count(
                        Case(When(completion_status="completed", then=1))
                    ),
                )
            )

            # Compile course data
            courses_data = []
            total_tasks = 0
            completed_tasks = 0

            for enrollment in enrolled_courses:
                course = enrollment.course
                course_tasks = course.learning_tasks.all()
                course_total_tasks = len(course_tasks)
                total_tasks += course_total_tasks

                course_completed_tasks = sum(
                    1
                    for task in course_tasks
                    if any(p.status == "completed" for p in task.user_progress)
                )
                completed_tasks += course_completed_tasks

                # Get course quiz performance
                course_quiz_perf = next(
                    (qp for qp in quiz_performance if qp["quiz__course"] == course.id),
                    {"avg_score": 0, "total_attempts": 0, "passed_count": 0},
                )

                courses_data.append(
                    {
                        "course_id": course.id,
                        "course_title": course.title,
                        "enrollment_date": enrollment.enrollment_date,
                        "enrollment_status": enrollment.status,
                        "progress": {
                            "completed_tasks": course_completed_tasks,
                            "total_tasks": course_total_tasks,
                            "completion_percentage": round(
                                (
                                    (course_completed_tasks / course_total_tasks * 100)
                                    if course_total_tasks > 0
                                    else 0
                                ),
                                2,
                            ),
                        },
                        "quiz_performance": {
                            "average_score": round(
                                course_quiz_perf["avg_score"] or 0, 2
                            ),
                            "total_attempts": course_quiz_perf["total_attempts"],
                            "passed_count": course_quiz_perf["passed_count"],
                        },
                    }
                )

            # Get recent activity
            recent_activity = (
                TaskProgress.objects.filter(user=user)
                .select_related("task", "task__course")
                .order_by("-updated_at")[:5]
            )

            # Compile dashboard data
            dashboard_data = {
                "user_info": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "full_name": f"{user.first_name} {user.last_name}".strip(),
                },
                "courses": courses_data,
                "progress": {
                    "overall_progress": round(
                        (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0,
                        2,
                    ),
                    "total_tasks": total_tasks,
                    "completed_tasks": completed_tasks,
                },
                "quiz_performance": {
                    "average_score": round(
                        quiz_performance.aggregate(Avg("avg_score"))["avg_score__avg"]
                        or 0,
                        2,
                    ),
                    "total_attempts": quiz_performance.count(),
                },
                "recent_activity": [
                    {
                        "task_id": activity.task.id,
                        "task_title": activity.task.title,
                        "course_title": activity.task.course.title,
                        "status": activity.status,
                        "updated_at": activity.updated_at,
                    }
                    for activity in recent_activity
                ],
            }

            # Cache the dashboard data for 15 minutes
            cache.set(cache_key, dashboard_data, 15 * 60)

            return Response(dashboard_data)

        except get_user_model().DoesNotExist:
            return Response({"error": "User not found"}, status=404)
        except Exception as e:
            logger.error(
                "Error in StudentDashboardAPI for user %s: %s",
                pk or request.user.id,
                str(e),
            )
            return Response({"error": "An unexpected error occurred"}, status=500)
