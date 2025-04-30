# GitHub Copilot Custom Instructions for Learning Platform (Full Stack)

---

## Goal

**Assist in generating backend and frontend code aligned with project architecture, terminology, workflows, and best practices, while ensuring vertical integration and validation through tests.**

---

## Project Overview

I'm developing a comprehensive Learning Platform featuring:

- Django-based backend
- React-based frontend
- Course management
- Student progress tracking
- Interactive assessments
- Multiple user roles (student, instructor, admin)

---

## Important Terminology

In this project, "task" can mean two distinct things:

- **LearningTask**: Student-facing assignments completed within the platform.
- **DevTask**: Development work items tracked under `memory_bank/tasks/`.

> Always maintain this distinction across all suggestions and code generation.

---

## Tech Stack

### Backend

- **Folder**: `learningplatform_backend/`
- **Framework**: Django 4.2.9 + Django REST Framework (DRF)
- **Authentication**: JWT (djangorestframework-simplejwt)
- **Database**: SQLite (for development)
- **Testing**: pytest, pytest-django
- **Code Quality**: pylint, black
- **Logging**: Use lazy `%` formatting
- **API Documentation**: drf-yasg (Swagger/OpenAPI)

### Frontend

- **Framework**: React 18 + TypeScript
- **UI Components**: Material UI
- **Routing**: React Router v7 (`v7_startTransition` future flag enabled)
- **State Management**: Zustand (client state), React Query (server state)
- **API Requests**: Axios
- **Build Tool**: Vite

### Development Client

- Use `;` to separate multiple commands (e.g., `cd project; npm start`) instead of `&&`.

---

## Backend Structure Overview

- Core app handles authentication, course management, and tracking
- REST API organized with ViewSets and proper permission classes
- Custom middleware for logging:
  - `RequestLoggingMiddleware`
  - `AuthLoggingMiddleware`
- **Domain Models**:
  - `User`, `Course`, `LearningTask`, `QuizTask`, `TaskProgress`, `CourseEnrollment`

---

## API Routing Overview

- **Base URL**: `localhost:8000/`
- **Authentication Endpoints**:
  - `POST /auth/login/` (public)
  - `POST /auth/logout/` (auth required)
  - `POST /auth/register/` (public)
  - `POST /auth/token/refresh/`
  - `GET /auth/validate-token/`
- **User Endpoints**:
  - `GET /users/profile/`
- **Health Check**:
  - `GET /health/`
- **API Docs**:
  - `/swagger/`
  - `/swagger/?format=openapi`

> APIs follow RESTful standards with JWT protection where appropriate.

---

## Frontend Structure Overview

- **Component Organization**:
  - `/components/common/` (shared UI elements)
  - `/features/*` (feature-specific components)
- **TypeScript**:
  - Use strict typing
  - Interfaces prefixed with `I` (e.g., `IUserProps`)
- **State Management**:
  - Zustand for client state
  - React Query for server state
- **API Layer**:
  - Centralized API service using Axios with interceptors
- **Testing**:
  - React Testing Library for units
  - Playwright for end-to-end tests
- **Other**:
  - Vite for builds
  - Material UI theme configuration
  - 2-space indentation, camelCase, PascalCase

---

## Memory Bank Folder Structure

- `tasks/`: DevTasks (development work items)
- `ADRs/`: Architecture Decision Records
- `Documentation/`: Project documentation
- `activeContext.md`: Tracks current development focus
- `progress.md`: Tracks overall project progress

---

## Development Principles

### Vertical Integration First

- Always implement features as **vertical slices**.
- A vertical slice should touch:
  - Database models (backend)
  - API endpoints
  - Service layers (frontend/backend)
  - UI components
- Avoid completing isolated backend or frontend pieces without wiring them together early.

### Test-Driven Validation

- **Every change must be validated through tests**.
- Backend:
  - Unit and integration tests using pytest
- Frontend:
  - Unit and integration tests with Vitest
  - test:unit for unit tests
  - test:integration for integration tests with real backend
  - End-to-end tests with Playwright
- Include positive, negative, and edge case testing where appropriate.
- Changes are only considered complete when corresponding tests pass.

---

## Governance Model

- **DevTasks** must:
  - Follow a clear lifecycle: DRAFT → VALIDATED → TODO → IN_PROGRESS → DONE
  - Have structured documentation: description, requirements, validation criteria, dependencies
- **ADRs** must:
  - Document significant technical decisions.
- **Progress Tracking**:
  - Use `memory_bank/activeContext.md` for active focus.
  - Use `memory_bank/progress.md` for project overview.

---

## Git Commit Standards

- Format: `[DEVTASK-ID] [STATUS] [SUMMARY]`
  - Example: `TASK-API-001 IN_PROGRESS Implement auth endpoints`
- Keep commits focused and descriptive.
- Include validation information in commit messages when appropriate.

---

## Backend Coding Standards

- Follow PEP 8 and Black formatting
- Use Django class-based views (ViewSets preferred)
- Apply proper permission_classes
- Use model relationships efficiently (ForeignKey, ManyToMany)
- Optimize database queries with select_related and prefetch_related
- Log using lazy `%` formatting
- Add detailed docstrings for public classes and methods

---

## Frontend Coding Standards

- Prefer functional components with hooks
- Use strict TypeScript interfaces (prefix with `I`)
- No `any` unless absolutely necessary
- Centralize error handling and API logic
- Use Material UI theming consistently
- Optimize performance with lazy loading, memoization
- Organize routes in a centralized file

---

## Testing Overview

### Backend

- pytest + pytest-django
- Model factories (factory_boy)
- API tests using django.test.Client

### Frontend

- Vitest for unit tests
- Playwright for end-to-end tests
- Centralize global mocks in `setupTests.ts`
- Isolate tests and avoid direct API calls

---

## Special Requirements

- Solve WSL networking issues for backend testing
- Ensure course enrollment and progress tracking efficiency
- Optimize API queries to avoid N+1 problems
- Provide informative error messages throughout the UI
- Use path aliases for cleaner imports
- Enable React Router v7 `startTransition` to avoid warnings

---

## Preferred Solution Style

- Write clear, maintainable code with useful comments
- Reuse existing architectural patterns from ADRs and DevTasks
- Always consider security, scalability, and performance
- Document service methods and public APIs
- Validate all functionality through tests before finalizing
- Maintain clear distinction between LearningTasks and DevTasks

---

## Quality Standards

- Comprehensive error handling
- Full documentation for APIs and complex logic
- Create reusable, maintainable components
- Apply validation on both frontend and backend
- Follow SOLID principles where applicable
- Include accessibility considerations (ARIA, keyboard navigation)
- Optimize critical performance paths

## Additional Frontend TypeScript Rules

- Define TypeScript types/interfaces for all API responses and requests.
- Prefer `enum` types for constant sets like user roles and statuses.
- Provide default values when destructuring props.
- Assume `strict` mode is active (no implicit `any` allowed).
- Use Error Boundaries for UI components handling server data.

## Additional Backend Django Rules

- Optimize relational database queries with `select_related` and `prefetch_related`.
- Use custom exceptions for domain-specific errors.
- Centralize validation inside DRF serializers.
- Wrap multi-step database operations with `@transaction.atomic`.
- Specify `ordering` and human-friendly names in Django model `Meta` classes.
- Use environment-specific settings files.
- Handle file uploads securely via `upload_to` settings.
