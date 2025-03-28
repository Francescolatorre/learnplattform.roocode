from rest_framework import serializers
from .models import Course, LearningTask


class LearningTaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = LearningTask
        fields = ["id", "title", "description"]


class CourseSerializer(serializers.ModelSerializer):
    learningTasks = LearningTaskSerializer(
        many=True, read_only=True
    )  # Include learning tasks

    class Meta:
        model = Course
        fields = ["id", "name", "description", "learningTasks"]
