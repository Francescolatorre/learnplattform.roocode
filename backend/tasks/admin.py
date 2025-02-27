from django.contrib import admin
from .models import LearningTask, QuizTask # Registering all task models

admin.site.register(LearningTask)
admin.site.register(QuizTask)
