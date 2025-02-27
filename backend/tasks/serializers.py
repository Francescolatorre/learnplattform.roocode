from rest_framework import serializers
from .models import LearningTask, AssessmentTask, QuizTask

class LearningTaskSerializer(serializers.ModelSerializer):
    """
    Serializer for learning-specific tasks.
    """
    class Meta:
        model = LearningTask
        fields = ['id', 'title', 'description', 'created_at', 'updated_at', 'due_date']
        read_only_fields = ['id', 'created_at', 'updated_at']

class AssessmentTaskSerializer(serializers.ModelSerializer):
    """
    Serializer for assessment tasks with scoring.
    """
    class Meta:
        model = AssessmentTask
        fields = ['id', 'title', 'description', 'created_at', 'updated_at', 'due_date', 'max_score', 'passing_score']
        read_only_fields = ['id', 'created_at', 'updated_at']

class QuizTaskSerializer(AssessmentTaskSerializer):
    """
    Serializer for quiz tasks with additional quiz-specific attributes.
    """
    class Meta(AssessmentTaskSerializer.Meta):
        model = QuizTask
        fields = AssessmentTaskSerializer.Meta.fields + ['time_limit', 'is_randomized']
