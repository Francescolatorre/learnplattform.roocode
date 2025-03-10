# Task Definition: Draft Model Update Plan

## Task ID
TASK-MODEL-UPDATE-PLAN-001

## Task Description
Draft a detailed plan for updating the data models across the learning platform, based on the accepted ADRs for model consolidation.

## Requirements
1.  **Course Model**:
    *   Base model: `learningplatform/models.py.Course`
    *   Incorporate attributes from `courses/models.py.Course`: `duration`, `difficulty_level`
    *   Standardize foreign key relationships (use explicit import for User model)
    *   Keep existing fields: `title`, `description`, `instructor`, `status`, `visibility`, `learning_objectives`, `prerequisites`
2.  **Task Model**:
    *   Base model: `learningplatform/models.py.Task`
    *   Consolidate `LearningTask`, `AssessmentTask`, and `QuizTask` from `tasks/models.py` into `learningplatform/models.py.Task`
    *   Use `task_type` field to differentiate task types (LEARNING, QUIZ, ASSESSMENT)
    *   Incorporate relevant attributes from `tasks/models.py`:
        *   `LearningTask`: `difficulty_level`, `max_submissions`
        *   `AssessmentTask`: `max_score`, `passing_score` (already in `learningplatform_backend.Task`)
        *   `QuizTask`: `time_limit`, `is_randomized`
    *   Remove complex inheritance structure from tasks app.
3.  **User Model**:
    *   Use `learningplatform/models.py.User` model (already consolidated)
    *   Ensure it extends `AbstractUser` and keeps `bio` and `profile_picture` attributes (already confirmed)
4.  **Dependencies**:
    *   Course Model: No direct dependencies.
    *   Task Model: Depends on Course model consolidation.
    *   User Model: No direct dependencies.
5.  **Migration Strategy**:
    *   For Course model, add new fields (`duration`, `difficulty_level`) and run migrations. Data migration might be needed for these new fields.
    *   For Task model, consolidate data from `LearningTask`, `AssessmentTask`, and `QuizTask` into `learningplatform_backend.Task`. This will require a data migration script to move and transform existing task data. After migration, remove `LearningTask`, `AssessmentTask`, and `QuizTask` models.
    *   User model requires no migration.
6.  **Testing**:
    *   Unit tests for Course, Task, and User models to ensure data integrity and functionality after consolidation.
    *   Integration tests to verify relationships between models and API endpoints.
    *   Test data regeneration to reflect the consolidated models.

## Validation Criteria
*   The model update plan must cover all requirements outlined above.
*   The plan must include a detailed migration strategy for Course and Task models.
*   The plan must include a testing strategy.
*   The plan must be reviewed and approved by the architect.

## Resources
*   ADR: Model Consolidation and Relationship Strategy
*   ADR: Model Consolidation Review
*   Existing model definitions in `courses/models.py`, `learningplatform/models.py`, and `tasks/models.py`

## Risks
*   Potential data loss during migration.
*   Potential breaking changes in existing code (serializers, views, forms).

## Communications
*   Communicate progress and any issues to the architect.

## Task Type
Planning

## Status
DONE

## Assigned To
Architect

## Dependencies
*   TASK-MODEL-CONSOLIDATION-002

## Started At
2025-02-28
