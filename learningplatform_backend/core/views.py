from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from rest_framework import viewsets, generics, status, permissions
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from .models import (
    User, Course, CourseVersion, LearningTask, QuizTask, QuizQuestion, QuizOption
)
from .serializers import (
    UserSerializer, RegisterSerializer, CustomTokenObtainPairSerializer,
    CourseSerializer, CourseVersionSerializer, LearningTaskSerializer, QuizTaskSerializer, QuizQuestionSerializer,
    QuizOptionSerializer
)

class IsInstructorOrAdminPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        return request.user.role in ['instructor', 'admin']

class IsAdminPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        return request.user.role == 'admin'

class AllowAnyForRegisterPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        if view.action == 'create':  # Registration
            return True
        return request.user.is_authenticated

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer

class LogoutView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh_token')
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response(status=status.HTTP_400_BAD_REQUEST)

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.action == 'update' or self.action == 'partial_update':
            return [permissions.IsAuthenticated()]
        elif self.action == 'list' or self.action == 'retrieve':
            return [permissions.IsAuthenticated()]
        else:
            return [IsAdminPermission()]

    def get_queryset(self):
        if self.request.user.is_authenticated and self.request.user.role != 'admin':
            return User.objects.filter(pk=self.request.user.pk)
        return User.objects.all()

    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsInstructorOrAdminPermission()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(creator=self.request.user)

    @action(detail=True, methods=['get'])
    def versions(self, request, pk=None):
        course = self.get_object()
        versions = CourseVersion.objects.filter(course=course)
        serializer = CourseVersionSerializer(versions, many=True)
        return Response(serializer.data)

class CourseVersionViewSet(viewsets.ModelViewSet):
    queryset = CourseVersion.objects.all()
    serializer_class = CourseVersionSerializer
    permission_classes = [IsInstructorOrAdminPermission]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class LearningTaskViewSet(viewsets.ModelViewSet):
    queryset = LearningTask.objects.all()
    serializer_class = LearningTaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsInstructorOrAdminPermission()]
        return [permissions.IsAuthenticated()]

    @action(detail=False, methods=['get'])
    def by_course(self, request):
        course_id = request.query_params.get('course_id')
        if not course_id:
            return Response(
                {"error": "course_id query parameter is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        tasks = LearningTask.objects.filter(course_id=course_id)
        serializer = self.get_serializer(tasks, many=True)
        return Response(serializer.data)

class QuizTaskViewSet(viewsets.ModelViewSet):
    queryset = QuizTask.objects.all()
    serializer_class = QuizTaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsInstructorOrAdminPermission()]
        return [permissions.IsAuthenticated()]

class QuizQuestionViewSet(viewsets.ModelViewSet):
    queryset = QuizQuestion.objects.all()
    serializer_class = QuizQuestionSerializer
    permission_classes = [IsInstructorOrAdminPermission]

class QuizOptionViewSet(viewsets.ModelViewSet):
    queryset = QuizOption.objects.all()
    serializer_class = QuizOptionSerializer
    permission_classes = [IsInstructorOrAdminPermission]

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_student_progress(request, course_id, student_id=None):
    progress_data = {
        'courseId': course_id,
        'studentId': student_id,
        'totalTasks': 10,
        'completedTasks': 5,
        'averageScore': 85,
        'totalObjectives': 8,
        'achievedObjectives': 4,
        'moduleProgress': [],
        'taskProgress': [],
        'recentActivity': []
    }
    return Response(progress_data)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_course_structure(request, course_id):
    course_structure = {
        'courseId': course_id,
        'courseTitle': 'Sample Course',
        'modules': [],
        'learningObjectives': []
    }
    return Response(course_structure)

@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    data = {
        'status': 'healthy',
        'message': 'Learning Platform API is up and running!',
        'version': '0.1.0'
    }
    return Response(data)
