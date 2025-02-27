from rest_framework import viewsets, permissions
from .models import LearningTask, QuizTask
from .serializers import (
    LearningTaskSerializer, 
    QuizTaskSerializer
)

class LearningTaskViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing learning tasks.
    """
    queryset = LearningTask.objects.all()
    serializer_class = LearningTaskSerializer
    permission_classes = [permissions.IsAuthenticated]

class QuizTaskViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing quiz tasks.
    """
    queryset = QuizTask.objects.all()
    serializer_class = QuizTaskSerializer
    permission_classes = [permissions.IsAuthenticated]
