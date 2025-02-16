# Test Migration Strategy

## Test Classification Guidelines

### Unit Tests
Tests should be marked as `@pytest.mark.unit` if they:
- Test a single function/method/class in isolation
- Don't require database access
- Use mocking for external dependencies
- Are fast (< 100ms)

Example candidates:
- Utility function tests
- Model method tests with mocked DB
- Service layer logic tests
- Validator tests

### Integration Tests
Tests should be marked as `@pytest.mark.integration` if they:
- Test interaction between components
- Require database access but not performance critical
- Test repository implementations
- Test service layer with real repositories

Example candidates:
- Repository tests
- Service layer integration tests
- API endpoint tests
- Form processing tests

### DB Tests
Tests should be marked as `@pytest.mark.db` if they:
- Focus specifically on database operations
- Test model constraints and relationships
- Verify migration behavior
- Test complex queries

Example candidates:
- Model field constraint tests
- Unique constraint tests
- Foreign key relationship tests
- Query optimization tests

### Performance Tests
Tests should be marked as `@pytest.mark.performance` if they:
- Measure execution time
- Require realistic data volumes
- Test caching behavior
- Verify query efficiency

Example candidates:
- Bulk operation tests
- Cache efficiency tests
- Query performance tests
- Load tests

### Slow Tests
Tests should be marked as `@pytest.mark.slow` if they:
- Take more than 1 second to execute
- Require extensive setup
- Process large amounts of data
- Make external service calls

## Migration Process

### 1. Audit Current Tests

Create an audit spreadsheet with columns:
- Test file path
- Test class/function name
- Current markers
- Database usage
- External dependencies
- Typical execution time
- Proposed classification
- Migration status

### 2. Test Analysis Criteria

For each test, evaluate:
1. Database Usage
   - No DB access -> Unit test
   - Simple DB operations -> Integration test
   - Complex DB operations -> DB test
   - Performance critical -> Performance test

2. Dependencies
   - No external deps -> Unit test
   - Multiple components -> Integration test
   - External services -> Integration + Slow

3. Execution Time
   - < 100ms -> Fast test
   - 100ms-1s -> Normal test
   - > 1s -> Slow test

### 3. Migration Order

1. Start with clear unit tests:
   - Utility functions
   - Pure logic tests
   - Tests with clear mocking

2. Move to DB tests:
   - Model tests
   - Constraint tests
   - Migration tests

3. Handle integration tests:
   - Repository tests
   - Service layer tests
   - API tests

4. Finally, performance tests:
   - Query tests
   - Cache tests
   - Load tests

### 4. Implementation Steps

For each test file:

1. Add appropriate markers:
```python
@pytest.mark.unit
def test_utility_function():
    pass

@pytest.mark.integration
@pytest.mark.slow
def test_complex_integration():
    pass
```

2. Fix broken assumptions:
   - Add mocking where needed
   - Update database access
   - Adjust test data setup

3. Verify test execution:
   - Run with specific marker
   - Verify correct settings used
   - Check execution time

### 5. Example Migrations

#### Model Test Migration
```python
# Before
class TestSubmissionModel:
    def test_creation(self):
        submission = SubmissionFactory()
        assert submission.id is not None

# After
@pytest.mark.db
class TestSubmissionModel:
    def test_creation(self):
        submission = SubmissionFactory()
        assert submission.id is not None
```

#### Service Test Migration
```python
# Before
class TestAssessmentService:
    def test_grade_submission(self):
        service = AssessmentService()
        result = service.grade_submission(submission_id)
        assert result.is_passed

# After
@pytest.mark.unit
class TestAssessmentService:
    def test_grade_submission(self):
        service = AssessmentService()
        mock_repo = Mock()
        mock_repo.get_submission.return_value = mock_submission
        service.repository = mock_repo
        result = service.grade_submission(submission_id)
        assert result.is_passed
```

#### Repository Test Migration
```python
# Before
class TestAssessmentRepository:
    def test_get_submission(self):
        repo = AssessmentRepository()
        submission = repo.get_submission(1)
        assert submission is not None

# After
@pytest.mark.integration
class TestAssessmentRepository:
    def test_get_submission(self):
        repo = AssessmentRepository()
        submission = repo.get_submission(1)
        assert submission is not None
```

### 6. Validation

For each migrated test:
1. Run with specific marker
2. Verify correct settings loaded
3. Check execution time
4. Validate test isolation
5. Verify CI pipeline execution

### 7. Documentation

Update test documentation:
1. Add marker requirements
2. Document test categories
3. Update CI/CD docs
4. Add migration status

## Success Criteria

1. All tests have appropriate markers
2. Unit tests run without DB access
3. Integration tests use correct DB settings
4. Performance tests use dedicated DB
5. CI pipeline properly segregates tests
6. Test execution times are documented
7. Migration status is tracked

## Rollback Plan

1. Keep original test files backed up
2. Maintain mapping of changes
3. Test both old and new configurations
4. Update gradually, one test type at a time
5. Validate each step before proceeding