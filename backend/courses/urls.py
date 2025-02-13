from django.urls import path
from rest_framework.routers import DefaultRouter

# Placeholder views - will be implemented later
class CourseViewSet:
    pass

router = DefaultRouter()
# router.register(r'', CourseViewSet, basename='course')

urlpatterns = [
    # Add course-related routes here
]

# urlpatterns += router.urls