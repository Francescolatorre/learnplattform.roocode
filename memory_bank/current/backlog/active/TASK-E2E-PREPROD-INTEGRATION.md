# TASK: E2E Tests Integration with Preprod Environment

**Task ID**: TASK-E2E-PREPROD-INTEGRATION
**Priority**: P2 (Medium)
**Status**: Backlog - Ready for Planning
**Created**: 2025-09-19
**Estimated Effort**: 3-5 Story Points

---

## Context

During pipeline failure resolution (Branch: `fix/pipeline-failures-typescript-e2e`), E2E tests were temporarily removed from the main CI/CD pipeline due to infrastructure complexity and database setup issues. The tests need to be reconfigured to run against the preprod/preview environment instead of setting up a local test environment.

## Current E2E Test Configuration

### Existing Setup (Removed)
The current E2E tests in `.github/workflows/e2e-tests.yml` include:

1. **Local Test Environment Setup**:
   - PostgreSQL service container
   - Python backend setup with test database
   - Node.js frontend build and serve
   - Playwright test execution

2. **Test Jobs**:
   - `e2e-tests`: Main E2E test suite with Chromium browser
   - `visual-regression`: Visual regression testing

3. **Infrastructure Issues**:
   - Database setup failures
   - Service connectivity problems
   - Git process failures (exit code 128)
   - Complex service orchestration in CI environment

## Proposed Solution: Preprod Integration

### Benefits of Preprod Approach
1. **Eliminates Infrastructure Complexity**: No need for local database setup
2. **Real Environment Testing**: Tests run against actual deployment environment
3. **Faster Pipeline**: No service startup time in CI
4. **Better Reliability**: Stable environment without setup dependencies
5. **Production-like Testing**: Tests actual deployment configuration

### Technical Requirements

#### 1. Preprod Environment Prerequisites
- [ ] Stable preprod/preview environment URL
- [ ] Test data seeding capability in preprod
- [ ] Authentication handling for automated tests
- [ ] Database reset/cleanup procedures for test isolation

#### 2. Test Configuration Updates
- [ ] Update Playwright base URL to preprod environment
- [ ] Configure authentication for preprod access
- [ ] Implement test data setup/teardown
- [ ] Update environment variable configuration

#### 3. Pipeline Integration
- [ ] Create separate E2E workflow for preprod testing
- [ ] Configure triggers (PR, main branch, scheduled)
- [ ] Set up proper secret management for preprod access
- [ ] Implement parallel execution strategy

### Implementation Plan

#### Phase 1: Environment Setup (1 Story Point)
**Duration**: 2-3 hours

1. **Preprod Environment Verification**
   ```yaml
   # Verify preprod environment is accessible
   - name: Check preprod health
     run: curl -f ${{ secrets.PREPROD_BASE_URL }}/health/
   ```

2. **Authentication Configuration**
   ```typescript
   // Test user setup for preprod
   const testUser = {
     username: process.env.E2E_TEST_USERNAME,
     password: process.env.E2E_TEST_PASSWORD
   };
   ```

3. **Test Data Management**
   ```typescript
   // Preprod test data setup
   beforeAll(async () => {
     await setupTestData(preprodApiUrl);
   });

   afterAll(async () => {
     await cleanupTestData(preprodApiUrl);
   });
   ```

#### Phase 2: Test Configuration (2 Story Points)
**Duration**: 4-6 hours

1. **Playwright Configuration Update**
   ```typescript
   // playwright.config.ts
   export default defineConfig({
     use: {
       baseURL: process.env.PREPROD_BASE_URL || 'https://preprod.learningplatform.com',
       extraHTTPHeaders: {
         'Authorization': `Bearer ${process.env.E2E_API_TOKEN}`
       }
     },
     projects: [
       {
         name: 'preprod-e2e',
         use: { ...devices['Desktop Chrome'] },
         testDir: './tests/e2e/preprod'
       }
     ]
   });
   ```

2. **Test Suite Adaptation**
   ```typescript
   // Update existing tests for preprod environment
   test('user login flow', async ({ page }) => {
     await page.goto('/login');
     // Use preprod-specific test data
     await loginWithTestUser(page);
     await expect(page).toHaveURL(/dashboard/);
   });
   ```

#### Phase 3: Pipeline Integration (2 Story Points)
**Duration**: 3-4 hours

1. **New Workflow File**
   ```yaml
   # .github/workflows/e2e-preprod.yml
   name: E2E Tests - Preprod Environment

   on:
     pull_request:
       types: [opened, synchronize]
     push:
       branches: [main]
     schedule:
       - cron: '0 6 * * *'  # Daily at 6 AM UTC

   jobs:
     e2e-preprod:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v5

         - name: Setup Node.js
           uses: actions/setup-node@v5
           with:
             node-version: 20
             cache: 'npm'
             cache-dependency-path: frontend/package-lock.json

         - name: Install dependencies
           working-directory: frontend
           run: npm ci

         - name: Install Playwright
           working-directory: frontend
           run: npx playwright install chromium

         - name: Wait for preprod availability
           run: |
             curl -f ${{ secrets.PREPROD_BASE_URL }}/health/ || exit 1

         - name: Run E2E tests against preprod
           working-directory: frontend
           env:
             PREPROD_BASE_URL: ${{ secrets.PREPROD_BASE_URL }}
             E2E_TEST_USERNAME: ${{ secrets.E2E_TEST_USERNAME }}
             E2E_TEST_PASSWORD: ${{ secrets.E2E_TEST_PASSWORD }}
             E2E_API_TOKEN: ${{ secrets.E2E_API_TOKEN }}
           run: |
             npx playwright test --config=playwright.preprod.config.ts
   ```

2. **Secret Configuration**
   ```bash
   # GitHub Secrets to configure:
   PREPROD_BASE_URL=https://preview.learningplatform.vercel.app
   E2E_TEST_USERNAME=e2e-test-user
   E2E_TEST_PASSWORD=secure-test-password
   E2E_API_TOKEN=preprod-api-access-token
   ```

### Test Strategy for Preprod

#### 1. Test Data Isolation
```typescript
// Isolated test data per run
const testRunId = Date.now();
const testUser = `e2e-user-${testRunId}`;
const testCourse = `e2e-course-${testRunId}`;
```

#### 2. Parallel Test Execution
```yaml
strategy:
  matrix:
    browser: [chromium]
    test-group: [auth, courses, tasks, admin]
```

#### 3. Test Result Management
```yaml
- name: Upload test results
  uses: actions/upload-artifact@v4
  if: always()
  with:
    name: preprod-e2e-results
    path: |
      frontend/playwright-report/
      frontend/test-results/
```

### Migration Steps

#### Step 1: Backup Current Configuration
```bash
# Backup current E2E workflow
mv .github/workflows/e2e-tests.yml .github/workflows/e2e-tests.yml.backup
```

#### Step 2: Create Preprod Test Configuration
```bash
# Create new Playwright config for preprod
cp playwright.config.ts playwright.preprod.config.ts
# Update configuration for preprod environment
```

#### Step 3: Update Test Suites
```bash
# Create preprod-specific test directory
mkdir tests/e2e/preprod
# Adapt existing tests for preprod environment
```

#### Step 4: Configure Secrets
```bash
# Add required secrets to GitHub repository
# Set up preprod environment variables
```

#### Step 5: Test and Deploy
```bash
# Test new workflow locally with act or similar
# Deploy to feature branch for testing
# Validate against preprod environment
```

### Success Criteria

#### ✅ Functional Requirements
- [ ] E2E tests run successfully against preprod environment
- [ ] Test data isolation prevents conflicts between test runs
- [ ] Authentication works correctly with preprod credentials
- [ ] Visual regression tests function in preprod environment
- [ ] Test results are properly captured and stored

#### ✅ Non-Functional Requirements
- [ ] E2E test execution time < 10 minutes
- [ ] Test reliability > 95% success rate
- [ ] Proper error reporting and debugging information
- [ ] No impact on preprod environment stability
- [ ] Secure handling of test credentials

#### ✅ Integration Requirements
- [ ] Pipeline triggers work correctly (PR, main, scheduled)
- [ ] Test results integrate with GitHub PR checks
- [ ] Parallel execution with other pipeline jobs
- [ ] Proper artifact collection and storage
- [ ] Clear failure reporting and debugging

### Risk Assessment

#### Medium Risk: Preprod Environment Stability
**Risk**: Preprod environment downtime affects E2E pipeline
**Mitigation**:
- Implement health checks before test execution
- Add retry logic for transient failures
- Fallback to local testing if preprod unavailable

#### Low Risk: Test Data Conflicts
**Risk**: Multiple test runs interfere with each other
**Mitigation**:
- Use unique test data identifiers per run
- Implement proper cleanup procedures
- Use test-specific user accounts

#### Low Risk: Authentication Token Expiry
**Risk**: Test authentication tokens expire
**Mitigation**:
- Implement token refresh logic
- Monitor token expiry dates
- Use service accounts with longer-lived tokens

### Dependencies

#### External Dependencies
- [ ] Preprod environment URL and access
- [ ] Test user accounts in preprod environment
- [ ] API tokens for preprod access
- [ ] Database cleanup capabilities in preprod

#### Internal Dependencies
- [ ] Playwright test suite refactoring
- [ ] GitHub Actions workflow updates
- [ ] Secret management configuration
- [ ] Documentation updates

### Definition of Done

- [ ] E2E tests successfully run against preprod environment
- [ ] Pipeline integration is complete and tested
- [ ] Documentation is updated with new procedures
- [ ] Team is trained on new E2E test approach
- [ ] Old E2E infrastructure is properly decommissioned
- [ ] Performance benchmarks meet requirements
- [ ] Security review is completed for preprod access

---

## Implementation Notes

### Current Pipeline Removal
During the immediate pipeline fix (Branch: `fix/pipeline-failures-typescript-e2e`), the existing E2E workflow has been disabled to unblock development. This task will restore E2E testing with the improved preprod approach.

### Timeline
This task should be prioritized after:
1. Current pipeline failures are resolved
2. Frontend TypeScript issues are fixed
3. Core development workflow is stable

**Estimated Implementation Time**: 1-2 sprints (2-3 weeks)
**Complexity**: Medium (requires coordination between environments)
**Priority Justification**: Medium priority as E2E tests are important for quality but not blocking immediate development