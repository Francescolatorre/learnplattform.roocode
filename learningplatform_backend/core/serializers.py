from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import (
    User, Course, CourseVersion, StatusTransition,
    LearningTask, QuizTask, QuizQuestion, QuizOption
,
    CourseEnrollment, TaskProgress, QuizAttempt, QuizResponse
)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'display_name', 'role']
        read_only_fields = ['id']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ('username', 'password', 'password2', 'email', 'display_name', 'role')

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        return user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Add custom claims
        token['username'] = user.username
        token['email'] = user.email
        token['role'] = user.role
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user
        data['user'] = {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'display_name': user.display_name,
            'role': user.role
        }
        return data


class CourseSerializer(serializers.ModelSerializer):
    creator_details = UserSerializer(source='creator', read_only=True)

    class Meta:
        model = Course
        fields = [
            'id', 'title', 'description', 'version', 'status',
            'visibility', 'learning_objectives', 'prerequisites',
            'created_at', 'updated_at', 'creator', 'creator_details'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'creator_details']


class CourseVersionSerializer(serializers.ModelSerializer):
    created_by_details = UserSerializer(source='created_by', read_only=True)

    class Meta:
        model = CourseVersion
        fields = [
            'id', 'course', 'version_number', 'created_at',
            'content_snapshot', 'notes', 'created_by', 'created_by_details'
        ]
        read_only_fields = ['id', 'created_at', 'created_by_details']


class StatusTransitionSerializer(serializers.ModelSerializer):
    changed_by_details = UserSerializer(source='changed_by', read_only=True)

    class Meta:
        model = StatusTransition
        fields = [
            'id', 'course', 'from_status', 'to_status',
            'changed_at', 'reason', 'changed_by', 'changed_by_details'
        ]
        read_only_fields = ['id', 'changed_at', 'changed_by_details']


class LearningTaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = LearningTask
        fields = [
            'id', 'course', 'title', 'description',
            'order', 'is_published', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class QuizOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizOption
        fields = ['id', 'question', 'text', 'is_correct', 'order']
        read_only_fields = ['id']


class QuizQuestionSerializer(serializers.ModelSerializer):
    options = QuizOptionSerializer(many=True, read_only=True)

    class Meta:
        model = QuizQuestion
        fields = ['id', 'quiz', 'text', 'explanation', 'points', 'order', 'options']
        read_only_fields = ['id']


class QuizTaskSerializer(serializers.ModelSerializer):
    questions = QuizQuestionSerializer(many=True, read_only=True)

    class Meta:
        model = QuizTask
        fields = [
            'id', 'course', 'title', 'description', 'order',
            'is_published', 'created_at', 'updated_at',
            'time_limit_minutes', 'pass_threshold', 'max_attempts',
            'randomize_questions', 'questions'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class CourseEnrollmentSerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source='user', read_only=True)
    course_details = CourseSerializer(source='course', read_only=True)
    progress_percentage = serializers.SerializerMethodField()

    class Meta:
        model = CourseEnrollment
        fields = [
            'id', 'user', 'course', 'enrollment_date', 'status',
            'settings', 'user_details', 'course_details', 'progress_percentage'
        ]
        read_only_fields = ['id', 'enrollment_date', 'user_details', 'course_details', 'progress_percentage']

    def get_progress_percentage(self, obj):
        return obj.calculate_course_progress()


class TaskProgressSerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source='user', read_only=True)
    task_details = LearningTaskSerializer(source='task', read_only=True)

    class Meta:
        model = TaskProgress
        fields = [
            'id', 'user', 'task', 'status', 'time_spent',
            'completion_date', 'user_details', 'task_details'
        ]
        read_only_fields = ['id', 'user_details', 'task_details']


class QuizResponseSerializer(serializers.ModelSerializer):
    question_details = QuizQuestionSerializer(source='question', read_only=True)
    selected_option_details = QuizOptionSerializer(source='selected_option', read_only=True)

    class Meta:
        model = QuizResponse
        fields = [
            'id', 'attempt', 'question', 'selected_option',
            'is_correct', 'time_spent', 'question_details', 'selected_option_details'
        ]
        read_only_fields = ['id', 'question_details', 'selected_option_details']


class QuizAttemptSerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source='user', read_only=True)
    quiz_details = QuizTaskSerializer(source='quiz', read_only=True)
    responses = QuizResponseSerializer(many=True, read_only=True)

    class Meta:
        model = QuizAttempt
        fields = [
            'id', 'user', 'quiz', 'score', 'time_taken',
            'completion_status', 'attempt_date', 'user_details',
            'quiz_details', 'responses'
        ]
        read_only_fields = ['id', 'attempt_date', 'user_details', 'quiz_details', 'responses']


class NestedQuizAttemptSerializer(serializers.ModelSerializer):
    """A simplified serializer for QuizAttempt when nested in other serializers"""

    class Meta:
        model = QuizAttempt
        fields = ['id', 'quiz', 'score', 'completion_status', 'attempt_date']
        read_only_fields = ['id', 'attempt_date']
