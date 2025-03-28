from rest_framework import serializers
from .models import LearningTask
from core.models import Course  # Update import to reference the new location


class LearningTaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = LearningTask
        fields = "__all__"


class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = "__all__"
