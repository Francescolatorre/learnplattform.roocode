from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Submission, Quiz, UserProgress
from .serializers import (
    SubmissionSerializer, 
    QuizSerializer, 
    UserProgressSerializer
)
from tasks.models import QuizTask
from django.contrib.auth import get_user_model

User = get_user_model()

class SubmissionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing submissions.
    """
    queryset = Submission.objects.all()
    serializer_class = SubmissionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        Limit submissions to the current user unless they are staff.
        """
        user = self.request.user
        if user.is_staff:
            return Submission.objects.all()
        return Submission.objects.filter(user=user)

    @action(detail=False, methods=['POST'])
    def grade_submission(self, request):
        """
        Grade a submission.
        """
        submission_id = request.data.get('submission_id')
        grade = request.data.get('grade')

        try:
            submission = Submission.objects.get(id=submission_id)
            
            # Ensure only instructors or staff can grade
            if not request.user.is_staff:
                return Response(
                    {'error': 'Only staff can grade submissions'}, 
                    status=status.HTTP_403_FORBIDDEN
                )

            submission.grade = grade
            submission.save()
            
            serializer = self.get_serializer(submission)
            return Response(serializer.data)
        except Submission.DoesNotExist:
            return Response(
                {'error': 'Submission not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )

class QuizViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing quizzes.
    """
    queryset = Quiz.objects.all()
    serializer_class = QuizSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=True, methods=['POST'])
    def add_task(self, request, pk=None):
        """
        Add a quiz task to the quiz.
        """
        quiz = self.get_object()
        task_id = request.data.get('task_id')
        
        if not task_id:
            return Response(
                {'error': 'Task ID is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            task = QuizTask.objects.get(id=task_id)
            quiz.tasks.add(task)
            quiz.save()
            
            serializer = self.get_serializer(quiz)
            return Response(serializer.data)
        except QuizTask.DoesNotExist:
            return Response(
                {'error': 'Quiz task not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )

class UserProgressViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing user progress.
    """
    queryset = UserProgress.objects.all()
    serializer_class = UserProgressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        Limit progress to the current user unless they are staff.
        """
        user = self.request.user
        if user.is_staff:
            return UserProgress.objects.all()
        return UserProgress.objects.filter(user=user)

    @action(detail=False, methods=['POST'])
    def mark_task_completed(self, request):
        """
        Mark a task as completed for a specific quiz progress.
        """
        quiz_progress_id = request.data.get('quiz_progress_id')
        task_id = request.data.get('task_id')

        try:
            progress = UserProgress.objects.get(id=quiz_progress_id, user=request.user)
            task = QuizTask.objects.get(id=task_id)

            # Ensure the task belongs to the quiz
            if task not in progress.quiz.tasks.all():
                return Response(
                    {'error': 'Task does not belong to this quiz'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            progress.completed_tasks.add(task)
            
            # Update total score and completion status
            progress.total_score += task.max_score or 0
            progress.is_completed = (
                progress.completed_tasks.count() == progress.quiz.tasks.count()
            )
            progress.save()

            serializer = self.get_serializer(progress)
            return Response(serializer.data)
        except UserProgress.DoesNotExist:
            return Response(
                {'error': 'User progress not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except QuizTask.DoesNotExist:
            return Response(
                {'error': 'Quiz task not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
