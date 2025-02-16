from django.db import models
from django.utils.translation import gettext_lazy as _
from django.conf import settings
from django.apps import apps

class Course(models.Model):
    """
    Model representing a course in the learning platform.
    """
    class Meta:
        app_label = 'learning'

    title = models.CharField(
        _('Course Title'), 
        max_length=200, 
        unique=True
    )
    description = models.TextField(
        _('Course Description'), 
        blank=True
    )
    instructor = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        related_name='courses_taught',
        null=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Relationship with tasks
    tasks = models.ManyToManyField(
        'tasks.LearningTask', 
        related_name='courses', 
        blank=True
    )

    objects = models.Manager()

    def __str__(self) -> str:
        """
        String representation of the Course model.
        """
        return str(self.title) if self.title else ''

    def get_total_tasks(self) -> int:
        """
        Returns the total number of tasks in the course.
        """
        return self.tasks.count()

    def get_learning_tasks(self):
        """
        Returns all learning tasks for this course.
        """
        return self.tasks.all()
