from django.contrib import admin
from .core.models import (
    User,
    InstructorRole,
    Course,
    CourseVersion,
    StatusTransition,
    LearningTask,
    QuizTask,
    QuizQuestion,
    QuizOption,
    CourseEnrollment,
    TaskProgress,
    QuizAttempt,
    QuizResponse,
)

# Register models in the admin interface
admin.site.register(User)
admin.site.register(InstructorRole)
admin.site.register(Course)
admin.site.register(CourseVersion)
admin.site.register(StatusTransition)
admin.site.register(LearningTask)
admin.site.register(QuizTask)
admin.site.register(QuizQuestion)
admin.site.register(QuizOption)
admin.site.register(CourseEnrollment)
admin.site.register(TaskProgress)
admin.site.register(QuizAttempt)
admin.site.register(QuizResponse)
# Remove any admin registrations for deleted models
