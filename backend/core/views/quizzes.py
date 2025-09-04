"""
Quiz-related API views for the Learning Platform backend.

Includes:
- Quiz task, question, option, attempt, and response endpoints
"""

import logging

from rest_framework import permissions, viewsets

from ..models import (
    QuizAttempt,
    QuizOption,
    QuizQuestion,
    QuizResponse,
    QuizTask,
)
from ..serializers import (
    QuizAttemptSerializer,
    QuizOptionSerializer,
    QuizQuestionSerializer,
    QuizResponseSerializer,
    QuizTaskSerializer,
)

logger = logging.getLogger(__name__)


class QuizTaskViewSet(viewsets.ModelViewSet):
    """
    API endpoint for quiz tasks
    """

    queryset = QuizTask.objects.all()
    serializer_class = QuizTaskSerializer
    permission_classes = [permissions.IsAuthenticated]


class QuizQuestionViewSet(viewsets.ModelViewSet):
    """
    API endpoint for quiz questions
    """

    queryset = QuizQuestion.objects.all()
    serializer_class = QuizQuestionSerializer
    permission_classes = [permissions.IsAuthenticated]


class QuizOptionViewSet(viewsets.ModelViewSet):
    """
    API endpoint for quiz options
    """

    queryset = QuizOption.objects.all()
    serializer_class = QuizOptionSerializer
    permission_classes = [permissions.IsAuthenticated]


class QuizAttemptViewSet(viewsets.ModelViewSet):
    """
    API endpoint for quiz attempts
    """

    queryset = QuizAttempt.objects.all()
    serializer_class = QuizAttemptSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        Filter attempts to only show those belonging to the current user
        unless the user is staff/admin
        """
        if (
            self.request.user.is_staff
            or getattr(self.request.user, "role", None) == "admin"
        ):
            return QuizAttempt.objects.all()
        return QuizAttempt.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class QuizResponseViewSet(viewsets.ModelViewSet):
    """
    API endpoint for quiz responses
    """

    queryset = QuizResponse.objects.all()
    serializer_class = QuizResponseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        Filter responses to only show those belonging to the current user's attempts
        unless the user is staff/admin
        """
        if (
            self.request.user.is_staff
            or getattr(self.request.user, "role", None) == "admin"
        ):
            return QuizResponse.objects.all()
        return QuizResponse.objects.filter(attempt__user=self.request.user)
