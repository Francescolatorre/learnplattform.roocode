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
from django.urls import include, path
from drf_yasg import openapi
from drf_yasg.views import get_schema_view
from rest_framework import permissions
from rest_framework.authentication import get_authorization_header
from rest_framework.decorators import api_view
from rest_framework.permissions import IsAuthenticated  # Ensure correct import
from rest_framework.response import Response
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.views import TokenRefreshView

from core import views
from core.progress_api import (CourseAnalyticsAPI, CourseStudentProgressAPI,
                               CourseTaskAnalyticsAPI,
                               EnhancedCourseEnrollmentViewSet,
                               EnhancedQuizAttemptViewSet,
                               EnhancedTaskProgressViewSet, StudentProgressAPI,
                               StudentQuizPerformanceAPI)
from core.views import AdminDashboardAPI  # Import AdminDashboardAPI
from core.views import CourseViewSet  # Import CourseViewSet for custom action
from core.views import InstructorDashboardAPI  # Import InstructorDashboardAPI
from core.views import \
    validate_token  # Import validate_token from core/views.py
from core.views import \
    admin_dashboard_summary  # Import the new admin dashboard summary view

# API router
router = DefaultRouter()
router.register(r"users", views.UserViewSet)
router.register(r"courses", views.CourseViewSet)
router.register(r"course-versions", views.CourseVersionViewSet)
router.register(r"learning-tasks", views.LearningTaskViewSet)
router.register(r"quiz-tasks", views.QuizTaskViewSet)
router.register(r"quiz-questions", views.QuizQuestionViewSet)
router.register(r"quiz-options", views.QuizOptionViewSet)
router.register(r"course-enrollments", views.CourseEnrollmentViewSet)
router.register(r"task-progress", EnhancedTaskProgressViewSet)
router.register(r"quiz-attempts", EnhancedQuizAttemptViewSet)
router.register(r"enrollments", EnhancedCourseEnrollmentViewSet)
router.register(r"tasks", views.LearningTaskViewSet)  # Ensure this is included

# JWT auth URLs
auth_urls = [
    path("login/", views.CustomTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path(
        "token/refresh/", TokenRefreshView.as_view(), name="token_refresh"
    ),  # Ensure this is correct
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
        "students/<int:pk>/quiz-performance/",
        StudentQuizPerformanceAPI.as_view(),
        name="student_quiz_performance",
    ),
]

# Custom instructor URL
instructor_urls = [
    path(
        "instructor/courses/",
        views.CourseViewSet.as_view(
            {"get": "instructor_courses"}
        ),  # Correctly map the action
        name="instructor_courses",
    ),
]


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
    path("api/v1/", include(instructor_urls)),  # Ensure instructor URLs are included
    path("auth/", include(auth_urls)),  # Ensure this includes the auth URLs
    path("api-auth/", include("rest_framework.urls")),  # DRF browsable API login
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
    ),  # Add the admin dashboard summary endpoint
    path(
        "api/v1/admin/dashboard/", AdminDashboardAPI.as_view(), name="admin_dashboard"
    ),
    path(
        "swagger/",
        schema_view.with_ui("swagger", cache_timeout=0),
        name="schema-swagger-ui",
    ),
    path("openapi.json", schema_view.without_ui(cache_timeout=0), name="schema-json"),
]
