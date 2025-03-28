from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.viewsets import ViewSet
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from core.models import Course  # Update import to reference the new location
from core.serializers import (
    CourseSerializer,
)  # Update import to reference the new location
from .models import LearningTask
from .serializers import LearningTaskSerializer
import logging

logger = logging.getLogger(__name__)


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Ensure the role field exists and is populated
        token["username"] = user.username
        token["role"] = getattr(
            user, "role", "user"
        )  # Default to "user" if role is not set
        return token


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class LearningTaskViewSet(ViewSet):
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=["get"], url_path="course/(?P<course_id>[^/.]+)")
    def get_tasks_by_course(self, request, course_id):
        """
        Retrieve learning tasks for a specific course.
        """
        tasks = LearningTask.objects.filter(course_id=course_id)
        if not tasks.exists():
            logger.debug("No LearningTasks found for course_id=%s", course_id)
        serializer = LearningTaskSerializer(tasks, many=True)
        return Response(serializer.data)


class CourseViewSet(ViewSet):
    def list(self, request):
        courses = Course.objects.prefetch_related("learning_tasks")  # Optimierung
        serializer = CourseSerializer(courses, many=True)
        return Response(serializer.data)
