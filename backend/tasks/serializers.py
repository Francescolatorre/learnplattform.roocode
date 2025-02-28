from rest_framework import serializers
from django.utils import timezone
from django.contrib.auth import get_user_model

from .models import LearningTask
from courses.models import Course

User = get_user_model()

class LearningTaskSerializer(serializers.ModelSerializer):
    """
    Serializer for the consolidated LearningTask model
    """
    course = serializers.PrimaryKeyRelatedField(
        queryset=Course.objects.all(),
        required=True
    )
    created_by = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        required=False,
        allow_null=True
    )
    
    class Meta:
        model = LearningTask
        fields = [
            'id', 
            'title', 
            'description', 
            'course', 
            'status', 
            'difficulty_level',
            'created_at', 
            'updated_at', 
            'created_by',
            'max_submissions', 
            'deadline',
            'points_possible',
            'passing_score',
            'task_type',
            'settings',
            'is_active'
        ]
        read_only_fields = ['created_at', 'updated_at', 'id']
    
    def create(self, validated_data):
        """
        Custom create method to handle task creation
        """
        # Set created_by to current user if not provided
        if 'created_by' not in validated_data:
            user = self.context['request'].user
            validated_data['created_by'] = user
        
        return super().create(validated_data)
    
    def validate(self, data):
        """
        Additional validation for learning tasks
        """
        # Validate deadline is in the future if provided
        if data.get('deadline') and data['deadline'] <= timezone.now():
            raise serializers.ValidationError({
                'deadline': 'Deadline must be in the future'
            })
        
        # Validate points_possible is positive if provided
        if data.get('points_possible') and data['points_possible'] < 0:
            raise serializers.ValidationError({
                'points_possible': 'Points must be a non-negative number'
            })
        
        return data

class LearningTaskDetailSerializer(LearningTaskSerializer):
    """
    Detailed serializer with additional information
    """
    course_details = serializers.SerializerMethodField()
    created_by_details = serializers.SerializerMethodField()
    
    class Meta(LearningTaskSerializer.Meta):
        fields = LearningTaskSerializer.Meta.fields + [
            'course_details', 
            'created_by_details'
        ]
    
    def get_course_details(self, obj):
        """
        Retrieve additional course details
        """
        return {
            'id': obj.course.id,
            'title': obj.course.title,
            'instructor': obj.course.instructor.username
        }
    
    def get_created_by_details(self, obj):
        """
        Retrieve additional creator details
        """
        if obj.created_by:
            return {
                'id': obj.created_by.id,
                'username': obj.created_by.username,
                'email': obj.created_by.email
            }
        return None
