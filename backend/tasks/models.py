from django.db import models
from django.conf import settings
from django.utils import timezone
from django.core.exceptions import ValidationError
import uuid
import os

from courses.models import Course

class TaskStatus(models.TextChoices):
    DRAFT = 'DRAFT', 'Draft'
    PUBLISHED = 'PUBLISHED', 'Published'
    ARCHIVED = 'ARCHIVED', 'Archived'
    DEPRECATED = 'DEPRECATED', 'Deprecated'

class TaskDifficulty(models.TextChoices):
    BEGINNER = 'BEGINNER', 'Beginner'
    INTERMEDIATE = 'INTERMEDIATE', 'Intermediate'
    ADVANCED = 'ADVANCED', 'Advanced'

class TaskType(models.TextChoices):
    TEXT_SUBMISSION = 'TEXT_SUBMISSION', 'Text Submission'
    MULTIPLE_CHOICE = 'MULTIPLE_CHOICE', 'Multiple Choice'
    FILE_UPLOAD = 'FILE_UPLOAD', 'File Upload'
    QUIZ = 'QUIZ', 'Quiz'
    PROJECT = 'PROJECT', 'Project'
    DISCUSSION = 'DISCUSSION', 'Discussion'

class LearningTask(models.Model):
    """
    Comprehensive and flexible Learning Task model with advanced configuration
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Core Task Information
    title = models.CharField(max_length=255, verbose_name="Task Title")
    description = models.TextField(verbose_name="Task Description", blank=True)
    
    # Course Relationship
    course = models.ForeignKey(
        Course, 
        on_delete=models.CASCADE, 
        related_name='learning_tasks'
    )
    
    # Enhanced Task Type and Configuration
    task_type = models.CharField(
        max_length=50, 
        choices=TaskType.choices, 
        default=TaskType.TEXT_SUBMISSION
    )
    
    # Status and Visibility
    status = models.CharField(
        max_length=20, 
        choices=TaskStatus.choices, 
        default=TaskStatus.DRAFT
    )
    difficulty_level = models.CharField(
        max_length=20, 
        choices=TaskDifficulty.choices, 
        default=TaskDifficulty.BEGINNER
    )
    
    # Timestamps and Ownership
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        related_name='created_tasks'
    )
    
    # Task Submission Controls
    max_submissions = models.PositiveIntegerField(
        verbose_name="Maximum Submissions", 
        blank=True, 
        null=True
    )
    deadline = models.DateTimeField(
        verbose_name="Task Deadline", 
        blank=True, 
        null=True
    )
    
    # Assessment-related Fields
    points_possible = models.DecimalField(
        max_digits=7, 
        decimal_places=2, 
        null=True, 
        blank=True
    )
    passing_score = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        null=True, 
        blank=True
    )
    
    # Text Submission Specific Configuration
    text_submission_config = models.JSONField(
        default=dict, 
        blank=True, 
        help_text="Configuration for text submission tasks"
    )
    
    # Text Submission Constraints
    min_word_count = models.PositiveIntegerField(
        verbose_name="Minimum Word Count", 
        null=True, 
        blank=True
    )
    max_word_count = models.PositiveIntegerField(
        verbose_name="Maximum Word Count", 
        null=True, 
        blank=True
    )
    
    # Advanced Flexible Configuration
    task_configuration = models.JSONField(
        default=dict, 
        blank=True, 
        help_text="Flexible configuration for task-specific settings"
    )
    
    # Enhanced Task Controls
    is_active = models.BooleanField(default=True)
    requires_peer_review = models.BooleanField(default=False)
    
    class Meta:
        verbose_name = "Learning Task"
        verbose_name_plural = "Learning Tasks"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['course', 'status', 'task_type']),
            models.Index(fields=['created_at', 'task_type']),
            models.Index(fields=['deadline', 'status']),
            models.Index(fields=['created_by', 'task_type']),
        ]
    
    def __str__(self):
        return f"{self.title} ({self.task_type})"
    
    def clean(self):
        """
        Validate task configuration and constraints
        """
        # Validate deadline
        if self.deadline and self.deadline < timezone.now():
            raise ValidationError("Deadline cannot be in the past")
        
        # Validate points possible
        if self.points_possible is not None:
            if self.points_possible < 0:
                raise ValidationError("Points possible must be non-negative")
        
        # Validate passing score
        if self.passing_score is not None:
            if self.passing_score < 0:
                raise ValidationError("Passing score must be non-negative")
            
            if self.points_possible is not None and self.passing_score > self.points_possible:
                raise ValidationError("Passing score cannot be greater than points possible")
        
        # Validate text submission constraints
        if self.task_type == TaskType.TEXT_SUBMISSION:
            if self.min_word_count is not None and self.max_word_count is not None:
                if self.min_word_count > self.max_word_count:
                    raise ValidationError("Minimum word count cannot be greater than maximum word count")
    
    def save(self, *args, **kwargs):
        """
        Override save method to run full validation
        """
        self.full_clean()
        super().save(*args, **kwargs)
    
    def is_available_to_students(self):
        """
        Comprehensive availability check for tasks
        """
        checks = [
            self.status == TaskStatus.PUBLISHED,
            self.is_active,
            not (self.deadline and timezone.now() > self.deadline)
        ]
        return all(checks)
    
    def get_submission_count(self, student):
        """
        Placeholder for submission count logic
        To be implemented with submission tracking
        """
        return 0
    
    def can_submit(self, student):
        """
        Comprehensive submission eligibility check
        """
        if not self.is_available_to_students():
            return False
        
        if self.max_submissions is not None:
            return self.get_submission_count(student) < self.max_submissions
        
        return True
    
    def validate_text_submission(self, text_content):
        """
        Validate text submission based on task constraints
        """
        if self.task_type != TaskType.TEXT_SUBMISSION:
            return False
        
        # Count words
        word_count = len(text_content.split())
        
        # Check word count constraints
        if self.min_word_count is not None and word_count < self.min_word_count:
            return False
        
        if self.max_word_count is not None and word_count > self.max_word_count:
            return False
        
        return True
    
    def get_task_configuration(self):
        """
        Retrieve and validate task-specific configuration
        """
        return self.task_configuration

class FileUploadTaskType(models.Model):
    """
    Specialized model for file upload task configurations
    """
    task = models.OneToOneField(
        'LearningTask', 
        on_delete=models.CASCADE, 
        related_name='file_upload_config'
    )
    
    # File type restrictions
    allowed_file_types = models.JSONField(
        default=list, 
        blank=True,
        help_text="List of allowed file extensions (e.g. ['.pdf', '.docx', '.jpg'])"
    )
    
    # Size restrictions
    max_file_size = models.PositiveIntegerField(
        default=10485760,  # 10MB default
        help_text="Maximum file size in bytes"
    )
    
    max_files = models.PositiveIntegerField(
        default=1,
        help_text="Maximum number of files that can be uploaded"
    )
    
    # Additional configuration options
    require_description = models.BooleanField(
        default=False,
        help_text="Require students to provide a description for uploaded files"
    )
    
    virus_scan_required = models.BooleanField(
        default=True,
        help_text="Require virus scanning for uploaded files"
    )
    
    def clean(self):
        """
        Validate file upload configuration
        """
        # Validate file types
        if not isinstance(self.allowed_file_types, list):
            raise ValidationError("Allowed file types must be a list of extensions")
        
        # Validate each file type is a string starting with a dot
        for file_type in self.allowed_file_types:
            if not isinstance(file_type, str) or not file_type.startswith('.'):
                raise ValidationError(f"Invalid file type: {file_type}. Must be a string starting with a dot.")
        
        # Validate max file size
        if self.max_file_size <= 0:
            raise ValidationError("Maximum file size must be a positive number")
        
        # Validate max files
        if self.max_files <= 0:
            raise ValidationError("Maximum number of files must be a positive number")
    
    def save(self, *args, **kwargs):
        """
        Override save method to run full validation
        """
        self.full_clean()
        super().save(*args, **kwargs)
    
    def validate_file(self, file_obj):
        """
        Validate an individual file against task configuration
        """
        # Check file size
        if file_obj.size > self.max_file_size:
            raise ValidationError(f"File exceeds maximum size of {self.max_file_size} bytes")
        
        # Check file extension
        file_ext = os.path.splitext(file_obj.name)[1].lower()
        if self.allowed_file_types and file_ext not in self.allowed_file_types:
            raise ValidationError(f"File type {file_ext} is not allowed. Allowed types: {', '.join(self.allowed_file_types)}")
        
        # Placeholder for virus scanning (would be implemented with a dedicated service)
        if self.virus_scan_required:
            # In a real-world scenario, this would call an external virus scanning service
            pass
        
        return True

class FileSubmission(models.Model):
    """
    Model to track individual file submissions for a task
    """
    task = models.ForeignKey(
        'LearningTask', 
        on_delete=models.CASCADE, 
        related_name='file_submissions'
    )
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='file_submissions'
    )
    
    file = models.FileField(
        upload_to='submissions/',
        help_text="Uploaded file for the task"
    )
    
    original_filename = models.CharField(
        max_length=255,
        help_text="Original filename of the uploaded file"
    )
    
    file_description = models.TextField(
        blank=True, 
        null=True,
        help_text="Optional description for the uploaded file"
    )
    
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    def clean(self):
        """
        Validate file submission
        """
        # Retrieve the task's file upload configuration
        try:
            file_config = self.task.file_upload_config
            file_config.validate_file(self.file)
        except FileUploadTaskType.DoesNotExist:
            raise ValidationError("No file upload configuration found for this task")
        
        # Check description requirement
        if file_config.require_description and not self.file_description:
            raise ValidationError("A description is required for file submissions")
    
    def save(self, *args, **kwargs):
        """
        Override save to perform validation
        """
        self.full_clean()
        return super().save(*args, **kwargs)
    
    def __str__(self):
        return f"File submission for {self.task.title} by {self.student.username}"
