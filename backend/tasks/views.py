from django.utils import timezone
from rest_framework import permissions, serializers, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import (LearningTask, MultipleChoiceQuizSubmission,
                     MultipleChoiceQuizTaskType)
from .serializers import (LearningTaskDetailSerializer, LearningTaskSerializer,
                          MultipleChoiceQuizSubmissionSerializer,
                          MultipleChoiceQuizTaskTypeSerializer)


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

class MultipleChoiceQuizTaskTypeViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing Multiple Choice Quiz Task Type configurations
    """
    queryset = MultipleChoiceQuizTaskType.objects.all()
    serializer_class = MultipleChoiceQuizTaskTypeSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """
        Customize queryset based on query parameters
        """
        queryset = super().get_queryset()
        
        # Filter by task if task_id is provided
        task_id = self.request.query_params.get('task_id')
        if task_id:
            queryset = queryset.filter(task_id=task_id)
        
        return queryset
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def validate_quiz_submission(self, request, pk=None):
        """
        Validate a student's quiz submission
        """
        quiz_config = self.get_object()
        student_answers = request.data.get('answers', [])
        
        try:
            score, detailed_results = quiz_config.validate_submission(student_answers)
            
            return Response({
                'score': score,
                'max_score': quiz_config.calculate_max_score(),
                'detailed_results': detailed_results,
                'passed': score >= quiz_config.task.passing_score if quiz_config.task.passing_score else None
            })
        except serializers.ValidationError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def quiz_configuration(self, request, pk=None):
        """
        Retrieve quiz configuration details
        """
        quiz_config = self.get_object()
        
        # Optionally randomize questions and options if configured
        questions = quiz_config.questions_config
        
        return Response({
            'total_questions': quiz_config.total_questions,
            'points_per_question': quiz_config.points_per_question,
            'max_attempts': quiz_config.max_attempts,
            'randomize_questions': quiz_config.randomize_questions,
            'randomize_options': quiz_config.randomize_options,
            'questions': questions
        })

class MultipleChoiceQuizSubmissionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing Multiple Choice Quiz Submissions
    """
    queryset = MultipleChoiceQuizSubmission.objects.all()
    serializer_class = MultipleChoiceQuizSubmissionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """
        Customize queryset based on query parameters
        """
        queryset = super().get_queryset()
        
        # Filter by task if task_id is provided
        task_id = self.request.query_params.get('task_id')
        if task_id:
            queryset = queryset.filter(task_id=task_id)
        
        # Filter by student if student_id is provided
        student_id = self.request.query_params.get('student_id')
        if student_id:
            queryset = queryset.filter(student_id=student_id)
        
        return queryset
    
    @action(detail=True, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def submission_details(self, request, pk=None):
        """
        Retrieve detailed information about a specific submission
        """
        submission = self.get_object()
        
        return Response({
            'task_id': submission.task.id,
            'task_title': submission.task.title,
            'student_username': submission.student.username,
            'submission_time': submission.submission_time,
            'score': submission.score,
            'max_score': submission.max_score,
            'attempt_number': submission.attempt_number,
            'is_passed': submission.is_passed,
            'detailed_results': submission.detailed_results
        })
    
    def perform_create(self, serializer):
        """
        Set the student to the current user if not provided
        """
        serializer.save(student=self.request.user)
