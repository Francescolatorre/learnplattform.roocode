# TASK: Repair Store Integration Tests

## Context
During pipeline fix (TASK-027-B), several store integration tests were temporarily skipped to ensure green pipeline. These tests need to be repaired and re-enabled.

## Skipped Test Files
1. **modernCourseStore.test.ts** - 22/22 tests failed
   - Issue: Store reset function missing, ServiceFactory mock issues
   - Priority: High (core TASK-027-B functionality)

2. **modernAuthStore.test.ts** - 3/26 tests failed
   - Issue: React ACT warnings causing timeouts
   - Priority: High (authentication critical)

3. **taskStore.test.ts** - 4/16 tests failed
   - Issue: Method name mismatches, mock configuration
   - Priority: Medium

4. **modernAuthService.test.ts** - 5/30 tests failed
   - Issue: Mock setup for token validation flows
   - Priority: Medium

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