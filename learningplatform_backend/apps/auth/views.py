from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import LoginSerializer
from .utils import generate_tokens
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework_simplejwt.exceptions import InvalidToken
import logging

logger = logging.getLogger(__name__)


class LoginView(APIView):
    def post(self, request):
        logger.info(
            "Login request data: %s", request.data
        )  # Log the incoming request data
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data["user"]
            tokens = generate_tokens(user)  # Ensure tokens are generated correctly
            return Response(
                tokens, status=status.HTTP_201_CREATED
            )  # Return 201 Created
        logger.warning(
            "Login validation failed: %s", serializer.errors
        )  # Log validation errors
        return Response(
            {"detail": "Invalid username or password"},
            status=status.HTTP_400_BAD_REQUEST,
        )


class CustomTokenRefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        try:
            logger.info("Token refresh request received.")
            return super().post(request, *args, **kwargs)
        except InvalidToken as e:
            logger.warning("Invalid refresh token: %s", e)
            return Response(
                {"detail": "Invalid refresh token"}, status=status.HTTP_400_BAD_REQUEST
            )
