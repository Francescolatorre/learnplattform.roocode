from django.urls import path
from rest_framework.routers import DefaultRouter

# Placeholder views - will be implemented later
class UserViewSet:
    pass

router = DefaultRouter()
# router.register(r'', UserViewSet, basename='user')

urlpatterns = [
    # Add user-related routes here
]

# urlpatterns += router.urls