# ADR-001: TypeScript-Typenstruktur

## Kontext

Unser Projekt enthält zahlreiche TypeScript-Definitionen, darunter:

- Gemeinsame Typen wie `IPaginatedResponse`, die von mehreren Services verwendet werden
- Feature-spezifische Typen, die nur innerhalb eines bestimmten Funktionsbereichs relevant sind

Eine klare Strukturierung dieser Typen ist wichtig für die Wartbarkeit, Lesbarkeit und Skalierbarkeit des Codes.

## Entscheidung

Wir haben uns für folgende Strukturierung von TypeScript-Definitionen entschieden:

1. **Gemeinsame/Globale Typen**:
   - Speicherort: `src/types/common/`
   - Unterteilt in thematische Dateien wie `api.ts`, `entities.ts`, etc.
   - Re-Export über `src/types/index.ts`

2. **Feature-spezifische Typen**:
   - Speicherort: `src/features/<feature-name>/types/`
   - In thematische Dateien unterteilt (z.B. `courseTypes.ts`)
   - Re-Export über `src/features/<feature-name>/types/index.ts`

3. **Import-Konventionen**:
   - Globale Typen: `import { IPaginatedResponse } from '@/types';`
   - Feature-Typen: `import { ICourse } from '@features/courses/types';`

4. **Schnittstellen zwischen Features**:
   - Wenn ein Feature Typen aus einem anderen Feature benötigt, sollten "Basic"-Versionen der Typen verwendet werden, die nur die notwendigen Eigenschaften enthalten

### Aktualisierung von `IPaginatedResponse`

Die Schnittstelle `IPaginatedResponse` wurde aktualisiert, um mit dem API-Schema übereinzustimmen. Die Felder `next` und `previous` sind jetzt als `string | null` definiert, um die Möglichkeit von `null`-Werten zu berücksichtigen.

## Konsequenzen

### Vorteile

- Klare, konsistente Organisation von Typdefinitionen
- Verbesserte Auffindbarkeit und Lesbarkeit des Codes
- Reduzierte Abhängigkeiten zwischen Features
- Vereinfachtes Refactoring und Erweiterung

### Nachteile

- Anfänglicher Aufwand für die Umstrukturierung bestehender Typen
- Mögliche Duplikation bei "Basic"-Typen zwischen Features

## Status

Angenommen, 31.03.2025

## Referenzen

- [TypeScript-Dokumentation zu Modulen](https://www.typescriptlang.org/docs/handbook/modules.html)
- [React+TypeScript Best Practices](https://github.com/typescript-cheatsheets/react)

## Project Overview

I'm developing a comprehensive Learning Platform with a Django-based backend and a React-based frontend. The platform enables course management, student progress tracking, and interactive assessments with different user roles (student, instructor, admin).

> **IMPORTANT TERMINOLOGY CLARIFICATION:**
> In this project, we differentiate between two types of "tasks":
>
> 1. **LearningTasks** - The actual learning assignments in the platform that students complete
> 2. **DevTasks** - The development work items stored in `memory_bank/tasks/`
> Please maintain this distinction in all suggestions and code generation.

## Tech Stack

### Backend Tech Stack

- **Folder**: The backend code resides in the `learningplatform_backend` directory.
- **Framework**: Django 4.2.9 with Django REST Framework
- **Authentication**: JWT authentication (djangorestframework-simplejwt)
- **Database**: SQLite (development)
- **Testing**: pytest, pytest-django
- **Code Quality**: pylint, black
- **Logging**: Use lazy % formatting in logging
- **API Documentation**: drf-yasg for Swagger documentation

### Frontend Tech Stack

- **Framework**: React 18 with TypeScript
- **UI Components**: Material UI
- **Routing**: React Router with v7_startTransition future flag enabled
- **State Management**: Zustand (client state), React Query (server state)
- **API Requests**: Axios
- **Build Tool**: Vite

## Architecture Overview

### Backend Structure Overview

- Core app handles user authentication, course management, and progress tracking
- REST API endpoints with proper permission classes
- Custom middleware for logging (RequestLoggingMiddleware, AuthLoggingMiddleware)
- **Domain Models**: User, Course, LearningTask (student learning assignments), QuizTask, TaskProgress, CourseEnrollment

### API Routing Structure Overview

- **Base URL**: `localhost:8000/`
- **Authentication Endpoints**:
  - `POST /auth/login/`: User login
  - `POST /auth/logout/`: User logout
  - `POST /auth/register/`: User registration
  - `POST /auth/token/refresh/`: Refresh JWT token
  - `GET /auth/validate-token/`: Validate JWT token
- **User Endpoints**:
  - `GET /users/profile/`: Get user profile
- **Health Check**:
  - `GET /health/`: System health check
- **API Documentation**:
  - `/swagger/`: Swagger UI for API documentation
  - `/swagger/?format=openapi`: OpenAPI specification
- **API follows standard RESTful conventions** for resource endpoints

### Frontend Structure Overview

- **Component Organization**: Feature-based structure with shared components in `/components/common` and feature-specific components in `/features/*`
- **TypeScript Usage**: Strict type safety with interfaces prefixed by `I` (e.g., `IUserProps`)
- **UI Framework**: Material UI with a centralized theme configuration for consistent styling
- **Routing**: React Router v7 with `v7_startTransition` future flag enabled for smoother navigation
- **State Management**:
  - **Client State**: Zustand for lightweight and scalable state management
  - **Server State**: React Query for efficient data fetching, caching, and synchronization
- **API Integration**: Centralized API service layer using Axios with interceptors for authentication and error handling
- **Build Tool**: Vite for fast builds and optimized development experience
- **Testing**: React Testing Library for unit tests and Playwright for end-to-end testing
- **Code Formatting**: 2-space indentation, camelCase for variables/functions, PascalCase for components/interfaces
- **Path Aliases**: Use path aliases (e.g., `@components/*`, `@features/*`) for cleaner imports
- **Error Handling**: Centralized error boundaries and informative user feedback mechanisms
- **Performance Optimization**: Lazy loading for routes and components, React Query caching, and memoization where applicable

## Folder Structure Overview

The project follows a well-defined folder structure to ensure maintainability and scalability. Below is the recommended structure:

### Backend Folder Structure

- `apps/`: Contains Django apps (e.g., `auth`, `courses`, `tasks`)
- `config/`: Django project settings and configuration files
- `tests/`: Backend test cases
- `utils/`: Shared utility functions and helpers
- `logs/`: Log files for debugging and monitoring
- `static/`: Static files (e.g., CSS, JS)
- `media/`: Uploaded media files

### Frontend Folder Structure

- `src/`: Main source folder
  - `components/`: Reusable UI components
    - `common/`: Shared components (e.g., `DataTable`, `StatusChip`)
    - `layout/`: Layout components (e.g., `MainLayout`)
  - `features/`: Feature-specific components and logic
    - `auth/`: Authentication-related components and hooks
    - `courses/`: Course management components
    - `dashboard/`: Dashboard and analytics components
    - `learningTasks/`: Learning task-related components
  - `hooks/`: Custom React hooks
  - `services/`: API service layer
    - `api/`: Centralized API logic
  - `store/`: Zustand state management stores
  - `theme/`: Material UI theme configuration
  - `types/`: TypeScript type definitions
  - `utils/`: Shared utility functions
  - `routes/`: Application routing configuration
  - `tests/`: Frontend test cases
- `public/`: Static assets (e.g., `index.html`, images)

### Memory Bank Folder Structure

- `tasks/`: **DevTasks** (development work items)
- `ADRs/`: Architecture Decision Records
- `Documentation/`: Project documentation
- `activeContext.md`: Tracks current development work
- `progress.md`: Tracks overall project progress

### Additional Notes on Folder Structure

- Follow this structure for new features or modules.
- Reference existing patterns in `memory_bank/ADRs/` for architectural guidance.

## Frontend Development Standards Overview

- **Component Design**:
  - Prefer functional components with hooks over class components
  - Separate UI logic from business logic
  - Use reusable shared components for common UI patterns (e.g., `DataTable`, `StatusChip`, `ProgressIndicator`)
- **Forms**:
  - Use Material UI form components with validation via libraries like `react-hook-form` or `yup`
  - Provide clear error messages and feedback for invalid inputs
- **Routing**:
  - Use `ProtectedRoute` and `RoleBasedRoute` components for access control
  - Organize routes in a centralized `routes.tsx` file for maintainability
- **State Management**:
  - Use Zustand for lightweight client-side state
  - Use React Query hooks (e.g., `useQuery`, `useMutation`) for server-side state
  - Avoid direct Axios calls in components; use dedicated hooks or services
- **Styling**:
  - Use Material UI's `sx` prop or styled components for custom styles
  - Maintain a consistent theme using Material UI's `ThemeProvider`
- **Testing**:
  - Write unit tests for components with React Testing Library
  - Use Playwright for testing critical user flows
  - Mock API calls in tests to ensure isolation and reliability
- **Error Handling**:
  - Implement centralized error boundaries for catching runtime errors
  - Use React Query's `onError` callbacks for API error handling
  - Display user-friendly error messages in the UI

## Governance Model Overview

### Task Structure & Documentation Overview

- All **DevTasks** (development work items) are stored in the `memory_bank/tasks/` directory
- ADRs (Architecture Decision Records) are stored in `memory_bank/ADRs/`
- Project documentation is maintained in `memory_bank/Documentation/`
- All **DevTasks** should follow a structured format:
  - Clear description of purpose and objectives
  - Specific, measurable requirements
  - Validation criteria for completion
  - Dependencies and related tasks
  - Expected outcomes

### Development Workflow Overview

- Follow the **DevTask** lifecycle: DRAFT → VALIDATED → TODO → IN_PROGRESS → DONE
- Implement validation checks before considering **DevTasks** complete
- Document ADRs (Architecture Decision Records) for significant decisions
- Maintain consistency between implementation and documented requirements
- Create comprehensive test coverage for new functionality
- Use `memory_bank/activeContext.md` for tracking current development work
- Use `memory_bank/progress.md` for overall project progress tracking

### Code Organization Standards Overview

- Group related functionality in appropriate modules/services
- Follow single responsibility principle for components and services
- Document public APIs and complex logic with clear comments
- Use a standardized folder structure for new features
- Maintain clear separation between UI components and business logic

### Git Commit Standards Overview

- Format: `[DEVTASK-ID] [STATUS] [SUMMARY]` (e.g., "TASK-API-001 IN_PROGRESS Implement auth endpoints")
- Include validation status and explanation
- Keep commits focused on single logical changes
- Use descriptive messages that explain WHY changes were made

## Key Features Overview

- Course management with versioning capabilities
- User progress tracking across courses and tasks
- Quiz system with questions, options, and attempts tracking
- Detailed analytics for student performance
- Role-based access control (student, instructor, admin)
- Comprehensive logging system tracking API requests, authentication, and errors

## Coding Preferences Overview

### Backend Coding Preferences

- Follow PEP 8 styling with Black formatting
- Use Django's class-based views (ViewSets and APIView classes) where appropriate
- Implement proper permissions and authentication checks
- Log important events using the custom logging infrastructure
- Include detailed docstrings for classes and methods
- Use Django's model relationships appropriately (ForeignKey, ManyToMany)
- Handle errors gracefully with appropriate status codes and messages

### Django-Specific Best Practices Overview

- Prefer ModelViewSets for standard CRUD operations with additional custom actions
- Use model manager methods for complex database queries instead of putting query logic in views
- Apply select_related() and prefetch_related() consistently to avoid N+1 query problems
- Use F() and Q() objects for database-level operations and complex filtering
- Implement permission_classes at the view level, not just globally in settings
- Use serializer_class and get_serializer_class() for dynamic serializer selection
- Implement pagination, filtering, and ordering using DRF's built-in tools
- Use Django signals (pre_save, post_save) for model lifecycle management
- Apply Django's transaction.atomic() for operations that require database integrity

## Django Model Design Overview

- **Learning Platform Domain Models** (student-facing application entities):
  - `User`: Authentication and user roles
  - `Course`: Educational content container
  - `LearningTask`: Student assignments within courses
  - `QuizTask`: Specialized learning assignments with questions
  - `TaskProgress`: Tracks student completion of learning assignments
  - `CourseEnrollment`: Links students to courses
- Use abstract base classes for shared model attributes and behaviors
- Implement custom model managers for reusable query logic
- Apply appropriate model inheritance patterns (Abstract, Multi-table)
- Define proper constraints, indexes, and unique_together in Meta classes
- Use model methods for operations on the instance level
- Implement clean() method for model-level validation

### Frontend Coding Preferences Overview

- Prefer functional components with hooks over class components
- Use TypeScript interfaces for props and state (prefix with 'I', e.g., `IUserProps`)
- Avoid `any` types where possible
- Format code with 2-space indentation
- Use named exports for components
- Use camelCase for variables and functions, PascalCase for components and interfaces
- Use Material UI theme configuration for consistent styling

## API Integration Overview

- Backend implements RESTful endpoints with proper permission checks
- Frontend uses the `ApiService` class or hooks like `useApiResource` and `useCourseData`
- Components and pages shall not use Axios directly
- Include authentication tokens via Axios interceptors
- Handle loading, error, and success states consistently
- **Harmonizing Services**:
  - Centralize API logic in a dedicated service layer (e.g., `services/apiService.ts`)
  - Use consistent naming conventions for service methods (e.g., `fetchCourses`, `createTask`)
  - Implement reusable hooks (e.g., `useApiResource`) for common API patterns
  - Ensure all services follow the same error-handling and logging strategy
  - Use TypeScript interfaces to define request and response schemas for all services
  - Document service methods with clear descriptions of their purpose and usage

## Authentication & Authorization Overview

- Backend: JWT token authentication with refresh mechanics
- Frontend: Use the `useAuth` hook for authentication functionality
- Implement role-based access control using `withAuth` HOC or `RoleBasedRoute` component
- Check user roles before displaying role-specific UI elements or allowing access

## Common Project Tasks Overview

### Backend Tasks Overview

- Implementing API endpoints for course and task management
- Adding analytics features for tracking student progress
- Extending the permission system for role-based access
- Optimizing database queries for performance
- Adding tests for new features
- Troubleshooting network connectivity issues between client and server

### Django-Specific Tasks Overview

- Creating custom API endpoints via @action decorator on ViewSets
- Implementing nested serializers for complex data structures
- Customizing the Django admin interface for better content management
- Setting up proper filter backends with filterset_fields and search_fields
- Implementing DRF's throttling mechanism for rate limiting
- Extending the JWT authentication system with custom claims
- Creating custom model fields and validators for domain-specific data
- Using get_serializer_context() to pass additional data to serializers

### API Routing and Viewsets Overview

- Use Django REST Framework's DefaultRouter for registering ViewSets
- Implement custom actions with `@action` decorator for non-CRUD operations
- Follow RESTful URL patterns: `/api/v1/resources/`, `/api/v1/resources/{id}/`
- Group related endpoints using router.register() with appropriate prefixes
- Use namespacing for URL patterns to avoid conflicts
- Implement versioning through URL prefixing (e.g., `/api/v1/`, `/api/v2/`)

### Frontend Tasks Overview

- Creating new components with proper props interface, error handling, and loading states
- Implementing forms with validation and error feedback
- Using shared UI components like `DataTable`, `StatusChip`, and `ProgressIndicator`
- Handling data fetching and state management
- Configuring React Router with v7_startTransition future flag to prevent warnings

## Testing Overview

- Backend: Use pytest and pytest-django for unit and integration tests
- Frontend: Use React Testing Library for component tests and end-to-end testing

### Testing Architecture Rules Overview

- **Global Mocks**:
  - Use a centralized `setupTests.ts` file to define global mocks and reusable test utilities.
  - Mock services like `authService` and `apiService` globally to ensure consistency across tests.
  - Mock `react-router-dom`'s `useNavigate` globally and export it for use in tests.

- **Reusable Helpers**:
  - Define reusable helpers like `login` for common test flows (e.g., user login) in `setupTests.ts`.
  - Ensure helpers return consistent mock data that aligns with the application's API responses.

- **LocalStorage Mocking**:
  - Mock `localStorage` globally in `setupTests.ts` to isolate tests from browser-specific behavior.
  - Clear `localStorage` before each test to ensure a clean state.

- **Playwright Integration**:
  - Use Playwright's `Page` type for reusable helpers like `login`.
  - Ensure Playwright helpers include explicit return types and handle navigation properly.

- **Mock Reset**:
  - Use `vi.clearAllMocks()` in `beforeEach` to reset mocks between tests.
  - Ensure all mocks are properly reset to avoid test contamination.

- **Test Isolation**:
  - Avoid direct API calls in tests; use mocked services or helpers instead.
  - Ensure each test is isolated and does not depend on the state of other tests.

- **Error Handling**:
  - Test error scenarios by mocking service failures (e.g., rejected promises).
  - Verify that error messages and fallback UI are displayed correctly.

- **Consistency**:
  - Ensure mock data and responses are consistent with the application's API schema.
  - Use the same mock data structure across unit and integration tests.

- **Documentation**:
  - Document all reusable helpers and global mocks in `setupTests.ts` for maintainability.
  - Include comments explaining the purpose of each mock and helper.

- **Testing Tools**:
  - Use React Testing Library for unit tests and Playwright for end-to-end tests.
  - Ensure tests are written to cover both success and failure scenarios.

### Django Testing Specifics Overview

- Use pytest fixtures for reusable test components
- Implement model factories with factory_boy
- Use django.test.Client for API endpoint testing
- Mock external services when needed
- Test permissions for different user roles
- Use django.test.TestCase for database-driven tests
- Implement separate test databases for integration tests

## Special Requirements & Challenges Overview

### Backend Challenges Overview

- WSL networking issues when accessing the server from Windows host
- Efficient querying for analytics endpoints
- Properly structured logging for debugging
- Managing course enrollment and progress tracking efficiently
- Always include proper error handling
- Ensure database queries are optimized (minimize N+1 query issues)

### Django-Specific Challenges Overview

- Configuring drf-yasg for comprehensive API documentation
- Setting up proper permission handling for public vs authenticated endpoints
- Implementing efficient analytics queries with Django ORM optimizations
- Managing models with complex relationships in DRF serializers
- Using proper pagination for large datasets
- Handling file uploads and serving media files
- Implementing proper exception handling with DRF's exception_handler
- Configuring Django settings properly for different environments
- Using Django's caching framework for performance optimization

### Frontend Challenges Overview

- Improve type safety throughout the application
- Reduce code duplication by extending shared components
- Enhance error handling with more informative user feedback
- Improve performance with better data fetching and caching strategies
- Use path aliases (e.g., `@components/*`, `@features/*`) for imports
- Fix React Router warnings by enabling the v7_startTransition future flag in the router configuration

## Preferred Solution Style Overview

- Clear, well-documented code with helpful comments
- Reuse existing patterns from the codebase where appropriate
- Consider both security and performance implications
- Include tests for new functionality
- Follow established project conventions for both backend and frontend
- Use built-in framework features where possible rather than reinventing solutions
- Reference existing patterns from similar **DevTasks** in `memory_bank/tasks/`
- Review relevant ADRs in `memory_bank/ADRs/` for architectural guidance before implementation
- Maintain clear distinction between learning platform entities (`LearningTask`) and development work items (`DevTask`)

## Quality Standards Overview

- Provide comprehensive error handling for edge cases
- Document public APIs and complex logic
- Create reusable, maintainable components
- Implement proper validation both client-side and server-side
- Follow SOLID principles where appropriate
- Consider accessibility in UI implementations
- Optimize critical performance paths
