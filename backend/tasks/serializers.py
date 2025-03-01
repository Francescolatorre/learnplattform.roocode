"""
Serializers for the tasks module.
"""

from typing import cast

from django.contrib.auth import get_user_model
from django.db.models import Manager
from django.utils import timezone
from rest_framework import serializers

from courses.models import Course

from .models import (LearningTask, MultipleChoiceQuizSubmission,
                     MultipleChoiceQuizTaskType)

User = get_user_model()

# Explicitly cast the objects manager to the correct type
MultipleChoiceQuizSubmission.objects = cast(Manager[MultipleChoiceQuizSubmission], MultipleChoiceQuizSubmission.objects)


class LearningTaskSerializer(serializers.ModelSerializer):
    """
    Serializer for the consolidated LearningTask model.
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
            'is_active'
        ]
        read_only_fields = ['created_at', 'updated_at', 'id']

    def create(self, validated_data):
        """
        Custom create method to handle task creation.
        """
        # Set created_by to current user if not provided
        if 'created_by' not in validated_data:
            user = self.context['request'].user
            validated_data['created_by'] = user

        return super().create(validated_data)

    def validate(self, data):
        """
        Additional validation for learning tasks.
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
    Detailed serializer with additional information.
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
        Retrieve additional course details.
        """
        return {
            'id': obj.course.id,
            'title': obj.course.title,
            'instructor': obj.course.instructor.username
        }

    def get_created_by_details(self, obj):
        """
        Retrieve additional creator details.
        """
        if obj.created_by:
            return {
                'id': obj.created_by.id,
                'username': obj.created_by.username,
                'email': obj.created_by.email
            }
        return None


class MultipleChoiceQuizTaskTypeSerializer(serializers.ModelSerializer):
    """
    Serializer for Multiple Choice Quiz Task Type configuration.
    """
    task = serializers.PrimaryKeyRelatedField(
        queryset=LearningTask.objects.all(),
        required=True
    )

    class Meta:
        model = MultipleChoiceQuizTaskType
        fields = [
            'task',
            'total_questions',
            'questions_config',
            'randomize_questions',
            'randomize_options',
            'points_per_question',
            'max_attempts'
        ]

    def validate_questions_config(self, value):
        """
        Validate the questions configuration.
        """
        if not isinstance(value, list):
            raise serializers.ValidationError("Questions configuration must be a list")

        for idx, question in enumerate(value, 1):
            if not isinstance(question, dict):
                raise serializers.ValidationError(f"Question {idx} must be a dictionary")

            required_keys = ['question', 'options', 'correct_answers']
            for key in required_keys:
                if key not in question:
                    raise serializers.ValidationError(f"Question {idx} is missing required key: {key}")

            if not isinstance(question['options'], list) or len(question['options']) < 2:
                raise serializers.ValidationError(f"Question {idx} must have at least 2 options")

            if not isinstance(question['correct_answers'], list) or len(question['correct_answers']) == 0:
                raise serializers.ValidationError(f"Question {idx} must have at least one correct answer")

            # Validate that correct answers are within the options
            for correct_answer in question['correct_answers']:
                if correct_answer not in question['options']:
                    raise serializers.ValidationError(f"Correct answer '{correct_answer}' in question {idx} is not in the options list")

        return value

    def validate(self, data):
        """
        Additional validation for multiple choice quiz configuration.
        """
        # Validate total questions matches questions_config length
        if len(data.get('questions_config', [])) != data.get('total_questions', 0):
            raise serializers.ValidationError({
                'total_questions': 'Number of questions must match the length of questions_config'
            })

        # Validate points per question is positive
        if data.get('points_per_question', 0) <= 0:
            raise serializers.ValidationError({
                'points_per_question': 'Points per question must be a positive number'
            })

        # Validate max attempts is positive
        if data.get('max_attempts', 0) <= 0:
            raise serializers.ValidationError({
                'max_attempts': 'Maximum attempts must be a positive number'
            })

        return data

    def create(self, validated_data):
        """
        Custom create method to ensure task type is set to MULTIPLE_CHOICE.
        """
        task = validated_data.get('task')
        if task:
            task.task_type = 'MULTIPLE_CHOICE'
            task.save()

        return super().create(validated_data)


class MultipleChoiceQuizSubmissionSerializer(serializers.ModelSerializer):
    """
    Serializer for Multiple Choice Quiz Submission.
    """
    task = serializers.PrimaryKeyRelatedField(
        queryset=LearningTask.objects.all(),
        required=True
    )
    student = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        required=False,
        default=serializers.CurrentUserDefault()
    )

    class Meta:
        model = MultipleChoiceQuizSubmission
        fields = [
            'id',
            'task',
            'student',
            'submission_time',
            'answers',
            'score',
            'max_score',
            'detailed_results',
            'attempt_number',
            'is_passed'
        ]
        read_only_fields = [
            'id',
            'submission_time',
            'score',
            'max_score',
            'detailed_results',
            'attempt_number',
            'is_passed'
        ]

    def validate_answers(self, value):
        """
        Validate the student's answers against the quiz configuration.
        """
        # Get the task from the context or the validated data
        task = self.context.get('task') or self.initial_data.get('task')

        if not task:
            raise serializers.ValidationError("No task provided for validation")

        try:
            # Retrieve the quiz configuration
            quiz_config = task.multiple_choice_config

            # Validate number of answers
            if len(value) != quiz_config.total_questions:
                raise serializers.ValidationError(f"Expected {quiz_config.total_questions} answers, got {len(value)}")

            # Validate each answer
            for idx, (question, student_answer) in enumerate(zip(quiz_config.questions_config, value), 1):
                # Validate that student answer is a list
                if not isinstance(student_answer, list):
                    raise serializers.ValidationError(f"Answer for question {idx} must be a list")

                # Validate that all selected answers are in the options
                for answer in student_answer:
                    if answer not in question['options']:
                        raise serializers.ValidationError(f"Invalid answer '{answer}' for question {idx}")

        except MultipleChoiceQuizTaskType.DoesNotExist:
            raise serializers.ValidationError("No multiple-choice quiz configuration found for this task")

        return value

    def create(self, validated_data):
        """
        Custom create method to calculate score and validate submission.
        """
        # Get the task and quiz configuration
        task = validated_data['task']
        quiz_config = task.multiple_choice_config

        # Set the student to the current user if not provided
        student = validated_data.get('student', self.context['request'].user)

        # Calculate the attempt number
        existing_attempts = MultipleChoiceQuizSubmission.objects.filter(
            task=task,
            student=student
        ).count()

        # Check if max attempts have been reached
        if existing_attempts >= quiz_config.max_attempts:
            raise serializers.ValidationError("Maximum number of attempts reached")

        # Validate and score the submission
        score, detailed_results = quiz_config.validate_submission(validated_data['answers'])

        # Determine if the quiz is passed
        is_passed = (
            task.passing_score is not None and
            score >= task.passing_score
        )

        # Create the submission
        submission = MultipleChoiceQuizSubmission.objects.create(
            task=task,
            student=student,
            answers=validated_data['answers'],
            score=score,
            max_score=quiz_config.calculate_max_score(),
            detailed_results=detailed_results,
            attempt_number=existing_attempts + 1,
            is_passed=is_passed
        )

        return submission
