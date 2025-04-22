# Type System Organization

## Overview
We've restructured the type system to improve organization and maintainability. All types are now:
- Prefixed with 'I' for interfaces (e.g., ITask, IModuleProgress)
- Located in the appropriate domain-specific files in `types/common/`
- Consistently named and documented

## Type Files Structure
- `entities.ts` - Core domain entities (User, Course, LearningTask)
- `taskTypes.ts` - Task-related interfaces (ITask, ITaskProgress)
- `moduleTypes.ts` - Module-related interfaces (IModuleData, IModuleProgress)
- `authTypes.ts` - Authentication-related interfaces
- `paginatedResponse.ts` - API pagination interfaces

## Legacy Types
For backward compatibility, some legacy type exports are maintained:
- `Task.ts` re-exports ITask as both ITask and Task
- Other legacy files follow the same pattern

## Migration Guide
When working with types:
1. Import directly from the `types/common/` folder (e.g., `import { ITask } from 'types/common/taskTypes'`)
2. Use the newer interface names with the 'I' prefix (ITask instead of Task)
3. Update component props and state types to follow this pattern

This approach allows gradual migration without breaking existing code.
