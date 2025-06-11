# 📋 Task Management Lifecycle with Subtask Support

## 🔄 Task States & Role Responsibilities

### Parent Task States

| Status       | Role           | Description & Responsibilities |
|--------------|----------------|-------------------------------|
| `DRAFT`      | Digital Design | - Define high-level requirements and subtask structure<br>- Create initial subtask breakdown<br>- Set preliminary dependencies |
| `VALIDATED`  | Digital Design | - Verify completeness of subtask structure<br>- Validate subtask dependencies<br>- Ensure business alignment across all subtasks |
| `TODO`       | Architect     | - Review technical feasibility of subtasks<br>- Identify cross-cutting concerns<br>- Allocate resources for subtask implementation |
| `IN_PROGRESS`| Code          | - Coordinate subtask implementation<br>- Monitor subtask dependencies<br>- Update parent task progress based on subtask completion |
| `DONE`       | Code          | - Ensure all subtasks are completed<br>- Verify integration of subtask components<br>- Complete parent task documentation |
| `REVIEW`     | Architect     | - Validate subtask implementations<br>- Verify overall solution cohesion<br>- Approve parent task completion |

### Subtask States

| Status       | Description |
|--------------|-------------|
| `DRAFT`      | Initial subtask definition and scoping |
| `IN_PROGRESS`| Active development or implementation |
| `DONE`       | Completed and validated |

## 🎯 Completion Criteria for Nested Tasks

### Parent Task Completion Requirements

- All subtasks must be marked as `DONE`
- Integration tests must pass across all subtasks
- Documentation must be complete for parent and subtasks
- All validation criteria met at both levels

### Subtask Completion Requirements

- Individual acceptance criteria met
- Unit tests passing
- Code review approved
- Documentation updated
- No blocking issues

## 📊 Status Roll-up Rules

### Progress Calculation

```
Parent Completion = (Completed Subtasks / Total Subtasks) * 100%
```

### Status Inheritance

1. Parent → Subtask
   - Dependencies cascade down
   - Access permissions inherited
   - Priority level impacts inherited

2. Subtask → Parent
   - Blocking issues escalate up
   - Progress rolls up
   - Status affects parent completion

### Automation Requirements

- Real-time progress calculation
- Automated status updates based on subtask changes
- Dependency validation on status changes
- Notification system for status transitions

## 👥 Role Responsibilities

### Digital Design

- Create logical subtask breakdowns
- Define clear boundaries between subtasks
- Set initial priorities and dependencies

### Architect

- Review technical feasibility of subtask structure
- Identify shared components and cross-cutting concerns
- Define integration points between subtasks

### Code

- Implement subtasks according to specifications
- Maintain subtask status accuracy
- Report blocking issues and dependencies

## ⚡ Status Validation Requirements

### Status Change Prerequisites

- All required fields populated
- Dependencies checked
- Previous state requirements met
- Required approvals obtained

### Documentation Requirements

- Updated progress metrics
- Status change justification
- Remaining work identified
- Risks and blockers documented

## 🔄 Review Process

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

## 🚨 Escalation Paths

### Technical Blockers

1. Code → Tech Lead
2. Tech Lead → Architect
3. Architect → Technical Steering Committee

### Business Blockers

1. Implementation Team → Product Owner
2. Product Owner → Business Stakeholders
3. Stakeholders → Steering Committee

### Timeline Impacts

1. Team Lead → Project Manager
2. Project Manager → Program Manager
3. Program Manager → Steering Committee
