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
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from core.progress_api import (
    CourseAnalyticsAPI,
    CourseStudentProgressAPI,
    CourseTaskAnalyticsAPI,
    EnhancedQuizAttemptViewSet,
    EnhancedTaskProgressViewSet,
    StudentProgressAPI,
    StudentQuizPerformanceAPI,
)
from core.views.auth import (
    CustomTokenObtainPairView,
    LogoutView,
    RegisterView,
    validate_token,
)
from core.views.courses import CourseVersionViewSet, CourseViewSet
from core.views.dashboards import (
    AdminDashboardAPI,
    InstructorDashboardAPI,
    StudentDashboardAPI,
    admin_dashboard_summary,
)
from core.views.enrollments import EnrollmentViewSet
from core.views.health import health_check
from core.views.quizzes import QuizOptionViewSet, QuizQuestionViewSet, QuizTaskViewSet
from core.views.tasks import LearningTaskViewSet
from core.views.users import UserProfileAPI, UserViewSet

# EnhancedTaskProgressViewSet and EnhancedQuizAttemptViewSet remain from progress_api

# API router
router = DefaultRouter()
router.register(r"users", UserViewSet, basename="user")
router.register(r"courses", CourseViewSet)
router.register(r"course-versions", CourseVersionViewSet)
router.register(r"learning-tasks", LearningTaskViewSet)
router.register(r"quiz-tasks", QuizTaskViewSet)
router.register(r"quiz-questions", QuizQuestionViewSet)
router.register(r"quiz-options", QuizOptionViewSet)
router.register(r"enrollments", EnrollmentViewSet)
router.register(r"task-progress", EnhancedTaskProgressViewSet)
router.register(r"quiz-attempts", EnhancedQuizAttemptViewSet)

# JWT auth URLs
auth_urls = [
    path("login/", CustomTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("register/", RegisterView.as_view(), name="register"),
    path("logout/", LogoutView.as_view(), name="logout"),
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
        StudentDashboardAPI.as_view(),
        name="student-dashboard-detail",
    ),
]

# Custom instructor URL
instructor_urls = [
    path(
        "instructor/courses/",
        CourseViewSet.as_view({"get": "instructor_courses"}),
        name="instructor_courses",
    ),
]

schema_view = get_schema_view(
    openapi.Info(
        title="Learning Platform API",
        default_version="v1",
        description="""
# Learning Platform REST API

## Overview
The Learning Platform API provides comprehensive endpoints for managing courses,
learning tasks, quizzes, enrollments, and progress tracking.

## Authentication

Most endpoints require JWT (JSON Web Token) authentication.

### Getting Started:

1. **Register a new account:**
   ```
   POST /auth/register/
   {
     "username": "student1",
     "email": "student@example.com",
     "password": "SecurePass123!",
     "role": "student"
   }
   ```

2. **Login to get access token:**
   ```
   POST /auth/login/
   {
     "username": "student1",
     "password": "SecurePass123!"
   }
   ```

   Response:
   ```json
   {
     "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
     "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
   }
   ```

3. **Use the access token in requests:**
   ```
   Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
   ```

### Token Refresh:
When your access token expires, refresh it using:
```
POST /auth/token/refresh/
{
  "refresh": "your_refresh_token"
}
```

## User Roles

The platform supports three user roles:
- **Student**: Can enroll in courses, complete tasks, take quizzes
- **Instructor**: Can create and manage courses, view student progress
- **Admin**: Full system access, user management, analytics

## Common Error Responses

| Status Code | Meaning |
|-------------|---------|
| 400 | Bad Request - Invalid input data |
| 401 | Unauthorized - Not authenticated (missing/invalid token) |
| 403 | Forbidden - Not authorized (insufficient permissions) |
| 404 | Not Found - Resource doesn't exist |
| 500 | Server Error - Something went wrong on our end |

### Error Response Format:
```json
{
  "error": {
    "code": "validation_error",
    "message": "Invalid input data",
    "details": {
      "email": ["This field is required"]
    }
  }
}
```

## Rate Limiting

- **Anonymous users**: 100 requests/hour
- **Authenticated users**: 1000 requests/hour

## Pagination

List endpoints return paginated results:
```json
{
  "count": 100,
  "next": "http://api.example.com/api/v1/courses/?page=2",
  "previous": null,
  "results": [...]
}
```

## Health Check

Monitor API status: `GET /health/` or `GET /health/?detailed=true`

## Support

For issues or questions, please contact: support@learnplatform.dev
        """,
        terms_of_service="https://www.example.com/terms/",
        contact=openapi.Contact(email="support@learnplatform.dev"),
        license=openapi.License(name="MIT License"),
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
    path("health/", health_check, name="health_check"),
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
