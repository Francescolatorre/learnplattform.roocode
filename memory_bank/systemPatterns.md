# System Patterns and Architecture Decisions

This document outlines the key architectural patterns and decisions made in the Course Management System.

## Authentication and Authorization

### Architectural Issue: Direct API Calls in LoginForm

**Description:**

The `LoginForm` component in `frontend/src/features/auth/LoginForm.tsx` is directly calling the `login` function from the API service (`../../services/api`) instead of using the `login` function provided by the `AuthContext`.

**Consequences:**

*   **Lack of Separation of Concerns:** The `LoginForm` is responsible for both UI logic and authentication state management, violating the single responsibility principle.
*   **Inconsistent Authentication Handling:** Authentication logic is duplicated in multiple places, leading to potential inconsistencies and making it harder to maintain and test.
*   **Tight Coupling:** The `LoginForm` is tightly coupled to the API service, making it harder to switch to a different authentication mechanism in the future.

**Proposed Solution:**

1.  **Modify `LoginForm.tsx`:**
    *   Import the `useAuth` hook from `AuthContext.tsx`.
    *   Use the `login` function from the `useAuth` hook instead of the one from `../../services/api`.
2.  **Centralize Authentication Logic:** Ensure that all authentication-related logic is handled within the `AuthContext`.

This will ensure that the `LoginForm` is only responsible for handling the UI and form submission, while the `AuthContext` is responsible for managing the authentication state and providing the `login` function.

## Course Versioning

(This section will be populated with details about the course versioning system)
