# GitHub Copilot Custom Instructions for Learning Platform (Full Stack)

## Project Overview
I'm developing a comprehensive Learning Platform with a Django-based backend and a React-based frontend. The platform enables course management, student progress tracking, and interactive assessments with different user roles (student, instructor, admin).

> **IMPORTANT TERMINOLOGY CLARIFICATION:**
> In this project, we differentiate between two types of "tasks":
> 1. **LearningTasks** - The actual learning assignments in the platform that students complete
> 2. **DevTasks** - The development work items stored in `memory_bank/tasks/`
> Please maintain this distinction in all suggestions and code generation.

## Tech Stack

### Backend

- **Folder**: The backend code resides in the `learningplatform_backend` directory.
- **Framework**: Django 4.2.9 with Django REST Framework
- **Authentication**: JWT authentication (djangorestframework-simplejwt)
- **Database**: SQLite (development)
- **Testing**: pytest, pytest-django
- **Code Quality**: pylint, black
- **Logging**: Use lazy % formatting in logging
- **API Documentation**: drf-yasg for Swagger documentation


### Frontend
- **Framework**: React 18 with TypeScript
- **UI Components**: Material UI
- **Routing**: React Router with v7_startTransition future flag enabled
- **State Management**: Zustand (client state), React Query (server state)
- **API Requests**: Axios
- **Build Tool**: Vite

## Architecture

## Backend Structure
- Core app handles user authentication, course management, and progress tracking
- REST API endpoints with proper permission classes
- Custom middleware for logging (RequestLoggingMiddleware, AuthLoggingMiddleware)
- **Domain Models**: User, Course, LearningTask (student learning assignments), QuizTask, TaskProgress, CourseEnrollment

### API Routing Structure
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

### Frontend Structure
- Feature-based component organization with shared components in `/components/common`
- TypeScript interfaces for all component props and state
- API service architecture with dedicated hooks for different resources

## Governance Model

### Task Structure & Documentation
- All **DevTasks** (development work items) are stored in the `memory_bank/tasks/` directory
- ADRs (Architecture Decision Records) are stored in `memory_bank/ADRs/`
- Project documentation is maintained in `memory_bank/Documentation/`
- All **DevTasks** should follow a structured format:
  - Clear description of purpose and objectives
  - Specific, measurable requirements
  - Validation criteria for completion
  - Dependencies and related tasks
  - Expected outcomes

### Development Workflow
- Follow the **DevTask** lifecycle: DRAFT → VALIDATED → TODO → IN_PROGRESS → DONE
- Implement validation checks before considering **DevTasks** complete
- Document ADRs (Architecture Decision Records) for significant decisions
- Maintain consistency between implementation and documented requirements
- Create comprehensive test coverage for new functionality
- Use `memory_bank/activeContext.md` for tracking current development work
- Use `memory_bank/progress.md` for overall project progress tracking

### Code Organization Standards
- Group related functionality in appropriate modules/services
- Follow single responsibility principle for components and services
- Document public APIs and complex logic with clear comments
- Use a standardized folder structure for new features
- Maintain clear separation between UI components and business logic

### Git Commit Standards
- Format: `[DEVTASK-ID] [STATUS] [SUMMARY]` (e.g., "TASK-API-001 IN_PROGRESS Implement auth endpoints")
- Include validation status and explanation
- Keep commits focused on single logical changes
- Use descriptive messages that explain WHY changes were made

## Key Features
- Course management with versioning capabilities
- User progress tracking across courses and tasks
- Quiz system with questions, options, and attempts tracking
- Detailed analytics for student performance
- Role-based access control (student, instructor, admin)
- Comprehensive logging system tracking API requests, authentication, and errors

## Coding Preferences

### Backend
- Follow PEP 8 styling with Black formatting
- Use Django's class-based views (ViewSets and APIView classes) where appropriate
- Implement proper permissions and authentication checks
- Log important events using the custom logging infrastructure
- Include detailed docstrings for classes and methods
- Use Django's model relationships appropriately (ForeignKey, ManyToMany)
- Handle errors gracefully with appropriate status codes and messages

### Django-Specific Best Practices
- Prefer ModelViewSets for standard CRUD operations with additional custom actions
- Use model manager methods for complex database queries instead of putting query logic in views
- Apply select_related() and prefetch_related() consistently to avoid N+1 query problems
- Use F() and Q() objects for database-level operations and complex filtering
- Implement permission_classes at the view level, not just globally in settings
- Use serializer_class and get_serializer_class() for dynamic serializer selection
- Implement pagination, filtering, and ordering using DRF's built-in tools
- Use Django signals (pre_save, post_save) for model lifecycle management
- Apply Django's transaction.atomic() for operations that require database integrity

## Django Model Design
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

### Frontend
- Prefer functional components with hooks over class components
- Use TypeScript interfaces for props and state (prefix with 'I', e.g., `IUserProps`)
- Avoid `any` types where possible
- Format code with 2-space indentation
- Use named exports for components
- Use camelCase for variables and functions, PascalCase for components and interfaces
- Use Material UI theme configuration for consistent styling

## API Integration
- Backend implements RESTful endpoints with proper permission checks
- Frontend uses the `ApiService` class or hooks like `useApiResource` and `useCourseData`
- Components and pages shall not use Axios directly
- Include authentication tokens via Axios interceptors
- Handle loading, error, and success states consistently

## Authentication & Authorization
- Backend: JWT token authentication with refresh mechanics
- Frontend: Use the `useAuth` hook for authentication functionality
- Implement role-based access control using `withAuth` HOC or `RoleBasedRoute` component
- Check user roles before displaying role-specific UI elements or allowing access

## Common Project Tasks

### Backend Tasks
- Implementing API endpoints for course and task management
- Adding analytics features for tracking student progress
- Extending the permission system for role-based access
- Optimizing database queries for performance
- Adding tests for new features
- Troubleshooting network connectivity issues between client and server

### Django-Specific Tasks
- Creating custom API endpoints via @action decorator on ViewSets
- Implementing nested serializers for complex data structures
- Customizing the Django admin interface for better content management
- Setting up proper filter backends with filterset_fields and search_fields
- Implementing DRF's throttling mechanism for rate limiting
- Extending the JWT authentication system with custom claims
- Creating custom model fields and validators for domain-specific data
- Using get_serializer_context() to pass additional data to serializers

### API Routing and Viewsets
- Use Django REST Framework's DefaultRouter for registering ViewSets
- Implement custom actions with `@action` decorator for non-CRUD operations
- Follow RESTful URL patterns: `/api/v1/resources/`, `/api/v1/resources/{id}/`
- Group related endpoints using router.register() with appropriate prefixes
- Use namespacing for URL patterns to avoid conflicts
- Implement versioning through URL prefixing (e.g., `/api/v1/`, `/api/v2/`)

### Frontend Tasks
- Creating new components with proper props interface, error handling, and loading states
- Implementing forms with validation and error feedback
- Using shared UI components like `DataTable`, `StatusChip`, and `ProgressIndicator`
- Handling data fetching and state management
- Configuring React Router with v7_startTransition future flag to prevent warnings

## Testing
- Backend: Use pytest and pytest-django for unit and integration tests
- Frontend: Use React Testing Library for component tests and Playwright for end-to-end testing

### Django Testing Specifics
- Use pytest fixtures for reusable test components
- Implement model factories with factory_boy
- Use django.test.Client for API endpoint testing
- Mock external services when needed
- Test permissions for different user roles
- Use django.test.TestCase for database-driven tests
- Implement separate test databases for integration tests

## Special Requirements & Challenges

### Backend
- WSL networking issues when accessing the server from Windows host
- Efficient querying for analytics endpoints
- Properly structured logging for debugging
- Managing course enrollment and progress tracking efficiently
- Always include proper error handling
- Ensure database queries are optimized (minimize N+1 query issues)

### Django-Specific Challenges
- Configuring drf-yasg for comprehensive API documentation
- Setting up proper permission handling for public vs authenticated endpoints
- Implementing efficient analytics queries with Django ORM optimizations
- Managing models with complex relationships in DRF serializers
- Using proper pagination for large datasets
- Handling file uploads and serving media files
- Implementing proper exception handling with DRF's exception_handler
- Configuring Django settings properly for different environments
- Using Django's caching framework for performance optimization

### Frontend
- Improve type safety throughout the application
- Reduce code duplication by extending shared components
- Enhance error handling with more informative user feedback
- Improve performance with better data fetching and caching strategies
- Use path aliases (e.g., `@components/*`, `@features/*`) for imports
- Fix React Router warnings by enabling the v7_startTransition future flag in the router configuration

## Preferred Solution Style
- Clear, well-documented code with helpful comments
- Reuse existing patterns from the codebase where appropriate
- Consider both security and performance implications
- Include tests for new functionality
- Follow established project conventions for both backend and frontend
- Use built-in framework features where possible rather than reinventing solutions
- Reference existing patterns from similar **DevTasks** in `memory_bank/tasks/`
- Review relevant ADRs in `memory_bank/ADRs/` for architectural guidance before implementation
- Maintain clear distinction between learning platform entities (`LearningTask`) and development work items (`DevTask`)

## Quality Standards
- Provide comprehensive error handling for edge cases
- Document public APIs and complex logic
- Create reusable, maintainable components
- Implement proper validation both client-side and server-side
- Follow SOLID principles where appropriate
- Consider accessibility in UI implementations
- Optimize critical performance paths
