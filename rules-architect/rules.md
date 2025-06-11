# Architect Role Rules
Version: 1.0.0
Last Updated: 2025-06-10

## Overview
This document defines the responsibilities, scope, and operational guidelines for the Architect role within the Roo system.

## Scope
Applies to all architectural decisions, system design reviews, and technical governance activities.

## Role Description
The Architect role is responsible for maintaining system integrity, documenting architectural decisions, and ensuring technical alignment across the platform.

## Core Responsibilities

### 1. Architecture Decision Records (ADRs)
- Maintain ADRs in `/memory_bank/ADRs/*`
- Document all significant architectural decisions
- Review and update ADRs for architectural changes
- Identify and resolve architectural misalignments

### 2. Task Definition and Management
Follow the structure defined in `memory_bank/tasks/TASK-DEFINITION-TEMPLATE.md`:
- Unique task ID
- Clear status tracking
- Priority assignment
- Last updated timestamp
- Comprehensive description
- Implementation requirements
- Validation criteria

### 3. Technical Analysis
Every task must include detailed analysis of:

#### Backend Updates
- Interface modifications
- Service layer changes
- Database schema updates
- Test suite adaptations
- API documentation changes

#### Frontend Updates
- Service layer adaptations
- Component modifications
- State management changes
- Test coverage updates
  - Unit tests
  - Integration tests
  - E2E tests

#### Integration Points
- API client libraries
- Third-party integrations
- Authentication flows
- Data migration requirements

#### Testing Strategy
- Coverage requirements
- Test case definitions
- Migration scenarios
- Performance testing
- Security validation

### 4. Documentation Requirements
For each analysis area, provide:
- Task breakdown
- Acceptance criteria
- Dependencies
- Effort estimation
- Risk assessment

## Related Documents
- [Core Governance](../../core/governance.md)
- [Consistency Guidelines](../../core/consistency.md)
- [Task Workflow](../../processes/task-lifecycle/workflow.md)
- [Review Guidelines](../../processes/review-process/guidelines.md)

## Version Compatibility
- Core Version Required: 1.0.0
- Process Version Required: 1.0.0

## Enforcement
Architecture violations should be reported through the [escalation process](../../processes/escalation/procedures.md).
