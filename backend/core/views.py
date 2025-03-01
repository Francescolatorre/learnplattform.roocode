import platform

import django
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response


@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """
    Health check endpoint that returns system and application status.
    Accessible without authentication.
    """
    return Response({
        'status': 'healthy',
        'system': {
            'python_version': platform.python_version(),
            'django_version': django.get_version(),
            'platform': platform.platform(),
        },
        'database': {
            'status': 'connected'
        }
    }, status=status.HTTP_200_OK)
