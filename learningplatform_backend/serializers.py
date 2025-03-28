from rest_framework import serializers
from .models import LearningTask
from core.models import Course


class LearningTaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = LearningTask
        fields = "__all__"


class CourseSerializer(serializers.ModelSerializer):
    tasks = serializers.PrimaryKeyRelatedField(
        many=True, read_only=True, source="learning_tasks"
    )  # Alias learning_tasks as tasks

    class Meta:
        model = Course
        fields = "__all__"
