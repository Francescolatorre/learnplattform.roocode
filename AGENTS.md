# AGENTS.md

## Scope

Diese Datei gilt für das gesamte Repository, sofern keine spezifischeren AGENTS.md-Dateien in Unterverzeichnissen existieren.

---

## 1. Coding Conventions

### Backend (Django, DRF)

- PEP8, Black-Formatierung, pylint.
- Django 4.2.9, DRF, JWT (djangorestframework-simplejwt).
- Verwende ViewSets, permission_classes, select_related/prefetch_related.
- Logging mit lazy `%`-Formatierung.
- Tests: pytest, pytest-django, factory_boy.
- API-Dokumentation: drf-yasg.
- Unterscheide klar zwischen LearningTask (User-facing) und DevTask (Entwickler-Aufgaben).

### Frontend (React, TypeScript)

- React 18, TypeScript (strict), Material UI, Zustand, React Query, Axios.
- Komponenten in `/components/common/` und `/features/*`.
- Interfaces mit `I`-Prefix, enums für Konstanten.
- API-Layer zentral, Fehlerbehandlung zentralisieren.
- Tests: Vitest, Playwright, React Testing Library.
- Nutze data-testid für UI-Elemente in Tests.
- Routing: React Router v7 mit `startTransition`-Flag.

### MVP Browser Testing Strategy

- **Primary Browser**: Chrome/Chromium only for E2E tests during MVP development
- **Rationale**: Focus on core functionality, faster CI pipeline, sufficient coverage
- **Future**: Firefox/Safari testing added post-MVP for production readiness
- **Visual Regression**: Chrome-only sufficient for MVP UI consistency

### Allgemein

- Vertikale Slices: Backend, API, Frontend, Tests immer zusammenhängend implementieren.
- Tests sind Pflicht (Unit, Integration, E2E).
- **E2E Testing Standards**: E2E test failures are delivery blockers (no exceptions). Always verify UI navigation paths exist for implemented features. Test all interfaces where a feature appears, not just one.
- Dokumentiere alle APIs und komplexe Logik.
- Accessibility: ARIA, Tastatur-Navigation.
- Performance: Lazy Loading, Memoization, optimierte Queries.
- **Definition of Done**: All tasks must satisfy ADR-020 Definition of Done before completion.

---

## 2. Git & Commit Policy

- Keine neuen Branches für Agenten-Commits.
- Commit-Format: `[DEVTASK-ID] [STATUS] [SUMMARY]`
  - Beispiel: `TASK-API-001 IN_PROGRESS Implement auth endpoints`
- Committe nur, wenn der Arbeitsbaum sauber ist (`git status` muss clean sein).
- Pre-commit-Hooks müssen erfolgreich durchlaufen werden.
- Keine bestehenden Commits ändern oder rebasen.

### PR-First Review Policy
- **MANDATORY**: All code reviews must be conducted via Pull Request
- **PROCESS**: Always create PR before requesting review - never share raw branches
- **RATIONALE**: User reviews PR with CI/CD pipeline validation for complete quality assessment
- **WORKFLOW**: Commit → Push → Create PR → Request Review (not: Commit → Push → Request Review)

---

## 3. AGENTS.md Handling

- Diese Datei und alle tieferliegenden AGENTS.md sind bindend für alle Agenten.
- Bei Konflikten gilt die am tiefsten verschachtelte AGENTS.md.
- System-/User-Prompts haben Vorrang vor AGENTS.md.
- Für jede bearbeitete Datei müssen die Anweisungen der jeweils zuständigen AGENTS.md beachtet werden.

---

## 4. Programmatic Checks

- Nach jeder Änderung müssen alle im Projekt vorhandenen automatisierten Checks (Tests, Linter, Typprüfungen, etc.) ausgeführt werden.
- Für Backend: `pytest`, Linter, Black.
- Für Frontend: `npm run test:unit`, `npm run test:integration`, `npm run test:e2e`, Linter, TypeScript-Checks.
- Bei Fehlern: Korrigieren und erneut prüfen, bis alle Checks erfolgreich sind.

---

## 5. PR/Commit Message Instructions

- PR-Beschreibungen müssen:
  - Zusammenfassen, was geändert wurde (inkl. vertikaler Integration).
  - Validierungsergebnisse (Testausgaben) als Zitate angeben.
  - Citations nach Vorgabe:
    - `【F:<file_path>†L<line_start>(-L<line_end>)?】` für Dateien
    - `【<chunk_id>†L<line_start>(-L<line_end>)?】` für Terminalausgaben
- Keine Zitate aus PR-Diffs oder Kommentaren, keine Git-Hashes als chunk_id.

---

## 6. Special Project Rules

- LearningTask ≠ DevTask (immer klar trennen).
- DevTasks: Aktive in `memory_bank/current/decisions/`, abgeschlossene in `memory_bank/history/completed/` dokumentieren.
- ADRs: Aktive in `memory_bank/current/decisions/`, veraltete in `memory_bank/history/superseded/` pflegen.
- Aktuellen Entwicklungsfokus in `memory_bank/workspace/analysis/activeContext.md` dokumentieren.
- Fortschritt in `memory_bank/workspace/analysis/progress.md` nachhalten.
- **Definition of Done (ADR-020)**: Mandatory checklist for task completion including scope coverage, testing, documentation, and security validation.

---

## 7. Weitere Hinweise

- Bei Unsicherheiten: Siehe weitere AGENTS.md in Unterverzeichnissen oder frage nach.
- Änderungen an dieser Datei müssen mit dem Team abgestimmt werden.

---

**Beispiel für einen programmatic check (Backend):**

```sh
cd Backend
pytest
black --check .
pylint core/
```

**Beispiel für einen programmatic check (Frontend):**

```sh
cd frontend
npm run test:unit
npm run test:integration
npm run test:e2e
npm run lint
tsc --noEmit
```

---

## 8. Claude Code Configuration & Slash Commands

### Project Context

This is a Django + React project with:
- Backend: Django 4.2.9, DRF, JWT authentication
- Frontend: React 18, TypeScript, Material UI, Zustand, React Query
- Testing: pytest (backend), Vitest/Playwright (frontend)
- Project structure with LearningTasks vs DevTasks distinction

### Slash Commands

#### /handover
**Purpose**: Generate comprehensive handover document for session transitions
**Usage**: `/handover [optional: specific area]`
**Action**: Create detailed handover with project state, active work, next steps, and commit summary

#### /status  
**Purpose**: Quick project status check
**Usage**: `/status`
**Action**: Git status, test results, active tasks, blockers overview

#### /validate
**Purpose**: Run all programmatic checks
**Usage**: `/validate [backend|frontend|all]`
**Action**: Execute comprehensive validation (tests, linting, type checks)

#### /dependabot-merge
**Purpose**: Handle Dependabot PRs with automated conflict resolution
**Usage**: `/dependabot-merge [pr-number|all]`
**Action**: Analyze dependencies, resolve conflicts, run tests, merge safely

#### /processImprovement
**Purpose**: Automatically derive lightweight process updates from session learnings without over-engineering
**Usage**: `/processImprovement [session-summary|current-issues]`
**Action**: Analyze session patterns and derive minimal, targeted process improvements:

**Analysis Steps:**
1. **Issue Pattern Recognition**: Review recent session challenges, blockers, and repeated problems
2. **Root Cause Analysis**: Identify underlying process gaps (not individual mistakes)
3. **Impact Assessment**: Focus on high-impact, low-overhead improvements
4. **Existing Process Review**: Check current ADRs, agents.md, and Definition of Done
5. **Lightweight Solution Design**: Create simple rules, checklists, or guidelines

**Update Targets:**
- Add 1-3 critical checkboxes to Definition of Done (ADR-020)
- Insert targeted guidance in agents.md (1-2 sentences max)
- Create simple decision trees or checklists
- Avoid: Complex workflows, heavy documentation, elaborate processes

**Output**: Specific file updates with rationale, focusing on "make the right thing easy, wrong thing obvious"

#### /nextTask
**Purpose**: Identify, develop, and deliver the next critical task end-to-end
**Usage**: `/nextTask [task-id]` (optional: specify task, otherwise auto-select highest priority)
**Action**: Complete task development workflow following defined processes:

**Workflow Steps:**
1. **Task Selection**: Analyze `memory_bank/workspace/analysis/activeContext.md` and `memory_bank/workspace/analysis/TASK-TRIAGE-PRIORITIES.md` to identify highest priority OPEN task, or use provided task-id
2. **Branch Creation**: Create feature branch following naming convention `feature/[task-id]-[brief-description]` or `fix/[task-id]-[brief-description]`
3. **Development**: 
   - Move task status from OPEN → IN PROGRESS in task documents
   - Implement solution following vertical slice approach (Backend + API + Frontend + Tests)
   - Apply all coding conventions from AGENTS.md sections 1-2
   - Run validation checks (`/validate`) throughout development
4. **Quality Assurance**:
   - Execute comprehensive testing (Unit + Integration + E2E where applicable)
   - Run linting, formatting, and type checking
   - Ensure all programmatic checks pass
   - **Validate Definition of Done**: Follow ADR-020 Definition of Done checklist before task completion
5. **Documentation**: 
   - Update task documents with implementation details
   - Update `memory_bank/workspace/analysis/activeContext.md` and `memory_bank/workspace/analysis/progress.md`
   - Create/update any necessary technical documentation
6. **Pull Request Creation** (REQUIRED BEFORE REVIEW):
   - Commit with proper message format: `[TASK-ID] [STATUS] [SUMMARY]`  
   - Push branch to remote
   - Create pull request with comprehensive description including test plan
   - Link to task documentation
   - **MANDATORY**: All reviews must be conducted via PR with CI/CD pipeline validation
   - **PROCESS**: Never request review without creating PR first - user reviews PR + pipeline, not raw branch
   
   **Test Reporting Requirements:**
   - Include test execution results (unit, integration, E2E)
   - For UI changes: Screenshots/videos showing before/after behavior
   - For bug fixes: Evidence that the fix resolves the reported issue
   - For E2E tests: Playwright HTML report with videos (when applicable)
   - Command: `npm run test:e2e -- --reporter=html` generates test reports with videos

**Prerequisites**: Clean working directory, all previous commits pushed
**Output**: Ready-to-review pull request with complete implementation and documentation

### Session Handover Process

When transitioning between Claude Code sessions:
1. Check `memory_bank/workspace/drafts/session-handover.md` for current work status
2. Review active todo list using TodoWrite tool
3. Complete any pending commits/pushes before starting new work
4. Update handover document with new session progress

### Development Workflow Integration

**Session Start Protocol:**
1. Run `/status` to understand current state
2. Review memory_bank/workspace/analysis/activeContext.md
3. Check for failing validations
4. Plan session objectives

**Session End Protocol:**
1. Run programmatic checks to ensure code quality
2. Execute `/handover` to document session
3. Update memory_bank/workspace/analysis/progress.md
4. Commit clean, working state

### File Structure Context
```
project/
├── Backend/           # Django backend
├── frontend/          # React frontend  
├── memory_bank/       # Optimized project documentation
│   ├── current/       # Active working context
│   │   ├── decisions/ # Active ADRs and task decisions  
│   │   ├── standards/ # Coding standards and practices
│   │   ├── schemas/   # API specs, data models
│   │   └── workflows/ # Current processes and user journeys
│   ├── reference/     # Stable knowledge assets
│   │   ├── patterns/  # Reusable templates and examples
│   │   ├── guides/    # How-to documentation and tutorials
│   │   └── glossary/  # Terminology and definitions
│   ├── history/       # Archived knowledge (searchable)
│   │   ├── completed/ # Finished tasks and implementations
│   │   ├── superseded/# Outdated decisions and investigations
│   │   └── lessons/   # Retrospectives and learning summaries
│   └── workspace/     # Temporary agent workspace
│       ├── analysis/  # Current analysis work (activeContext, progress)
│       ├── drafts/    # Work in progress documents
│       └── scratch/   # Temporary notes and experiments
└── AGENTS.md          # This file (binding conventions)
```

---

Mit dieser Struktur erfüllt eure AGENTS.md die Anforderungen des Systemprompts und bietet klare, projektbezogene Anweisungen für Agenten und Entwickler.
