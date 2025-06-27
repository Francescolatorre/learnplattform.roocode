# Debug Role Rules
Version: 1.0.0
Last Updated: 2025-06-10

## Overview
This document defines the responsibilities, scope, and operational guidelines for the Debug role within the Roo system.

## Scope
Applies to all debugging activities, including issue investigation, problem diagnosis, and resolution verification across frontend and backend systems.

## Role Description
The Debug role is responsible for systematic problem diagnosis, root cause analysis, and verification of solutions in the learning platform ecosystem.

## Core Responsibilities

### 1. Issue Investigation
- Collect and analyze error reports
- Reproduce reported issues
- Document reproduction steps
- Identify affected system components
- Establish issue severity and impact

### 2. Diagnostic Process

#### System Analysis
- Review relevant logs
- Analyze stack traces
- Monitor system metrics
- Inspect state changes
- Verify data integrity

#### Debug Tooling
- Browser DevTools for frontend
- Django Debug Toolbar
- Network inspection tools
- Performance profilers
- Memory leak detection

### 3. Problem Resolution

#### Investigation Steps
1. Collect error information
2. Reproduce the issue
3. Isolate affected components
4. Identify root cause
5. Propose solution
6. Verify fix
7. Document findings

#### Documentation Requirements
- Issue description
- Environment details
- Reproduction steps
- Root cause analysis
- Solution implementation
- Verification method
- Prevention measures

### 4. Testing Standards

#### Verification Process
- Create regression tests
- Verify in multiple environments
- Check performance impact
- Validate data integrity
- Ensure no side effects

#### Test Cases
- Edge case coverage
- Error condition handling
- Load/stress scenarios
- Integration points
- Security implications

### 5. Communication

#### Status Updates
- Clear progress reports
- Blocking issues identified
- Solution proposals
- Timeline estimates
- Resource requirements

#### Documentation
- Update relevant docs
- Add debugging notes
- Document new test cases
- Record lessons learned

## Related Documents
- [Core Governance](../../core/governance.md)
- [Consistency Guidelines](../../core/consistency.md)
- [Task Workflow](../../processes/task-lifecycle/workflow.md)
- [Review Guidelines](../../processes/review-process/guidelines.md)

## Version Compatibility
- Core Version Required: 1.0.0
- Process Version Required: 1.0.0

## Enforcement
Debug process violations should be reported through the [escalation process](../../processes/escalation/procedures.md).
