from django.contrib import admin
from .models import Course, LearningTask, QuizTask, CourseEnrollment


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "creator", "status", "visibility")
    search_fields = ("title", "creator__username")
    list_filter = ("status", "visibility")


@admin.register(LearningTask)
class LearningTaskAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "course", "is_published", "created_at", "updated_at")
    search_fields = ("title", "course__title")
    list_filter = ("is_published", "course")


@admin.register(QuizTask)
class QuizTaskAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "course", "time_limit_minutes", "pass_threshold")
    search_fields = ("title", "course__title")
    list_filter = ("course",)


@admin.register(CourseEnrollment)
class CourseEnrollmentAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "course", "status", "enrollment_date")
    search_fields = ("user__username", "course__title")
    list_filter = ("status",)
