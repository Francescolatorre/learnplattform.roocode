# ADR-000: Structured Task Management

## Status

Proposed

## Context

The Learning Platform project requires a consistent approach to define, track, and manage tasks across distributed teams and autonomous agents. While issues and stories may originate in tools like Jira or GitHub, internal tasks form the operational building blocks for implementation, validation, and review.

To ensure a robust, automatable task workflow, we need to define:

* Task types and lifecycle stages
* Status semantics
* Role responsibilities
* Metadata requirements
* Principles for task decomposition and traceability

This ADR establishes those definitions.

## Decision

### 🎯 Task Definition

A **Task** is a self-contained unit of work that:

* Is described in a markdown file
* Follows the structure of `.roo/templates/task_template.md`
* Is version-controlled
* May be assigned to a person or agent
* May contain subtasks

### 📊 Task Status Lifecycle

| Status       | Description                                  |
| ------------ | -------------------------------------------- |
| DRAFT        | Unvalidated initial draft                    |
| VALIDATED    | Reviewed and ready for implementation        |
| TODO         | Scheduled but not yet started                |
| IN\_PROGRESS | Actively being worked on                     |
| REVIEW       | Work done, pending review                    |
| DONE         | Implementation and validation complete       |
| POSTPONED    | Deferred, blocked, or not currently relevant |

Only `VALIDATED` tasks can move to `TODO` or `IN_PROGRESS`.

### 🧑‍🤝‍🧑 Roles & Responsibilities

| Role         | Responsibility                              |
| ------------ | ------------------------------------------- |
| Author       | Creates the task, drafts metadata & context |
| Validator    | Confirms feasibility, requirements, clarity |
| Implementer  | Completes the technical work                |
| Reviewer     | Performs review based on checklist          |
| Orchestrator | (optional) assigns agents or tracks status  |

A task may have multiple roles fulfilled by one person or agent.

### 🧩 Task Composition & Modularity

Tasks may:

* Contain nested **subtasks** (`[TASK-ID]-SUB-[XXX]`)
* Reference **dependencies** or **parent tasks**
* Be grouped in **milestones** or **epics**

All subtasks must be DONE for the parent to reach DONE.

### 🏷 Metadata Requirements

Each task must include:

* Unique `Task-ID`
* Owner and status
* Timestamps (`Last Updated`)
* Time tracking fields
* Completion percentage or progress metrics

These are specified in `## Task Metadata` per `TASK_TEMPLATE.md`.

### ⚙️ Automation Support

Tasks are designed to support:

* Agent execution plans
* Automatic status roll-ups
* Programmatic parsing and visualization
* Version control integration (e.g. via pre-commit hooks)

## Consequences

* Tasks become traceable, auditable, and delegatable.
* Progress can be summarized across task hierarchies.
* Human and agent collaboration is standardized.

## Related

* `TASK_TEMPLATE.md`
* `ADR-016-TASK_NAMING_CONVENTION.md`

## Last Updated

2025-06-22
