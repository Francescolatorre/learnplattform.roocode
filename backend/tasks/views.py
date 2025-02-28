from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import serializers
from django.utils import timezone

from .models import LearningTask
from .serializers import LearningTaskSerializer, LearningTaskDetailSerializer

class LearningTaskViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing Learning Tasks
    """
    queryset = LearningTask.objects.all()
    serializer_class = LearningTaskSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        """
        Return different serializers for list and retrieve actions
        """
        if self.action in ['retrieve', 'list']:
            return LearningTaskDetailSerializer
        return LearningTaskSerializer
    
    def get_queryset(self):
        """
        Customize queryset based on user permissions and query parameters
        """
        queryset = super().get_queryset()
        
        # Filter by course if course_id is provided
        course_id = self.request.query_params.get('course_id')
        if course_id:
            queryset = queryset.filter(course_id=course_id)
        
        # Filter by status
        status = self.request.query_params.get('status')
        if status:
            queryset = queryset.filter(status=status)
        
        # Filter by task type
        task_type = self.request.query_params.get('task_type')
        if task_type:
            queryset = queryset.filter(task_type=task_type)
        
        return queryset
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def check_submission_eligibility(self, request, pk=None):
        """
        Custom action to check if a student can submit the task
        """
        task = self.get_object()
        student = request.user
        
        can_submit = task.can_submit(student)
        
        return Response({
            'can_submit': can_submit,
            'task_details': {
                'id': task.id,
                'title': task.title,
                'deadline': task.deadline,
                'max_submissions': task.max_submissions
            }
        })
    
    @action(detail=True, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def task_settings(self, request, pk=None):
        """
        Retrieve task-specific settings
        """
        task = self.get_object()
        return Response(task.get_task_settings())
    
    def perform_create(self, serializer):
        """
        Automatically set the created_by field to the current user
        """
        serializer.save(created_by=self.request.user)
    
    def perform_update(self, serializer):
        """
        Additional logic for updating tasks
        """
        # Prevent updating archived tasks
        task = self.get_object()
        if task.status == 'ARCHIVED':
            raise serializers.ValidationError("Cannot modify archived tasks")
        
        serializer.save()
