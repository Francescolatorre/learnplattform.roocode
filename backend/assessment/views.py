from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from ..tasks.models import LearningTask  # Updated import
from .models import Quiz, Submission, UserProgress
from .serializers import (QuizSerializer, SubmissionSerializer,
                          UserProgressSerializer)

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

    @action(detail=False, methods=["POST"])
    def grade_submission(self, request):
        """
        Grade a submission.
        """
        submission_id = request.data.get("submission_id")
        grade = request.data.get("grade")

        submission = get_object_or_404(Submission, id=submission_id)

        # Ensure only instructors or staff can grade
        if not request.user.is_staff:
            return Response(
                {"error": "Only staff can grade submissions"},
                status=status.HTTP_403_FORBIDDEN,
            )

        submission.grade = grade
        submission.save()

        serializer = self.get_serializer(submission)
        return Response(serializer.data)


class QuizViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing quizzes.
    """

    queryset = Quiz.objects.all()
    serializer_class = QuizSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=True, methods=["POST"])
    def add_task(self, request, pk=None):
        """
        Add a task to the quiz.
        """
        quiz = self.get_object()
        task_id = request.data.get("task_id")

        if not task_id:
            return Response(
                {"error": "Task ID is required"}, status=status.HTTP_400_BAD_REQUEST
            )

        task = get_object_or_404(LearningTask, id=task_id)  # Updated reference
        quiz.tasks.add(task)
        quiz.save()

        serializer = self.get_serializer(quiz)
        return Response(serializer.data)


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

    @action(detail=False, methods=["POST"])
    def mark_task_completed(self, request):
        """
        Mark a task as completed for a specific quiz progress.
        """
        quiz_progress_id = request.data.get("quiz_progress_id")
        task_id = request.data.get("task_id")

        progress = get_object_or_404(
            UserProgress, id=quiz_progress_id, user=request.user
        )
        task = get_object_or_404(LearningTask, id=task_id)  # Updated reference

        # Ensure the task belongs to the quiz
        if task not in progress.quiz.tasks.all():
            return Response(
                {"error": "Task does not belong to this quiz"},
                status=status.HTTP_400_BAD_REQUEST,
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
