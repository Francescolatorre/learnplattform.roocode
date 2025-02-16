from rest_framework import serializers
from .models import Course
from tasks.serializers import LearningTaskSerializer

class CourseSerializer(serializers.ModelSerializer):
    """
    Serializer for Course model with nested learning tasks.
    """
    tasks = LearningTaskSerializer(many=True, read_only=True)
    total_tasks = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = [
            'id', 
            'title', 
            'description', 
            'instructor', 
            'created_at', 
            'updated_at', 
            'tasks', 
            'total_tasks'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_total_tasks(self, obj):
        """
        Returns the total number of tasks in the course.
        """
        return obj.get_total_tasks()

class CourseDetailSerializer(CourseSerializer):
    """
    Detailed serializer for Course with additional information.
    """
    learning_tasks = serializers.SerializerMethodField()

    class Meta(CourseSerializer.Meta):
        fields = CourseSerializer.Meta.fields + ['learning_tasks']

    def get_learning_tasks(self, obj):
        """
        Returns all learning tasks for this course.
        """
        return LearningTaskSerializer(obj.get_learning_tasks(), many=True).data