"""
Factory Boy factories for core models.
"""
from decimal import Decimal

import factory
from factory.django import DjangoModelFactory

from assessment.models import Quiz, Submission, UserProgress
from learning.models import Course
from tasks.models import LearningTask
from users.models import User  # Direct import from users app


class UserFactory(DjangoModelFactory):
    """Factory for User model."""
    
    class Meta:
        model = User
        django_get_or_create = ('username',)
    
    username = factory.Sequence(lambda n: f'user{n}')
    email = factory.LazyAttribute(lambda obj: f'{obj.username}@example.com')
    password = factory.PostGenerationMethodCall('set_password', 'testpass123')
    display_name = factory.LazyAttribute(lambda obj: f'Display {obj.username}')
    role = 'user'
    is_active = True
    is_staff = False
    is_superuser = False

    @factory.post_generation
    def groups(self, create, extracted, **kwargs):
        """Add groups to user if specified."""
        if not create or not extracted:
            return
        
        self.groups.add(*extracted)

    @factory.post_generation
    def user_permissions(self, create, extracted, **kwargs):
        """Add permissions to user if specified."""
        if not create or not extracted:
            return
        
        self.user_permissions.add(*extracted)

class AdminFactory(UserFactory):
    """Factory for admin users."""
    username = factory.Sequence(lambda n: f'admin{n}')
    email = factory.LazyAttribute(lambda obj: f'{obj.username}@example.com')
    display_name = factory.LazyAttribute(lambda obj: f'Admin {obj.username}')
    role = 'admin'
    is_staff = True
    is_superuser = True

class LearningTaskFactory(DjangoModelFactory):
    """Factory for LearningTask model."""
    
    class Meta:
        model = LearningTask
    
    title = factory.Sequence(lambda n: f'Learning Task {n}')
    description = factory.LazyAttribute(lambda obj: f'Description for {obj.title}')
    difficulty_level = factory.Iterator([
        'Beginner',
        'Intermediate',
        'Advanced'
    ])

class QuizFactory(DjangoModelFactory):
    """Factory for Quiz model."""
    
    class Meta:
        model = Quiz
    
    title = factory.Sequence(lambda n: f'Quiz {n}')
    description = factory.LazyAttribute(lambda obj: f'Description for {obj.title}')

    @factory.post_generation
    def tasks(self, create, extracted, **kwargs):
        """Add tasks to quiz if specified."""
        if not create:
            return

        if extracted is not None:  # Check for None instead of truthiness
            self.tasks.add(*extracted)
        else:
            # Create 3 default tasks if no tasks specified and not explicitly empty
            for _ in range(3):
                self.tasks.add(QuizTaskFactory())

class SubmissionFactory(DjangoModelFactory):
    """Factory for Submission model."""
    
    class Meta:
        model = Submission
    
    user = factory.SubFactory(UserFactory)
    task = factory.SubFactory(LearningTaskFactory)
    content = factory.LazyAttribute(lambda obj: f'Submission content for {obj.task.title}')
    grade = None
    graded_by = None

class UserProgressFactory(DjangoModelFactory):
    """Factory for UserProgress model."""
    
    class Meta:
        model = UserProgress
    
    user = factory.SubFactory(UserFactory)
    quiz = factory.SubFactory(QuizFactory)
    total_score = Decimal('0.0')
    is_completed = False

    @factory.post_generation
    def completed_tasks(self, create, extracted, **kwargs):
        """Add completed tasks if specified."""
        if not create:
            return

        if extracted:
            self.completed_tasks.add(*extracted)

class CourseFactory(DjangoModelFactory):
    """Factory for Course model."""
    
    class Meta:
        model = Course
    
    title = factory.Sequence(lambda n: f'Course {n}')
    description = factory.LazyAttribute(lambda obj: f'Description for {obj.title}')
    instructor = factory.SubFactory(UserFactory)

    @factory.post_generation
    def tasks(self, create, extracted, **kwargs):
        """Add tasks to course if specified."""
        if not create or not extracted:
            return
        self.tasks.add(*extracted)
