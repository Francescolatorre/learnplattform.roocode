# Rule Versioning Strategy
Version: 1.0.0
Last Updated: 2025-06-10

## Overview
This document defines the versioning strategy for all Roo rule documents, ensuring coordinated evolution of the governance system.

## Scope
Applies to all rule documents, including core principles, role-specific rules, and process definitions.

## Version Number Format

### Semantic Versioning
All rule documents follow semantic versioning (MAJOR.MINOR.PATCH):
- MAJOR: Breaking changes that affect multiple roles or processes
- MINOR: Backwards-compatible additions or modifications
- PATCH: Documentation improvements or clarifications

### Version Synchronization
- Core documents (governance.md, consistency.md, versioning.md) share major version numbers
- Role-specific rules may have independent version numbers but must reference compatible core versions
- Process documents version independently but must maintain compatibility

## Version Update Rules

### 1. Major Version Updates (X.0.0)
- Require full system review
- Must be approved through [review process](../processes/review-process/guidelines.md)
- Trigger updates in all dependent documents
- Require migration plan for existing processes

### 2. Minor Version Updates (0.X.0)
- Can be role-specific
- Must maintain backwards compatibility
- Require documentation of changes
- Need review from affected roles

### 3. Patch Updates (0.0.X)
- Documentation improvements
- Clarification of existing rules
- No functional changes
- Minimal review required

## Version History Management
- Maintain changelog in each document
- Record rationale for version changes
- Document migration steps for major updates

## Compatibility Requirements
- Role-specific rules must declare compatible core version
- Process documents must specify minimum required versions
- Cross-references must include version constraints

## Related Documents
- [Core Governance](governance.md)
- [Consistency Guidelines](consistency.md)
- [Review Guidelines](../processes/review-process/guidelines.md)

## Enforcement
Version incompatibilities should be reported through the [escalation process](../processes/escalation/procedures.md).
