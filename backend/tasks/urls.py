from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (LearningTaskViewSet, MultipleChoiceQuizSubmissionViewSet,
                    MultipleChoiceQuizTaskTypeViewSet)

# Create a router and register viewsets
router = DefaultRouter()
router.register(r'learning-tasks', LearningTaskViewSet, basename='learning-task')
router.register(r'multiple-choice-quizzes', MultipleChoiceQuizTaskTypeViewSet, basename='multiple-choice-quiz')
router.register(r'multiple-choice-submissions', MultipleChoiceQuizSubmissionViewSet, basename='multiple-choice-submission')

urlpatterns = [
    # Include router URLs
    path('', include(router.urls)),
]
