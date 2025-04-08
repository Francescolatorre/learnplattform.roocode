import datetime

from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.utils import timezone
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator

# User = get_user_model()


class CustomUserManager(BaseUserManager):
    def create_user(self, username, email, password=None, **extra_fields):
        if not email:
            raise ValueError("The Email field must be set")
        email = self.normalize_email(email)
        user = self.model(username=username, email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("role", "admin")

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return self.create_user(username, email, password, **extra_fields)


class User(AbstractUser):
    email = models.EmailField(unique=True)
    display_name = models.CharField(max_length=150, blank=True)
    role = models.CharField(max_length=100, default="student")

    objects = CustomUserManager()

    REQUIRED_FIELDS = ["email", "role"]

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
    creator = models.ForeignKey(
        "User", on_delete=models.CASCADE, related_name="courses"
    )
    description = models.TextField()
    version = models.IntegerField(default=1)
    status = models.CharField(max_length=100)
    visibility = models.CharField(max_length=100)
    learning_objectives = models.TextField(blank=True)
    prerequisites = models.TextField(blank=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.title

    class Meta:
        ordering = ["id"]  # Default ordering by ID


class CourseVersion(models.Model):
    course = models.ForeignKey(
        Course, on_delete=models.CASCADE, related_name="versions"
    )
    version_number = models.IntegerField()
    created_at = models.DateTimeField(default=timezone.now)
    content_snapshot = models.JSONField()
    notes = models.TextField(blank=True)
    created_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True
    )

    class Meta:
        unique_together = ["course", "version_number"]
        ordering = ["-version_number"]

    def __str__(self):
        return f"{self.course.title} - v{self.version_number}"


class StatusTransition(models.Model):
    course = models.ForeignKey(
        Course, on_delete=models.CASCADE, related_name="status_transitions"
    )
    from_status = models.CharField(max_length=100)
    to_status = models.CharField(max_length=100)
    changed_at = models.DateTimeField(default=timezone.now)
    reason = models.TextField(blank=True)
    changed_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True
    )

    def __str__(self):
        return f"{self.course.title}: {self.from_status} → {self.to_status}"


class LearningTask(models.Model):
    course = models.ForeignKey(
        "Course", on_delete=models.CASCADE, related_name="learning_tasks"
    )
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_published = models.BooleanField(default=False)

    class Meta:
        ordering = ["course", "order"]
        verbose_name = "Learning Task"
        verbose_name_plural = "Learning Tasks"

    def __str__(self):
        return f"{self.course.title} - {self.title}"


class QuizTask(LearningTask):
    time_limit_minutes = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(180)], default=60
    )
    pass_threshold = models.IntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(100)], default=70
    )
    max_attempts = models.IntegerField(validators=[MinValueValidator(1)], default=3)
    randomize_questions = models.BooleanField(default=False)

    class Meta:
        verbose_name = "Quiz Task"
        verbose_name_plural = "Quiz Tasks"

    def __str__(self):
        return f"{self.course.title} - {self.title} (Quiz)"


class QuizQuestion(models.Model):
    """Represents a question in a quiz"""

    quiz = models.ForeignKey(
        QuizTask, on_delete=models.CASCADE, related_name="questions"
    )
    text = models.TextField()
    explanation = models.TextField(blank=True)
    points = models.IntegerField(default=1)
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ["order"]
        verbose_name = "Quiz Question"
        verbose_name_plural = "Quiz Questions"

    def __str__(self):
        return f"{self.quiz.title} - Question {self.order}"


class QuizOption(models.Model):
    """Represents an answer option for a quiz question"""

    question = models.ForeignKey(
        QuizQuestion, on_delete=models.CASCADE, related_name="options"
    )
    text = models.CharField(max_length=500)
    is_correct = models.BooleanField(default=False)
    order = models.IntegerField(default=0)
    explanation = models.TextField(blank=True)

    class Meta:
        ordering = ["order"]
        verbose_name = "Quiz Option"
        verbose_name_plural = "Quiz Options"

    def __str__(self):
        return f"{self.question.quiz.title} - Option {self.order}"


class CourseEnrollment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="enrollments")
    course = models.ForeignKey(
        Course, on_delete=models.CASCADE, related_name="enrollments"
    )
    enrollment_date = models.DateTimeField(default=timezone.now)
    status = models.CharField(
        max_length=50,
        choices=[
            ("active", "Active"),
            ("completed", "Completed"),
            ("dropped", "Dropped"),
        ],
    )
    settings = models.JSONField(blank=True, null=True)

    class Meta:
        unique_together = ["user", "course"]
        ordering = ["-enrollment_date"]  # Add default ordering by enrollment date

    def __str__(self):
        return f"{self.user.username} enrolled in {self.course.title}"

    def is_course_completed(self):
        """Check if all tasks in the course are completed by the user."""
        course_tasks = self.course.learning_tasks.all()
        user_progress = self.user.task_progress.filter(task__in=course_tasks)

        if user_progress.count() < course_tasks.count():
            return False

        return all(progress.status == "completed" for progress in user_progress)

    def calculate_course_progress(self):
        """Simplified method that returns just the percentage"""
        stats = self.get_progress_stats()
        return stats["completion_percentage"]

    def get_progress_stats(self):
        """
        Calculate current progress statistics for this enrollment.
        Returns dict with counts and percentages.
        """
        from django.db.models import Count, Q

        # Get all tasks and their counts in a single query
        task_stats = self.course.learning_tasks.aggregate(
            total=Count("id"),
            completed=Count(
                "progress",
                filter=Q(progress__user=self.user, progress__status="completed"),
            ),
            in_progress=Count(
                "progress",
                filter=Q(progress__user=self.user, progress__status="in_progress"),
            ),
        )

        total = task_stats["total"]
        completed = task_stats["completed"]
        in_progress = task_stats["in_progress"]
        not_started = total - (completed + in_progress)

        return {
            "total_tasks": total,
            "completed": completed,
            "in_progress": in_progress,
            "not_started": not_started,
            "completion_percentage": (completed / total * 100) if total > 0 else 0,
        }


class TaskProgress(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="task_progress"
    )
    task = models.ForeignKey(
        LearningTask, on_delete=models.CASCADE, related_name="progress"
    )
    status = models.CharField(
        max_length=50,
        choices=[
            ("not_started", "Not Started"),
            ("in_progress", "In Progress"),
            ("completed", "Completed"),
        ],
    )
    time_spent = models.DurationField(default=datetime.timedelta(0))
    start_date = models.DateTimeField(null=True, blank=True)  # Added field
    completion_date = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)  # Automatically updates on save

    def __str__(self):
        return f"{self.user.username} - {self.task.title} - {self.status}"

    def start_task(self):
        """Start the task if not already started"""
        if not self.start_date and self.status in ["not_started", "in_progress"]:
            self.start_date = timezone.now()
            self.status = "in_progress"
            self.save()


class QuizAttempt(models.Model):
    """
    Represents a student's attempt at a quiz.

    Fields:
        user: The user taking the quiz
        quiz: The quiz being attempted
        score: Final score achieved (0-100)
        time_taken: Total time spent on the quiz
        completion_status: Current status of the attempt
        started_at: When the attempt was started
        attempt_date: When the attempt was last updated/completed
    """

    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="quiz_attempts"
    )
    quiz = models.ForeignKey(
        QuizTask, on_delete=models.CASCADE, related_name="attempts"
    )
    score = models.IntegerField()
    time_taken = models.DurationField()
    completion_status = models.CharField(
        max_length=50,
        choices=[
            ("in_progress", "In Progress"),
            ("completed", "Completed"),
            ("incomplete", "Incomplete"),
            ("abandoned", "Abandoned"),
        ],
        default="in_progress",
    )
    started_at = models.DateTimeField(auto_now_add=True)
    attempt_date = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ["-attempt_date"]
        get_latest_by = "attempt_date"

    def __str__(self):
        return f"{self.user.username} - {self.quiz.title} - Attempt {self.id}"

    def get_latest_attempt(self):
        return (
            self.quiz.attempts.filter(user=self.user).order_by("-attempt_date").first()
        )

    def is_active(self):
        """Check if the attempt is still active and can be submitted"""
        if self.completion_status != "in_progress":
            return False

        # Check if attempt is within the time limit
        elapsed_time = timezone.now() - self.started_at
        return elapsed_time.total_seconds() / 60 <= self.quiz.time_limit_minutes


class QuizResponse(models.Model):
    """Records a student's response to a quiz question"""

    attempt = models.ForeignKey(
        QuizAttempt, on_delete=models.CASCADE, related_name="responses"
    )
    question = models.ForeignKey(
        QuizQuestion, on_delete=models.CASCADE, related_name="responses"
    )
    selected_option = models.ForeignKey(
        QuizOption, on_delete=models.CASCADE, related_name="responses"
    )
    is_correct = models.BooleanField()
    time_spent = models.DurationField()

    def __str__(self):
        return f"{self.attempt.user.username} - {self.question.text[:20]} - {'Correct' if self.is_correct else 'Incorrect'}"
