# Test Organization Guidelines

## Test Discovery

### File Naming Conventions
- Test files must follow one of these patterns:
  - `test_*.py`
  - `*_test.py`
  - `tests.py`
  - `*_tests.py`

### Test Categories
Tests are organized using pytest markers:
- `@pytest.mark.unit`: Unit tests
- `@pytest.mark.integration`: Integration tests
- `@pytest.mark.api`: API tests
- `@pytest.mark.db`: Database tests
- `@pytest.mark.slow`: Tests that take longer to run

## Directory Structure
```
tests/
├── conftest.py      # Shared fixtures
├── factories.py     # Test data factories
├── utils.py         # Test utilities
└── test_*.py       # Test modules
```

## Test Organization Guidelines

### Test Classes
- Name test classes as `Test*`, `*Test`, `*Tests`, or `*TestCase`
- Group related test methods in the same class
- Use descriptive class names that indicate what's being tested

### Test Methods
- Prefix test methods with `test_`
- Use descriptive names that explain the test scenario
- Follow the pattern: `test_<what>_<scenario>_<expected>`

### Fixtures
- Place shared fixtures in `conftest.py`
- Use appropriate fixture scope (function, class, module, session)
- Document fixture purpose and dependencies

## Database Testing
- Tests are run with `--reuse-db` for performance
- Each test runs in a transaction that's rolled back
- Use the `@pytest.mark.db` marker for database tests
- Utilize factories for test data creation

## Coverage Requirements
- Overall coverage minimum: 80%
- Core services coverage minimum: 90%
- Branch coverage is enabled
- Critical paths require higher coverage
- Excluded from coverage:
  - Migrations
  - Test files
  - Configuration files
  - Abstract methods
  - Type checking blocks

## Best Practices
1. **Isolation**: Each test should be independent
2. **Clarity**: Tests should be easy to understand
3. **Maintenance**: Keep tests DRY but readable
4. **Documentation**: Document complex test scenarios
5. **Performance**: Group slow tests with markers

## Running Tests
```bash
# Run all tests
pytest

# Run specific test categories
pytest -m unit
pytest -m integration
pytest -m api
pytest -m db

# Run with coverage report
pytest --cov

# Run without database recreation
pytest --reuse-db