from rest_framework import serializers
from django.contrib.auth import get_user_model
from courses.models import Course
from tasks.models import LearningTask

User = get_user_model()

class CourseSerializer(serializers.ModelSerializer):
    """
    Serializer for the consolidated Course model
    """
    instructor = serializers.PrimaryKeyRelatedField(
        read_only=False, 
        queryset=User.objects.all()
    )
    
    class Meta:
        model = Course
        fields = [
            'id', 
            'title', 
            'description', 
            'instructor', 
            'created_at', 
            'updated_at', 
            'status', 
            'visibility', 
            'learning_objectives', 
            'prerequisites',
            'duration',
            'difficulty_level'
        ]
        read_only_fields = ['created_at', 'updated_at']

class LearningTaskSerializer(serializers.ModelSerializer):
    """
    Serializer for the consolidated Learning Task model
    """
    course = CourseSerializer(read_only=True)
    course_id = serializers.PrimaryKeyRelatedField(
        queryset=Course.objects.all(), 
        source='course', 
        write_only=True
    )
    created_by = serializers.PrimaryKeyRelatedField(
        read_only=False, 
        queryset=User.objects.all()
    )
    
    class Meta:
        model = LearningTask
        fields = [
            'id',
            'title', 
            'description', 
            'course',
            'course_id',
            'task_type',
            'status',
            'difficulty_level',
            'created_at', 
            'updated_at',
            'deadline',
            'max_submissions',
            'points_possible',
            'passing_score',
            'created_by',
            'task_configuration',
            'is_active',
            'requires_peer_review'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def validate(self, data):
        """
        Additional validation for the learning task
        """
        # You can add custom validation logic here
        return data
