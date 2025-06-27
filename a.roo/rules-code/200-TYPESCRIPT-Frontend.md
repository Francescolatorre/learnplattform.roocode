# 200-TYPESCRIPT-Frontend.md

## TypeScript Frontend Coding Rules (Learning Platform)

### 1. General Principles

- Use React 18 with TypeScript in strict mode (no implicit `any`).
- Prefer functional components with hooks.
- Organize components in `/components/common/` (shared) and `/features/*` (feature-specific).
- Use 2-space indentation, camelCase for variables/functions, PascalCase for components/interfaces.
- Use path aliases (e.g., `@components/*`, `@features/*`) for imports.

### 2. Typing & Interfaces

- All API requests and responses must have explicit TypeScript types/interfaces.
- Prefix interfaces with `I` (e.g., `IUserProps`).
- Prefer `enum` types for constant sets (e.g., user roles, statuses).
- Mark read-only API fields as `readonly` in interfaces.
- Provide default values when destructuring props.

### 3. State Management

- Use Zustand for client state.
- Use React Query for server state (data fetching, caching, sync).
- Avoid direct Axios calls in components; use centralized API service layer with interceptors.

### 4. API Layer

- Centralize all API logic in `services/` (see ADR-013).
- Service files must follow `*Service.ts` naming.
- All public service methods must be async, have explicit return types, and be documented with JSDoc/TSDoc.
- Use dependency injection or the standardized dependency pattern for service dependencies.
- No unrelated business logic in service modules.

### 5. Error Handling

- Use a centralized error notification system (see ADR-012) with Material UI and React Context API.
- Use Error Boundaries for UI components handling server data.
- Provide informative error messages throughout the UI.

### 6. Testing

Use Vitest for unit tests, Playwright for E2E, React Testing Library for components.
Centralize global mocks in setupTests.ts.
Use data-testid for UI elements in tests.
Maintain >80% unit test coverage for services; cover error scenarios.
Use renderWithProviders for consistent test context.

#### 6.1. React State & act() Usage

All code that triggers React state updates in tests (including fireEvent, userEvent, timer advances, and direct state changes) MUST be wrapped in act() or use async utilities that do so.
Rationale: Prevents warnings and ensures test reliability, especially with libraries like MUI and React Transition Group.
Example:

```typescript
act(() => {
  fireEvent.click(button);
  vi.runAllTimers();
});
await act(async () => { await Promise.resolve(); });
```

#### 6.2. Asynchronous Effects & Microtasks

After advancing timers or triggering transitions, always flush pending microtasks using await act(async () => { await Promise.resolve(); }); if assertions depend on async effects.
Rationale: Ensures all React/MUI transitions and effects are complete before assertions.

#### 6.3. Unique Keys in Lists

All list-rendered components (e.g., notifications) MUST use unique, stable keys.
Rationale: Prevents React reconciliation bugs and duplicate key warnings in tests and production.

#### 6.4. Test Isolation & State Reset

Global or static state (e.g., notification id counters) MUST be reset between tests to avoid cross-test contamination and duplicate key issues.
Rationale: Ensures tests are independent and reliable.

#### 6.5. Test Coverage

Tests MUST cover:
All user-visible behaviors, including edge cases (e.g., queue overflow, rapid dismissals).
Accessibility roles and ARIA attributes.
Error and race conditions (e.g., concurrent notification operations).
Component integration with context/providers.

#### 6.6. Test Readability & Debugging

Tests SHOULD use clear queries (e.g., getByRole, getByTestId) and provide helpful error messages for failures.
If a test fails due to missing elements, check for empty DOM or broken provider/component logic before assuming a test bug.

#### 6.7. Test Utilities

Reusable test utilities (e.g., renderWithProviders, flushAllTimersAndMicrotasks) SHOULD be centralized in test-utils/.
Rationale: Reduces duplication and ensures consistent test setup.

#### 6.8. Integration with MUI/3rd Party Components

When using MUI or other libraries with transitions, always account for their async nature in tests.
Rationale: Prevents false negatives and act warnings.

### 7. Accessibility & Performance

- Follow accessibility standards (ARIA, keyboard navigation).
- Use Material UI theming consistently.
- Optimize performance with lazy loading, memoization, and React Query caching.

### 8. Documentation & Linting

- Document all public classes, methods, and complex logic with JSDoc/TSDoc.
- Pass all linting and formatting checks (ESLint, Prettier).
- Follow project structure and naming conventions as per ADRs.

---

> For detailed migration and enforcement, see ADR-013, ADR-005, and the TypeScript Services Standardization docs.
