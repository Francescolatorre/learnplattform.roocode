---
description: Identify, develop, and deliver the next critical task end-to-end
allowed-tools: Read(*), Write(*), Edit(*), MultiEdit(*), Bash(*), Glob(*), Grep(*), TodoWrite(*)
---

Identify, develop, and deliver the next critical task end-to-end following the workflow defined in agents.md.

**Task ID**: $ARGUMENTS (optional: specify task, otherwise auto-select highest priority)

**Workflow Steps:**
1. **Task Selection**:
   - **Primary Source**: Check `memory_bank/current/backlog/active/current-sprint.md` for committed sprint tasks
   - **Secondary Source**: Check `memory_bank/current/backlog/active/p0-critical.md` for emergency items
   - **Fallback Source**: Review `memory_bank/current/backlog/active/p1-high.md` for high priority tasks
   - **Context Check**: Reference `memory_bank/workspace/analysis/activeContext.md` for current development focus
   - Use provided task-id if specified, otherwise auto-select highest priority OPEN task
2. **Branch Creation**: Create feature branch following naming convention `feature/[task-id]-[brief-description]` or `fix/[task-id]-[brief-description]`
3. **Development**: 
   - Move task status from OPEN → IN PROGRESS in task documents
   - Implement solution following vertical slice approach (Backend + API + Frontend + Tests)
   - Apply all coding conventions from AGENTS.md sections 1-2
   - Run validation checks throughout development
4. **Quality Assurance**:
   - Execute comprehensive testing (Unit + Integration + E2E where applicable)
   - Run linting, formatting, and type checking
   - Ensure all programmatic checks pass
5. **Documentation**:
   - Update task status in appropriate backlog files (`memory_bank/current/backlog/active/`)
   - Update `memory_bank/current/backlog/active/current-sprint.md` with progress
   - Update `memory_bank/workspace/analysis/activeContext.md` and `memory_bank/workspace/analysis/progress.md`
   - Create/update any necessary technical documentation
   - Move completed tasks to `memory_bank/history/completed/` following the established pattern
6. **Pull Request**: 
   - Commit with proper message format: `[TASK-ID] [STATUS] [SUMMARY]`
   - Push branch to remote
   - Create pull request with comprehensive description including test plan
   - Link to task documentation

**Prerequisites**: Clean working directory, all previous commits pushed
**Output**: Ready-to-review pull request with complete implementation and documentation