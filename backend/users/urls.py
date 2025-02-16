"""
URL configuration for user authentication endpoints.
"""
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import UserViewSet

urlpatterns = [
    # Authentication endpoints
    path('register/', UserViewSet.as_view({'post': 'register'}), name='user-register'),
    path('login/', UserViewSet.as_view({'post': 'login'}), name='user-login'),
    path('logout/', UserViewSet.as_view({'post': 'logout'}), name='user-logout'),
    path('password-reset/', UserViewSet.as_view({'post': 'password_reset'}), name='user-password-reset'),
    path('profile/', UserViewSet.as_view({
        'get': 'profile',
        'patch': 'profile'
    }), name='user-profile'),
    
    # JWT token refresh
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]