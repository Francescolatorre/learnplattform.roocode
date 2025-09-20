# E2E Tests Affected by Component Migrations

**Created**: 2025-09-20
**Purpose**: Identify and track E2E tests that will be affected by auth store component migrations
**Status**: Active planning document

---

## Overview

This document identifies all E2E tests that will be impacted by the modern authentication store component migrations (TASK-055, TASK-056, TASK-057). These tests will need validation after component migrations but before final deployment.

## Migration Strategy for E2E Tests

**Timing**: Update E2E tests AFTER all component migrations are complete
**Approach**: Validation-only (no test changes expected)
**Reason**: Modern auth store maintains identical functionality to legacy implementation

---

## TASK-055: ProfilePage Modern Migration

### Directly Affected Tests

#### 1. Profile Navigation Tests
- **File**: `e2e/tests/menu-navigation-test.spec.ts`
- **Test**: "should handle mobile navigation using burger menu"
- **Impact**: Tests profile page navigation via mobile menu
- **Lines**: 158-163 (navigation to profile page)
- **Validation Required**: Profile page loads correctly with modern auth store

#### 2. User Role and Profile Tests
- **File**: `e2e/tests/roles.spec.ts`
- **Test**: All role-based tests that access profile functionality
- **Impact**: Profile page rendering with different user roles
- **Lines**: 18, 27, 38 (profile menu visibility)
- **Validation Required**: Profile menu appears correctly for all roles

### Indirectly Affected Tests

#### Authentication Flow Tests
- **File**: `e2e/tests/auth.spec.ts`
- **Impact**: Authentication state consistency with profile page
- **Validation Required**: User state synchronized between auth and profile

---

## TASK-056: InstructorDashboard Modern Migration

### Directly Affected Tests

#### 1. Instructor Dashboard Access
- **File**: `e2e/tests/auth.spec.ts`
- **Test**: "lead instructor can login and access dashboard"
- **Lines**: 10-14
- **Impact**: Dashboard loading and display
- **Validation Required**: Dashboard renders correctly with modern auth store

#### 2. Instructor Course Management
- **File**: `e2e/tests/courses/instructor-course-list.spec.ts`
- **Test**: All instructor course management tests
- **Lines**: 40-55 (instructor dashboard login flow)
- **Impact**: Instructor role recognition and course access
- **Validation Required**: Course management features work with modern auth

#### 3. Role-Based Dashboard Access
- **File**: `e2e/tests/roles.spec.ts`
- **Test**: "Instructor role can access instructor and student views"
- **Lines**: 21-30
- **Impact**: Instructor dashboard menu visibility and access
- **Validation Required**: All instructor dashboard features accessible

#### 4. Menu Navigation to Dashboard
- **File**: `e2e/tests/menu-navigation-test.spec.ts`
- **Test**: "should navigate through the application using menu clicks"
- **Lines**: 48-54 (instructor dashboard navigation)
- **Impact**: Navigation to instructor dashboard via menu
- **Validation Required**: Dashboard navigation works correctly

### Service Integration Tests

#### Course Creation and Management
- **File**: `e2e/tests/course-creation.spec.ts`
- **Impact**: Instructor dashboard integration with course creation
- **Validation Required**: Course creation flows work with modern services

---

## TASK-057: CourseEnrollment Modern Migration

### Directly Affected Tests

#### 1. Course Enrollment Flow
- **File**: `e2e/tests/course-enrollment-unenrollment.spec.ts`
- **Test**: "should be able to enroll in a course"
- **Lines**: 57-123
- **Impact**: Course enrollment component integration
- **Validation Required**: Enrollment actions work with modern auth and services

#### 2. Course Unenrollment Flow
- **File**: `e2e/tests/course-enrollment-unenrollment.spec.ts`
- **Test**: "should be able to unenroll from a course via the unenroll button"
- **Lines**: 125-191
- **Impact**: Unenrollment functionality
- **Validation Required**: Unenrollment works with modern services

#### 3. Enrollment Cancellation
- **File**: `e2e/tests/course-enrollment-unenrollment.spec.ts`
- **Test**: "should be able to cancel unenrollment via the cancel button"
- **Lines**: 193-235
- **Impact**: Cancel enrollment functionality
- **Validation Required**: Cancel operations work correctly

#### 4. API-Driven Enrollment
- **File**: `e2e/tests/course-enrollment-unenrollment.spec.ts`
- **Test**: "should be able to unenroll from a course via the unenroll button (API setup)"
- **Lines**: 257-338
- **Impact**: Enrollment state consistency between API and UI
- **Validation Required**: API-UI integration works with modern services

### Student Dashboard Integration

#### 1. Course Display on Dashboard
- **File**: `e2e/tests/student-dashboard.spec.ts`
- **Test**: "displays dashboard components correctly"
- **Lines**: 97-112
- **Impact**: Enrolled courses display on student dashboard
- **Validation Required**: Course enrollment status displays correctly

#### 2. Course Progress Display
- **File**: `e2e/tests/student-dashboard.spec.ts`
- **Test**: "shows course progress correctly"
- **Lines**: 114-132
- **Impact**: Enrollment-based progress tracking
- **Validation Required**: Progress displays correctly for enrolled courses

#### 3. Dashboard Navigation
- **File**: `e2e/tests/student-dashboard.spec.ts`
- **Test**: "navigation to courses works"
- **Lines**: 146-160
- **Impact**: Navigation from dashboard to course details
- **Validation Required**: Course navigation works with modern enrollment state

---

## Cross-Component Integration Tests

### Authentication Flow Tests
- **File**: `e2e/tests/auth.spec.ts`
- **Impact**: All tests that verify authentication state across components
- **Validation Required**: Consistent auth state across ProfilePage, InstructorDashboard, and CourseEnrollment

### Navigation Flow Tests
- **File**: `e2e/tests/menu-navigation-test.spec.ts`
- **Impact**: Tests that navigate between migrated components
- **Validation Required**: Navigation flows work correctly between modern components

### Role-Based Access Tests
- **File**: `e2e/tests/roles.spec.ts`
- **Impact**: Role verification across all migrated components
- **Validation Required**: User roles recognized correctly in all modern components

---

## Testing Strategy

### Phase 1: Unit Test Updates (During Migration)
- Update component unit tests during each migration
- Ensure 100% test coverage maintained
- Verify component-specific functionality

### Phase 2: Integration Testing (After Each Migration)
- Manual testing of each migrated component
- Verify component integrates with modern auth store
- Test component-specific user workflows

### Phase 3: E2E Test Validation (After All Migrations)
- Run all identified affected E2E tests
- Verify no functional regressions
- Validate authentication state consistency
- Test cross-component navigation flows

### Phase 4: Full E2E Test Suite (Before Deployment)
- Run complete E2E test suite
- Performance validation
- Cross-browser testing
- Final deployment approval

---

## Test Execution Plan

### Pre-Migration Baseline
```bash
# Capture current E2E test status
cd frontend && npm run test:e2e -- --reporter=html
```

### During Migration (After Each Component)
```bash
# Quick validation of affected tests
cd frontend && npm run test:e2e -- --grep="enrollment|dashboard|profile"
```

### Post-Migration Full Validation
```bash
# Full E2E test suite
cd frontend && npm run test:e2e
cd frontend && npm run test:e2e:ci  # CI environment validation
```

---

## Risk Assessment

### High-Risk Tests (Require Immediate Attention if Failing)
1. **Authentication flow tests** - Core login/logout functionality
2. **Course enrollment tests** - Business-critical student workflow
3. **Role-based access tests** - Security-critical functionality

### Medium-Risk Tests (Important but Not Critical)
1. **Navigation tests** - User experience impact
2. **Dashboard integration tests** - Daily workflow impact

### Low-Risk Tests (Cosmetic or Edge Cases)
1. **Mobile navigation tests** - Responsive design validation
2. **Course management tests** - Instructor workflow optimization

---

## Expected Test Changes

### Expected: No Test Changes Required
- Modern auth store maintains 100% functional compatibility
- Component interfaces remain identical
- User workflows unchanged

### Possible: Minor Test Timing Adjustments
- Loading state transitions may have different timing
- Network request patterns may change slightly
- Retry logic may need adjustment for modern service calls

### Unlikely: Test Logic Changes
- No fundamental changes to component behavior expected
- Authentication flow remains the same
- User role handling unchanged

---

## Success Criteria

### Component Migration Success
- [ ] All unit tests pass with 100% coverage
- [ ] Manual component testing confirms identical functionality
- [ ] No TypeScript errors or warnings

### E2E Test Validation Success
- [ ] All identified affected tests pass
- [ ] No new test failures introduced
- [ ] Performance metrics within acceptable range
- [ ] Cross-component navigation works correctly

### Full Migration Success
- [ ] Complete E2E test suite passes
- [ ] Authentication flow works end-to-end
- [ ] All user roles function correctly
- [ ] Course enrollment workflows operational
- [ ] Dashboard and profile functionality confirmed

---

## Notes

This document will be updated during the migration process if additional affected tests are discovered. The focus is on validation rather than test modification, as the modern auth store is designed to maintain complete functional compatibility with the legacy implementation.

**Next Update**: After TASK-055 (ProfilePage) migration completion