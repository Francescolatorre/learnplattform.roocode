from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from typing import Optional, Type, TypeVar, ClassVar
from django.db.models import Manager, QuerySet
from django.core.exceptions import ObjectDoesNotExist

T = TypeVar('T', bound='Course')
TaskT = TypeVar('TaskT', bound='Task')

class CourseManager(Manager['Course']):
    def get_by_title(self, title: str) -> Optional['Course']:
        """Retrieve a course by its title."""
        try:
            return self.get(title=title)
        except ObjectDoesNotExist:
            return None

class Course(models.Model):
    objects = CourseManager()

    title = models.CharField(
        _('Course Title'), 
        max_length=200, 
        unique=True
    )
    description = models.TextField(
        _('Course Description'), 
        blank=True
    )
    created_at = models.DateTimeField(
        _('Created At'), 
        auto_now_add=True
    )
    updated_at = models.DateTimeField(
        _('Updated At'), 
        auto_now=True
    )
    is_active = models.BooleanField(
        _('Is Active'), 
        default=True
    )

    def __str__(self) -> str:
        return str(self.title)

    class Meta:
        verbose_name = _('Course')
        verbose_name_plural = _('Courses')
        ordering = ['-created_at']

class TaskManager(Manager['Task']):
    def get_by_course_and_title(self, course_title: str, task_title: str) -> Optional['Task']:
        """Retrieve a task by course title and task title."""
        try:
            return self.get(
                course__title=course_title, 
                title=task_title
            )
        except ObjectDoesNotExist:
            return None

class Task(models.Model):
    objects = TaskManager()

    TASK_TYPES = [
        ('text', _('Text Submission')),
        ('mindmap', _('Mindmap')),
        ('image', _('Image Upload'))
    ]

    course = models.ForeignKey(
        'Course', 
        on_delete=models.CASCADE, 
        related_name='tasks',
        verbose_name=_('Course')
    )
    title = models.CharField(
        _('Task Title'), 
        max_length=200
    )
    description = models.TextField(
        _('Task Description')
    )
    type = models.CharField(
        _('Task Type'), 
        max_length=20, 
        choices=TASK_TYPES
    )
    order = models.PositiveIntegerField(
        _('Task Order'), 
        default=0
    )
    evaluation_prompt = models.TextField(
        _('Evaluation Prompt'), 
        blank=True
    )
    max_score = models.DecimalField(
        _('Maximum Score'), 
        max_digits=5, 
        decimal_places=2, 
        default=10.00
    )

    def __str__(self) -> str:
        return str(f"{self.course.title} - {self.title}")

    class Meta:
        verbose_name = _('Task')
        verbose_name_plural = _('Tasks')
        unique_together = [['course', 'order']]
        ordering = ['course', 'order']
