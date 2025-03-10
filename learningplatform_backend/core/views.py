from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from rest_framework import viewsets, generics, status, permissions
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from .models import (
    User, Course, CourseVersion, StatusTransition, 
    LearningTask, QuizTask, QuizQuestion, QuizOption
)
from .serializers import (
    UserSerializer, RegisterSerializer, CustomTokenObtainPairSerializer,
    CourseSerializer, CourseVersionSerializer, StatusTransitionSerializer,
    LearningTaskSerializer, QuizTaskSerializer, QuizQuestionSerializer,
    QuizOptionSerializer
)


class IsInstructorOrAdminPermission(permissions.BasePermission):
    """
    Custom permission to only allow instructors or admins to perform certain actions
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        return request.user.role in ['instructor', 'admin']


class IsAdminPermission(permissions.BasePermission):
    """
    Custom permission to only allow admin users
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        return request.user.role == 'admin'


class AllowAnyForRegisterPermission(permissions.BasePermission):
    """
    Allow any user to register
    """
    def has_permission(self, request, view):
        if view.action == 'create':  # Registration
            return True
        return request.user.is_authenticated


class CustomTokenObtainPairView(TokenObtainPairView):
    """Custom token view that returns user data along with tokens"""
    serializer_class = CustomTokenObtainPairSerializer


class RegisterView(generics.CreateAPIView):
    """API endpoint for user registration"""
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer


class LogoutView(generics.GenericAPIView):
    """Logout view that invalidates refresh token"""
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
    """API endpoint for users"""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_permissions(self):
        if self.action == 'update' or self.action == 'partial_update':
            # Users can update their own profiles, admins can update anyone
            return [permissions.IsAuthenticated()]
        elif self.action == 'list' or self.action == 'retrieve':
            return [permissions.IsAuthenticated()]
        else:  # create, destroy
            return [IsAdminPermission()]
    
    def get_queryset(self):
        # Non-admin users can only see their own profile
        if self.request.user.role != 'admin':
            return User.objects.filter(pk=self.request.user.pk)
        return User.objects.all()
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get current user's profile"""
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)


class CourseViewSet(viewsets.ModelViewSet):
    """API endpoint for courses"""
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
        """Get all versions of a course"""
        course = self.get_object()
        versions = CourseVersion.objects.filter(course=course)
        serializer = CourseVersionSerializer(versions, many=True)
        return Response(serializer.data)


class CourseVersionViewSet(viewsets.ModelViewSet):
    """API endpoint for course versions"""
    queryset = CourseVersion.objects.all()
    serializer_class = CourseVersionSerializer
    permission_classes = [IsInstructorOrAdminPermission]
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class LearningTaskViewSet(viewsets.ModelViewSet):
    """API endpoint for learning tasks"""
    queryset = LearningTask.objects.all()
    serializer_class = LearningTaskSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsInstructorOrAdminPermission()]
        return [permissions.IsAuthenticated()]
    
    @action(detail=False, methods=['get'])
    def by_course(self, request):
        """Get all tasks for a specific course"""
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
    """API endpoint for quiz tasks"""
    queryset = QuizTask.objects.all()
    serializer_class = QuizTaskSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsInstructorOrAdminPermission()]
        return [permissions.IsAuthenticated()]


class QuizQuestionViewSet(viewsets.ModelViewSet):
    """API endpoint for quiz questions"""
    queryset = QuizQuestion.objects.all()
    serializer_class = QuizQuestionSerializer
    permission_classes = [IsInstructorOrAdminPermission]


class QuizOptionViewSet(viewsets.ModelViewSet):
    """API endpoint for quiz options"""
    queryset = QuizOption.objects.all()
    serializer_class = QuizOptionSerializer
    permission_classes = [IsInstructorOrAdminPermission]


@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """API health check endpoint that doesn't require authentication"""
    data = {
        'status': 'healthy',
        'message': 'Learning Platform API is up and running!',
        'version': '0.1.0'
    }
    return Response(data)