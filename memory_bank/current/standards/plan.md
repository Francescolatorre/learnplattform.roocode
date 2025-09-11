# Plan for Task Naming Convention Compliance

## Objective

Ensure all tasks in the `memory_bank/tasks` directory comply with the naming convention specified in `memory_bank/ADRs/ADR-010-TASK_NAMING_CONVENTION.md`.

## Steps

1. **Analyze Task Files and Propose Renames:**

    * List all files in the `memory_bank/tasks` directory.
    * Identify files that do not comply with the `TASK-[AREA]-[NUMBER]-[SHORT_DESCRIPTION].md` naming convention.
    * For each non-compliant file, propose a new name that adheres to the convention. I will need to infer the AREA and NUMBER from the existing filename or content. If I can't, I'll mark it as requiring manual intervention.

2. **Update References in `activeContext.md` and `progress.md`:**

    * Read the contents of `activeContext.md` and `progress.md`.
    * For each file being renamed, search for references to the old filename in these files.
    * Replace the old filename with the new filename.

3. **Implement the Renaming and Reference Updates:**

    * Switch to `code` mode.
    * Rename the files using the `mv` command.
    * Update the contents of `activeContext.md` and `progress.md` using the `apply_diff` tool.

4. **Validate Metadata:**

    * For each task file, read the contents and check for the presence and correctness of the metadata block:
        * Task-ID
        * Status
        * Owner
        * Created
        * Updated
        * Priority
        * Effort
    * If any metadata is missing or incorrect, generate a report.

5. **Update Metadata (If Necessary):**

    * If the metadata needs updating, switch to `code` mode and use the `apply_diff` tool to update the metadata blocks in the task files.

6. **Final Validation:**

    * List all files in the `memory_bank/tasks` directory again to ensure all filenames now comply with the naming convention.
    * Read the contents of `activeContext.md` and `progress.md` to ensure all references have been updated correctly.
    * Manually review the generated metadata report (if any) to ensure the metadata is correct.

## Proposed Filename Changes

* `migration_plan_ADR013.md` → `TASK-DOC-013-MIGRATION-PLAN.md` (Inferred DOC area and 013 number)
* `Task_GRADING-001 Task Grading System.md` → `TASK-GRADING-001-GRADING-SYSTEM.md`
* `Task_UI-001 - Design Task Management User Interface.md` → `TASK-UI-001-DESIGN-TASK-MANAGEMENT.md`
* `Task_UI-002 - Implement Frontend Task Creation Form.md` → `TASK-UI-002-IMPLEMENT-TASK-CREATION.md`
* `Task_UI-003 - Implement Frontend Task Editing & Deletion.md` → `TASK-UI-003-IMPLEMENT-TASK-EDIT-DELETE.md`
* `Task_UI-004 - UI Components Development.md` → `TASK-UI-004-UI-COMPONENTS-DEVELOPMENT.md`
* `Task_UI-005 - Implement Task Progress Tracking UI.md` → `TASK-UI-005-IMPLEMENT-TASK-PROGRESS.md`
* `Task_UI-006 - Implement Grading Feedback UI for Students.md` → `TASK-UI-006-IMPLEMENT-GRADING-FEEDBACK.md`
* `Task_UX-001 - Improve UI-UX for Instructor Task Management.md` → `TASK-UX-001-IMPROVE-INSTRUCTOR-TASK-UX.md`
* `TASK-001-Implement_Student_Journey.md` → `TASK-FEAT-001-IMPLEMENT-STUDENT-JOURNEY.md` (Inferred FEAT area)
* `TASK-001-IMPLEMENT-STUDENT-JOURNEY.md` → `TASK-FEAT-001-IMPLEMENT-STUDENT-JOURNEY.md` (Inferred FEAT area)
* `Task-API-001 - API Endpoints for Task Management.md` → `TASK-API-001-API-ENDPOINTS-TASK-MANAGEMENT.md`
* `TASK-CREATION-001-Course_Creation_Feature.md` → `TASK-CREATION-001-COURSE-CREATION.md`
* `TASK-CREATION-001-COURSE-CREATION-FEATURE.md` → `TASK-CREATION-001-COURSE-CREATION.md`
* `TASK-FEAT-001-Implement_Student_Journey.md` → `TASK-FEAT-001-IMPLEMENT-STUDENT-JOURNEY.md`
* `TASK-FEAT-001-IMPLEMENT-STUDENT-JOURNEY.md` → `TASK-FEAT-001-IMPLEMENT-STUDENT-JOURNEY.md`
* `Task-SM-009-STATE_MANAGEMENT_SETUP.md` → `TASK-STATE-009-STATE-MANAGEMENT-SETUP.md` (Inferred STATE area)
* `TASK-TEST-006-Fix_TaskCreation_Tests.md` → `TASK-TEST-006-FIX-TASK-CREATION-TESTS.md`
* `TASK-TEST-006-fix-taskcreation-tests.md` → `TASK-TEST-006-FIX-TASK-CREATION-TESTS.md`
* `TASK-UI-001-Design_Task_Management.md` → `TASK-UI-001-DESIGN-TASK-MANAGEMENT.md`
* `TASK-UI-001-DESIGN-TASK-MANAGEMENT.md` → `TASK-UI-001-DESIGN-TASK-MANAGEMENT.md`
* `TASK-UI-007- UI Components Development.md` → `TASK-UI-007-UI-COMPONENTS-DEVELOPMENT.md`
* `tasks_for_implementation.md` → `TASK-DOC-000-TASKS-FOR-IMPLEMENTATION.md` (Inferred DOC area and assigned 000 number)

```mermaid
graph TD
    A[Start] --> B{Analyze Task Files and Propose Renames};
    B --> C{Update References in activeContext.md and progress.md};
    C --> D{Implement Renaming and Reference Updates (Code Mode)};
    D --> E{Validate Metadata};
    E --> F{Update Metadata (If Necessary) (Code Mode)};
    F --> G{Final Validation};
    G --> H[End];
