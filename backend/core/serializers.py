"""
Serializers for the Learning Platform core models.

This module provides Django REST Framework serializers for converting model
instances to and from JSON representations. It handles all data validation
and transformation for the API endpoints.

Key serializer categories:
- User management (registration, profiles)
- Course management (courses, versions, enrollment)
- Learning content (tasks, quizzes, progress)
- Assessment (quiz attempts, responses)
"""

from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import (Course, CourseEnrollment, CourseVersion, LearningTask,
                     QuizAttempt, QuizOption, QuizQuestion, QuizResponse,
                     QuizTask, StatusTransition, TaskProgress, User)


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for user profiles.

    Provides user information for profile views and user management,
    excluding sensitive data like passwords.

    Fields:
        id: User's unique identifier
        username: User's username
        email: User's email address
        role: User's role
        display_name: User's display name
    """

    class Meta:
        model = User
        fields = ["id", "username", "email", "display_name", "role"]
        read_only_fields = ["id"]


class RegisterSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration.

    Handles creation of new user accounts with proper password hashing
    and validation of required fields.

    Fields:
        username: User's unique username
        email: User's email address
        password: User's password (write-only)
        role: User's role in the system
        display_name: User's display name
    """

    password = serializers.CharField(
        write_only=True, required=True, validators=[validate_password]
    )
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ("username", "password", "password2", "email", "display_name", "role")

    def validate(self, attrs):
        if attrs["password"] != attrs["password2"]:
            raise serializers.ValidationError(
                {"password": "Password fields didn't match."}
            )
        return attrs

    def create(self, validated_data):
        validated_data.pop("password2")
        user = User.objects.create_user(**validated_data)
        return user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Custom JWT token serializer that includes additional user data in the token response.

    Extends the default JWT token serializer to include user role and display name
    in the token payload and response.
    """

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Add custom claims
        token["username"] = user.username
        token["email"] = user.email
        token["role"] = user.role
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user
        data["user"] = {  # type: ignore
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "display_name": user.display_name,
            "role": user.role,
        }
        return data


class CourseSerializer(serializers.ModelSerializer):
    """
    Serializer for courses.

    Handles course creation, updates, and detailed course information including
    creator details and enrollment statistics.

    Fields:
        id: Course unique identifier
        title: Course title
        description: Course description
        creator: Reference to course creator
        version: Course version number
        status: Course status
        visibility: Course visibility setting
        learning_objectives: Course learning objectives
        prerequisites: Course prerequisites
    """

    isEnrolled = serializers.SerializerMethodField()
    isCompleted = serializers.SerializerMethodField()
    creator_details = UserSerializer(source="creator", read_only=True)
    description_html = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = [
            "id",
            "title",
            "description",
            "description_html",
            "version",
            "status",
            "visibility",
            "learning_objectives",
            "prerequisites",
            "created_at",
            "updated_at",
            "creator",
            "creator_details",
            "isEnrolled",
            "isCompleted",
        ]
        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
            "creator",
            "creator_details",
            "description_html",
        ]

    def get_isEnrolled(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return CourseEnrollment.objects.filter(
                user=request.user, course=obj, status="active"
            ).exists()
        return False

    def get_isCompleted(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return False

        is_enrolled = self.get_isEnrolled(obj)
        if not is_enrolled:
            return False

        total_tasks = LearningTask.objects.filter(course=obj).count()
        if total_tasks == 0:
            return False

        completed_tasks = TaskProgress.objects.filter(
            user=request.user, task__course=obj, status="completed"
        ).count()

        return total_tasks == completed_tasks

    def get_description_html(self, obj):
        """Return HTML-rendered markdown content"""
        return obj.description_html


class CourseVersionSerializer(serializers.ModelSerializer):
    """
    Serializer for course versions.

    Tracks different versions of a course, including content snapshots
    and version metadata.
    """

    created_by_details = UserSerializer(source="created_by", read_only=True)

    class Meta:
        model = CourseVersion
        fields = [
            "id",
            "course",
            "version_number",
            "created_at",
            "content_snapshot",
            "notes",
            "created_by",
            "created_by_details",
        ]
        read_only_fields = ["id", "created_at", "created_by_details"]


class StatusTransitionSerializer(serializers.ModelSerializer):
    """
    Serializer for status transitions.

    Tracks changes in course status, including the user who made the change
    and the reason for the change.
    """

    changed_by_details = UserSerializer(source="changed_by", read_only=True)

    class Meta:
        model = StatusTransition
        fields = [
            "id",
            "course",
            "from_status",
            "to_status",
            "changed_at",
            "reason",
            "changed_by",
            "changed_by_details",
        ]
        read_only_fields = ["id", "changed_at", "changed_by_details"]


class LearningTaskSerializer(serializers.ModelSerializer):
    """
    Serializer for learning tasks.

    Handles basic learning task data including task details and
    course association.
    """

    description_html = serializers.SerializerMethodField()

    class Meta:
        model = LearningTask
        fields = [
            "id",
            "course",
            "title",
            "description",
            "description_html",
            "order",
            "is_published",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at", "description_html"]

    def get_description_html(self, obj):
        """Return HTML-rendered markdown content"""
        return obj.description_html


class QuizOptionSerializer(serializers.ModelSerializer):
    """
    Serializer for quiz options.

    Manages answer options for quiz questions, including correctness flags.
    """

    class Meta:
        model = QuizOption
        fields = ["id", "question", "text", "is_correct", "order"]
        read_only_fields = ["id"]


class QuizQuestionSerializer(serializers.ModelSerializer):
    """
    Serializer for quiz questions.

    Handles question content, correct answers, and associated metadata.
    """

    options = QuizOptionSerializer(many=True, read_only=True)

    class Meta:
        model = QuizQuestion
        fields = ["id", "quiz", "text", "explanation", "points", "order", "options"]
        read_only_fields = ["id"]


class QuizTaskSerializer(serializers.ModelSerializer):
    """
    Serializer for quiz tasks.

    Extends LearningTask serializer to include quiz-specific fields
    such as time limits and passing thresholds.
    """

    questions = QuizQuestionSerializer(many=True, read_only=True)

    class Meta:
        model = QuizTask
        fields = [
            "id",
            "course",
            "title",
            "description",
            "order",
            "is_published",
            "created_at",
            "updated_at",
            "time_limit_minutes",
            "pass_threshold",
            "max_attempts",
            "randomize_questions",
            "questions",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class CourseEnrollmentSerializer(serializers.ModelSerializer):
    """
    Serializer for course enrollments.

    Handles student enrollment in courses, including enrollment status
    and completion tracking.
    """

    user_details = UserSerializer(source="user", read_only=True)
    course_details = CourseSerializer(source="course", read_only=True)
    progress_percentage = serializers.SerializerMethodField()

    class Meta:
        model = CourseEnrollment
        fields = [
            "id",
            "user",
            "course",
            "enrollment_date",
            "status",
            "settings",
            "user_details",
            "course_details",
            "progress_percentage",
        ]
        read_only_fields = [
            "id",
            "enrollment_date",
            "user_details",
            "course_details",
            "progress_percentage",
        ]

    def get_progress_percentage(self, obj):
        return obj.calculate_course_progress()


class TaskProgressSerializer(serializers.ModelSerializer):
    """
    Serializer for task progress.

    Tracks student progress through learning tasks, including completion
    status and time spent.
    """

    user_details = UserSerializer(source="user", read_only=True)
    task_details = LearningTaskSerializer(source="task", read_only=True)

    class Meta:
        model = TaskProgress
        fields = [
            "id",
            "user",
            "task",
            "status",
            "time_spent",
            "completion_date",
            "user_details",
            "task_details",
        ]
        read_only_fields = ["id", "user_details", "task_details"]


class QuizResponseSerializer(serializers.ModelSerializer):
    """
    Serializer for quiz responses.

    Handles individual question responses within a quiz attempt, including
    correctness checking and time tracking.
    """

    question_details = QuizQuestionSerializer(source="question", read_only=True)
    selected_option_details = QuizOptionSerializer(
        source="selected_option", read_only=True
    )

    class Meta:
        model = QuizResponse
        fields = [
            "id",
            "attempt",
            "question",
            "selected_option",
            "is_correct",
            "time_spent",
            "question_details",
            "selected_option_details",
        ]
        read_only_fields = ["id", "question_details", "selected_option_details"]


class QuizAttemptSerializer(serializers.ModelSerializer):
    """
    Serializer for quiz attempts.

    Manages student attempts at quizzes, including scores and completion status.
    """

    user_details = UserSerializer(source="user", read_only=True)
    quiz_details = QuizTaskSerializer(source="quiz", read_only=True)
    responses = QuizResponseSerializer(many=True, read_only=True)

    class Meta:
        model = QuizAttempt
        fields = [
            "id",
            "user",
            "quiz",
            "score",
            "time_taken",
            "completion_status",
            "attempt_date",
            "user_details",
            "quiz_details",
            "responses",
        ]
        read_only_fields = [
            "id",
            "attempt_date",
            "user_details",
            "quiz_details",
            "responses",
        ]


class NestedQuizAttemptSerializer(serializers.ModelSerializer):
    """A simplified serializer for QuizAttempt when nested in other serializers"""

    class Meta:
        model = QuizAttempt
        fields = ["id", "quiz", "score", "completion_status", "attempt_date"]
        read_only_fields = ["id", "attempt_date"]
