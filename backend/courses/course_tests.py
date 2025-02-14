'''
dummy docstring
'''

import pytest
from django.contrib.auth import get_user_model
from courses.models import Course, Task

User = get_user_model()

@pytest.mark.django_db
def test_create_course():
    """Test creating a new course"""
    course = Course.objects.create(
        title='Test Course',
        description='A test course description'
    )

    assert course.title == 'Test Course'
    assert course.description == 'A test course description'
    assert course.created_at is not None
    assert course.updated_at is not None

@pytest.mark.django_db
def test_create_task():
    """Test creating a task for a course"""
    course = Course.objects.create(
        title='Test Course',
        description='A test course description'
    )

    task = Task.objects.create(
        course=course,
        title='Test Task',
        description='A test task description',
        type='text',
        order=1,
        evaluation_prompt='Evaluate this task carefully'
    )

    assert task.course == course
    assert task.title == 'Test Task'
    assert task.description == 'A test task description'
    assert task.type == 'text'
    assert task.order == 1
    assert task.evaluation_prompt == 'Evaluate this task carefully'
