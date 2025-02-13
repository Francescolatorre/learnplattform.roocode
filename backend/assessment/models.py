from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from courses.models import Task, Course
from django.db.models import Manager

class SubmissionManager(Manager):
    def create_submission(self, user, task, content, status='pending'):
        """Create a submission with optional status."""
        return self.create(
            user=user,
            task=task,
            content=content,
            status=status
        )

class Submission(models.Model):
    objects = SubmissionManager()

    SUBMISSION_STATUS = [
        ('pending', _('Pending Review')),
        ('reviewed', _('Reviewed')),
        ('accepted', _('Accepted')),
        ('rejected', _('Rejected'))
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='submissions',
        verbose_name=_('User')
    )
    task = models.ForeignKey(
        Task, 
        on_delete=models.CASCADE, 
        related_name='submissions',
        verbose_name=_('Task')
    )
    content = models.TextField(_('Submission Content'))
    file = models.FileField(
        _('Submission File'), 
        upload_to='submissions/', 
        null=True, 
        blank=True
    )
    submitted_at = models.DateTimeField(
        _('Submitted At'), 
        auto_now_add=True
    )
    status = models.CharField(
        _('Submission Status'), 
        max_length=20, 
        choices=SUBMISSION_STATUS, 
        default='pending'
    )
    feedback = models.TextField(
        _('Feedback'), 
        blank=True
    )
    score = models.FloatField(
        _('Score'), 
        null=True, 
        blank=True
    )

    def __str__(self):
        return f"{self.user.username} - {self.task.title}"

    class Meta:
        verbose_name = _('Submission')
        verbose_name_plural = _('Submissions')
        ordering = ['-submitted_at']

class UserProgressManager(Manager):
    def create_progress(self, user, course, total_score=0):
        """Create a user progress record."""
        return self.create(
            user=user,
            course=course,
            total_score=total_score
        )

class UserProgress(models.Model):
    objects = UserProgressManager()

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='progress',
        verbose_name=_('User')
    )
    course = models.ForeignKey(
        Course, 
        on_delete=models.CASCADE, 
        related_name='user_progress',
        verbose_name=_('Course')
    )
    completed_tasks = models.ManyToManyField(
        Task, 
        blank=True,
        verbose_name=_('Completed Tasks')
    )
    last_accessed = models.DateTimeField(
        _('Last Accessed'), 
        auto_now=True
    )
    total_score = models.FloatField(
        _('Total Score'), 
        default=0
    )

    class Meta:
        unique_together = ('user', 'course')
        verbose_name = _('User Progress')
        verbose_name_plural = _('User Progress')

    def __str__(self):
        return f"{self.user.username} - {self.course.title} Progress"
