# Migration Guide: Updating Legacy TypeScript Services to the New Standard

**Related Task:** [TYPESCRIPT-SERVICES-STANDARDIZATION-001](../tasks/Task_TYPESCRIPT-SERVICES-STANDARDIZATION-001.md)
**Standard Reference:** [TypeScript Services Standardization Draft](../drafts/typescript_services_standardization.md)

---

## Overview

This guide provides a step-by-step process for migrating legacy TypeScript service modules to comply with the new standard. The goal is to ensure consistency, maintainability, and quality across all TypeScript services in the project.

---

## Migration Checklist

- [ ] Service folder and file names follow the unified convention.
- [ ] Public API (method signatures, error handling, return types) is consistent with the standard.
- [ ] All public methods and classes have comprehensive JSDoc/TSDoc comments.
- [ ] Dependency injection or the standardized dependency pattern is used.
- [ ] Unit tests exist and meet the minimum coverage threshold (≥80%).
- [ ] Integration/API-level tests are present as required.
- [ ] No unrelated business logic is present in the service module.
- [ ] Service passes all linting and formatting checks.
- [ ] Documentation is up-to-date and accessible.

---

## Migration Steps

### 1. Review the Standard

- Read the [TypeScript Services Standardization Draft](../drafts/typescript_services_standardization.md) for detailed requirements and examples.

### 2. Update Structure and Naming

- Ensure the service is located in the correct folder (e.g., `src/services/resources/`).
- Rename files and folders to match the convention (e.g., `camelCase` or `PascalCase` as specified).

### 3. Refactor Public API

- Standardize method signatures (async, explicit return types, error handling).
- Ensure all exported functions/classes are consistent with the standard.

**Before:**

```ts
export function getData(id) {
  // ...
}
```

**After:**

```ts
/**
 * Retrieves data by ID.
 * @param id - The unique identifier.
 * @returns The data object.
 */
export async function getData(id: string): Promise<Data> {
  // ...
}
```

### 4. Add Documentation

- Add TSDoc/JSDoc comments to all public classes and methods.
- Include class-level documentation describing the service's purpose.

### 5. Standardize Dependency Management

- Use dependency injection or the approved pattern for external dependencies.
- Avoid hardcoding dependencies within the service.

### 6. Write/Update Tests

- Add or update unit tests to achieve at least 80% coverage.
- Add integration/API-level tests as required (e.g., in `src/tests/api-only.spec.ts`).

### 7. Remove Unrelated Business Logic

- Ensure the service only contains logic relevant to its domain responsibility.

### 8. Linting and Formatting

- Run the project's linting and formatting tools.
- Fix any issues to ensure compliance.

### 9. Update Documentation

- Ensure the service's documentation is current and accessible.
- Reference this migration guide in the service's README or documentation section.

### 10. Validate and Commit

- Verify all checklist items are complete.
- Commit changes with a message referencing the migration and task ID.

---

## Refactored React Hooks and Service Modules

This section explains how React hooks have been refactored to utilize the standardized TypeScript service modules, such as `progressService`, to manage data fetching and business logic.

### Overview

- Service modules encapsulate API calls and business logic, providing a clean and consistent interface.
- React hooks use these service modules to fetch data asynchronously and manage component state.
- This separation improves maintainability, testability, and code reuse.

### Example: ProgressDebugger Component

The `ProgressDebugger` component demonstrates how to use React hooks with the `progressService` module.

```tsx
import React, {useState, useEffect} from 'react';
import {fetchStudentProgressByCourse} from '@services/resources/progressService';
import {useAuth} from '@context/auth/AuthContext';

const ProgressDebugger: React.FC = () => {
  const {user, isAuthenticated, getAccessToken, getUserRole} = useAuth();
  const [debugInfo, setDebugInfo] = useState({
    isAuthenticated: false,
    userRole: null,
    accessToken: null,
    progressFetchResult: 'Not attempted',
  });

  useEffect(() => {
    const runDiagnostics = async () => {
      const accessToken = getAccessToken();
      const userRole = getUserRole();

      setDebugInfo(prev => ({
        ...prev,
        isAuthenticated,
        userRole: userRole,
        accessToken: accessToken,
      }));

      if (isAuthenticated) {
        try {
          await fetchStudentProgressByCourse('1', String(user?.id) || 'defaultStudentId');
          setDebugInfo(prev => ({
            ...prev,
            progressFetchResult: 'Success',
          }));
        } catch (error: any) {
          setDebugInfo(prev => ({
            ...prev,
            progressFetchResult: `Failed with status ${error?.response?.status || 'unknown'}: ${error.message || 'No error message provided'}`,
          }));
        }
      }
    };

    runDiagnostics();
  }, [user, isAuthenticated, getAccessToken, getUserRole]);

  return (
    <div>
      {/* UI rendering omitted for brevity */}
    </div>
  );
};

export default ProgressDebugger;
```

### Usage Notes

- Always handle authentication and authorization when calling service methods.
- Use React's `useEffect` to perform asynchronous data fetching.
- Manage loading, success, and error states appropriately in component state.
- Service modules should not contain UI logic; keep UI concerns in React components.

---

## Example Migration

**Legacy Service (Before):**

```ts
// src/services/legacyDataService.ts
export function fetchData(id) {
  return api.get(`/data/${id}`);
}
```

**Migrated Service (After):**

```ts
/**
 * Service for retrieving data entities.
 */
export class DataService {
  constructor(private api: ApiService) {}

  /**
   * Retrieves data by ID.
   * @param id - The unique identifier.
   * @returns The data object.
   */
  async getData(id: string): Promise<Data> {
    return this.api.get(`/data/${id}`);
  }
}
```

---

## References

- [TypeScript Services Standardization Draft](../drafts/typescript_services_standardization.md)
- [Task File](../tasks/Task_TYPESCRIPT-SERVICES-STANDARDIZATION-001.md)
- [Project Linting/Formatting Rules](../../frontend/.prettierrc), [../../frontend/eslint.config.js)
- [Developer Documentation](../../README.md)

---

## Tips

- Migrate incrementally to avoid breaking existing integrations.
- Use automated tools for linting, formatting, and test coverage.
- Consult the Architect Mode or Boomerang Mode orchestration for complex migrations.

---

## Contact

For questions or support, contact the project maintainers or refer to the governance documentation.
