# TASK-002-Versioning-LearningTasks

## Task Metadata

- **Task-ID:** TASK-001
- **Status:** DRAFT
- **Priority:** High
- **Last Updated:** 2025-06-20

### Time Tracking

- **Estimated Hours:** 40
- **Hours Spent:** 0
- **Remaining Hours:** 40

### Task Relationships

- **Has Subtasks:** Yes
- **Parent Task:** None
- **Dependencies:** None

### Progress Metrics

- **Completion:** 0%
- **Active Subtasks:** 0
- **Total Subtasks:** 4

## Description

Introduce versioning for `LearningTask` in the Django + React-based learning platform to ensure traceability of task edits and their impact on student submissions. Each edit should result in a new version, and submissions must reference the exact version used.

### Key Details from Codebase Analysis

#### Backend (Django)

1. **Model Updates**:
   - `LearningTask` is defined in `Backend/core/models.py` and represents a learning task within a course.
   - Add a new model `LearningTaskVersion` with fields:
     - `learning_task` (ForeignKey to `LearningTask`)
     - `version_number` (Integer)
     - `title`, `description`, `order`, `is_published` (copied from `LearningTask`)
     - `created_at`, `updated_at` (timestamps)
   - Update `LearningTask` to include:
     - `current_version` (ForeignKey to `LearningTaskVersion`).

2. **Migration Strategy**:
   - Create a migration to populate `LearningTaskVersion` for existing tasks.
   - Set `current_version` for each `LearningTask`.

3. **API Updates**:
   - Update `LearningTaskSerializer` in `Backend/core/serializers.py` to include versioning details.
   - Add a new serializer `LearningTaskVersionSerializer`.

4. **Task Progress**:
   - Update `TaskProgress` model to reference `LearningTaskVersion` instead of `LearningTask`.

5. **Endpoints**:
   - Update endpoints in `Backend/core/progress_api.py` to handle versioning:
     - Fetch tasks by version.
     - Update progress to reference specific versions.

#### Frontend (React with TypeScript)

1. **Component Updates**:
   - `TaskListPage.tsx` in `frontend/src/pages/learningTasks/`:
     - Update to display task versions.
     - Add a dropdown or tabs for instructors to manage versions.
   - `StudentCourseDetailsPage.tsx`:
     - Display the version of the task tied to the student's progress.

2. **Service Updates**:
   - `learningTaskService.ts` in `frontend/src/services/resources/`:
     - Add methods to fetch and update task versions.
     - Update existing methods to include versioning logic.

3. **TypeScript Types**:
   - Update `ILearningTask` to include `currentVersion` and `versions`.
   - Add a new interface `ILearningTaskVersion`.

4. **UI Enhancements**:
   - Add a modal or form for instructors to create new versions.
   - Display version history for each task.

## Requirements

1. Create a new `LearningTaskVersion` model in the backend.
2. Refactor the existing `LearningTask` model to act as a container for versions.
3. Update related models like `Submission` to reference `LearningTaskVersion`.
4. Implement UI changes for instructors and students to manage and view task versions.
5. Update API endpoints to support versioning.

## Implementation Details

### Backend (Django)

1. Identify the current model used for tasks (`LearningTask` or `LearningUnit`).
2. Create a new model `LearningTaskVersion` to hold versioned fields:
   - Title
   - Description
   - Criteria
   - Reference links
   - AI prompts
3. Refactor the existing `LearningTask` model:
   - Add a `current_version` ForeignKey to `LearningTaskVersion`.
   - Ensure backward compatibility.
4. Update related models like `Submission` or `TaskProgress` to reference `LearningTaskVersion`.
5. Design a `RunPython` migration strategy:
   - Create initial `LearningTaskVersion` records for all tasks.
   - Link each task to its new version as `current_version`.

### Frontend (React with TypeScript)

1. Identify affected components:
   - `TaskDetailsView`
   - `StudentCourseDetailsPage`
   - `InstructorCourseDetailsPage`
2. Define updated TypeScript types/interfaces:
   - `LearningTask` (container)
   - `LearningTaskVersion` (content)
3. UI changes:
   - For instructors: Add a version list or tabbed interface with actions like “Create Version” and “Set Current”.
   - For students: Display version information tied to submissions.

### API

1. Extend existing endpoints or create new ones to support:
   - Fetching `LearningTaskVersion` details.
   - Updating `current_version` for a `LearningTask`.
2. Update API payloads:
   - Include version data in `Submission` payloads.
   - Ensure backward compatibility.

### UX/UI

1. Propose a simple interface for version management:
   - Instructors can view, create, and set versions.
   - Students can view the version tied to their submission.
2. Ensure clarity and usability in displaying version information.

## Validation Criteria

1. Backend:
   - All models and migrations are implemented correctly.
   - Existing data is migrated without errors.
   - Unit tests cover new functionality.
2. Frontend:
   - UI changes are functional and intuitive.
   - TypeScript types/interfaces are updated and validated.
   - Integration tests cover API interactions.
3. API:
   - Endpoints handle versioning correctly.
   - Payloads include accurate version data.
4. UX/UI:
   - Version management is easy to use.
   - Students can clearly see the version tied to their submissions.

## Subtasks

### Subtask-1: Backend Model Refactoring

- **ID:** TASK-001-SUB-001
- **Status:** DRAFT
- **Estimated Hours:** 15
- **Dependencies:** None
- **Description:** Refactor `LearningTask` and create `LearningTaskVersion`.
- **Validation:** Models and migrations are implemented and tested.

### Subtask-2: Frontend Component Updates

- **ID:** TASK-001-SUB-002
- **Status:** DRAFT
- **Estimated Hours:** 10
- **Dependencies:** TASK-001-SUB-001
- **Description:** Update React components to support versioning.
- **Validation:** UI changes are functional and tested.

### Subtask-3: API Enhancements

- **ID:** TASK-001-SUB-003
- **Status:** DRAFT
- **Estimated Hours:** 8
- **Dependencies:** TASK-001-SUB-001
- **Description:** Extend API endpoints to handle versioning.
- **Validation:** Endpoints are functional and tested.

### Subtask-4: UX/UI Design

- **ID:** TASK-001-SUB-004
- **Status:** DRAFT
- **Estimated Hours:** 7
- **Dependencies:** None
- **Description:** Design and validate the version management interface.
- **Validation:** Interface is intuitive and meets requirements.

## Status Roll-up Rules

1. Task is considered DONE when:
   - All subtasks are marked as DONE.
   - All validation criteria are met.
   - Required documentation is complete.
2. Task Progress Calculation:
   - Completion % = (Completed Subtasks / Total Subtasks) * 100.
3. Status Inheritance Rules:
   - Parent task cannot be DONE if any subtask is not DONE.
   - Parent task is IN_PROGRESS if any subtask is IN_PROGRESS.

## Related Work

- TASK-002: Grading System Enhancements
- TASK-003: Submission Tracking Improvements

## Potential Risks

- Data migration issues.
- Increased complexity in task management.
- Potential API backward compatibility challenges.

## Notes

- Ensure thorough testing for all changes.
- Collaborate with the UX team for interface design.

<!-- Template Version: 2.0 -->
<!-- Last Updated: 2025-06-20 -->
