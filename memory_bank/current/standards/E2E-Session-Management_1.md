# E2E Test Session Management Guidelines

## Problem Identified (2025-09-09)

**Issue**: Parallel E2E test execution causes session conflicts when multiple tests share the same user accounts.

**Symptoms**:
- Tests randomly failing due to lost authentication sessions
- Instructor tests being redirected to login page unexpectedly  
- Session state interference between parallel workers
- Inconsistent test results despite working functionality

## Root Cause

Playwright's default configuration runs tests in parallel using multiple workers (typically 3). When tests use the same user credentials:

1. **Worker 1**: Logs in as `instructor` 
2. **Worker 2**: Also tries to log in as `instructor` → overwrites session
3. **Worker 1**: Loses session, gets redirected to login
4. **Test fails** due to authentication, not functionality

## Current Solution (Temporary)

**Use Sequential Execution**:
```bash
# Run tests with single worker to avoid session conflicts
npx playwright test --workers=1

# For specific test files
npx playwright test e2e/tests/tasks/task-deletion.spec.ts --workers=1
```

**Results**: 
- ✅ Eliminates session conflicts
- ✅ Reliable, consistent test results
- ❌ Slower execution (tests run one at a time)

## Future Solutions (Recommended)

### Option 1: Multiple Test Users Per Role
Create dedicated test accounts for parallel execution:

```typescript
// Enhanced TEST_USERS configuration
export const TEST_USERS = {
  // Parallel instructor accounts
  instructor1: {
    username: 'instructor1',
    password: 'instructor123',
    expectedRole: 'instructor',
  },
  instructor2: {
    username: 'instructor2', 
    password: 'instructor123',
    expectedRole: 'instructor',
  },
  instructor3: {
    username: 'instructor3',
    password: 'instructor123', 
    expectedRole: 'instructor',
  },
  
  // Parallel student accounts
  student1: {
    username: 'student1',
    password: 'student123',
    expectedRole: 'student',
  },
  student2: {
    username: 'student2',
    password: 'student123',
    expectedRole: 'student',
  },
  student3: {
    username: 'student3',
    password: 'student123',
    expectedRole: 'student',
  },
  
  // Single admin (less parallel usage expected)
  admin: {
    username: 'admin',
    password: 'adminpassword',
    expectedRole: 'admin',
  },
};

// Enhanced login helper with user selection
export const loginWithRoleAndWorker = async (
  page: Page, 
  role: 'instructor' | 'student' | 'admin',
  workerIndex?: number
) => {
  const availableUsers = Object.entries(TEST_USERS)
    .filter(([key, user]) => user.expectedRole === role);
    
  const userIndex = workerIndex ? workerIndex % availableUsers.length : 0;
  const [username, userData] = availableUsers[userIndex];
  
  return await login(page, userData.username, userData.password);
};
```

### Option 2: Browser Context Isolation
```typescript
// Each test gets completely isolated browser context
test.describe('Task Deletion Feature', () => {
  test.describe.configure({ mode: 'parallel' });
  
  let context: BrowserContext;
  
  test.beforeEach(async ({ browser }) => {
    // Create isolated context for each test
    context = await browser.newContext({
      // Clear storage for true isolation
      storageState: undefined
    });
    
    const page = await context.newPage();
    // Login with dedicated user...
  });
  
  test.afterEach(async () => {
    await context.close();
  });
});
```

### Option 3: Role-Based Test Grouping
```typescript
// Group tests by role to minimize user conflicts
test.describe('Instructor Features', () => {
  test.describe.configure({ mode: 'serial' }); // Run instructor tests sequentially
  
  test('instructor can see delete button', async ({ page }) => {
    await login(page, 'instructor1', 'pass');
    // Test logic...
  });
  
  test('instructor can delete task', async ({ page }) => {
    await login(page, 'instructor1', 'pass');
    // Test logic...
  });
});

test.describe('Student Features', () => {
  test.describe.configure({ mode: 'serial' }); // Run student tests sequentially
  
  test('student cannot see delete buttons', async ({ page }) => {
    await login(page, 'student1', 'pass');
    // Test logic...
  });
});
```

## Implementation Priority

1. **Immediate** (Current): Use `--workers=1` for stability
2. **Short-term**: Create multiple test users per role in database
3. **Medium-term**: Implement user selection logic in test helpers
4. **Long-term**: Consider browser context isolation for maximum parallelization

## Database Setup Requirements

When implementing multiple test users:

```sql
-- Create additional test instructors
INSERT INTO auth_user (username, email, first_name, last_name, is_active, is_staff, date_joined, password) 
VALUES 
  ('instructor1', 'instructor1@test.com', 'Test', 'Instructor1', true, false, NOW(), 'hashed_password'),
  ('instructor2', 'instructor2@test.com', 'Test', 'Instructor2', true, false, NOW(), 'hashed_password'),
  ('instructor3', 'instructor3@test.com', 'Test', 'Instructor3', true, false, NOW(), 'hashed_password');

-- Assign instructor role
INSERT INTO core_userrole (user_id, role)
SELECT id, 'instructor' FROM auth_user WHERE username IN ('instructor1', 'instructor2', 'instructor3');

-- Create additional test students  
INSERT INTO auth_user (username, email, first_name, last_name, is_active, is_staff, date_joined, password)
VALUES 
  ('student1', 'student1@test.com', 'Test', 'Student1', true, false, NOW(), 'hashed_password'),
  ('student2', 'student2@test.com', 'Test', 'Student2', true, false, NOW(), 'hashed_password'),
  ('student3', 'student3@test.com', 'Test', 'Student3', true, false, NOW(), 'hashed_password');

-- Assign student role
INSERT INTO core_userrole (user_id, role)
SELECT id, 'student' FROM auth_user WHERE username IN ('student1', 'student2', 'student3');
```

## Test Execution Commands

```bash
# Current reliable method
npx playwright test --workers=1 --headed --reporter=html

# Future parallel method (after implementing multiple users)
npx playwright test --workers=3 --headed --reporter=html

# Role-specific test runs  
npx playwright test --grep "instructor" --workers=1
npx playwright test --grep "student" --workers=1
npx playwright test --grep "admin" --workers=1
```

## Video Recording Considerations

- **Sequential execution** (`--workers=1`): Clean, reliable videos showing actual user flows
- **Parallel execution**: May show authentication artifacts if session conflicts occur
- **Always enable video** for debugging: `--video=retain-on-failure` or `--video=on`

---

**Date Created**: 2025-09-09  
**Status**: Active Guidelines  
**Next Review**: When test suite grows beyond 10-15 E2E tests

**Related Files**:
- `frontend/e2e/setupTests.ts` - Login helpers and user configuration
- `frontend/playwright.config.ts` - Playwright configuration
- `frontend/e2e/tests/tasks/task-deletion.spec.ts` - Example of session management issues