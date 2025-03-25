from django.urls import path, include
from rest_framework.routers import DefaultRouter
from core.views import CourseViewSet

router = DefaultRouter()
router.register(r"courses", CourseViewSet, basename="course")

urlpatterns = [
    path("api/v1/", include(router.urls)),
]
