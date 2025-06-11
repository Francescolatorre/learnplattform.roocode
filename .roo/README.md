# Roo Code Modules Documentation

## Project Overview
The Roo code modules system is a sophisticated governance framework that manages and coordinates different roles, processes, and tasks within the learning platform codebase. This documentation serves as the central reference point for understanding how the various components work together.

## Directory Structure

```
rules/
├── core/                    # Core governance principles and rules
│   ├── consistency.md      # Consistency guidelines
│   ├── governance.md       # Fundamental governance principles
│   └── versioning.md       # Version control standards
├── processes/              # Process-specific documentation
│   ├── escalation/        # Escalation procedures
│   ├── review-process/    # Review guidelines
│   └── task-lifecycle/    # Task workflow management
└── roles/                 # Role-specific rules
    ├── architect/         # Architect role guidelines
    ├── code/             # Code role specifications
    ├── debug/            # Debug role protocols
    └── digital-design/   # Digital Design role standards
```

## Rule Hierarchy and Precedence

1. **Core Rules** (`rules/core/*.md`)
   - Establish fundamental governance principles
   - Define system-wide standards
   - Take precedence over role-specific rules
   - Must be followed by all roles and processes

2. **Role-Based Rules** (`rules/roles/*/rules.md`)
   - Define role-specific responsibilities
   - Outline operational boundaries
   - Must align with core governance principles
   - Include role-specific workflows and standards

3. **Process Rules** (`rules/processes/*/*.md`)
   - Define workflows and procedures
   - Establish cross-role interactions
   - Detail escalation paths
   - Specify validation requirements

## How to Use This Repository

1. Start with `core/governance.md` to understand fundamental principles
2. Review your role-specific rules in `roles/<your-role>/rules.md`
3. Follow task lifecycle documentation in `processes/task-lifecycle/workflow.md`
4. Reference process-specific guidelines as needed
5. Use escalation procedures when encountering blockers

## Version Control Guidelines

1. All rule documents follow semantic versioning (MAJOR.MINOR.PATCH)
2. Version compatibility is checked across related documents
3. Changes must maintain cross-document consistency
4. Version updates require architectural review
5. Documentation must be updated with code changes

## Quick Start Guide

1. **For New Tasks**
   - Check task state definitions in `task-lifecycle/workflow.md`
   - Follow role-specific task handling procedures
   - Ensure all required documentation is completed

2. **For Existing Tasks**
   - Review current task status
   - Follow role transition protocols
   - Update documentation as you progress
   - Maintain task state consistency

3. **For Issue Resolution**
   - Follow escalation procedures in `processes/escalation/procedures.md`
   - Document all decisions and changes
   - Update relevant documentation
   - Ensure proper handoff between roles

## Contributing Guidelines

1. **Documentation Updates**
   - Follow the established document structure
   - Maintain cross-references between related documents
   - Include version information
   - Update all affected documents together

2. **Rule Changes**
   - Propose changes through established channels
   - Include impact analysis
   - Maintain backwards compatibility where possible
   - Follow versioning guidelines

3. **Quality Standards**
   - Clear and concise documentation
   - Consistent formatting
   - Updated cross-references
   - Complete version information

4. **Review Requirements**
   - Technical accuracy
   - Consistency with existing rules
   - Clear and understandable content
   - Proper cross-referencing

## Related Core Documents

- [Core Governance](core/governance.md)
- [Consistency Guidelines](core/consistency.md)
- [Versioning Strategy](core/versioning.md)

## Role-Specific Rules

- [Architect Rules](roles/architect/rules.md)
- [Code Rules](roles/code/rules.md)
- [Debug Rules](roles/debug/rules.md)
- [Digital Design Rules](roles/digital-design/rules.md)

## Process Documentation

- [Task Lifecycle Workflow](processes/task-lifecycle/workflow.md)
- [Review Guidelines](processes/review-process/guidelines.md)
- [Escalation Procedures](processes/escalation/procedures.md)
