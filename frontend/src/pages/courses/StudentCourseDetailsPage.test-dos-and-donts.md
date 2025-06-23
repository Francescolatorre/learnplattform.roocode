# StudentCourseDetailsPage Test Dos and Don'ts

## Dos

- **Do** use `renderWithProviders` for all tests to ensure consistent context and providers (AuthProvider, QueryClientProvider, etc.).
- **Do** mock `useAuth` using `vi.mock('@context/auth/AuthContext', async (importOriginal) => { ... })` and spread the real module with `...actual` to preserve all exports, especially `AuthProvider`.
- **Do** set the route param using `initialEntries` in `renderWithProviders` to match the real app routing (e.g., `{initialEntries: ['/courses/1']}`).
- **Do** use factories for mock data to ensure type consistency and reduce duplication.
- **Do** use `waitFor` for async UI assertions to avoid race conditions.
- **Do** check for both positive and negative UI states (e.g., tasks shown for enrolled, not shown for not enrolled).
- **Do** clean up unused variables and imports to avoid lint errors.
- **Do** check that all service mocks are called as expected.

## Don'ts

- **Don't** mock the entire AuthContext module without spreading the real exports; this will break `AuthProvider` and cause context errors.
- **Don't** forget to provide the correct route param; otherwise, the component will not match the route and may render nothing.
- **Don't** use `screen.getByText` with possibly undefined values; always use a fallback or non-null assertion.
- **Don't** wrap the component with both `AuthContext.Provider` and `AuthProvider`—use only the real provider via `renderWithProviders`.
- **Don't** rely on default context state for authentication; always mock `useAuth` to control the test scenario.
- **Don't** skip checking for error or empty states—test both enrolled and not enrolled cases.

## Example: Correct Auth Mock
```ts
vi.mock('@context/auth/AuthContext', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useAuth: () => ({
      user: { id: '1', username: 'testuser', email: 'testuser@example.com', role: 'student', is_active: true },
      isAuthenticated: true,
      isRestoring: false,
      error: null,
      login: vi.fn(),
      logout: vi.fn(),
      register: vi.fn(),
      getUserRole: () => 'student',
      redirectToDashboard: vi.fn(),
    }),
  };
});
```

## Example: Route Setup
```ts
renderWithProviders(
  <Routes>
    <Route path="/courses/:courseId" element={<StudentCourseDetailsPage />} />
  </Routes>,
  {initialEntries: ['/courses/1']}
);
```

---

_This file documents key testing patterns and pitfalls for StudentCourseDetailsPage and similar React/TypeScript/React Query/React Router test setups._
