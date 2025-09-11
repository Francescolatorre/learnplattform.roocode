# TASK-046-E2E-Parallel-Testing-Credentials

## Task Title

Implement Multi-User E2E Testing for Parallel Execution

---

## Task Metadata

* **Task-ID:** TASK-046
* **Status:** OPEN
* **Owner:** Development Team
* **Priority:** Low
* **Created:** 2025-09-09
* **Estimated Hours:** 8-12
* **Dependencies:** None
* **Related Tasks:** TASK-042 (Task Deletion Feature)

---

## Business Context

Currently, E2E tests must run sequentially (`--workers=1`) to avoid session conflicts when multiple tests use the same user credentials. This limitation:
- Slows down CI/CD pipeline execution
- Reduces developer productivity during testing
- Limits test suite scalability
- Creates unrealistic testing bottlenecks

Implementing parallel E2E testing with proper credential isolation will enable faster test execution and better development workflows.

---

## Requirements

### User Stories

```gherkin
Feature: Parallel E2E Test Execution

  Scenario: Multiple instructor tests run simultaneously
    Given we have multiple instructor test accounts (instructor1, instructor2, instructor3)
    And E2E tests are configured for parallel execution
    When tests run with --workers=3
    Then each test uses a different instructor account
    And no session conflicts occur
    And all tests pass reliably

  Scenario: Role-based test isolation
    Given we have dedicated test accounts for each role
    When instructor and student tests run in parallel
    Then each role uses its own credential pool
    And tests complete in optimal time
    And test results are consistent

  Scenario: Automatic user assignment
    Given multiple tests need the same role
    When tests execute in parallel workers
    Then the system automatically assigns available users
    And prevents credential conflicts
    And provides clean test isolation
```

### Acceptance Criteria

1. **Multiple Test Users**: Create dedicated test accounts for parallel execution
   - At least 3 instructor accounts (instructor1, instructor2, instructor3)
   - At least 3 student accounts (student1, student2, student3)
   - 1 admin account (admin)
   - All accounts properly configured with roles and permissions

2. **Smart User Assignment**: Implement logic to automatically select available users
   - Tests automatically pick unused credentials based on worker index
   - No manual user assignment required in test code
   - Fallback mechanism when all users of a role are in use

3. **Parallel Execution Support**: Enable reliable parallel test execution
   - Tests pass consistently with `--workers=3` or higher
   - No session conflicts or authentication errors
   - Execution time reduced by at least 60% compared to sequential runs

4. **Backward Compatibility**: Maintain existing test functionality
   - All existing tests continue to work without modification
   - Sequential execution (`--workers=1`) still supported as fallback
   - No breaking changes to current test structure

5. **Clean Test Isolation**: Ensure complete isolation between parallel tests
   - Each test gets independent browser context
   - No shared state between concurrent tests
   - Proper cleanup after test completion

### Technical Requirements

* Enhanced `TEST_USERS` configuration with multiple accounts per role
* Smart user selection helper function based on worker index
* Database fixtures for test user creation
* Updated CI/CD pipeline configuration for parallel execution
* Documentation for new testing approach
* Monitoring/logging for credential assignment debugging

---

## Implementation Approach

### Phase 1: Database Setup (2-3 hours)
1. Create database migration for additional test users
2. Set up test data fixtures with proper roles and permissions
3. Ensure test users have necessary course enrollments and data access

### Phase 2: Enhanced Test Helpers (3-4 hours)
1. Extend `setupTests.ts` with multi-user support
2. Implement automatic user selection based on worker index
3. Add fallback mechanisms for user conflicts
4. Create role-based user pools

### Phase 3: Test Configuration (2-3 hours)
1. Update `playwright.config.ts` for optimal parallel settings
2. Configure browser context isolation
3. Set up proper test timeouts and retry logic
4. Add environment variables for test user management

### Phase 4: Validation & Documentation (1-2 hours)
1. Run full test suite with parallel execution
2. Verify no regressions in existing functionality  
3. Update documentation and testing guidelines
4. Create troubleshooting guide for credential issues

---

## Technical Design

### Enhanced User Configuration

```typescript
// Enhanced TEST_USERS in setupTests.ts
export const TEST_USERS = {
  // Instructor pool for parallel execution
  instructor1: {
    username: 'instructor1',
    password: 'instructor123',
    expectedRole: 'instructor',
    workerId: 0,
  },
  instructor2: {
    username: 'instructor2',
    password: 'instructor123',
    expectedRole: 'instructor', 
    workerId: 1,
  },
  instructor3: {
    username: 'instructor3',
    password: 'instructor123',
    expectedRole: 'instructor',
    workerId: 2,
  },
  
  // Student pool for parallel execution
  student1: {
    username: 'student1',
    password: 'student123',
    expectedRole: 'student',
    workerId: 0,
  },
  student2: {
    username: 'student2',
    password: 'student123',
    expectedRole: 'student',
    workerId: 1,
  },
  student3: {
    username: 'student3',
    password: 'student123',
    expectedRole: 'student',
    workerId: 2,
  },
  
  // Single admin (less parallel usage expected)
  admin: {
    username: 'admin',
    password: 'adminpassword',
    expectedRole: 'admin',
    workerId: 0,
  },
};
```

### Smart User Selection

```typescript
// Auto-assign users based on worker index
export const getTestUserForRole = (role: 'instructor' | 'student' | 'admin', workerInfo?: any) => {
  const availableUsers = Object.values(TEST_USERS)
    .filter(user => user.expectedRole === role);
    
  if (availableUsers.length === 1) {
    return availableUsers[0]; // Single user for this role
  }
  
  // Use worker index to distribute users
  const workerIndex = workerInfo?.workerIndex || 0;
  const userIndex = workerIndex % availableUsers.length;
  
  return availableUsers[userIndex];
};

// Enhanced login helper
export const loginAsRole = async (
  page: Page, 
  role: 'instructor' | 'student' | 'admin',
  workerInfo?: any
) => {
  const user = getTestUserForRole(role, workerInfo);
  console.log(`Worker ${workerInfo?.workerIndex || 0}: Using ${user.username} for ${role} tests`);
  
  return await login(page, user.username, user.password);
};
```

### Database Migration

```sql
-- Create additional test users for parallel execution
INSERT INTO auth_user (username, email, first_name, last_name, is_active, is_staff, date_joined, password) 
VALUES 
  ('instructor1', 'instructor1@test.com', 'Test', 'Instructor1', true, false, NOW(), 'pbkdf2_sha256$...'),
  ('instructor2', 'instructor2@test.com', 'Test', 'Instructor2', true, false, NOW(), 'pbkdf2_sha256$...'),
  ('instructor3', 'instructor3@test.com', 'Test', 'Instructor3', true, false, NOW(), 'pbkdf2_sha256$...'),
  ('student1', 'student1@test.com', 'Test', 'Student1', true, false, NOW(), 'pbkdf2_sha256$...'),
  ('student2', 'student2@test.com', 'Test', 'Student2', true, false, NOW(), 'pbkdf2_sha256$...'),
  ('student3', 'student3@test.com', 'Test', 'Student3', true, false, NOW(), 'pbkdf2_sha256$...');

-- Assign appropriate roles
INSERT INTO core_userrole (user_id, role)
SELECT u.id, 'instructor' 
FROM auth_user u 
WHERE u.username IN ('instructor1', 'instructor2', 'instructor3');

INSERT INTO core_userrole (user_id, role)
SELECT u.id, 'student'
FROM auth_user u  
WHERE u.username IN ('student1', 'student2', 'student3');
```

### Playwright Configuration Updates

```typescript
// playwright.config.ts updates
export default defineConfig({
  // Enable parallel execution by default
  workers: process.env.CI ? 2 : 3, // Reduce workers in CI for stability
  
  // Each test gets isolated browser context  
  use: {
    // Clear storage for true isolation
    storageState: undefined,
    
    // Add worker info to context for user selection
    contextOptions: {
      // Custom property to pass worker info
    }
  },
  
  projects: [
    {
      name: 'chromium-parallel',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'chromium-sequential', 
      use: { ...devices['Desktop Chrome'] },
      // Override workers for sequential execution when needed
      workers: 1,
    },
  ],
});
```

---

## Test Strategy

### Unit Tests
- Test user selection logic with different worker configurations
- Validate role-based user filtering
- Test fallback mechanisms for user conflicts

### Integration Tests  
- Verify database fixtures create users correctly
- Test authentication with new user accounts
- Validate role permissions for all test users

### E2E Tests
- Run existing test suite with parallel execution
- Measure performance improvements
- Verify no session conflicts occur
- Test edge cases (high concurrency, user exhaustion)

---

## Risk Assessment

### Technical Risks

* **Database Constraints**: Test user creation may conflict with existing data
  * **Impact:** Medium  
  * **Mitigation:** Use unique identifiers and proper cleanup

* **Timing Issues**: Parallel tests may still have race conditions
  * **Impact:** Medium
  * **Mitigation:** Proper test isolation and data setup

* **CI/CD Resource Limits**: Parallel execution may overwhelm CI resources
  * **Impact:** Low
  * **Mitigation:** Configurable worker count per environment

### Implementation Risks

* **Backward Compatibility**: Changes may break existing tests
  * **Impact:** High
  * **Mitigation:** Maintain existing interfaces, add new features incrementally

* **Complexity**: Multiple user management adds test complexity  
  * **Impact:** Medium
  * **Mitigation:** Clear documentation and helper functions

---

## Success Metrics

### Performance Metrics
- **Test execution time** reduced by at least 60% with parallel execution
- **CI/CD pipeline** completion time improved significantly
- **Developer feedback loop** time decreased

### Reliability Metrics  
- **Test pass rate** remains at 100% with parallel execution
- **Session conflicts** reduced to zero
- **Flaky test incidents** eliminated

### Maintainability Metrics
- **New test creation** requires no additional credential management
- **Test debugging** remains straightforward
- **Documentation clarity** scores high in team reviews

---

## Documentation Requirements

### Technical Documentation
- Update `E2E-Session-Management.md` with new approach
- Create `Multi-User-Testing-Guide.md` for developers
- Document database setup requirements
- Add troubleshooting guide for credential issues

### User Documentation  
- Update testing guidelines in project README
- Create CI/CD configuration examples
- Document performance benchmarks and expectations

---

## Future Considerations

### Scalability
- Consider dynamic user creation for larger test suites
- Evaluate container-based test isolation
- Plan for role-based test sharding strategies

### Monitoring
- Add logging for user assignment and conflicts
- Create dashboards for test execution metrics
- Set up alerts for credential-related failures

### Security
- Ensure test users have minimal required permissions
- Implement proper test data cleanup
- Review credential storage and management practices

---

## References

- **Related Task:** TASK-042 (Task Deletion Feature E2E Tests)
- **Documentation:** `memory_bank/testing/E2E-Session-Management.md`
- **Current Issue:** Session conflicts requiring `--workers=1` execution
- **Target:** Reliable `--workers=3+` parallel execution

---

**Created:** 2025-09-09  
**Last Updated:** 2025-09-09  
**Status:** Ready for implementation  
**Priority:** Medium (blocks test suite scaling)