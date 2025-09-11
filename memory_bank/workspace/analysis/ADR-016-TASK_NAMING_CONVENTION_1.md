# ADR-016: Task Naming and Content Structure Convention

## Status

Accepted

## Context

To ensure clarity, consistency, and machine-readability of task definitions in the Learning Platform project, we define a standard for task filenames and content structure. This replaces earlier inconsistent formats and aligns with agentic workflows and automation.

## Decision

### 📛 Task Filename Convention

All task files must follow the naming convention:

```
TASK-[NUMBER]-[AREA]-[SHORT_DESCRIPTION].md
```

#### Components

* `TASK-`: Static prefix
* `[NUMBER]`: Unique task identifier
* `[AREA]`: Functional domain (must be selected from the list below)
* `[SHORT_DESCRIPTION]`: Hyphenated, human-readable label

#### Approved AREA Codes

| Code  | Description                  |
| ----- | ---------------------------- |
| API   | Backend or API-related work  |
| UI    | User interface               |
| MODEL | Data modeling                |
| AUTH  | Authentication/authorization |
| TEST  | Testing and quality          |
| PERF  | Performance optimization     |
| SEC   | Security-related tasks       |
| DOC   | Documentation                |
| FEAT  | New feature development      |
| INFRA | Infrastructure, CI/CD        |

#### Examples

✅ `TASK-021-API-USER-ENDPOINT.md`
✅ `TASK-057-FEAT-CUSTOM-ASSESSMENTS.md`

### 🗂 Required Task Structure

Each task must conform to the structure defined in `TASK_TEMPLATE.md` (v1.1), which includes the following **required sections**:

1. `## Task Metadata`

   * Task-ID
   * Status, Priority, Owner
   * Time Tracking (Estimated, Spent, Remaining)

2. `## Business Context`

3. `## Requirements`

   * User Stories
   * Acceptance Criteria
   * Technical Requirements

4. `## Implementation`

   * Technical Approach
   * Dependencies
   * Test Strategy

5. `## Documentation`

6. `## Risk Assessment`

7. `## Progress Tracking`

8. `## Review Checklist`

9. `## Notes`

Optional sections include `## Subtasks`, `## Future Considerations`, or agent-specific blocks for automated code agents.

All headings must follow markdown syntax exactly to support programmatic parsing.

### 🔁 Task Updates

* Each change to a task file must retain previous metadata.
* `Last Updated` must reflect the most recent edit.
* Review checklist entries must be updated during review.

### 🧠 Agent Support

Tasks may include agent-compatible extensions (e.g. `Agent Interface`, `Feedback Loop Metadata`, `Output Artifacts`) for AI-assisted implementation. These are optional but recommended for auto-generative workflows.

## Consequences

* Tasks are easier to navigate, version, and process (by both humans and tools).
* Onboarding for new contributors is streamlined.
* Task files are compatible with future automation and agent orchestration.

## Related

* `TASK_TEMPLATE.md` (v1.1)
* `ADR-000-STRUCTURED_TASK_MANAGEMENT.md`

## Last Updated

2025-06-22
