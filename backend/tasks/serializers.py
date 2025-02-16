from rest_framework import serializers
from .models import BaseTask, LearningTask, AssessmentTask, QuizTask

class BaseTaskSerializer(serializers.ModelSerializer):
    """
    Serializer for base task attributes.
    """
    class Meta:
        model = BaseTask
        fields = ['id', 'title', 'description', 'created_at', 'updated_at', 'due_date']
        read_only_fields = ['id', 'created_at', 'updated_at']

class LearningTaskSerializer(BaseTaskSerializer):
    """
    Serializer for learning-specific tasks.
    """
    class Meta(BaseTaskSerializer.Meta):
        model = LearningTask
        fields = BaseTaskSerializer.Meta.fields + ['difficulty_level']

class AssessmentTaskSerializer(BaseTaskSerializer):
    """
    Serializer for assessment tasks with scoring.
    """
    class Meta(BaseTaskSerializer.Meta):
        model = AssessmentTask
        fields = BaseTaskSerializer.Meta.fields + ['max_score', 'passing_score']

class QuizTaskSerializer(AssessmentTaskSerializer):
    """
    Serializer for quiz tasks with additional quiz-specific attributes.
    """
    class Meta(AssessmentTaskSerializer.Meta):
        model = QuizTask
        fields = AssessmentTaskSerializer.Meta.fields + ['time_limit', 'is_randomized']