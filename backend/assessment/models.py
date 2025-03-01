'''
This module contains the models for the assessment app.
'''

from django.apps import apps
from django.conf import settings
from django.db import models
from django.utils.translation import gettext_lazy as _


class Submission(models.Model):
    '''
    Model representing a submission for an assessment task.
    Attributes:
        user (ForeignKey): Reference to the user who made the submission.
        task (ForeignKey): Reference to the task being submitted.
        submitted_at (DateTimeField): Timestamp when the submission was made.
        content (TextField): Content of the submission.
        grade (DecimalField): Grade assigned to the submission.
        graded_by (ForeignKey): Reference to the user who graded the submission.
    Methods:
        get_username() -> str:
            Safely retrieve the username from the related user.
        get_task_title() -> str:
            Safely retrieve the task title.
        __str__() -> str:
            Return a string representation of the submission.
    '''
    class Meta:
        app_label = 'assessment'
        unique_together = ('user', 'task')

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='assessment_submissions'
    )
    task = models.ForeignKey(
        'tasks.LearningTask', 
        on_delete=models.CASCADE, 
        related_name='assessment_submissions'
    )
    submitted_at = models.DateTimeField(auto_now_add=True)
    content = models.TextField(
        _('Submission Content'), 
        blank=True
    )
    grade = models.DecimalField(
        _('Grade'), 
        max_digits=5, 
        decimal_places=2, 
        null=True, 
        blank=True
    )
    graded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name='assessment_graded_submissions',
        null=True,
        blank=True
    )

    objects = models.Manager()

    def get_username(self) -> str:
        """
        Safely retrieve username from related user
        """
        try:
            return str(self.user.username) if self.user else ''
        except AttributeError:
            return ''

    def get_task_title(self) -> str:
        """
        Safely retrieve task title
        """
        try:
            return str(self.task.title) if self.task else ''
        except AttributeError:
            return ''

    def __str__(self) -> str:
        return f"{self.get_username()} - {self.get_task_title()}"

class Quiz(models.Model):
    '''
    Model representing a quiz in the assessment system.
    '''
    class Meta:
        app_label = 'assessment'
        verbose_name_plural = 'Quizzes'

    title = models.CharField(
        _('Quiz Title'), 
        max_length=200
    )
    description = models.TextField(
        _('Quiz Description'), 
        blank=True
    )
    tasks = models.ManyToManyField(
        'tasks.LearningTask', 
        related_name='assessment_quizzes', 
        blank=True,
        limit_choices_to={'task_type': 'MULTIPLE_CHOICE'}
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = models.Manager()

    def __str__(self) -> str:
        return str(self.title)

    def get_total_tasks(self) -> int:
        """
        Returns the total number of tasks in the quiz.
        """
        return self.tasks.all().count()

class UserProgress(models.Model):
    class Meta:
        app_label = 'assessment'
        unique_together = ('user', 'quiz')

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='assessment_progress'
    )
    quiz = models.ForeignKey(
        Quiz, 
        on_delete=models.CASCADE, 
        related_name='user_progress'
    )
    completed_tasks = models.ManyToManyField(
        'tasks.LearningTask', 
        related_name='assessment_completed_by',
        blank=True,
        limit_choices_to={'task_type': 'MULTIPLE_CHOICE'}
    )
    total_score = models.DecimalField(
        _('Total Score'), 
        max_digits=5, 
        decimal_places=2, 
        default=0
    )
    is_completed = models.BooleanField(default=False)

    objects = models.Manager()

    def get_username(self) -> str:
        """
        Safely retrieve username from related user
        """
        try:
            return str(self.user.username) if self.user else ''
        except AttributeError:
            return ''

    def get_quiz_title(self) -> str:
        """
        Safely retrieve quiz title
        """
        try:
            return str(self.quiz.title) if self.quiz else ''
        except AttributeError:
            return ''

    def __str__(self) -> str:
        return f"{self.get_username()} - {self.get_quiz_title()}"
