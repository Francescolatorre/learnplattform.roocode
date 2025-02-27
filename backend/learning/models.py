from django.db import models
from django.utils import timezone
from django.conf import settings
import uuid

# Import Course from courses.models for compatibility with existing code
try:
    from courses.models import Course
except ImportError:
    try:
        from backend.courses.models import Course
    except ImportError:
        # Define a placeholder for Course to allow model loading
        # This will be replaced by the actual import at runtime
        Course = models.Model

# Re-export Course for backward compatibility
# This allows existing code to continue importing Course from learning.models
# while the actual model is defined in courses.models

class LearningTask(models.Model):
    STATUS_CHOICES = [
        ('Draft', 'Draft'),
        ('Published', 'Published'),
        ('Archived', 'Archived'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    description = models.TextField()
    course = models.ForeignKey('courses.Course', on_delete=models.CASCADE, related_name='learning_tasks')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    max_submissions = models.IntegerField(null=True, blank=True)
    deadline = models.DateTimeField(null=True, blank=True)
    points = models.IntegerField(default=0)  # Added points field
    task_type = models.CharField(max_length=50, default='Text')  # Added task_type field
    submission_instructions = models.TextField(blank=True)  # Added submission_instructions field

    class Meta:
        app_label = 'learning'
        indexes = [
            models.Index(fields=['course']),
            models.Index(fields=['status']),
            models.Index(fields=['created_at']),
            models.Index(fields=['updated_at']),
        ]

    def __str__(self):
        return f"{self.title} - {self.course.title if hasattr(self.course, 'title') else 'No Course'}"

class StatusTransition(models.Model):
    """
    Tracks status changes for courses with audit information.
    """
    course = models.ForeignKey('courses.Course', on_delete=models.CASCADE, related_name='status_transitions')
    from_status = models.CharField(max_length=20)
    to_status = models.CharField(max_length=20)
    changed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    reason = models.TextField()
    changed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        app_label = 'learning'
        indexes = [
            models.Index(fields=['course']),
            models.Index(fields=['changed_at']),
        ]

    def __str__(self):
        course_title = getattr(self.course, 'title', 'Unknown Course')
        return f"{course_title}: {self.from_status} → {self.to_status}"

# Add compatibility classes for other models mentioned in imports
class CourseInstructorAssignment(models.Model):
    """
    Compatibility class for CourseInstructorAssignment.
    """
    course = models.ForeignKey('courses.Course', on_delete=models.CASCADE, related_name='+')
    instructor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='+')
    role = models.CharField(max_length=50)
    
    class Meta:
        app_label = 'learning'

class InstructorRole(models.TextChoices):
    """
    Compatibility class for InstructorRole.
    """
    LEAD = 'LEAD', 'Lead Instructor'
    ASSISTANT = 'ASSISTANT', 'Assistant Instructor'
    GUEST = 'GUEST', 'Guest Lecturer'

class CourseVersion(models.Model):
    """
    Compatibility class for CourseVersion.
    """
    course = models.ForeignKey('courses.Course', on_delete=models.CASCADE, related_name='+')
    version = models.CharField(max_length=20)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        app_label = 'learning'
