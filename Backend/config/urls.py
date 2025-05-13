"""
Root URL configuration for the Learning Platform Backend.

This module defines the top-level URL routing for the entire platform:

Core API Routes:
- /api/v1/: Core REST API endpoints for all platform functionality
- /api/v1/admin/dashboard/: Admin dashboard data and analytics
- /api/v1/instructor/dashboard/: Instructor-specific views
- /auth/: Authentication endpoints (login, logout, token refresh)
- /users/profile/: User profile management

Documentation:
- /swagger/: Interactive API documentation
- /openapi.json: OpenAPI schema

Development:
- /admin/: Django admin interface
- /api-auth/: DRF browsable API authentication
- /health/: Application health check endpoint

All routes follow REST principles and include appropriate
permission checks based on user roles.
"""

from django.contrib import admin
from django.urls import include, path
from drf_yasg import openapi
from drf_yasg.views import get_schema_view
from rest_framework import permissions
from rest_framework.authentication import get_authorization_header
from rest_framework.decorators import api_view
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.views import TokenRefreshView

from core import views
from core.progress_api import (
    CourseAnalyticsAPI,
    CourseStudentProgressAPI,
    CourseTaskAnalyticsAPI,
    EnhancedQuizAttemptViewSet,
    EnhancedTaskProgressViewSet,
    StudentProgressAPI,
    StudentQuizPerformanceAPI,
)
from core.views import AdminDashboardAPI
from core.views import CourseViewSet
from core.views import InstructorDashboardAPI
from core.views import validate_token
from core.views import admin_dashboard_summary
from core.views import UserProfileAPI

# API router
router = DefaultRouter()
router.register(r"users", views.UserViewSet, basename="user")
router.register(r"courses", views.CourseViewSet)
router.register(r"course-versions", views.CourseVersionViewSet)
router.register(r"learning-tasks", views.LearningTaskViewSet)
router.register(r"quiz-tasks", views.QuizTaskViewSet)
router.register(r"quiz-questions", views.QuizQuestionViewSet)
router.register(r"quiz-options", views.QuizOptionViewSet)
router.register(r"enrollments", views.EnrollmentViewSet)
router.register(r"task-progress", EnhancedTaskProgressViewSet)
router.register(r"quiz-attempts", EnhancedQuizAttemptViewSet)
router.register(r"tasks", views.LearningTaskViewSet)

# JWT auth URLs
auth_urls = [
    path("login/", views.CustomTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("register/", views.RegisterView.as_view(), name="register"),
    path("logout/", views.LogoutView.as_view(), name="logout"),
    path("validate-token/", validate_token, name="validate_token"),
]

# Analytics URLs
analytics_urls = [
    path(
        "courses/<int:pk>/analytics/",
        CourseAnalyticsAPI.as_view(),
        name="course_analytics",
    ),
    path(
        "courses/<int:pk>/student-progress/",
        CourseStudentProgressAPI.as_view(),
        name="course_student_progress",
    ),
    path(
        "courses/<int:pk>/task-analytics/",
        CourseTaskAnalyticsAPI.as_view(),
        name="course_task_analytics",
    ),
    path(
        "students/<int:pk>/progress/",
        StudentProgressAPI.as_view(),
        name="student_progress",
    ),
    path(
        "students/progress/",
        StudentProgressAPI.as_view(),
        name="student_personal_progress",
    ),
    path(
        "students/<int:pk>/quiz-performance/",
        StudentQuizPerformanceAPI.as_view(),
        name="student_quiz_performance",
    ),
    path(
        "students/<int:pk>/dashboard/",
        views.StudentDashboardAPI.as_view(),
        name="student-dashboard-detail",
    ),
]

# Custom instructor URL
instructor_urls = [
    path(
        "instructor/courses/",
        views.CourseViewSet.as_view({"get": "instructor_courses"}),
        name="instructor_courses",
    ),
]

schema_view = get_schema_view(
    openapi.Info(
        title="API Documentation",
        default_version="v1",
        description="API documentation for the backend",
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/", include(router.urls)),
    path("api/v1/", include(analytics_urls)),
    path("api/v1/", include(instructor_urls)),
    path("auth/", include(auth_urls)),
    path("api-auth/", include("rest_framework.urls")),
    path("health/", views.health_check, name="health_check"),
    path(
        "api/v1/instructor/dashboard/",
        InstructorDashboardAPI.as_view(),
        name="instructor_dashboard",
    ),
    path(
        "api/v1/dashboard/admin-summary/",
        admin_dashboard_summary,
        name="admin_dashboard_summary",
    ),
    path(
        "api/v1/admin/dashboard/", AdminDashboardAPI.as_view(), name="admin_dashboard"
    ),
    path("users/profile/", UserProfileAPI.as_view(), name="user_profile"),
    path(
        "swagger/",
        schema_view.with_ui("swagger", cache_timeout=0),
        name="schema-swagger-ui",
    ),
    path("openapi.json", schema_view.without_ui(cache_timeout=0), name="schema-json"),
]
