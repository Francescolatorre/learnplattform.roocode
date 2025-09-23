"""
Django admin interface configurations for the Learning Platform.

This module configures the Django admin interface for all core models,
providing a user-friendly interface for content management. It includes:
- Course management
- Learning task administration
- Quiz configuration
- Student enrollment tracking
- Progress monitoring
"""

from django.contrib import admin

from .models import CourseEnrollment  # Ensure parentheses are closed
from .models import (Course, LearningTask, QuizAttempt, QuizOption,
                     QuizQuestion, QuizResponse, QuizTask, TaskProgress)


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    """Admin interface for Course model management."""

    list_display = ("id", "title", "creator", "status", "visibility")
    search_fields = ("title", "creator__username")
    list_filter = ("status", "visibility")


@admin.register(LearningTask)  # Ensure proper formatting
class LearningTaskAdmin(admin.ModelAdmin):  # Ensure new line at end of decorator
    """Admin interface for managing learning tasks within courses."""

    list_display = ("id", "title", "course", "is_published", "created_at", "updated_at")
    search_fields = ("title", "course__title")
    list_filter = ("is_published", "course")


@admin.register(QuizTask)
class QuizTaskAdmin(admin.ModelAdmin):
    """Admin interface for quiz task configuration and management."""

    list_display = ("id", "title", "course", "time_limit_minutes", "pass_threshold")
    search_fields = ("title", "course__title")
    list_filter = ("course",)


@admin.register(CourseEnrollment)
class CourseEnrollmentAdmin(admin.ModelAdmin):
    """Admin interface for managing student course enrollments."""

    list_display = ("id", "user", "course", "status", "enrollment_date")
    search_fields = ("user__username", "course__title")
    list_filter = ("status",)


class QuizOptionInline(admin.TabularInline):
    """Inline admin interface for quiz options within quiz questions."""

    model = QuizOption
    extra = 1


@admin.register(QuizQuestion)
class QuizQuestionAdmin(admin.ModelAdmin):
    """Admin interface for managing quiz questions and their options."""

    list_display = ("id", "quiz", "text", "points")
    search_fields = ("quiz__title", "text")
    list_filter = ("quiz", "points")
    inlines = [QuizOptionInline]


@admin.register(QuizOption)
class QuizOptionAdmin(admin.ModelAdmin):
    """Admin interface for managing individual quiz options."""

    list_display = ("id", "question", "text", "is_correct")
    search_fields = ("question__text", "text")
    list_filter = ("question", "is_correct")


@admin.register(QuizAttempt)
class QuizAttemptAdmin(admin.ModelAdmin):
    """Admin interface for reviewing student quiz attempts."""

    list_display = ("id", "user", "quiz", "score", "completion_status", "attempt_date")
    search_fields = ("user__username", "quiz__title")
    list_filter = ("completion_status", "attempt_date")


@admin.register(QuizResponse)
class QuizResponseAdmin(admin.ModelAdmin):
    """Admin interface for managing individual quiz responses."""

    list_display = ("id", "attempt", "question", "selected_option", "is_correct")
    search_fields = ("attempt__user__username", "question__text")
    list_filter = ("is_correct",)


@admin.register(TaskProgress)
class TaskProgressAdmin(admin.ModelAdmin):
    """Admin interface for tracking student progress on learning tasks."""

    list_display = ("id", "user", "task", "status", "completion_date")
    search_fields = ("user__username", "task__title")
    list_filter = ("status", "completion_date")
