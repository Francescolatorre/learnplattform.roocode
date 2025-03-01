from django.contrib.auth import get_user_model
from rest_framework import serializers

from tasks.serializers import LearningTaskSerializer

from .models import (Course, CourseInstructorAssignment, CourseVersion,
                     InstructorRole, StatusTransition)

User = get_user_model()

class InstructorRoleSerializer(serializers.ModelSerializer):
    """
    Serializer for InstructorRole model.
    """
    class Meta:
        model = InstructorRole
        fields = [
            'role_name', 
            'description', 
            'can_edit_course', 
            'can_manage_tasks', 
            'can_grade_submissions'
        ]

class CourseInstructorAssignmentSerializer(serializers.ModelSerializer):
    """
    Serializer for CourseInstructorAssignment model.
    """
    role = InstructorRoleSerializer(read_only=True)
    instructor = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all()
    )

    class Meta:
        model = CourseInstructorAssignment
        fields = [
            'instructor', 
            'role', 
            'assigned_at', 
            'is_active'
        ]

class StatusTransitionSerializer(serializers.ModelSerializer):
    """
    Serializer for StatusTransition model.
    """
    changed_by = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), 
        required=False, 
        allow_null=True
    )

    class Meta:
        model = StatusTransition
        fields = [
            'from_status', 
            'to_status', 
            'changed_by', 
            'changed_at', 
            'reason'
        ]

class CourseVersionSerializer(serializers.ModelSerializer):
    """
    Serializer for CourseVersion model with version metadata.
    """
    created_by = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        required=False,
        allow_null=True
    )
    changes_from_previous = serializers.SerializerMethodField()
    is_current = serializers.SerializerMethodField()

    class Meta:
        model = CourseVersion
        fields = [
            'version_number',
            'created_at',
            'created_by',
            'notes',
            'changes_from_previous',
            'is_current'
        ]
        read_only_fields = ['version_number', 'created_at', 'changes_from_previous', 'is_current']

    def get_changes_from_previous(self, obj):
        return obj.get_changes_from_previous()

    def get_is_current(self, obj):
        return obj.is_current()

class CourseSerializer(serializers.ModelSerializer):
    """
    Serializer for Course model with nested learning tasks and instructor assignments.
    """
    tasks = LearningTaskSerializer(many=True, read_only=True)
    total_tasks = serializers.SerializerMethodField()
    status_history = serializers.SerializerMethodField()
    allowed_transitions = serializers.SerializerMethodField()
    instructors = serializers.SerializerMethodField()
    version_history = serializers.SerializerMethodField()
    created_from = serializers.PrimaryKeyRelatedField(
        queryset=Course.objects.all(), required=False, allow_null=True)

    class Meta:
        model = Course
        fields = [
            'id', 
            'title', 
            'description', 
            'instructors', 
            'created_at', 
            'updated_at', 
            'tasks', 
            'total_tasks',
            'status',
            'visibility',
            'status_history',
            'allowed_transitions',
            'version',
            'version_notes',
            'created_from',
            'version_history'
        ]
        read_only_fields = [
            'id', 
            'created_at', 
            'updated_at', 
            'status_history', 
            'allowed_transitions',
            'version_history'
        ]

    def get_total_tasks(self, obj):
        """
        Returns the total number of tasks in the course.
        """
        return obj.get_total_tasks()

    def get_instructors(self, obj):
        """
        Returns detailed instructor information for the course.
        """
        assignments = CourseInstructorAssignment.objects.filter(
            course=obj, 
            is_active=True
        )
        return CourseInstructorAssignmentSerializer(assignments, many=True).data

    def get_status_history(self, obj):
        """
        Returns the status transition history for the course.
        """
        return StatusTransitionSerializer(
            obj.get_status_history(), 
            many=True
        ).data

    def get_allowed_transitions(self, obj):
        """
        Returns the list of allowed status transitions.
        """
        return obj.get_allowed_transitions()

    def get_version_history(self, obj):
        """
        Returns the version history for the course.
        """
        versions = obj.versions.all().order_by('-version_number')
        return CourseVersionSerializer(versions, many=True).data

    def validate_status(self, value):
        """
        Validate status transition.
        """
        instance = getattr(self, 'instance', None)
        if instance and not instance.can_transition_to(value):
            raise serializers.ValidationError(
                f"Cannot transition from {instance.status} to {value}"
            )
        return value

    def create(self, validated_data):
        """
        Custom create method to handle instructor assignments.
        """
        instructors_data = self.context.get('instructors', [])
        course = Course.objects.create(**validated_data)

        for instructor_data in instructors_data:
            user = instructor_data.get('instructor')
            role = instructor_data.get('role', InstructorRole.StandardRoles.GUEST)
            
            CourseInstructorAssignment.objects.create(
                course=course,
                instructor=user,
                role=InstructorRole.objects.get(role_name=role)
            )

        return course

    def update(self, instance, validated_data):
        """
        Custom update method to handle instructor assignments.
        """
        instructors_data = self.context.get('instructors', [])

        # Update course fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Update instructor assignments
        # First, deactivate all current assignments
        CourseInstructorAssignment.objects.filter(course=instance).update(is_active=False)

        # Create new assignments
        for instructor_data in instructors_data:
            user = instructor_data.get('instructor')
            role = instructor_data.get('role', InstructorRole.StandardRoles.GUEST)
            
            CourseInstructorAssignment.objects.create(
                course=instance,
                instructor=user,
                role=InstructorRole.objects.get(role_name=role),
                is_active=True
            )

        return instance

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