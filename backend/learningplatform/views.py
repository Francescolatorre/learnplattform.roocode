from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response

from courses.models import Course
from tasks.models import LearningTask
from .serializers import CourseSerializer, LearningTaskSerializer

class CourseViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Course operations
    """
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=True, methods=['get'])
    def tasks(self, request, pk=None):
        """
        Retrieve tasks for a specific course
        """
        course = self.get_object()
        tasks = course.learning_tasks.all()
        serializer = LearningTaskSerializer(tasks, many=True)
        return Response(serializer.data)

class LearningTaskViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Learning Task operations
    """
    queryset = LearningTask.objects.all()
    serializer_class = LearningTaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        Optionally filter tasks by course or task type
        """
        queryset = LearningTask.objects.all()
        course_id = self.request.query_params.get('course_id')
        task_type = self.request.query_params.get('task_type')

        if course_id:
            queryset = queryset.filter(course_id=course_id)
        if task_type:
            queryset = queryset.filter(task_type=task_type)

        return queryset

    @action(detail=True, methods=['get'])
    def configuration(self, request, pk=None):
        """
        Retrieve task-specific configuration
        """
        task = self.get_object()
        return Response(task.get_task_configuration())

    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """
        Activate a task
        """
        task = self.get_object()
        task.is_active = True
        task.save()
        serializer = self.get_serializer(task)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        """
        Deactivate a task
        """
        task = self.get_object()
        task.is_active = False
        task.save()
        serializer = self.get_serializer(task)
        return Response(serializer.data)
