from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
import datetime
import django


class CustomUserManager(BaseUserManager):
    def create_user(self, username, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(username=username, email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'admin')
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        
        return self.create_user(username, email, password, **extra_fields)


class User(AbstractUser):
    email = models.EmailField(unique=True)
    display_name = models.CharField(max_length=150, blank=True)
    role = models.CharField(max_length=100, default='student')
    
    objects = CustomUserManager()
    
    REQUIRED_FIELDS = ['email', 'role']
    
    def __str__(self):
        return self.username


class InstructorRole(models.Model):
    role_name = models.CharField(max_length=100, primary_key=True)
    description = models.TextField()
    can_edit_course = models.BooleanField(default=False)
    can_manage_tasks = models.BooleanField(default=False)
    can_grade_submissions = models.BooleanField(default=False)


class Course(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    version = models.IntegerField(default=1)
    status = models.CharField(max_length=100)
    visibility = models.CharField(max_length=100)
    learning_objectives = models.TextField(blank=True)
    prerequisites = models.TextField(blank=True)
    created_at = models.DateTimeField(default=django.utils.timezone.now)
    updated_at = models.DateTimeField(default=django.utils.timezone.now)
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_courses', null=True)
    
    def __str__(self):
        return self.title


class CourseVersion(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='versions')
    version_number = models.IntegerField()
    created_at = models.DateTimeField(default=django.utils.timezone.now)
    content_snapshot = models.JSONField()
    notes = models.TextField(blank=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    
    class Meta:
        unique_together = ['course', 'version_number']
        ordering = ['-version_number']
    
    def __str__(self):
        return f"{self.course.title} - v{self.version_number}"


class StatusTransition(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='status_transitions')
    from_status = models.CharField(max_length=100)
    to_status = models.CharField(max_length=100)
    changed_at = models.DateTimeField(default=django.utils.timezone.now)
    reason = models.TextField(blank=True)
    changed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    
    def __str__(self):
        return f"{self.course.title}: {self.from_status} → {self.to_status}"


class LearningTask(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='tasks')
    title = models.CharField(max_length=255)
    description = models.TextField()
    order = models.IntegerField(default=0)
    is_published = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=django.utils.timezone.now)
    updated_at = models.DateTimeField(default=django.utils.timezone.now)
    
    class Meta:
        ordering = ['order']
    
    def __str__(self):
        return self.title


class QuizTask(LearningTask):
    """Extension of LearningTask for multiple choice quizzes"""
    time_limit_minutes = models.IntegerField(default=30)
    pass_threshold = models.IntegerField(default=70)  # Percentage needed to pass
    max_attempts = models.IntegerField(default=3)
    randomize_questions = models.BooleanField(default=True)
    
    def __str__(self):
        return f"Quiz: {self.title}"


class QuizQuestion(models.Model):
    quiz = models.ForeignKey(QuizTask, on_delete=models.CASCADE, related_name='questions')
    text = models.TextField()
    explanation = models.TextField(blank=True)
    points = models.IntegerField(default=1)
    order = models.IntegerField(default=0)
    
    class Meta:
        ordering = ['order']
    
    def __str__(self):
        return self.text[:50]


class QuizOption(models.Model):
    question = models.ForeignKey(QuizQuestion, on_delete=models.CASCADE, related_name='options')
    text = models.TextField()
    is_correct = models.BooleanField(default=False)
    order = models.IntegerField(default=0)
    
    class Meta:
        ordering = ['order']
    
    def __str__(self):
        return self.text[:50]