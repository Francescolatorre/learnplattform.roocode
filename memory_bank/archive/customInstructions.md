# Roo's Custom Instructions

## Mode Interaction Protocol

### Architect Mode Responsibilities

1. Task Creation
   - Break down large tasks into atomic units
   - Define clear requirements and validation criteria
   - Specify dependencies between tasks
   - Document tasks in YAML format in activeContext.md

2. Task Structure MUST COMPLY

```yaml
Task-ID: Unique identifier (e.g., CORE-001)
Description: Clear, concise task description
Requirements:
  - Specific, actionable items
  - Clear technical requirements
  - Required file paths and changes
Validation:
  - Concrete success criteria
  - Testable conditions
  - Expected outcomes
Status: TODO | IN_PROGRESS | DONE
Dependencies: [List of Task-IDs]
```

3. Task Management
   - Maintain single active task in activeContext.md
   - Queue upcoming tasks with dependencies
   - Track progress and blocking issues
   - Validate completed tasks
   - Always move task to IN_PROGRESS before implementation begins
   - Update task status to DONE upon completion

4. Documentation
   - Maintain architectural documentation
   - Update technical specifications
   - Document design decisions
   - Track implementation progress

### Code Mode Responsibilities

1. Task Execution
   - Read current task from activeContext.md
   - Acknowledge task receipt by updating status to IN_PROGRESS
   - Implement requirements exactly as specified
   - Follow Django best practices
   - 
   - Create/modify only specified files

2. Validation
   - Verify against task validation criteria
   - Run tests if specified
   - Document any issues encountered
   - Update task status to DONE upon completion

3. Implementation Rules
   - Focus on single task completion
   - No scope creep beyond requirements
   - Follow specified patterns and practices
   - Document technical decisions

### Version Control

1. Git Commit Rules
   - Commit changes after each completed task
   - Use descriptive commit messages referencing task IDs
   - Include validation status in commit message
   - Stage all relevant files before committing

### Communication Flow

1. Task Handoff
   - Architect mode prepares task in activeContext.md
   - Code mode acknowledges task receipt by updating status to IN_PROGRESS
   - Code mode begins implementation
   - Architect mode awaits completion

2. Task Completion
   - Code mode updates task status to DONE
   - Code mode provides implementation details
   - Architect mode validates completion
   - Architect mode activates next task

3. Issue Handling
   - Code mode reports blocking issues
   - Architect mode provides clarification
   - Task requirements updated if needed
   - Progress tracked in activeContext.md

### Best Practices

1. Django Standards
   - Business logic in services.py
   - Efficient ORM usage
   - Proper model relationships
   - Clean separation of concerns

2. Testing Requirements
   - pytest with Factory Boy
   - Comprehensive test coverage
   - Isolated test cases
   - Performance testing

3. Code Quality
   - Type hints
   - Proper documentation
   - Error handling
   - Query optimization

4. Security
   - CSRF protection
   - Proper authentication
   - Input validation
   - Secure API design
