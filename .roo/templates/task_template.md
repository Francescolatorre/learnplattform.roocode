# Task: [Task Title]

## Task Metadata

- **Task-ID:** [TASK-ID]
- **Status:** [DRAFT|VALIDATED|TODO|IN_PROGRESS|DONE|REVIEW|POSTPONED]
- **Priority:** [High|Medium|Low]
- **Last Updated:** [YYYY-MM-DD]

### Time Tracking

- **Estimated Hours:** [Number] <!-- Total estimated hours for the task -->
- **Hours Spent:** [Number] <!-- Actual hours spent on the task -->
- **Remaining Hours:** [Number] <!-- Calculated: Estimated - Spent -->

### Task Relationships

- **Has Subtasks:** [Yes|No]
- **Parent Task:** [PARENT-TASK-ID|None] <!-- Reference to parent task if this is a subtask -->
- **Dependencies:** [List of dependent tasks]

### Progress Metrics

- **Completion:** [0-100]% <!-- Overall completion percentage -->
- **Active Subtasks:** [Number] <!-- Count of IN_PROGRESS subtasks -->
- **Total Subtasks:** [Number] <!-- Total number of subtasks -->

## Description

[Detailed task description]

## Requirements

1. [Requirement 1]
2. [Requirement 2]
...

## Implementation Details

[Technical approach, architecture considerations, etc.]

## Validation Criteria

1. [Criterion 1]
2. [Criterion 2]
...

## Subtasks

<!-- Begin Subtasks Section -->
<!-- Each subtask follows a nested structure with its own metadata -->

### Subtask-1: [Subtask Title]

- **ID:** [TASK-ID]-SUB-001
- **Status:** [DRAFT|IN_PROGRESS|DONE]
- **Estimated Hours:** [Number]
- **Dependencies:** [List of dependent subtask IDs]
- **Description:** [Brief description]
- **Validation:** [Specific validation criteria]

### Subtask-2: [Subtask Title]

- **ID:** [TASK-ID]-SUB-002
- **Status:** [DRAFT|IN_PROGRESS|DONE]
- **Estimated Hours:** [Number]
- **Dependencies:** [List of dependent subtask IDs]
- **Description:** [Brief description]
- **Validation:** [Specific validation criteria]

<!-- End Subtasks Section -->

## Status Roll-up Rules

<!-- Automated status calculation based on subtasks -->
1. Task is considered DONE when:
   - All subtasks are marked as DONE
   - All validation criteria are met
   - Required documentation is complete

2. Task Progress Calculation:
   - Completion % = (Completed Subtasks / Total Subtasks) * 100
   - Subtask weights can be adjusted in metadata if needed

3. Status Inheritance Rules:
   - Parent task cannot be DONE if any subtask is not DONE
   - Parent task is IN_PROGRESS if any subtask is IN_PROGRESS
   - All subtasks inherit dependencies from parent task

4. Validation Requirements:
   - Each subtask must have defined validation criteria
   - Parent task validation must encompass subtask validations
   - Status changes require validation criteria check

## Related Work

- [Reference to related tasks or resources]

## Potential Risks

- [Risk 1]
- [Risk 2]
...

## Notes

[Additional information]

<!-- Template Version: 2.0 -->
<!-- Last Updated: 2025-06-10 -->
