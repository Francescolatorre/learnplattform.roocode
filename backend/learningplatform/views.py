from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from rest_framework import permissions, viewsets
from rest_framework.response import Response

from .models import Course  # Assuming Course model exists
from .serializers import CourseSerializer  # Assuming CourseSerializer exists


# Add schema view for OpenAPI
class SchemaView(SpectacularAPIView):
    permission_classes = [permissions.AllowAny]

class SwaggerView(SpectacularSwaggerView):
    permission_classes = [permissions.AllowAny]

class CourseViewSet(viewsets.ModelViewSet):
    """ViewSet for handling course-related API endpoints."""
    queryset = Course.objects.all()
    serializer_class = CourseSerializer

    def list(self, request):
        """Retrieve a list of courses."""
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def create(self, request):
        """Create a new course."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        course = serializer.save()
        return Response(serializer.data, status=201)

    # Additional methods for retrieve, update, and destroy can be added here
