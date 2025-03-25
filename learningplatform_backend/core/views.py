import logging  # Add logging import

from django.db import models  # Add this import for using models.Sum
from django.db.models import Avg
from django.http import JsonResponse
from rest_framework import generics, permissions, status, viewsets
from rest_framework.authentication import get_authorization_header
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.tokens import AccessToken, RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

from core.permissions import (  # Import the custom permissions
    IsEnrolledInCourse,
    IsInstructorOrAdmin,
    IsStudentOrReadOnly,
)

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
    StatusTransition,
    TaskProgress,
    User,
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
    StatusTransitionSerializer,
    TaskProgressSerializer,
    UserSerializer,
)

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

    queryset = User.objects.all()
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
        except Exception as e:
            return Response(status=status.HTTP_400_BAD_REQUEST)


class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint for users
    """

    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_permissions(self):
        """
        Allow users to view their own profile
        """
        if self.action == "retrieve" and self.request.user.is_authenticated:
            if str(self.request.user.id) == self.kwargs.get("pk"):
                return [permissions.IsAuthenticated()]
        return super().get_permissions()


class CourseViewSet(viewsets.ModelViewSet):
    """
    API endpoint for courses
    """

    queryset = Course.objects.all().order_by("id")  # Ensure consistent ordering
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated]

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

            if request.user.role == "admin":
                # Admins can view all courses
                queryset = self.get_queryset()
            else:
                # Instructors can only view courses they created
                queryset = self.get_queryset().filter(creator=request.user)

            if not queryset.exists():
                return Response({"message": "No courses found."}, status=404)

            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)
        except Exception as e:
            # Log the error for debugging
            print(f"Error fetching instructor courses: {str(e)}")
            return Response(
                {"error": "An unexpected error occurred while fetching courses."},
                status=500,
            )

    @action(
        detail=True,
        methods=["get"],
        url_path="student-progress",
        permission_classes=[IsAuthenticated],  # Allow all authenticated users
    )
    def student_progress(self, request, pk=None):
        """
        Fetch student progress for a specific course.
        """
        try:
            course = self.get_object()

            # Check if the user is enrolled
            is_enrolled = CourseEnrollment.objects.filter(
                user=request.user, course_id=course.id
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

            # Fetch progress for the authenticated student
            progress = TaskProgress.objects.filter(
                user=request.user, task__course_id=course.id
            )
            if not progress.exists():
                return Response(
                    {"message": "No progress found for this course."}, status=404
                )

            serializer = TaskProgressSerializer(progress, many=True)
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Error fetching student progress for course {pk}: {str(e)}")
            return Response(
                {"error": "An unexpected error occurred while fetching progress."},
                status=500,
            )

    def get_permissions(self):
        """
        Allow students to view course details.
        """
        if self.action == "retrieve" and self.request.user.is_authenticated:
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
            logger.error(f"Error fetching tasks for course {course_id}: {str(e)}")
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


class CourseEnrollmentViewSet(viewsets.ModelViewSet):
    """
    API endpoint for course enrollments
    """

    queryset = CourseEnrollment.objects.all().order_by("id")
    serializer_class = CourseEnrollmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Filter enrollments to only show those belonging to the current user
        unless the user is staff/admin
        """
        if self.request.user.is_staff or self.request.user.role == "admin":
            return CourseEnrollment.objects.all()
        return CourseEnrollment.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class TaskProgressViewSet(viewsets.ModelViewSet):
    """
    API endpoint for task progress
    """

    queryset = TaskProgress.objects.all()
    serializer_class = TaskProgressSerializer
    permission_classes = [
        permissions.IsAuthenticated,
        IsStudentOrReadOnly,
    ]  # Add custom permission

    def get_queryset(self):
        """
        Filter progress to only show those belonging to the current user
        unless the user is staff/admin
        """
        if self.request.user.is_staff or self.request.user.role == "admin":
            return TaskProgress.objects.all()
        return TaskProgress.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


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
