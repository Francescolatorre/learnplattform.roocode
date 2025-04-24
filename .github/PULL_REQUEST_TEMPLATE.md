# Pull Request Checklist

This checklist enforces the TypeScript Services Standardization Initiative ([Task TYPESCRIPT-SERVICES-STANDARDIZATION-001](../memory_bank/tasks/Task_TYPESCRIPT-SERVICES-STANDARDIZATION-001.md)). Please ensure all items are addressed before requesting review.

## TypeScript Service Standardization

- [ ] **Service Naming:** All new/modified service files and folders follow the naming convention (`*Service.ts`).
- [ ] **API Consistency:** All public service methods are async, have explicit return types, and follow the unified API signature.
- [ ] **JSDoc/TSDoc:** All public classes and methods in services are fully documented with JSDoc/TSDoc.
- [ ] **Dependency Pattern:** Service dependencies use dependency injection or the standardized pattern.
- [ ] **Test Coverage:** Unit tests exist for all service methods, and overall service coverage is at least 80%.
- [ ] **Domain Logic:** Service modules contain only domain-relevant logic (no unrelated business logic).
- [ ] **Documentation:** Service documentation is up-to-date and accessible.
- [ ] **Lint/Format Compliance:** Code passes all linting and formatting checks.

---

_Reference: [TypeScript Services Standardization Initiative](../memory_bank/tasks/Task_TYPESCRIPT-SERVICES-STANDARDIZATION-001.md)_
