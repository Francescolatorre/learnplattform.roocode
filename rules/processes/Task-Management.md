# Task Management Lifecycle (with Subtask Governance)

Version: 1.1.0
Last Updated: 2025-06-11

---

## Overview

This document consolidates the standard workflow for task handling across all roles in the Roo system, including robust subtask governance, status validation, and review processes. It applies to all tasks and subtasks handled by any role, including architectural decisions, code implementation, debugging, and design work.

---

## Task & Subtask States

### Parent Task States

| Status       | Role           | Description & Responsibilities |
|--------------|----------------|-------------------------------|
| `DRAFT`      | Digital Design | - Define high-level requirements and subtask structure<br>- Create initial subtask breakdown<br>- Set preliminary dependencies |
| `VALIDATED`  | Digital Design | - Verify completeness of subtask structure<br>- Validate subtask dependencies<br>- Ensure business alignment across all subtasks |
| `TODO`       | Architect      | - Review technical feasibility of subtasks<br>- Identify cross-cutting concerns<br>- Allocate resources for subtask implementation |
| `IN_PROGRESS`| Code           | - Coordinate subtask implementation<br>- Monitor subtask dependencies<br>- Update parent task progress based on subtask completion |
| `REVIEW`     | Architect      | - Validate subtask implementations<br>- Verify overall solution cohesion<br>- Approve parent task completion |
| `DONE`       | Code           | - Ensure all subtasks are completed<br>- Verify integration of subtask components<br>- Complete parent task documentation |
| `BLOCKED`    | Any            | - Progress impeded<br>- Blockers documented<br>- Escalation initiated<br>- Dependencies tracked |

### Subtask States

| Status       | Description |
|--------------|-------------|
| `DRAFT`      | Initial subtask definition and scoping |
| `IN_PROGRESS`| Active development or implementation |
| `DONE`       | Completed and validated |

---

## Task & Subtask Lifecycle Steps

### 1. Task Creation

- Use standardized template
- Provide clear description
- Define initial scope
- List known requirements
- Initialize task in `activeContext.md`

### 2. Task Triage

- Assess priority
- Identify dependencies
- Assign appropriate role
- Set initial timeline
- Update priority in `activeContext.md`

### 3. Task Execution

- Validate requirements
- Update task status in `activeContext.md`
- Document progress
- Handle blockers
- Maintain communication
- Record implementation patterns in `progress.md`

### 4. Task Review

- Verify requirements
- Run test suites
- Check documentation
- Validate changes
- Update status in both tracking files

### 5. Task Completion

- Final verification
- Update documentation
- Close related items
- Archive task data
- Move task record to `progress.md`

---

## Subtask Governance & Status Roll-up

### Completion Criteria for Nested Tasks

#### Parent Task Completion Requirements

- All subtasks must be marked as `DONE`
- Integration tests must pass across all subtasks
- Documentation must be complete for parent and subtasks
- All validation criteria met at both levels

#### Subtask Completion Requirements

- Individual acceptance criteria met
- Unit tests passing
- Code review approved
- Documentation updated
- No blocking issues

### Progress Calculation

```
Parent Completion = (Completed Subtasks / Total Subtasks) * 100%
```

### Status Inheritance

- **Parent → Subtask**: Dependencies cascade down, access permissions and priority inherited
- **Subtask → Parent**: Blocking issues escalate up, progress rolls up, status affects parent completion

### Automation Requirements

- Real-time progress calculation
- Automated status updates based on subtask changes
- Dependency validation on status changes
- Notification system for status transitions

---

## Role Responsibilities

### Digital Design

- Create logical subtask breakdowns
- Define clear boundaries between subtasks
- Set initial priorities and dependencies

### Architect

- System-level impact assessment
- Review technical feasibility of subtask structure
- Identify shared components and cross-cutting concerns
- Define integration points between subtasks
- Technical direction and design validation

### Code

- Implement subtasks according to specifications
- Maintain subtask status accuracy
- Report blocking issues and dependencies
- Testing, documentation, and code review

### Debug

- Issue investigation
- Problem diagnosis
- Solution verification
- Regression testing

---

## Status Validation & Documentation Requirements

### Task Status Tracking Files

As defined in [ADR-018](../../memory_bank/ADRs/ADR-018-Task-Status-Tracking-Files-Structure.md), the system uses two primary files for tracking task status:

#### activeContext.md

- Purpose: Real-time project status dashboard
- Content:
  - Current phase and project status
  - Active tasks and their states
  - Current blockers and challenges
  - Resource requirements
  - Priority TODO items
  - Next steps
- Update Frequency: As changes occur (real-time)
- Authoritative For:
  - Active tasks
  - Current priorities
  - Real-time status

#### progress.md

- Purpose: Historical record and analysis
- Content:
  - Chronological task completion timeline
  - Implementation patterns
  - Quality metrics
  - Major milestones
  - Technical debt tracking
  - Long-term planning
- Update Frequency: Upon task completion or significant milestones
- Authoritative For:
  - Completed tasks
  - Task history
  - Implementation patterns

### Status Change Prerequisites

- All required fields populated
- Dependencies checked
- Previous state requirements met
- Required approvals obtained
- Status changes reflected in appropriate tracking file

### Documentation Requirements

- Updated progress metrics in both tracking files
- Status change justification
- Remaining work identified
- Risks and blockers documented
- Implementation patterns recorded in `progress.md`
- Real-time status maintained in `activeContext.md`

---

## Review Process

### Hierarchical Review Flow

1. Individual Subtask Review
   - Code review
   - Unit test verification
   - Documentation check
2. Integration Review
   - Cross-subtask testing
   - Interface verification
   - Performance validation
3. Final Parent Task Review
   - Complete solution review
   - Business requirement validation
   - Final approval

---

## Related Documents

- [ADR-018: Task Status Tracking Files Structure](../../memory_bank/ADRs/ADR-018-Task-Status-Tracking-Files-Structure.md)
- [Inconsistency Resolution Guide](./inconsistency_resolution.md)
- [Task Workflow](./task-lifecycle/workflow.md)
- [Review Guidelines](./review-process/guidelines.md)
