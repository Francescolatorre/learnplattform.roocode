# claude.md - Claude Code Configuration

## Project Context

This is a Django + React project with strict development conventions defined in AGENTS.md. The project uses:

- Backend: Django 4.2.9, DRF, JWT authentication
- Frontend: React 18, TypeScript, Material UI, Zustand, React Query
- Testing: pytest (backend), Vitest/Playwright (frontend)
- Project structure with LearningTasks vs DevTasks distinction

## Slash Commands

### /handover

**Purpose**: Generate a comprehensive handover document for transitioning between Claude Code sessions

**Usage**: `/handover [optional: specific area like "backend", "frontend", "testing"]`

**Action**: Execute this command to create a detailed handover document that includes:

1. **Current Project State Analysis**
   - Git status and branch information
   - Recent commits and changes
   - Active development tasks from memory_bank/tasks/
   - Current focus from memory_bank/activeContext.md

2. **Active Work Documentation**
   - Work in progress (WIP) files and changes
   - Current DevTask status and priorities
   - Test results and validation status
   - Any failing checks or blockers

3. **Next Steps Planning**
   - Immediate next actions
   - Pending tasks and dependencies
   - Required validations and tests

4. **Context Preservation**
   - Key decisions and rationale
   - Important findings or issues discovered
   - Code patterns and approaches being used

5. **Mandatory Commit and Handover Signal**
   - Create git commit with handover summary in commit message
   - State "ready for handover" to user

**Implementation**:

```bash
# Check git status
git status --porcelain
git log --oneline -10

# Check active tasks
ls memory_bank/tasks/ -la
cat memory_bank/activeContext.md
cat memory_bank/progress.md

# Check test status
cd Backend && pytest --tb=short -q
cd ../frontend && npm run test:unit -- --reporter=minimal

# Document current state
echo "=== HANDOVER DOCUMENT $(date) ===" > memory_bank/temp/session-handover.md
# ... compile comprehensive handover document

# MANDATORY: Commit handover document with summary
git add memory_bank/temp/session-handover.md
git commit -m "handover: session transition $(date +%Y-%m-%d)

Summary of work completed:
- [List key achievements]
- [List pending work]  
- [Note any blockers or issues]

Next session should: [immediate next steps]

🔄 Session handover prepared"

# Signal completion
echo "ready for handover"
```

### /status

**Purpose**: Quick project status check

**Usage**: `/status`

**Action**:

- Git status summary
- Test results summary
- Active tasks overview
- Any immediate blockers

### /validate

**Purpose**: Run all programmatic checks as defined in AGENTS.md

**Usage**: `/validate [backend|frontend|all]`

**Action**: Execute comprehensive validation:

```bash
# Backend validation
cd Backend
pytest
black --check .
pylint core/

# Frontend validation
cd frontend
npm run test:unit
npm run test:integration
npm run test:e2e
npm run lint
tsc --noEmit
```

### /commit-prep

**Purpose**: Prepare for commit following AGENTS.md conventions

**Usage**: `/commit-prep <DEVTASK-ID> <STATUS> <SUMMARY>`

**Action**:

1. Run `/validate` to ensure all checks pass
2. Stage appropriate files
3. Generate commit message: `[DEVTASK-ID] [STATUS] [SUMMARY]`
4. Show git diff summary
5. Confirm commit readiness

### /task-init

**Purpose**: Initialize a new DevTask following project conventions

**Usage**: `/task-init <task-name> <description>`

**Action**:

1. Create task file in memory_bank/tasks/
2. Update memory_bank/activeContext.md
3. Initialize any required directory structure
4. Set up basic test scaffolding

## Development Workflow Integration

### Session Start Protocol

1. Run `/status` to understand current state
2. Review memory_bank/activeContext.md
3. Check for any failing validations
4. Plan session objectives

### Session End Protocol

1. Run `/pre-commit` to ensure linters/formatters have been applied
2. Run `/validate` to ensure all checks pass
3. Execute `/handover` to document session
4. Update memory_bank/progress.md
5. Commit clean, working state with proper formatting

### Emergency Handover

If session must end unexpectedly:

```bash
/handover emergency
```

This creates a minimal but essential handover focusing on:

- Immediate WIP state
- Critical next steps
- Any urgent blockers or issues

## File Structure Context

```
project/
├── Backend/           # Django backend
├── frontend/          # React frontend
├── memory_bank/       # Project documentation
│   ├── tasks/         # DevTask documentation
│   ├── ADRs/          # Architecture Decision Records
│   ├── activeContext.md  # Current development focus
│   └── progress.md    # Development progress tracking
├── AGENTS.md          # Agent conventions (binding)
└── claude.md          # This file
```

## Key Conventions from AGENTS.md

- **Commit Format**: `[DEVTASK-ID] [STATUS] [SUMMARY]`
- **Testing**: All changes require tests (Unit, Integration, E2E)
- **Validation**: All programmatic checks must pass before commit
- **Task Types**: LearningTask (user-facing) vs DevTask (development)
- **Vertical Slices**: Backend + API + Frontend + Tests together

## Notes for New Sessions

- Always check AGENTS.md and any deeper AGENTS.md files first
- LearningTask ≠ DevTask - maintain clear separation
- Document all architectural decisions in ADRs
- Update progress tracking consistently
- Follow strict typing and testing requirements
