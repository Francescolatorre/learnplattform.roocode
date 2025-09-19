# TASK: Repair Store Integration Tests

## Context
During pipeline fix (TASK-027-B), several store integration tests were temporarily skipped to ensure green pipeline. These tests need to be repaired and re-enabled.

## Skipped Test Files
1. **modernCourseStore.test.ts** - ALL 22 tests skipped
   - Original: 22/22 tests failed
   - Issues: Store reset function missing, ServiceFactory mock issues, multiple describe blocks
   - Skipped blocks: 'Modern Course Store', 'Course Store Hooks', 'Error Handling', 'Performance and Caching'
   - Priority: High (core TASK-027-B functionality)

2. **modernAuthStore.test.ts** - ALL 26 tests skipped
   - Original: 3/26 tests failed + extensive React ACT warnings
   - Issues: React ACT warnings causing timeouts, store state management in tests
   - Skipped blocks: 'Modern Auth Store'
   - Priority: High (authentication critical)

3. **taskStore.test.ts** - ALL 16 tests skipped
   - Original: 4/16 tests failed
   - Issues: Method name mismatches (getTasks vs getAllTasks), mock configuration
   - Skipped blocks: 'TaskStore'
   - Priority: Medium

4. **modernAuthService.test.ts** - ALL 30 tests skipped
   - Original: 5/30 tests failed
   - Issues: Mock setup for token validation flows, localStorage mock interactions
   - Skipped blocks: 'ModernAuthService'
   - Priority: Medium

**Total Impact**: 94 tests temporarily skipped (22+26+16+30)

## Required Fixes

### modernCourseStore.test.ts
- [ ] Fix ServiceFactory mock configuration
- [ ] Implement missing store reset functionality
- [ ] Update test data to match current ICourse interface

### modernAuthStore.test.ts
- [ ] Wrap all store state changes in act() blocks
- [ ] Fix React testing library integration
- [ ] Resolve timeout issues from excessive warnings

### taskStore.test.ts
- [ ] Update service method calls to match current API
- [ ] Fix mock data structures
- [ ] Align with modernLearningTaskService interface

### modernAuthService.test.ts
- [ ] Fix token validation test scenarios
- [ ] Repair mock localStorage interactions
- [ ] Fix getCurrentUser service call expectations

## Acceptance Criteria
- [ ] All skipped tests re-enabled and passing
- [ ] No React ACT warnings in store tests
- [ ] Pipeline runs green with full test coverage
- [ ] Store integration follows TASK-027-B patterns

## Estimated Effort
**4-6 story points** (1-2 days)

## Dependencies
- TASK-027-B patterns established
- ServiceFactory implementation stable
- Modern service interfaces finalized