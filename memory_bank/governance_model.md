# Governance Model

## Overview

This document defines the governance model for the Learning Platform project, including mode interactions, task management, and memory bank usage guidelines. It serves as the authoritative reference for how different modes collaborate to accomplish project goals.

## Mode Interaction Protocol

### Mode Definitions and Responsibilities

1. **Architect Mode**
   - **Primary Responsibility**: High-level system design, task planning, and architectural decisions
   - **File Access**: Can only edit markdown files (`.md`)
   - **Key Activities**:
     - Create and maintain architectural documentation
     - Define tasks and requirements
     - Review code mode implementations
     - Make architectural decisions
     - Validate completed tasks
     - Plan project roadmap

2. **Code Mode**
   - **Primary Responsibility**: Implementation of tasks and requirements
   - **File Access**: Can edit all file types
   - **Key Activities**:
     - Implement features according to requirements
     - Write tests
     - Fix bugs
     - Refactor code
     - Validate implementations against requirements
     - Document technical details

3. **Debug Mode**
   - **Primary Responsibility**: Systematic problem diagnosis and resolution
   - **File Access**: Can edit all file types
   - **Key Activities**:
     - Diagnose issues
     - Fix bugs
     - Improve error handling
     - Optimize performance
     - Document debugging processes

4. **Ask Mode**
   - **Primary Responsibility**: Answering questions and providing information
   - **File Access**: Read-only
   - **Key Activities**:
     - Provide information about the project
     - Answer technical questions
     - Explain architectural decisions
     - Clarify requirements

5. **Digital Design Mode**
   - **Primary Responsibility**: Requirements engineering and digital design
   - **File Access**: Can edit markdown files (`.md`)
   - **Key Activities**:
     - Define user requirements
     - Create user stories
     - Design user interfaces
     - Document user flows
     - Validate requirements against business needs

### Mode Switching Protocol

1. **Architect to Code Handoff**
   - Architect mode creates a task in `activeContext.md` with status `TODO`
   - Architect mode adds the task to `progress.md`
   - Architect mode requests switch to Code mode
   - Code mode acknowledges receipt by updating status to `IN_PROGRESS`
   - Code mode implements the task

2. **Code to Architect Handoff**
   - Code mode completes implementation
   - Code mode updates task status to `DONE`
   - Code mode provides implementation details
   - Code mode requests switch to Architect mode
   - Architect mode validates the implementation
   - Architect mode activates the next task

3. **Emergency Mode Switching**
   - If a blocking issue is encountered that requires expertise from another mode
   - Current mode documents the issue in `activeContext.md`
   - Current mode requests switch to appropriate mode
   - Target mode addresses the issue
   - Target mode requests switch back to original mode

## Task Management Process

### Task Lifecycle

1. **Task Creation (Architect Mode)**
   - Create task definition in `memory_bank/tasks/{TASK-ID}.md`
   - Add task to `progress.md` with status `TODO`
   - Define clear requirements and validation criteria
   - Specify dependencies if any
   - Switch to Code mode for implementation

2. **Task Implementation (Code Mode)**
   - Update task status to `IN_PROGRESS` in all relevant files
   - Implement requirements according to specifications
   - Follow best practices and coding standards
   - Document implementation details
   - Run tests to validate implementation

3. **Task Validation (Code Mode)**
   - Verify implementation against validation criteria
   - Document any issues or limitations
   - Update task status to `DONE`
   - Switch to Architect mode for review

4. **Task Review (Architect Mode)**
   - Review implementation against requirements
   - Validate code quality and adherence to best practices
   - Update documentation if needed
   - Activate next task or create new tasks

### Task Prioritization

1. **Critical Path Tasks**
   - Tasks that block other tasks are prioritized
   - Dependencies are clearly documented
   - Progress is tracked in `progress.md`

2. **Task Postponement**
   - Tasks can be postponed if higher priority tasks emerge
   - Postponed tasks are moved to "Postponed Tasks" section in `progress.md`
   - Reason for postponement is documented

3. **Task Dependencies**
   - Dependencies are specified in task definition
   - Tasks with dependencies are only activated when dependencies are completed
   - Circular dependencies are avoided

## Memory Bank Usage Guidelines

### File Purposes and Maintenance

1. **activeContext.md**
   - Contains the current active task
   - Updated at the beginning and end of each task
   - Includes recent changes and next steps
   - Single source of truth for current work

2. **progress.md**
   - Tracks all tasks: completed, in progress, postponed, and upcoming
   - Updated when task status changes
   - Provides overview of project progress
   - Includes completion dates and summaries

3. **tasks/{TASK-ID}.md**
   - Contains detailed task definition
   - Includes requirements, validation criteria, and dependencies
   - Updated when task status changes
   - Serves as reference for implementation

4. **ADRs.md**
   - Documents architectural decisions
   - Follows structured format for decision records
   - Updated when new architectural decisions are made
   - Provides context for technical choices

5. **systemPatterns.md**
   - Documents system architecture and patterns
   - Updated when architectural changes are made
   - Serves as reference for implementation
   - Ensures consistency across the system

6. **techContext.md**
   - Documents technologies used
   - Includes development setup instructions
   - Lists technical constraints
   - Updated when technology stack changes

7. **productContext.md**
   - Documents product vision and requirements
   - Includes functional and non-functional requirements
   - Serves as reference for feature implementation
   - Updated when product requirements change

### Information Flow Between Files

1. **Task Creation Flow**
   - New task created in `tasks/{TASK-ID}.md`
   - Task added to `progress.md`
   - Task activated in `activeContext.md`

2. **Task Implementation Flow**
   - Task status updated in `activeContext.md`
   - Implementation details documented
   - Task status updated in `tasks/{TASK-ID}.md`
   - Task status updated in `progress.md`

3. **Architectural Decision Flow**
   - Decision documented in `ADRs.md`
   - System patterns updated in `systemPatterns.md`
   - Technical context updated in `techContext.md` if needed

## Communication Standards

### Status Reporting

1. **Task Status Updates**
   - Status changes must be reflected in all relevant files:
     - `activeContext.md` - For the current active task
     - `progress.md` - For overall project tracking
     - `tasks/{TASK-ID}.md` - For detailed task documentation
   - Status terminology must be consistent: `TODO`, `IN_PROGRESS`, `DONE`, `POSTPONED`
   - Status changes must include timestamp and reason

2. **Blocking Issues**
   - Documented in `activeContext.md`
   - Include clear description of the issue
   - Specify what is needed to resolve the issue
   - Request appropriate mode switch if needed

### Documentation Standards

1. **Task Documentation**
   - Follow YAML-like structure as specified in `.clinerules`
   - Include clear requirements and validation criteria
   - Specify dependencies
   - Document status changes

2. **Code Documentation**
   - Follow language-specific best practices
   - Include docstrings and comments
   - Document complex algorithms and business logic
   - Update documentation when code changes

3. **Architectural Documentation**
   - Follow ADR structure as specified in `.clinerules`
   - Document context, decision, justification, and consequences
   - Include status and participants
   - Reference relevant technical documentation

## Governance Model Updates

This governance model should be reviewed and updated as needed to reflect changes in project processes and requirements. Updates to the governance model should be documented as ADRs to provide context for the changes.

## References

- `.clinerules` - Base rules for mode interactions and task management
- `.roomodes` - Mode definitions and file access permissions
