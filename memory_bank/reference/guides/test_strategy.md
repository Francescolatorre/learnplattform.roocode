# Testing Strategy

## Overview

This document outlines the testing strategy for the learning platform's architectural restructuring, focusing on comprehensive test coverage using pytest and Factory Boy.

## Test Infrastructure

### Factory Boy Setup

```python
# factories.py
import factory
from factory.django import DjangoModelFactory
from django.contrib.auth import get_user_model
from decimal import Decimal

class UserFactory(DjangoModelFactory):
    class Meta:
        model = get_user_model()
    
    username = factory.Sequence(lambda n: f'user_{n}')
    email = factory.LazyAttribute(lambda o: f'{o.username}@example.com')
    is_staff = False

class TaskFactory(DjangoModelFactory):
    class Meta:
        model = 'core.Task'
    
    title = factory.Sequence(lambda n: f'Task {n}')
    description = factory.Faker('paragraph')
    created_at = factory.Faker('date_time')
    updated_at = factory.Faker('date_time')

class QuizFactory(DjangoModelFactory):
    class Meta:
        model = 'core.Quiz'
    
    title = factory.Sequence(lambda n: f'Quiz {n}')
    description = factory.Faker('paragraph')

    @factory.post_generation
    def tasks(self, create, extracted, **kwargs):
        if not create:
            return
        
        if extracted:
            for task in extracted:
                self.tasks.add(task)

class SubmissionFactory(DjangoModelFactory):
    class Meta:
        model = 'core.Submission'
    
    user = factory.SubFactory(UserFactory)
    task = factory.SubFactory(TaskFactory)
    content = factory.Faker('text')
    grade = factory.LazyFunction(lambda: Decimal('0.00'))
```

### Pytest Fixtures

```python
# conftest.py
import pytest
from django.contrib.auth import get_user_model
from core.services import AssessmentService
from core.repositories import AssessmentRepository

@pytest.fixture
def user_factory():
    return UserFactory

@pytest.fixture
def task_factory():
    return TaskFactory

@pytest.fixture
def quiz_factory():
    return QuizFactory

@pytest.fixture
def submission_factory():
    return SubmissionFactory

@pytest.fixture
def assessment_service():
    return AssessmentService(AssessmentRepository())

@pytest.fixture
def staff_user(user_factory):
    return user_factory(is_staff=True)

@pytest.fixture
def regular_user(user_factory):
    return user_factory(is_staff=False)

@pytest.fixture
def quiz_with_tasks(quiz_factory, task_factory):
    tasks = [task_factory() for _ in range(3)]
    return quiz_factory(tasks=tasks)
```

## Test Categories

### 1. Unit Tests

Focus on testing individual components in isolation:

```python
# test_services.py
def test_grade_submission(assessment_service, submission_factory, staff_user):
    # Arrange
    submission = submission_factory()
    grade = Decimal('85.5')
    
    # Act
    result = assessment_service.grade_submission(
        submission.id,
        grade,
        staff_user.id
    )
    
    # Assert
    assert result.grade == grade
    assert result.graded_by_id == staff_user.id

def test_unauthorized_grade_submission(
    assessment_service,
    submission_factory,
    regular_user
):
    # Arrange
    submission = submission_factory()
    
    # Act/Assert
    with pytest.raises(NotAuthorizedError):
        assessment_service.grade_submission(
            submission.id,
            Decimal('85.5'),
            regular_user.id
        )
```

### 2. Integration Tests

Test interaction between components:

```python
# test_views.py
def test_submission_view_grade_submission(client, submission_factory, staff_user):
    # Arrange
    submission = submission_factory()
    client.force_login(staff_user)
    
    # Act
    response = client.post(
        f'/api/submissions/{submission.id}/grade/',
        {'grade': '85.5'}
    )
    
    # Assert
    assert response.status_code == 200
    assert response.json()['grade'] == '85.50'
```

### 3. Repository Tests

Focus on query optimization:

```python
# test_repositories.py
def test_get_user_submissions_optimization(
    django_assert_num_queries,
    assessment_repository,
    submission_factory,
    regular_user
):
    # Arrange
    submissions = [
        submission_factory(user=regular_user)
        for _ in range(5)
    ]
    
    # Act/Assert
    with django_assert_num_queries(1):
        result = assessment_repository.get_user_submissions(
            regular_user.id,
            include_task_details=True
        )
        # Force evaluation of queryset
        list(result)
```

### 4. Performance Tests

Test query performance and optimization:

```python
# test_performance.py
@pytest.mark.slow
def test_quiz_completion_performance(
    django_assert_num_queries,
    assessment_service,
    quiz_factory,
    task_factory,
    regular_user
):
    # Arrange
    tasks = [task_factory() for _ in range(50)]
    quiz = quiz_factory(tasks=tasks)
    
    # Act/Assert
    with django_assert_num_queries(3):  # Expect optimized queries
        assessment_service.mark_task_completed(
            quiz.id,
            tasks[0].id,
            regular_user.id
        )
```

## Test Coverage Requirements

1. Service Layer
   - 100% coverage of business logic
   - All error cases tested
   - Authorization rules verified

2. Repository Layer
   - Query optimization verified
   - Complex queries tested
   - Edge cases covered

3. View Layer
   - API endpoints tested
   - Authentication/authorization tested
   - Response formats verified

## Continuous Integration

1. Test Execution
   ```yaml
   # pytest.ini
   [pytest]
   DJANGO_SETTINGS_MODULE = learningplatform.settings_test
   python_files = test_*.py
   markers =
       slow: marks tests as slow (deselect with '-m "not slow"')
   ```

2. Coverage Requirements
   ```yaml
   # .coveragerc
   [run]
   source = core/
   omit = */migrations/*, */tests/*
   
   [report]
   exclude_lines =
       pragma: no cover
       def __repr__
       raise NotImplementedError
   
   fail_under = 90
   ```

## Migration Testing Strategy

1. Parallel Testing
   - Run tests against both old and new implementations
   - Compare results for consistency
   - Verify performance improvements

2. Integration Period
   - Gradually migrate components
   - Maintain both test suites
   - Remove old tests after verification

3. Performance Monitoring
   - Benchmark critical operations
   - Compare query counts
   - Monitor memory usage

## Test Data Management

1. Factory Boy Strategies
   - Use realistic data generators
   - Create complex relationships
   - Handle edge cases

2. Test Database Setup
   - Fresh database for each test
   - Proper cleanup after tests
   - Manage test data isolation

## Conclusion

This testing strategy ensures:
1. Comprehensive coverage of new architecture
2. Performance verification
3. Proper isolation of components
4. Reliable test data generation
5. Smooth migration process

Implementation should proceed incrementally, with continuous validation of test coverage and performance metrics.