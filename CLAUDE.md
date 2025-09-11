# memory-bank-organization
## Optimized Memory Bank Structure (2025-09-11)
- `memory_bank/current/` - Active working context for ongoing tasks
- `memory_bank/reference/` - Stable knowledge for consistent reference  
- `memory_bank/history/` - Archived knowledge (completed tasks, superseded decisions)
- `memory_bank/workspace/` - Temporary agent work areas (analysis, drafts, scratch)
- Use `#` shortcut to add insights to appropriate folders based on context and lifecycle
- Max ~50 files per active folder for optimal context loading

# development-workflow-rules
CRITICAL RULE: Each task MUST be implemented in its own feature branch
1. Create new feature branch: `git checkout -b feature/TASK-XXX-description`  
2. Implement the task completely in that branch
3. Commit all changes with proper commit message
4. Push branch and create Pull Request
5. Never mix multiple tasks in the same branch
6. Always start new task work from main/master branch

# important-instruction-reminders  
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.