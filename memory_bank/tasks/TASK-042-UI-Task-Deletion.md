# TASK-042-UI-Task-Deletion

## Task Title

Instructor Task Deletion Feature

---

## Task Metadata

* **Task-ID:** TASK-042
* **Status:** DRAFT
* **Owner:** Digital Design
* **Priority:** High
* **Last Updated:** 2025-06-30
* **Estimated Hours:**
* **Hours Spent:**
* **Remaining Hours:**

---

## Business Context

Instructors and Admins need the ability to manage course tasks efficiently, including deleting obsolete or erroneous tasks. This improves course quality and reduces clutter, while ensuring student progress is not disrupted.

---

## Requirements

### User Stories

```gherkin
Feature: Task Deletion

  Scenario: Instructor deletes a task that no student has started
    Given I am logged in as an Instructor or Admin
    And I am viewing the course task list
    And the task has not been started by any student
    Then I see a delete button for the task
    When I click the delete button for the task
    And I confirm the deletion
    Then the task is deleted
    And a success notification is shown
    And the task is no longer visible to students

  Scenario: Instructor views a task already started by a student
    Given I am logged in as an Instructor or Admin
    And at least one student has started the task
    Then I do not see a delete button for the task
    And I see an info icon or tooltip explaining why deletion is not possible
    And the tooltip shows how many students have this task in progress or done

  Scenario: Instructor aborts deletion
    Given I am logged in as an Instructor or Admin
    When I click the delete button for a task
    And I abort the confirmation dialog
    Then the task is not deleted
    And no changes occur

  Scenario: Unauthorized user attempts deletion
    Given I am logged in as a Student
    When I view the course task list
    Then I do not see a delete button for any task

  Scenario: Audit log entry for deletion
    Given a task is deleted by an Instructor or Admin
    Then an audit log entry is created with user, timestamp, and task details
```

### Acceptance Criteria

1. Only Instructors or Admins can see and use the delete button for tasks.
2. The delete button is only shown for tasks that have not been started by any student.
3. For tasks already started by students, no delete button is shown; instead, an info icon or tooltip explains why deletion is not possible and displays the number of students with the task in progress or done.
4. Clicking the delete button prompts a confirmation dialog ("Are you sure?" with Yes and Abort).
5. If Yes is selected, the task is deleted and a success notification is shown.
6. If Abort is selected, no action is taken.
7. Tasks not started by any student can be deleted.
8. Deleted tasks are no longer visible to students who have not started them.
9. Tasks already started remain visible to those students, but are not accessible to others.

### Technical Requirements

* Role-based access control for delete action.
* Confirmation dialog implementation.
* Backend logic to check student progress before deletion.
* Notification system for success and error states.
* Audit logging for task deletions.
* API endpoint: DELETE /api/courses/{courseId}/tasks/{taskId}
* InstructorDashboardPage and related frontend components must be updated.
* Backend task service and progress tracking modules require adjustment.
* Ensure concurrency safety for simultaneous deletion attempts.
* Regression tests for task list and student views.

---

## Implementation

### Technical Approach

* UI: Show delete button only for tasks not started by any student; add info icon or tooltip for non-deletable tasks, including counts of students in progress or done.
* Backend: Endpoint to handle deletion with progress check and provide counts of students with the task in progress or done.
* Update task visibility logic for students.
* Notification and error handling.

### Dependencies

* User authentication and role management.
* Task progress tracking.
* Notification system.

### Test Strategy

* **Unit Tests:**
  * Delete button visibility for different roles.
  * Confirmation dialog logic.
  * Backend deletion logic with/without student progress.
* **Integration Tests:**
  * End-to-end deletion flow.
  * Edge case: students in progress.

---

## Subtasks

### Subtask-1: UI Delete Button & Info Tooltip

* **ID:** TASK-042-SUB-001
* **Status:** DRAFT
* **Estimated Hours:**
* **Dependencies:**
* **Description:** Show delete button only for tasks not started by any student; for non-deletable tasks, show info icon or tooltip explaining why deletion is not possible and display the number of students with the task in progress or done. Add confirmation dialog to InstructorDashboardPage and task list components.
* **Validation:** Button only visible to authorized roles and deletable tasks; info/tooltip with student counts shown for non-deletable tasks; dialog appears on click.

### Subtask-2: Backend Deletion Logic & Progress Counts

* **ID:** TASK-042-SUB-002
* **Status:** DRAFT
* **Estimated Hours:**
* **Dependencies:** SUB-001
* **Description:** Implement backend API and service logic to check student progress, provide counts of students with the task in progress or done, and delete task if allowed.
* **Validation:** Task only deleted if no student has started; correct counts returned for UI; concurrency handled.

### Subtask-3: Notification & Error Handling

* **ID:** TASK-042-SUB-003
* **Status:** DRAFT
* **Estimated Hours:**
* **Dependencies:** SUB-002
* **Description:** Show success/error notifications and warnings in UI; backend returns clear error codes.
* **Validation:** Correct notification shown for each outcome.

### Subtask-4: Update Task Visibility Logic

* **ID:** TASK-042-SUB-004
* **Status:** DRAFT
* **Estimated Hours:**
* **Dependencies:** SUB-002
* **Description:** Ensure deleted tasks remain visible only to students who started them; update student task list logic.
* **Validation:** Visibility rules enforced.

### Subtask-5: Audit Logging

* **ID:** TASK-042-SUB-005
* **Status:** DRAFT
* **Estimated Hours:**
* **Dependencies:** SUB-002
* **Description:** Implement audit logging for all delete actions, including user, timestamp, and task details.
* **Validation:** Log entries created for each deletion attempt.

### Subtask-6: Regression and Integration Testing

* **ID:** TASK-042-SUB-006
* **Status:** DRAFT
* **Estimated Hours:**
* **Dependencies:** SUB-001, SUB-002, SUB-003, SUB-004
* **Description:** Add and update tests for all affected components and APIs, including edge cases and concurrency.
* **Validation:** All tests pass; no regressions in task management or student views.

### Subtask-7: Documentation & API Spec Update

* **ID:** TASK-042-SUB-007
* **Status:** DRAFT
* **Estimated Hours:**
* **Dependencies:** SUB-002
* **Description:** Update API documentation, user guides, and developer docs for new deletion logic and restrictions.
* **Validation:** Docs reflect all new behaviors and edge cases.

---

## Documentation

### API Documentation

```typescript
DELETE /api/courses/{courseId}/tasks/{taskId}
Authorization: Instructor|Admin
Response: { success: boolean, message: string }
```

### Usage Examples

```typescript
// Instructor clicks delete
await api.deleteTask(courseId, taskId);
```

---

## Risk Assessment

### Technical Risks

* Incorrect permission checks
  * **Impact:** High
  * **Mitigation:** Comprehensive role-based tests

* Data inconsistency if deletion logic fails
  * **Impact:** Medium
  * **Mitigation:** Transactional backend logic

### Security Considerations

* Only authorized users can delete tasks
* Audit log for deletions

---

## Progress Tracking

### Milestones

1. UI implementation
   * **Status:** Pending
   * **Notes:**
2. Backend logic
   * **Status:** Pending
   * **Notes:**
3. Integration and testing
   * **Status:** Pending
   * **Notes:**

### Status Updates

| Date       | Status       | Notes             |
| ---------- | ------------ | ----------------- |
| 2025-06-30 | DRAFT        | Task created      |

---

## Review Checklist

### Implementation Review

* [ ] Code follows standards
* [ ] Tests are complete
* [ ] Documentation is updated
* [ ] Performance is verified
* [ ] Security is validated

### Documentation Review

* [ ] API documentation is complete
* [ ] Examples are provided
* [ ] Configuration is documented
* [ ] Deployment/release notes are added

---

### Blind Spots & Open Questions

**Tooltip Content:**
* Show a breakdown: e.g., "3 students in progress, 2 students completed".

**Student List Visibility:**
* Start with just the counts. Optionally, allow instructors to expand for a list of affected students (names only), if privacy policy allows.

**Race Condition Handling:**
* Backend must always block deletion if a student starts the task after UI load. UI should show an error notification if deletion fails due to late progress.

**Soft-Delete/Undo:**
* Strongly recommend a soft-delete (archived state) with an undo option for a short period (e.g., 30 seconds), and permanent deletion after that.

**Notifications:**
* Notify instructors of successful/failed deletions. Student notification only if the task was visible to them and is now removed/archived (passive notification).

**Audit & Retention:**
* Retain audit logs for at least 1 year. Instructors should have access to a deletion history for their courses; full audit log is admin-only.

**Bulk Actions:**
* Not required for MVP, but design backend/UI for future extension to bulk deletion.

**Accessibility:**
* All tooltips and info icons must be accessible (screen reader text, keyboard focusable, ARIA labels).

### Implementation Notes

* Confirm edge case handling for students in progress.
* Ensure all affected frontend (InstructorDashboardPage, task list, student views) and backend (task API, progress tracking, audit log) modules are updated.
* API must provide counts for both "in progress" and "done" statuses.
* All error and info messages must be clear, actionable, and consistent in tone.
* Document the deletion/archival process in the instructor help section.
* Consider analytics for task deletion frequency and reasons (optional, for future).

### Future Considerations

* Soft-delete for audit/history with undo option.
* Bulk deletion support.
* Notification system for affected students.
* Admin dashboard for audit log review.
* Notification system for affected students.
* Admin dashboard for audit log review.

---
---

<!-- Template Version: 1.1 -->

<!-- Maintainer: Requirements Manager -->

<!-- Last Updated: 2025-06-30 -->
