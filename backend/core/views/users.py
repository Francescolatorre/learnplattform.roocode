"""
User management API views for the Learning Platform backend.

Includes:
- User CRUD operations
- User profile endpoints
"""

import logging
from typing import Any

from django.contrib.auth import get_user_model
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from ..serializers import UserSerializer

logger = logging.getLogger(__name__)


class UserViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing user resources.

    Provides CRUD operations for User model with appropriate permissions.
    """

    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self) -> Any:
        """
        Filter queryset based on user role.
        Regular users can only see their own profile.
        Staff and admin users can see all users.
        """
        if self.request.user.is_staff or self.request.user.is_superuser:
            return get_user_model().objects.all()
        return get_user_model().objects.all().filter(id=self.request.user.id)


class UserProfileAPI(APIView):
    """
    API endpoint to fetch the authenticated user's profile.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
