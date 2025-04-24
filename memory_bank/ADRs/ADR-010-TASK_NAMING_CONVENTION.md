# ADR-010: Task Naming Convention

## Overview

This document defines the standard naming convention for tasks in the Learning Platform project. Consistent task naming improves organization, searchability, and clarity across the project.

## Task File Naming Convention

All task files should follow this naming pattern:

```
TASK-[AREA]-[NUMBER]-[SHORT_DESCRIPTION].md
```

### Components

1. **TASK-**: Prefix that identifies the file as a task.
2. **[AREA]**: Functional area or component the task relates to (2-10 characters).
3. **[NUMBER]**: Three-digit sequential number within the area (e.g., 001, 002).
4. **[SHORT_DESCRIPTION]**: Brief, hyphenated description (optional, for clarity).
5. **.md**: Markdown file extension.

### Functional Areas

Use these standardized area codes:

| Area Code | Description | Example |
|-----------|-------------|---------|
| API | API-related tasks | TASK-API-001-OPENAPI-IMPLEMENTATION.md |
| UI | User Interface tasks | TASK-UI-001-PROGRESS-TRACKING.md |
| MODEL | Data model tasks | TASK-MODEL-001-SCHEMA-UPDATE.md |
| AUTH | Authentication tasks | TASK-AUTH-001-JWT-IMPLEMENTATION.md |
| TEST | Testing tasks | TASK-TEST-001-UNIT-TESTS.md |
| PERF | Performance tasks | TASK-PERF-001-CODE-SPLITTING.md |
| SEC | Security tasks | TASK-SEC-001-INPUT-VALIDATION.md |
| DOC | Documentation tasks | TASK-DOC-001-API-DOCS.md |
| FEAT | Feature implementation | TASK-FEAT-001-PERSONALIZED-LEARNING.md |
| INFRA | Infrastructure tasks | TASK-INFRA-001-CI-SETUP.md |

## Task Content Structure

Each task file should include the following sections:

```markdown
# [Task Title]

## Description
Brief description of the task.

## Status
Current status (DRAFT, VALIDATED, TODO, IN_PROGRESS, DONE, POSTPONED).

## Requirements
- Requirement 1
- Requirement 2

## Validation Criteria
- Criterion 1
- Criterion 2

## Dependencies
- Dependency 1
- Dependency 2

## Expected Outcome
Description of the expected outcome.

## Assigned To
Team or individual responsible.

## Timeline
- Started: [Date]
- Target Completion: [Date]
- Completed: [Date]

## Notes
Additional notes or context.
```

## Examples

### Good Examples

✅ `TASK-API-001-ENDPOINT-CREATION.md`
✅ `TASK-UI-002-FORM-VALIDATION.md`
✅ `TASK-MODEL-003-RELATIONSHIP-UPDATE.md`
✅ `TASK-FEAT-001-PERSONALIZED-LEARNING.md`

### Bad Examples

❌ `Task_API_LAYER_SETUP.md` (Inconsistent format, missing number)
❌ `Task-API-001 - API Endpoints for Task Management.md` (Spaces in filename, inconsistent format)
❌ `TASK-001.md` (Missing area code)
❌ `API_Implementation.md` (Missing TASK prefix and number)

## Implementation

1. All new tasks must follow this naming convention.
2. Existing tasks should be renamed during the task consolidation process.
3. References to tasks in other documents should be updated to reflect the new naming convention.

## Maintenance

This naming convention document should be reviewed and updated as needed to ensure it continues to meet the project's needs.
