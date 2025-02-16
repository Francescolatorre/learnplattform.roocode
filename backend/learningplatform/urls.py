"""
Root URL configuration for the learning platform.
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter

# Import viewsets from different apps
from users.views import UserViewSet
from tasks.views import LearningTaskViewSet, AssessmentTaskViewSet, QuizTaskViewSet
from learning.views import CourseViewSet
from assessment.views import SubmissionViewSet, QuizViewSet, UserProgressViewSet

# Create router and register viewsets
router = DefaultRouter()

# Users
router.register(r'users', UserViewSet, basename='user')

# Tasks
router.register(r'learning-tasks', LearningTaskViewSet, basename='learning-task')
router.register(r'assessment-tasks', AssessmentTaskViewSet, basename='assessment-task')
router.register(r'quiz-tasks', QuizTaskViewSet, basename='quiz-task')

# Learning
router.register(r'courses', CourseViewSet, basename='course')

# Assessment
router.register(r'submissions', SubmissionViewSet, basename='submission')
router.register(r'quizzes', QuizViewSet, basename='quiz')
router.register(r'user-progress', UserProgressViewSet, basename='user-progress')

urlpatterns = [
    # Admin site
    path('admin/', admin.site.urls),
    
    # API routes
    path('api/v1/', include(router.urls)),
    
    # Authentication routes
    path('api/v1/auth/', include('users.urls')),
]
