# Service Layer Testing Guidelines

## Test Organization

### Directory Structure
```
services/
├── tests/
│   ├── __init__.py
│   ├── conftest.py         # Shared fixtures and configurations
│   ├── test_*_service.py   # Service-specific test modules
│   └── README.md           # This documentation
```

### Test Categories
- Unit tests: `@pytest.mark.unit`
- Integration tests: `@pytest.mark.integration`
- Service tests: `@pytest.mark.service`

## Mocking Strategy

### Repository Layer
- Use `mock_repository` fixture from conftest.py
- Configure specific method returns for each test
- Verify repository method calls with assert_called_* methods

### Mock Objects
- Use provided fixtures from conftest.py for common objects
- Create test-specific mocks in test methods when needed
- Configure mock returns before test execution

## Test Patterns

### Service Method Tests
1. Basic Success Case
   - Configure mocks
   - Execute service method
   - Assert expected results
   - Verify repository calls

2. Error Cases
   - Test all possible exceptions
   - Verify error messages
   - Ensure proper exception hierarchy

3. Edge Cases
   - Test boundary conditions
   - Verify data validation
   - Check authorization rules

### Example Test Structure
```python
def test_method_name_scenario(self, service, mock_repository):
    # Arrange
    mock_repository.method.return_value = expected_value
    
    # Act
    result = service.method(params)
    
    # Assert
    assert result == expected_value
    mock_repository.method.assert_called_once_with(params)
```

## Integration Testing

### Database Integration
- Use `@pytest.mark.integration`
- Test with actual database
- Utilize transaction rollback
- Create test data with factories

### Service Boundaries
- Test service-to-service interactions
- Verify transaction handling
- Test rollback scenarios

## Best Practices

1. Test Independence
   - Each test should be self-contained
   - Reset mocks between tests
   - Don't share state between tests

2. Test Coverage
   - Cover all service methods
   - Test both success and failure paths
   - Include edge cases and validations

3. Mock Configuration
   - Configure mocks in test methods
   - Use descriptive names for mock objects
   - Document complex mock setups

4. Assertions
   - Use specific assertions
   - Verify both results and side effects
   - Check repository method calls

5. Documentation
   - Document test scenarios
   - Explain complex test setups
   - Include examples for new patterns

## Common Patterns

### Authorization Testing
```python
def test_method_unauthorized(self, service, mock_user):
    with pytest.raises(NotAuthorizedError):
        service.restricted_method(mock_user.id)
```

### Transaction Testing
```python
@pytest.mark.integration
def test_transaction_rollback(self, service, mock_repository):
    with pytest.raises(Exception):
        service.transactional_method()
    # Verify rollback occurred
```

### Data Validation
```python
def test_invalid_input(self, service):
    with pytest.raises(ValidationError):
        service.method(invalid_data)
```

## Testing Tools

### Pytest Fixtures
- Use fixtures for common setup
- Scope fixtures appropriately
- Document fixture dependencies

### Mock Objects
- unittest.mock for mocking
- Factory Boy for test data
- pytest-django for database handling

### Coverage
- Minimum 90% coverage for services
- Run with: `pytest --cov=services`
- Generate reports: `pytest --cov-report=html`