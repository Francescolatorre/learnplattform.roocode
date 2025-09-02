"""
Learning task management API views for the Learning Platform backend.

Includes:
- CRUD operations for learning tasks
- Task progress endpoints
"""

import logging

from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models import LearningTask, TaskProgress
from ..serializers import LearningTaskSerializer, TaskProgressSerializer

logger = logging.getLogger(__name__)


class LearningTaskViewSet(viewsets.ModelViewSet):
    """
    API endpoint for learning tasks
    """

    queryset = LearningTask.objects.all()
    serializer_class = LearningTaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        Filter queryset based on user role and permissions:
        - Admins and staff see all tasks
        - Instructors see all tasks in their courses
        - Students only see published tasks
        """
        queryset = LearningTask.objects.all()
        course_id = self.request.query_params.get("course")
        if course_id is not None:
            queryset = queryset.filter(course_id=course_id)
        if self.request.user.is_staff or self.request.user.is_superuser:
            pass
        elif getattr(self.request.user, "role", None) == "instructor":
            queryset = queryset.filter(course__creator=self.request.user)
        else:
            queryset = queryset.filter(is_published=True)
        return queryset

    @action(detail=False, methods=["get"], url_path="course/(?P<course_id>[^/.]+)")
    def tasks_by_course(self, request, course_id=None):
        """
        Fetch tasks for a specific course.
        """
        try:
            tasks = self.get_queryset().filter(course_id=course_id).order_by("order")
            if not tasks.exists():
                return Response(
                    {"error": "No tasks found for this course."}, status=404
                )
            serializer = self.get_serializer(tasks, many=True)
            return Response(serializer.data)
        except Exception as e:
            logger.error(
                "Error fetching tasks for course %s: %s",
                course_id,
                str(e),
                exc_info=True,
            )
            return Response(
                {"error": "An unexpected error occurred while fetching tasks."},
                status=500,
            )


class TaskProgressViewSet(viewsets.ModelViewSet):
    """
    API endpoint for task progress
    """

    queryset = TaskProgress.objects.all()
    serializer_class = TaskProgressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Filter progress to only show those belonging to the current user
        return TaskProgress.objects.filter(user=self.request.user)

    def partial_update(self, request, *args, **kwargs):
        # Allow updating the status of a task
        instance = self.get_object()
        instance.status = request.data.get("status", instance.status)
        instance.save()
        return Response({"status": "Task progress updated"})


class UserTaskProgressAPI(APIView):
    """
    API endpoint to retrieve task progress for the authenticated user.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        task_progress = TaskProgress.objects.filter(user=user)
        data = [{"task_id": tp.task.id, "status": tp.status} for tp in task_progress]
        return Response(data)
