from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Course
from .serializers import CourseDetailSerializer, CourseSerializer


class CourseViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing courses.
    """
    queryset = Course.objects.all()
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        """
        Return different serializers based on the action.
        """
        if self.action == 'retrieve':
            return CourseDetailSerializer
        return CourseSerializer

    @action(detail=True, methods=['GET'])
    def tasks(self, request, pk=None):
        """
        Retrieve all tasks for a specific course.
        """
        course = self.get_object()
        tasks = course.get_learning_tasks()
        serializer = self.get_serializer(tasks, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['POST'])
    def add_task(self, request, pk=None):
        """
        Add a task to the course.
        """
        course = self.get_object()
        task_id = request.data.get('task_id')
        
        if not task_id:
            return Response({'error': 'Task ID is required'}, status=400)
        
        try:
            from tasks.models import LearningTask
            task = LearningTask.objects.get(id=task_id)
            course.tasks.add(task)
            course.save()
            return Response({'message': 'Task added successfully'}, status=201)
        except LearningTask.DoesNotExist:
            return Response({'error': 'Task not found'}, status=404)
