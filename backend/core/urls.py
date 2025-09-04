"""
URL patterns for the core Learning Platform application.

This module defines the URL routing for the core functionality:

API Endpoints:
- /users/: User management and profiles
- /courses/: Course CRUD and enrollment
- /course-versions/: Course version tracking
- /learning-tasks/: Learning task management
- /quiz-tasks/: Quiz creation and management
- /quiz-questions/: Quiz question handling
- /quiz-options/: Quiz answer options
- /enrollments/: Course enrollment management

Additional Routes:
- /health/: Health check endpoint
- /api/v1/students/<id>/dashboard/: Student dashboard data
"""

from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views.courses import CourseVersionViewSet, CourseViewSet
from .views.dashboards import StudentDashboardAPI
from .views.enrollments import EnrollmentViewSet
from .views.misc import health_check
from .views.quizzes import QuizOptionViewSet, QuizQuestionViewSet, QuizTaskViewSet
from .views.tasks import LearningTaskViewSet
from .views.users import UserViewSet

router = DefaultRouter()
router.register(r"users", UserViewSet, basename="user")
router.register(r"courses", CourseViewSet)
router.register(r"course-versions", CourseVersionViewSet)
router.register(r"learning-tasks", LearningTaskViewSet)
router.register(r"quiz-tasks", QuizTaskViewSet)
router.register(r"quiz-questions", QuizQuestionViewSet)
router.register(r"quiz-options", QuizOptionViewSet)
router.register(r"enrollments", EnrollmentViewSet)

urlpatterns = [
    path("", include(router.urls)),
    path("health/", health_check, name="health_check"),
]
