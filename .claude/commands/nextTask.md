---
description: Identify, develop, and deliver the next critical task end-to-end
allowed-tools: Read(*), Write(*), Edit(*), MultiEdit(*), Bash(*), Glob(*), Grep(*), TodoWrite(*)
---

Identify, develop, and deliver the next critical task end-to-end following the workflow defined in agents.md.

**Task ID**: $ARGUMENTS (optional: specify task, otherwise auto-select highest priority)

**Workflow Steps:**
1. **Task Selection**: Analyze `memory_bank/workspace/analysis/activeContext.md` and `memory_bank/workspace/analysis/TASK-TRIAGE-PRIORITIES.md` to identify highest priority OPEN task, or use provided task-id
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
   - Update task documents with implementation details
   - Update `memory_bank/workspace/analysis/activeContext.md` and `memory_bank/workspace/analysis/progress.md`
   - Create/update any necessary technical documentation
6. **Pull Request**: 
   - Commit with proper message format: `[TASK-ID] [STATUS] [SUMMARY]`
   - Push branch to remote
   - Create pull request with comprehensive description including test plan
   - Link to task documentation

**Prerequisites**: Clean working directory, all previous commits pushed
**Output**: Ready-to-review pull request with complete implementation and documentation