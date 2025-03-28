from django.contrib import admin
from .models import LearningTask, Course, User, QuizTask

@admin.register(LearningTask)
class LearningTaskAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'course')
    search_fields = ('name', 'course__title')
    list_filter = ('course',)

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'status', 'visibility', 'creator')
    search_fields = ('title', 'creator__username')
    list_filter = ('status', 'visibility')

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('id', 'username', 'email', 'role', 'is_staff')
    search_fields = ('username', 'email')
    list_filter = ('role', 'is_staff')

@admin.register(QuizTask)
class QuizTaskAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'course', 'time_limit_minutes', 'pass_threshold')
    search_fields = ('title', 'course__title')
    list_filter = ('course',)
