"""
This module contains tests for the assessment application.

It includes tests for creating submissions and tracking user progress.
"""

import pytest
from django.contrib.auth import get_user_model
from courses.models import Course, Task
from .models import Submission, UserProgress

User = get_user_model()

@pytest.mark.django_db
def test_create_submission():
    """Test creating a submission"""
    user = User.objects.create_user(
        username='testuser', 
        email='test@example.com', 
        password='testpass123'
    )

    course = Course.objects.create(
        title='Test Course',
        description='A test course description'
    )

    task = Task.objects.create(
        course=course,
        title='Test Task',
        description='A test task description',
        type='text',
        order=1  # Ensure unique order
    )

    submission = Submission.objects.create(
        user=user,
        task=task,
        content='Test submission content',
        status='pending'
    )

    assert submission.user == user
    assert submission.task == task
    assert submission.content == 'Test submission content'
    assert submission.status == 'pending'
    assert submission.submitted_at is not None

@pytest.mark.django_db
def test_user_progress():
    """Test creating user progress"""
    user = User.objects.create_user(
        username='testuser', 
        email='test@example.com', 
        password='testpass123'
    )

    course = Course.objects.create(
        title='Test Course',
        description='A test course description'
    )

    task1 = Task.objects.create(
        course=course,
        title='Task 1',
        type='text',
        order=1  # Ensure unique order
    )

    task2 = Task.objects.create(
        course=course,
        title='Task 2',
        type='text',
        order=2  # Ensure unique order
    )

    progress = UserProgress.objects.create(
        user=user,
        course=course,
        total_score=85.5
    )

    progress.completed_tasks.add(task1, task2)

    assert progress.user == user
    assert progress.course == course
    assert progress.total_score == 85.5
    assert list(progress.completed_tasks.all()) == [task1, task2]
