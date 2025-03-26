# GitHub Copilot Custom Instructions for Learning Platform (Full Stack)

## Project Overview
I'm developing a comprehensive Learning Platform with a Django-based backend and a React-based frontend. The platform enables course management, student progress tracking, and interactive assessments with different user roles (student, instructor, admin).

## Tech Stack

### Backend

- **Folder**: The backend code resides in the `learningplatform_backend` directory.
- **Framework**: Django 4.2.9 with Django REST Framework
- **Authentication**: JWT authentication (djangorestframework-simplejwt)
- **Database**: SQLite (development)
- **Testing**: pytest, pytest-django
- **Code Quality**: pylint, black


### Frontend
- **Framework**: React 18 with TypeScript
- **UI Components**: Material UI
- **Routing**: React Router
- **State Management**: Zustand (client state), React Query (server state)
- **API Requests**: Axios
- **Build Tool**: Vite

## Architecture

### Backend Structure
- Core app handles user authentication, course management, and progress tracking
- REST API endpoints with proper permission classes
- Custom middleware for logging (RequestLoggingMiddleware, AuthLoggingMiddleware)
- Models include User, Course, LearningTask, QuizTask, TaskProgress, CourseEnrollment

### Frontend Structure
- Feature-based component organization with shared components in `/components/common`
- TypeScript interfaces for all component props and state
- API service architecture with dedicated hooks for different resources

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
- components and pages shall not use Axios directly
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

### Frontend Tasks
- Creating new components with proper props interface, error handling, and loading states
- Implementing forms with validation and error feedback
- Using shared UI components like `DataTable`, `StatusChip`, and `ProgressIndicator`
- Handling data fetching and state management

## Testing
- Backend: Use pytest and pytest-django for unit and integration tests
- Frontend: Use React Testing Library for component tests and Playwright for end-to-end testing

## Special Requirements & Challenges

### Backend
- WSL networking issues when accessing the server from Windows host
- Efficient querying for analytics endpoints
- Properly structured logging for debugging
- Managing course enrollment and progress tracking efficiently
- Always include proper error handling
- Ensure database queries are optimized (minimize N+1 query issues)

### Frontend
- Improve type safety throughout the application
- Reduce code duplication by extending shared components
- Enhance error handling with more informative user feedback
- Improve performance with better data fetching and caching strategies
- Use path aliases (e.g., `@components/*`, `@features/*`) for imports

## Preferred Solution Style
- Clear, well-documented code with helpful comments
- Reuse existing patterns from the codebase where appropriate
- Consider both security and performance implications
- Include tests for new functionality
- Follow established project conventions for both backend and frontend
- Use built-in framework features where possible rather than reinventing solutions
