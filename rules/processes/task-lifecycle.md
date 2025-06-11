# Task Lifecycle Workflow
Version: 1.0.0
Last Updated: 2025-06-10

## Overview
This document defines the standard workflow for task handling across all roles in the Roo system.

## Scope
Applies to all tasks handled by any role within the system, including architectural decisions, code implementation, debugging, and design work.

## Task States

### 1. NEW
- Initial task creation
- Basic description provided
- Awaiting triage
- No role assignment

### 2. TRIAGED
- Priority assigned
- Role(s) identified
- Initial requirements documented
- Dependencies noted

### 3. IN_PROGRESS
- Role actively working
- Requirements confirmed
- Updates being logged
- Blockers identified

### 4. REVIEW
- Implementation complete
- Pending verification
- Documentation updated
- Tests completed

### 5. DONE
- Requirements met
- Tests passed
- Documentation complete
- Changes verified

### 6. BLOCKED
- Progress impeded
- Blockers documented
- Escalation initiated
- Dependencies tracked

## Workflow Steps

### 1. Task Creation
- Use standardized template
- Provide clear description
- Define initial scope
- List known requirements

### 2. Task Triage
- Assess priority
- Identify dependencies
- Assign appropriate role
- Set initial timeline

### 3. Task Execution
- Validate requirements
- Update task status
- Document progress
- Handle blockers
- Maintain communication

### 4. Task Review
- Verify requirements
- Run test suites
- Check documentation
- Validate changes

### 5. Task Completion
- Final verification
- Update documentation
- Close related items
- Archive task data

## Role Responsibilities

### Architect Role
- System-level impact assessment
- Technical direction
- Architecture alignment
- Design validation

### Code Role
- Implementation
- Testing
- Documentation
- Code review

### Debug Role
- Issue investigation
- Problem diagnosis
- Solution verification
- Regression testing

### Digital Design Role
- Requirements clarity
- Design specifications
- UX validation
- Implementation guidance

## Related Documents
- [Core Governance](../../core/governance.md)
- [Consistency Guidelines](../../core/consistency.md)
- [Review Guidelines](../review-process/guidelines.md)
- [Escalation Procedures](../escalation/procedures.md)

## Version Compatibility
- Core Version Required: 1.0.0
- Process Version Required: 1.0.0

## Enforcement
Workflow violations should be reported through the [escalation process](../escalation/procedures.md).
