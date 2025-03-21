from django.http import JsonResponse
from rest_framework import viewsets, permissions, status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import (
    User, Course, CourseVersion, StatusTransition,
    LearningTask, QuizTask, QuizQuestion, QuizOption,
    CourseEnrollment, TaskProgress, QuizAttempt, QuizResponse
)
from .serializers import (
    UserSerializer, CourseSerializer, CourseVersionSerializer, StatusTransitionSerializer,
    LearningTaskSerializer, QuizTaskSerializer, QuizQuestionSerializer, QuizOptionSerializer,
    CourseEnrollmentSerializer, TaskProgressSerializer, QuizAttemptSerializer, QuizResponseSerializer,
    RegisterSerializer, CustomTokenObtainPairSerializer
)


@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """
    Simple health check endpoint to verify the API is running
    """
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
        if self.action == 'retrieve' and self.request.user.is_authenticated:
            if str(self.request.user.id) == self.kwargs.get('pk'):
                return [permissions.IsAuthenticated()]
        return super().get_permissions()


class CourseViewSet(viewsets.ModelViewSet):
    """
    API endpoint for courses
    """
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(creator=self.request.user)


class CourseVersionViewSet(viewsets.ModelViewSet):
    """
    API endpoint for course versions
    """
    queryset = CourseVersion.objects.all()
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
    queryset = CourseEnrollment.objects.all()
    serializer_class = CourseEnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        Filter enrollments to only show those belonging to the current user
        unless the user is staff/admin
        """
        if self.request.user.is_staff or self.request.user.role == 'admin':
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
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        Filter progress to only show those belonging to the current user
        unless the user is staff/admin
        """
        if self.request.user.is_staff or self.request.user.role == 'admin':
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
        if self.request.user.is_staff or self.request.user.role == 'admin':
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
        if self.request.user.is_staff or self.request.user.role == 'admin':
            return QuizResponse.objects.all()
        return QuizResponse.objects.filter(attempt__user=self.request.user)
