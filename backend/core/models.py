import datetime
from typing import TYPE_CHECKING, Any, Dict

from django.contrib.auth.models import AbstractUser, UserManager
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.db.models import QuerySet
from django.utils import timezone

from utils.markdown_utils import convert_markdown_to_html

if TYPE_CHECKING:
    # Use string literals for forward references to avoid circular imports
    CourseType = "Course"
    CourseEnrollmentType = "CourseEnrollment"
    QuizAttemptType = "QuizAttempt"


class CustomUserManager(UserManager["User"]):
    """
    Custom user manager to handle user creation with required email field.
    """

    def create_user(
        self,
        username: str,
        email: str,
        password: str | None = None,
        **extra_fields: Any,
    ) -> "User":
        if not email:
            raise ValueError("The Email field must be set")
        email = self.normalize_email(email)
        user = self.model(username=username, email=email, **extra_fields)
        if password:
            user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(
        self,
        username: str,
        email: str,
        password: str | None = None,
        **extra_fields: Any,
    ) -> "User":
        extra_fields = dict(extra_fields)  # Convert to mutable dict
        extra_fields["is_staff"] = True
        extra_fields["is_superuser"] = True
        extra_fields["role"] = "admin"

        return self.create_user(username, email, password, **extra_fields)


class User(AbstractUser):
    """
    Custom user model for the learning platform.

    Extends Django's AbstractUser to add platform-specific fields.
    """

    email = models.EmailField(unique=True)
    display_name = models.CharField(max_length=150, blank=True)
    role = models.CharField(
        max_length=100,
        choices=[
            ("student", "Student"),
            ("instructor", "Instructor"),
            ("admin", "Administrator"),
        ],
        default="student",
    )

    objects = CustomUserManager()
    REQUIRED_FIELDS = ["email", "role"]

    def __str__(self) -> str:
        return str(self.username)

    class Meta:
        ordering = ["username"]
        indexes = [
            models.Index(fields=["email"]),
            models.Index(fields=["role"]),
        ]

    def is_instructor_or_admin(self) -> bool:
        """Check if user has instructor or admin privileges."""
        return self.role in ["instructor", "admin"] or self.is_staff

    def get_enrolled_courses(self) -> QuerySet[models.Model]:
        """Get all courses the user is enrolled in."""
        return self.enrollments.filter(status="active").select_related("course")

    def get_managed_courses(self) -> QuerySet[models.Model]:
        """Get all courses managed by the user (instructor only)."""
        if self.is_instructor_or_admin():
            return self.courses.all()
        return self.courses.none()


class InstructorRole(models.Model):
    role_name = models.CharField(max_length=100, primary_key=True)
    description = models.TextField()
    can_edit_course = models.BooleanField(default=False)
    can_manage_tasks = models.BooleanField(default=False)
    can_grade_submissions = models.BooleanField(default=False)


class Course(models.Model):
    """
    Represents a course in the learning platform.

    A course contains multiple learning tasks and can have students enrolled in it.
    It tracks metadata such as learning objectives, prerequisites, and visibility.
    """

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

    @property
    def description_html(self):
        """Returns the HTML rendered version of the markdown description."""
        return convert_markdown_to_html(self.description)

    @property
    def safe_description(self) -> str:
        """Returns a sanitized HTML version of the description."""
        return convert_markdown_to_html(self.description)

    def __str__(self):
        return str(self.title)

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
    """
    Represents a learning task within a course.

    Learning tasks are student-facing assignments completed within the platform
    and can include various types of content (text, quizzes, etc.).
    """

    course = models.ForeignKey(
        "Course", on_delete=models.CASCADE, related_name="learning_tasks"
    )  # Use string reference
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_published = models.BooleanField(default=False)

    @property
    def description_html(self):
        """Returns the HTML rendered version of the markdown description."""
        return convert_markdown_to_html(self.description)

    @property
    def safe_description(self) -> str:
        """Returns a sanitized HTML version of the task description."""
        return convert_markdown_to_html(self.description)

    @property
    def course_title(self) -> str:
        """Returns the title of the associated course."""
        return str(self.course.title) if self.course else ""

    @property
    def course_description(self) -> str:
        """Returns the description of the associated course."""
        return self.course.description if self.course else ""

    class Meta:
        ordering = ["course", "order"]
        verbose_name = "Learning Task"
        verbose_name_plural = "Learning Tasks"

    def __str__(self):
        return f"{self.course.title} - {self.title}"

    def get_course_title(self) -> str:
        """Returns the title of the associated course."""
        return str(self.course.title)  # IDE now understands this relationship

    def get_course(self) -> "Course":
        """Returns the course object with proper typing."""
        return self.course


class QuizTask(LearningTask):
    """
    Represents a quiz-based learning task within a course.

    QuizTask extends LearningTask to include quiz-specific functionality
    such as time limits, pass thresholds, and attempt limits.
    """

    time_limit_minutes = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(180)], default=60
    )
    pass_threshold = models.IntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(100)], default=70
    )
    max_attempts = models.IntegerField(validators=[MinValueValidator(1)], default=3)
    randomize_questions = models.BooleanField(default=False)

    class Meta:
        """Meta Options for QuizTask."""

        verbose_name = "Quiz Task"
        verbose_name_plural = "Quiz Tasks"

    def __str__(self):
        return f"{self.course.title} - {self.title} (Quiz)"

    def get_questions(self) -> QuerySet["QuizQuestion"]:
        """Returns all questions associated with this quiz."""
        return self.questions.all().order_by("order")

    def is_completed_by_user(self, user_id: int) -> bool:
        """
        Check if a user has successfully completed this quiz.

        Args:
            user_id: The ID of the user to check

        Returns:
            bool: True if the user has a successful attempt, False otherwise
        """
        successful_attempts = self.attempts.filter(
            user_id=user_id,
            completion_status="completed",
            score__gte=self.pass_threshold,
        ).exists()
        return successful_attempts


class QuizQuestion(models.Model):
    """
    Represents a question in a quiz.

    Each question belongs to a quiz task and can have multiple answer options.
    """

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

    @property
    def quiz_title(self) -> str:
        """Returns the title of the quiz this question belongs to."""
        return self.quiz.title if self.quiz else ""

    @property
    def course(self) -> "Course | None":
        """Returns the course this question's quiz belongs to."""
        return self.quiz.course if self.quiz and hasattr(self.quiz, "course") else None

    @property
    def course_title(self) -> str:
        """Returns the title of the course this question's quiz belongs to."""
        return self.quiz.course.title if self.quiz and self.quiz.course else ""


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

    def is_course_completed(self) -> bool:
        """Check if all tasks in the course are completed by the user."""
        course_tasks = self.course.learning_tasks.all()
        user_progress = self.user.task_progress.filter(task__in=course_tasks)

        if user_progress.count() < course_tasks.count():
            return False

        return all(progress.status == "completed" for progress in user_progress)

    def calculate_course_progress(self) -> float:
        """Simplified method that returns just the percentage"""
        stats = self.get_progress_stats()
        return stats["completion_percentage"]

    def get_progress_stats(self) -> Dict[str, int | float]:
        """
        Calculate current progress statistics for this enrollment.
        Returns dict with counts and percentages.
        """
        from django.db.models import Count, Q  # Import where used

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

    def start_task(self) -> None:
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
        return f"{self.user.username} - {self.quiz_title} - Attempt {self.id}"

    def get_latest_attempt(self) -> "QuizAttempt | None":
        return (
            self.quiz.attempts.filter(user=self.user).order_by("-attempt_date").first()
        )

    def is_active(self) -> bool:
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
