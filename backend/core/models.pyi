"""
Type stub definitions for the Learning Platform core models.

This module provides type hints and stub definitions for Django models to help IDEs
understand dynamic model relationships and provide better type checking support.
Includes models for users, courses, tasks, quizzes, and progress tracking.
"""

from datetime import datetime, timedelta
from typing import Optional

from django.db import models

# Type stubs for Django models to help IDE understand dynamic model relationships

class User(models.Model):
    """
    Represents a user in the learning platform.

    Extends Django's base User model to add learning platform specific fields
    like display name and role. Supports different user types including students,
    instructors and administrators.

    Attributes:
        username: Unique identifier for the user
        email: User's email address
        display_name: User's display name in the platform
        role: User's role (student, instructor, admin)
        is_staff: Whether user has staff privileges
        is_superuser: Whether user has superuser privileges
    """

    username: str
    email: str
    display_name: str
    role: str
    is_staff: bool
    is_superuser: bool

class Course(models.Model):
    """
    Represents a course in the learning platform.

    A course is a container for learning content that students can enroll in.
    It includes metadata about the course and references to all associated
    learning tasks.

    Attributes:
        id: Unique identifier for the course
        title: Course title
        description: Detailed course description
        creator: Reference to the User who created the course
        version: Course version number
        status: Current status (draft, published, archived)
        visibility: Course visibility setting (public, private)
        learning_objectives: Course learning objectives
        prerequisites: Course prerequisites
        created_at: Timestamp of course creation
        updated_at: Timestamp of last update
    """

    id: int
    title: str
    description: str
    creator: User
    version: int
    status: str
    visibility: str
    learning_objectives: str
    prerequisites: str
    created_at: datetime
    updated_at: datetime

class LearningTask(models.Model):
    """
    Represents a learning task within a course.

    A learning task is a unit of learning content that students complete
    as part of a course. Can be extended by specific task types like QuizTask.

    Attributes:
        id: Unique identifier for the task
        course: Reference to the Course this task belongs to
        title: Task title
        description: Detailed task description
        order: Task order within the course
        created_at: Timestamp of task creation
        updated_at: Timestamp of last update
        is_published: Whether the task is published
    """

    id: int
    course: Course
    title: str
    description: str
    order: int
    created_at: datetime
    updated_at: datetime
    is_published: bool

    def get_course(self) -> Course:
        """Returns the course this task belongs to."""
        pass
    def get_course_title(self) -> str:
        """Returns the title of the course this task belongs to."""
        pass

class QuizTask(LearningTask):
    """
    Represents a quiz-type learning task.

    Extends LearningTask to add quiz-specific functionality including
    time limits, pass thresholds, and attempt limits.

    Attributes:
        time_limit_minutes: Time limit for quiz completion in minutes
        pass_threshold: Score required to pass the quiz (0-100)
        max_attempts: Maximum number of attempts allowed
        randomize_questions: Whether to randomize question order
    """

    time_limit_minutes: int
    pass_threshold: int
    max_attempts: int
    randomize_questions: bool

class QuizQuestion(models.Model):
    """
    Represents a question in a quiz.

    Questions belong to a QuizTask and can have multiple QuizOptions
    as possible answers.

    Attributes:
        id: Unique identifier for the question
        quiz: Reference to the QuizTask this question belongs to
        text: Question text
        explanation: Explanation of the correct answer
        points: Points awarded for correct answer
        order: Question order within the quiz
    """

    id: int
    quiz: QuizTask
    text: str
    explanation: str
    points: int
    order: int

class QuizOption(models.Model):
    """
    Represents an answer option for a quiz question.

    Each option belongs to a QuizQuestion and can be marked as correct
    or incorrect.

    Attributes:
        id: Unique identifier for the option
        question: Reference to the QuizQuestion this option belongs to
        text: Option text
        is_correct: Whether this is the correct answer
        order: Option order within the question
        explanation: Explanation for why this option is correct/incorrect
    """

    id: int
    question: QuizQuestion
    text: str
    is_correct: bool
    order: int
    explanation: str

class CourseEnrollment(models.Model):
    """
    Represents a student's enrollment in a course.

    Tracks the relationship between a user and a course, including
    enrollment status and custom settings.

    Attributes:
        id: Unique identifier for the enrollment
        user: Reference to the enrolled User
        course: Reference to the Course
        enrollment_date: When the user enrolled
        status: Current enrollment status (active, completed, dropped)
        settings: JSON field for enrollment-specific settings
    """

    id: int
    user: User
    course: Course
    enrollment_date: datetime
    status: str
    settings: dict

class TaskProgress(models.Model):
    """
    Tracks a student's progress on a learning task.

    Records the status, time spent, and completion details for a
    user working on a specific task.

    Attributes:
        id: Unique identifier for the progress record
        user: Reference to the User
        task: Reference to the LearningTask
        status: Current status (not_started, in_progress, completed)
        time_spent: Total time spent on the task
        start_date: When the user started the task
        completion_date: When the user completed the task
        updated_at: Last update timestamp
    """

    id: int
    user: User
    task: LearningTask
    status: str
    time_spent: timedelta
    start_date: Optional[datetime]
    completion_date: Optional[datetime]
    updated_at: datetime

class QuizAttempt(models.Model):
    """
    Records a student's attempt at a quiz.

    Tracks details about a specific attempt including score,
    time taken, and completion status.

    Attributes:
        id: Unique identifier for the attempt
        user: Reference to the User taking the quiz
        quiz: Reference to the QuizTask being attempted
        score: Final score achieved (0-100)
        time_taken: Total time spent on the quiz
        completion_status: Current status of the attempt
        started_at: When the attempt was started
        attempt_date: When the attempt was last updated/completed
    """

    id: int
    user: User
    quiz: QuizTask
    score: int
    time_taken: timedelta
    completion_status: str
    started_at: datetime
    attempt_date: datetime

class QuizResponse(models.Model):
    """
    Records a student's response to a quiz question.

    Tracks the selected answer and whether it was correct for a
    specific question within a quiz attempt.

    Attributes:
        id: Unique identifier for the response
        attempt: Reference to the QuizAttempt
        question: Reference to the QuizQuestion being answered
        selected_option: Reference to the QuizOption selected
        is_correct: Whether the selected answer was correct
        time_spent: Time spent on this question
    """

    id: int
    attempt: QuizAttempt
    question: QuizQuestion
    selected_option: QuizOption
    is_correct: bool
    time_spent: timedelta
