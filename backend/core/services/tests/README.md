# Service Layer Testing Guide

## Overview

This directory contains tests for the service layer, which implements core business logic for the learning platform. The tests follow established patterns from repository testing while adding additional coverage for business rules, authorization, and error handling.

## Test Structure

### Directory Organization

```python
tests/
├── conftest.py           # Common fixtures
├── test_assessment_service.py
├── test_learning_service.py
├── test_task_service.py
└── utils/
    └── assertions.py     # Custom assertions
```

### Test Categories

1. Unit Tests (`@pytest.mark.unit`)
   - Mock repository dependencies
   - Focus on business logic
   - Test error handling
   - Verify authorization rules

2. Integration Tests (`@pytest.mark.integration`)
   - Use real repositories
   - Test transaction handling
   - Verify data persistence
   - Check query optimization

3. Performance Tests (`@pytest.mark.performance`)
   - Query execution time
   - Cache behavior
   - Load testing scenarios

## Testing Patterns

### 1. Test Data Setup

Use Factory Boy for test data:

```python
@pytest.fixture
def mock_quiz(mock_repository):
    quiz = QuizFactory.build()
    mock_repository.get_quiz_with_tasks.return_value = quiz
    return quiz
```

### 2. Transaction Management

Use transaction fixtures for isolation:

```python
@pytest.fixture
def test_transaction():
    with transaction.atomic():
        sid = transaction.savepoint()
        yield
        transaction.savepoint_rollback(sid)
```

### 3. Mock Configuration

Configure mocks with proper return values:

```python
@pytest.fixture
def mock_repository():
    repository = Mock()
    repository.get_user_submissions.return_value = []
    return repository
```

### 4. Test Organization

Follow the Arrange-Act-Assert pattern:

```python
def test_method_name():
    """
    Clear test description with:
    - Preconditions
    - Expected behavior
    - Edge cases covered
    """
    # Arrange
    service = ServiceClass(repository)
    input_data = prepare_test_data()

    # Act
    result = service.method(input_data)

    # Assert
    assert result.status == expected_status
    assert_business_rules_followed(result)
```

## Key Testing Areas

### 1. Business Logic

- Input validation
- Data transformation
- Calculation accuracy
- State transitions
- Business rule enforcement

### 2. Error Handling

- Invalid inputs
- Not found scenarios
- Authorization failures
- Business rule violations
- Edge cases

### 3. Transaction Management

- Atomic operations
- Rollback scenarios
- Concurrent access
- Deadlock handling

### 4. Integration Points

- Repository interaction
- Event handling
- Cache integration
- External service mocking

## Best Practices

### 1. Test Isolation

- Use fresh test data
- Clean up after tests
- Avoid test interdependence

### 2. Mock Usage

- Mock at repository boundary
- Verify mock interactions
- Use realistic mock data

### 3. Error Testing

- Test all error paths
- Verify error messages
- Check error propagation

### 4. Performance Testing

- Measure query counts
- Check execution time
- Test with realistic data volumes

## Coverage Requirements

- Core Business Logic: 100%
- Error Handling: 100%
- Helper Methods: 80%+

## Running Tests

```bash
# Run all service tests
pytest core/services/tests/

# Run specific test categories
pytest core/services/tests/ -m unit
pytest core/services/tests/ -m integration
pytest core/services/tests/ -m performance

# Run with coverage
pytest core/services/tests/ --cov=core/services --cov-report=html
```

## Contributing

1. Follow the test organization pattern
2. Add proper docstrings
3. Include edge cases
4. Verify error handling
5. Check test isolation
6. Update this README as needed