from django.contrib import admin
from django.utils.html import format_html

from .core.models import LearningTask, Course, User, QuizTask,QuizQuestion, QuizOption

# Anpassen des Admin Headers
admin.site.site_header = "Kursplattform Administration"
admin.site.site_title = "Kursplattform Admin"
admin.site.index_title = "Verwaltungsbereich"


@admin.register(LearningTask)
class LearningTaskAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "course", "get_status")
    search_fields = ("name", "course__title")
    list_filter = ("course", "is_published")
    readonly_fields = ("created_at", "updated_at")
    fieldsets = (
        ("Grundinformationen", {"fields": ("name", "description", "course")}),
        ("Status", {"fields": ("is_published", "created_at", "updated_at")}),
    )

    def get_status(self, obj):
        if hasattr(obj, "is_published") and obj.is_published:
            return format_html('<span style="color: green;">Veröffentlicht</span>')
        return format_html('<span style="color: red;">Entwurf</span>')

    get_status.short_description = "Status"


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "status", "visibility", "creator", "get_task_count")
    search_fields = ("title", "creator__username")
    list_filter = ("status", "visibility")
    readonly_fields = ("created_at", "updated_at")
    fieldsets = (
        ("Grundinformationen", {"fields": ("title", "description", "creator")}),
        ("Status", {"fields": ("status", "visibility", "created_at", "updated_at")}),
    )

    def get_task_count(self, obj):
        task_count = obj.learningtask_set.count()
        quiz_count = obj.quiztask_set.count() if hasattr(obj, "quiztask_set") else 0
        return f"{task_count + quiz_count} ({task_count} Lern, {quiz_count} Quiz)"

    get_task_count.short_description = "Anzahl Aufgaben"


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ("id", "username", "email", "role", "is_staff", "date_joined")
    search_fields = ("username", "email", "first_name", "last_name")
    list_filter = ("role", "is_staff", "is_active")
    readonly_fields = ("date_joined", "last_login")
    fieldsets = (
        (
            "Persönliche Informationen",
            {"fields": ("username", "email", "first_name", "last_name", "role")},
        ),
        ("Berechtigungen", {"fields": ("is_active", "is_staff", "is_superuser")}),
        ("Wichtige Daten", {"fields": ("date_joined", "last_login")}),
    )


@admin.register(QuizTask)
class QuizTaskAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "title",
        "course",
        "time_limit_minutes",
        "pass_threshold",
        "question_count",
    )
    search_fields = ("title", "course__title")
    list_filter = ("course", "is_published")
    readonly_fields = ("created_at", "updated_at")
    fieldsets = (
        ("Grundinformationen", {"fields": ("title", "description", "course")}),
        (
            "Quiz-Einstellungen",
            {"fields": ("time_limit_minutes", "pass_threshold", "is_published")},
        ),
        ("Zeitstempel", {"fields": ("created_at", "updated_at")}),
    )

    def question_count(self, obj):
        if hasattr(obj, "question_set"):
            return obj.question_set.count()
        return 0

    question_count.short_description = "Anzahl Fragen"


# Optional: Inline-Admin für Fragen im Quiz

from .core.models import


class QuizOptionInline(admin.TabularInline):
    model = QuizOption
    extra = 2


class QuizQuestionAdmin(admin.ModelAdmin):
    list_display = ("text", "quiz", "question_type", "points")
    list_filter = ("quiz", "question_type")
    inlines = [QuizOptionInline]


admin.site.register(QuizQuestion, QuizQuestionAdmin)
