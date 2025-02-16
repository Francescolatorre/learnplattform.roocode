from rest_framework import serializers
from .models import Submission, Quiz, UserProgress
from tasks.serializers import AssessmentTaskSerializer, QuizTaskSerializer
from django.contrib.auth import get_user_model

User = get_user_model()

class SubmissionSerializer(serializers.ModelSerializer):
    """
    Serializer for Submission model.
    """
    username = serializers.SerializerMethodField()
    task_title = serializers.SerializerMethodField()
    task = AssessmentTaskSerializer(read_only=True)

    class Meta:
        model = Submission
        fields = [
            'id', 
            'user', 
            'username', 
            'task', 
            'task_title', 
            'submitted_at', 
            'content', 
            'grade'
        ]
        read_only_fields = ['id', 'submitted_at']

    def get_username(self, obj):
        return obj.get_username()

    def get_task_title(self, obj):
        return obj.get_task_title()

class QuizSerializer(serializers.ModelSerializer):
    """
    Serializer for Quiz model.
    """
    tasks = QuizTaskSerializer(many=True, read_only=True)
    total_tasks = serializers.SerializerMethodField()

    class Meta:
        model = Quiz
        fields = [
            'id', 
            'title', 
            'description', 
            'tasks', 
            'total_tasks', 
            'created_at', 
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_total_tasks(self, obj):
        return obj.get_total_tasks()

class UserProgressSerializer(serializers.ModelSerializer):
    """
    Serializer for UserProgress model.
    """
    username = serializers.SerializerMethodField()
    quiz_title = serializers.SerializerMethodField()
    completed_tasks = QuizTaskSerializer(many=True, read_only=True)

    class Meta:
        model = UserProgress
        fields = [
            'id', 
            'user', 
            'username', 
            'quiz', 
            'quiz_title', 
            'completed_tasks', 
            'total_score', 
            'is_completed'
        ]
        read_only_fields = ['id']

    def get_username(self, obj):
        return obj.get_username()

    def get_quiz_title(self, obj):
        return obj.get_quiz_title()