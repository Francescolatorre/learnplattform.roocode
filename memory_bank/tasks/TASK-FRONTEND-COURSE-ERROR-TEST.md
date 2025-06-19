# Task: Repair InstructorCoursesPage Error State Test

## Task Metadata

- **Task-ID:** TASK-FRONTEND-COURSE-ERROR-TEST
- **Status:** TODO
- **Priority:** Medium
- **Last Updated:** 2025-06-19

### Time Tracking

- **Estimated Hours:** 2
- **Hours Spent:** 0
- **Remaining Hours:** 2

### Task Relationships

- **Has Subtasks:** No
- **Parent Task:** None
- **Dependencies:** None

### Progress Metrics

- **Completion:** 0%
- **Active Subtasks:** 0
- **Total Subtasks:** 0

## Description

Repair the failing error state test in `InstructorCoursesPage.test.tsx` for the instructor course management page. The test for error handling currently fails because the error state is not rendered as expected when the course fetch fails. The test should reliably assert that the error message is shown when the API call fails.

## Requirements

1. Diagnose why the error state is not rendered (spinner remains, error boundary not triggered, etc.).
2. Ensure React Query and component state are flushed so the error message appears.
3. Update the test to robustly await the error state (using `act`, `waitFor`, or similar as needed).
4. Ensure the test passes reliably in CI and local runs.
5. Remove the `.skip` from the test and document the solution.

## Implementation Details

- Review the async flow and error handling in `FilterableCourseList` and `InstructorCoursesPage`.
- Use `act` or `waitFor` to ensure all state updates are flushed before assertions.
- Optionally, add debug output to help diagnose rendering issues.
- Ensure all mocks are properly reset and isolated per test.

## Validation Criteria

1. The error test passes reliably and asserts the correct error message.
2. No spinner remains when the error is shown.
3. No side effects on other tests.
4. Documentation and comments reference this task file.

## Related Work

- `src/pages/courses/InstructorCoursesPage.test.tsx`
- `src/components/courses/FilterableCourseList.tsx`

## Potential Risks

- Async state not flushing as expected
- Test flakiness due to timing or mock issues

## Notes

- See test file for a comment referencing this task.

<!-- Template Version: 2.0 -->
<!-- Last Updated: 2025-06-19 -->
