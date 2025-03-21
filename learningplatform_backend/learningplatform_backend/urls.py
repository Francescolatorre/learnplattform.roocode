"""
URL configuration for learningplatform_backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from core import views
from core.progress_api import EnhancedCourseEnrollmentViewSet, EnhancedTaskProgressViewSet, EnhancedQuizAttemptViewSet, CourseAnalyticsAPI, CourseStudentProgressAPI, CourseTaskAnalyticsAPI, StudentProgressAPI, StudentQuizPerformanceAPI

# API router
router = DefaultRouter()
router.register(r'users', views.UserViewSet)
router.register(r'courses', views.CourseViewSet)
router.register(r'course-versions', views.CourseVersionViewSet)
router.register(r'learning-tasks', views.LearningTaskViewSet)
router.register(r'quiz-tasks', views.QuizTaskViewSet)
router.register(r'quiz-questions', views.QuizQuestionViewSet)
router.register(r'quiz-options', views.QuizOptionViewSet)
router.register(r'course-enrollments', views.CourseEnrollmentViewSet)
router.register(r'task-progress', EnhancedTaskProgressViewSet)
router.register(r'quiz-attempts', EnhancedQuizAttemptViewSet)
router.register(r'enrollments', EnhancedCourseEnrollmentViewSet)

# JWT auth URLs
auth_urls = [
    path('login/', views.CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/', views.RegisterView.as_view(), name='register'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
]

# Analytics URLs
analytics_urls = [
    path('courses/<int:pk>/analytics/', CourseAnalyticsAPI.as_view(), name='course_analytics'),
    path('courses/<int:pk>/student-progress/', CourseStudentProgressAPI.as_view(), name='course_student_progress'),
    path('courses/<int:pk>/task-analytics/', CourseTaskAnalyticsAPI.as_view(), name='course_task_analytics'),
    path('students/<int:pk>/progress/', StudentProgressAPI.as_view(), name='student_progress'),
    path('students/<int:pk>/quiz-performance/', StudentQuizPerformanceAPI.as_view(), name='student_quiz_performance'),
]

urlpatterns = [
    path("admin/", admin.site.urls),
    path('api/v1/', include(router.urls)),
    path('api/v1/', include(analytics_urls)),
    path('auth/', include(auth_urls)),
    path('api-auth/', include('rest_framework.urls')),  # DRF browsable API login
    path('health/', views.health_check, name='health_check'),
]

