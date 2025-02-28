from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import CourseViewSet, LearningTaskViewSet

# Create a router and register our viewsets
router = DefaultRouter()
router.register(r'courses', CourseViewSet)
router.register(r'tasks', LearningTaskViewSet)

urlpatterns = [
    # Include router URLs
    path('', include(router.urls)),
]
