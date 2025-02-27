from django.contrib import admin
from backend.tasks.models import LearningTask, AssessmentTask, QuizTask # Registering all task models

admin.site.register(LearningTask)
admin.site.register(AssessmentTask)
admin.site.register(QuizTask)
