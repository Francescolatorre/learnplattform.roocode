# Learning Platform Tests

This directory contains automated tests for the Learning Platform application.

## Test Structure

The test suite is organized into several key files:

- **auth.spec.ts**: Tests for authentication functionality
- **roles.spec.ts**: Tests for role-based access control
- **api.spec.ts**: Tests for API endpoints and permissions
- **views.spec.ts**: Tests for UI views and components

## Prerequisites

To run the tests, ensure:

1. The backend server is running at `http://localhost:8000`
2. The frontend development server is running at `http://localhost:5173` (or configured in `BASE_URL` environment variable)
3. Test users exist in the backend:
   - Admin: admin/adminpassword
   - Instructor: instructor/instructor123
   - Student: student/student123

## Running Tests

You can run the tests using the provided script:

```bash
# Run all tests
./run-tests.sh --all

# Run specific test suites
./run-tests.sh --smoke    # Run basic smoke tests (default if no options specified)
./run-tests.sh --auth     # Run authentication tests
./run-tests.sh --roles    # Run role-based access tests
./run-tests.sh --api      # Run API tests

# Run tests with debugging
./run-tests.sh --smoke --debug    # Run smoke tests in debug mode

# Open test report after execution
./run-tests.sh --all --report

# Exit on first failure
./run-tests.sh --all --exit-on-fail
```

Or use Playwright commands directly:

```bash
# Run all tests
npx playwright test

# Run a specific test file
npx playwright test tests/auth.spec.ts

# Run tests with UI mode
npx playwright test --ui

# Show HTML report
npx playwright show-report
```

## Test Structure

### Authentication Tests

Tests user login for different roles and validates token generation.

### Role-Based Access Tests

Tests access permissions for:
- Admin users
- Instructors
- Students

Verifies that each role can only perform actions they're authorized for.

### API Tests

Direct API tests that validate:
- Authentication endpoints
- CRUD operations for courses and tasks
- Permission controls
- Token refresh functionality

## Adding New Tests

When adding tests:

1. Follow the existing patterns for organization
2. Use the helper classes where appropriate
3. Add any new user roles to the `USERS` object
4. Keep tests focused and independent

## Best Practices

- Tests should be independent and not depend on each other
- Clean up any data created during tests
- Use unique identifiers for test data to avoid conflicts
- Tests should assert specific behaviors
- Keep each test focused on a single behavior or feature