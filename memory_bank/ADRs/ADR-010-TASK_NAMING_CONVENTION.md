# ADR-010: Task Naming Convention

## Overview

This document defines the standard naming convention and content structure for tasks in the Learning Platform project. Consistent task documentation improves organization, searchability, and workflow management across the project.

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

### Required Sections and Order

1. **Title and Metadata Block**

```markdown
# {Task Title}

## Task Metadata
- **Task-ID:** TASK-{AREA}-{NUMBER}
- **Status:** {DRAFT|VALIDATED|TODO|IN_PROGRESS|REVIEW|DONE|BLOCKED}
- **Owner:** {Current responsible role}
- **Created:** YYYY-MM-DD HH:MM:SS
- **Updated:** YYYY-MM-DD HH:MM:SS
- **Priority:** {High|Medium|Low}
- **Effort:** {Story points or time estimate}
```

2. **Description**

```markdown
## Description
{Clear task description with context and goals}
```

3. **Requirements**

```markdown
## Requirements
- Functional requirements
- Technical requirements
- Business requirements
```

4. **Validation Criteria**

```markdown
## Validation Criteria
- Specific, measurable acceptance criteria
- Test requirements
- Quality metrics
```

5. **Dependencies**

```markdown
## Dependencies
- Required predecessor tasks
- External dependencies
- System dependencies
```

### Optional Sections

6. **Implementation Plan**

```markdown
## Implementation Plan
- Phase breakdown
- Technical approach
- Resource allocation
```

7. **Notes**

```markdown
## Notes
Additional context, decisions, or implementation details
```

8. **Timeline**

```markdown
## Timeline
- Started: [Date]
- Target: [Date]
- Completed: [Date]
```

## Status Tracking Requirements

### Status Change Documentation

Each status change must include:

- Timestamp of change
- Role making the change
- Reason for change
- Reference to progress.md entry

### Valid Status Transitions

1. `DRAFT` → `VALIDATED` (Digital Design)
2. `VALIDATED` → `TODO` (Architect)
3. `TODO` → `IN_PROGRESS` (Code)
4. `IN_PROGRESS` → `REVIEW` (Code)
5. `REVIEW` → `DONE` (Architect)
6. Any → `BLOCKED` (Any role)

### Status Change Example

```markdown
## Status History
- **2025-06-13 08:00:00** | DRAFT → VALIDATED
  - By: Digital Design
  - Reason: Requirements complete and verified
  - Progress: Initial scope defined, ready for technical review
```

## Validation Requirements

### Metadata Validation

- All required metadata fields present
- Valid status value
- Current owner matches status
- Timestamps in correct format
- Valid priority level

### Content Validation

- Description is clear and complete
- Requirements are specific and measurable
- Validation criteria defined
- Dependencies identified
- Implementation plan provided for TODO or later status

### Role-Based Validation

- Digital Design: Requirements completeness
- Architect: Technical feasibility
- Code: Implementation details
- All: Blocking issues documented

## Examples

### Good Examples

✅ `TASK-API-001-ENDPOINT-CREATION.md`
✅ `TASK-UI-002-FORM-VALIDATION.md`
✅ `TASK-MODEL-003-RELATIONSHIP-UPDATE.md`
✅ `TASK-FEAT-001-PERSONALIZED-LEARNING.md`

### Bad Examples

❌ `Task_API_LAYER_SETUP.md` (Inconsistent format, missing number)
❌ `Task-API-001 - API Endpoints for Task Management.md` (Spaces in filename)
❌ `TASK-001.md` (Missing area code)
❌ `API_Implementation.md` (Missing TASK prefix and number)

## Implementation

1. All new tasks must follow this convention
2. Existing tasks should be renamed during the task consolidation process
3. References to tasks in other documents should be updated
4. Task status tracking must be synchronized between:
   - Task file
   - activeContext.md
   - progress.md

## Maintenance

This convention should be reviewed quarterly and updated as needed to ensure it continues to meet the project's needs.

## Version History

- 2.0.0 (2025-06-13)
  - Added detailed metadata requirements
  - Added status tracking requirements
  - Added role-based validation
  - Enhanced content structure requirements
- 1.0.0 (Initial version)
  - Basic naming convention
  - Basic content structure
