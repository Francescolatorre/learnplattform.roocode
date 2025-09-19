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

# typescript-service-modernization
## Modern Service Architecture (2025 Standards - TASK-012 Implemented)
- **Location**: `frontend/src/services/` with modern implementations alongside legacy
- **Pattern**: Composition over inheritance with single API client via `ModernApiClient`
- **Factory**: Use `ServiceFactory` for dependency injection and service instantiation
- **Migration**: 3-phase strategy maintains backward compatibility during transition

### Phase 1: Parallel Implementation ✅ COMPLETE (TASK-012)
- Modern services created: `modernCourseService`, `modernLearningTaskService`, `modernEnrollmentService`, `modernProgressService`
- Backward compatibility: All legacy exports maintained (`fetchCourses`, `createTask`, etc.)
- Testing: 198/198 unit tests passing, 26/28 integration tests passing
- Performance: 80% memory reduction per service (40KB → 8KB)

### Phase 2: Gradual Adoption (Next Development Phase)
- **Priority**: Update high-traffic components first (TaskCreation, CourseDetails, Enrollment flows)
- **Migration Pattern**: Replace legacy imports with modern service instances
- **Monitoring**: Track performance improvements and error rates
- **Deprecation**: Add console warnings to legacy exports after 50% adoption

### Phase 3: Legacy Cleanup (Final Phase)  
- **Timing**: After 90% component migration completion
- **Bundle Optimization**: Remove legacy services for ~30KB bundle reduction
- **Architecture**: Single service layer with modern patterns only
- **Documentation**: Update all guides to modern service usage only

### Service Usage Guidelines
```typescript
// ✅ Modern Pattern (Use for new development)
import { modernCourseService } from '@/services/resources/modernCourseService';
const courses = await modernCourseService.getCourses();

// ⚠️ Legacy Pattern (Backward compatible, but deprecated)
import { fetchCourses } from '@/services/resources/courseService';
const courses = await fetchCourses();

// 🏭 Factory Pattern (For testing/DI)
import { ServiceFactory } from '@/services/factory/serviceFactory';
const courseService = ServiceFactory.getInstance().getService(ModernCourseService);
```

# claude-code-hooks
## Automatic Code Quality Hooks (matches CI pipeline exactly)
### Pre-commit validation hooks (run before git commits)
```bash
# Python: Format and lint backend code (exact CI commands)
cd backend && black --check --diff . && flake8 . && mypy . --ignore-missing-imports

# TypeScript: Format and lint frontend code (exact CI commands)
cd frontend && npx prettier --check . && npm run lint && npx tsc --noEmit

# Tests: Run unit tests to catch issues early
cd frontend && npm run test:unit
```

### Pre-push validation hooks (run before git push)
```bash
# Backend tests (exact CI command)
cd backend && pytest --tb=short

# Frontend full validation (exact CI commands)
cd frontend && npm run test:unit && npm run test:integration && npm run test:coverage

# Build validation
cd frontend && npm run build
```

### Post-edit hooks (run after file edits)
```bash
# Auto-format Python files after editing (with autofix)
if [[ "{file_path}" == backend/* && "{file_path}" == *.py ]]; then
  cd backend && black "{file_path}" && flake8 "{file_path}" && mypy "{file_path}" --ignore-missing-imports
fi

# Auto-format TypeScript files after editing (with autofix)
if [[ "{file_path}" == frontend/* && "{file_path}" == *.ts* ]]; then
  cd frontend && npx prettier --write "{file_path}" && npx eslint --fix "{file_path}"
fi
```

### Hook Commands Reference (CI Pipeline Exact Match)
```bash
# Python Linting (from code-quality.yml:115-128)
cd backend && black --check --diff .
cd backend && flake8 .
cd backend && mypy . --ignore-missing-imports

# Frontend Linting (from frontend-tests.yml:158-177)
cd frontend && npx prettier --check .
cd frontend && npm run lint
cd frontend && npx tsc --noEmit

# Backend Tests (from backend-tests.yml:55-61)
cd backend && pytest --tb=short

# Frontend Tests (from frontend-tests.yml:110-123)
cd frontend && npm run test:unit
cd frontend && npm run test:integration
cd frontend && npm run test:coverage

# Build Validation (from frontend-tests.yml:204-206)
cd frontend && npm run build
```

# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.
- Backend must be started with activated venv: cd backend && source .venv/Scripts/activate && python manage.py runserver
- you shall run the tests locally before pushing to save time#