"""
Authentication-related API views for the Learning Platform backend.

Includes:
- JWT token obtain/refresh/validate endpoints
- Registration and logout endpoints
"""

import logging

from django.contrib.auth import get_user_model
from rest_framework import generics, status
from rest_framework.authentication import get_authorization_header
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.tokens import AccessToken, RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

from ..serializers import CustomTokenObtainPairSerializer, RegisterSerializer

# Logger for this module
logger = logging.getLogger(__name__)


class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Custom token view that uses our enhanced JWT serializer
    """

    serializer_class = CustomTokenObtainPairSerializer


class RegisterView(generics.CreateAPIView):
    """
    API endpoint for user registration
    """

    queryset = get_user_model().objects.all()
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer


class LogoutView(APIView):
    """
    API endpoint for user logout (blacklists the refresh token)
    """

    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(status=status.HTTP_205_RESET_CONTENT)
        except TokenError:
            return Response(status=status.HTTP_400_BAD_REQUEST)


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
