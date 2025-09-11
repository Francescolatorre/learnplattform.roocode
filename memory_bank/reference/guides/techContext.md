# Learning Platform Technology Context

## Backend Technologies

### Core Framework

- Django 4.2.x
- Django REST Framework
- Python 3.10+

### Authentication

- Simple JWT
- Token-based Authentication
- Role-based Access Control

### Database

- PostgreSQL 15+
- psycopg2 (PostgreSQL Adapter)

### API Documentation

- DRF Spectacular
- OpenAPI/Swagger Specification

### Additional Tools

- python-dotenv (environment variable management)
- django-cors-headers (CORS support)
- Pillow (image processing)
- Black (code formatter)
- Mypy (type checking with django-stubs)
- Pylint (static analysis)

## Frontend Technologies

### Core Framework

- React 18
- TypeScript
- Vite Build Tool

### State Management

- Zustand
- React Context API
- React Hooks

### UI Components

- Material UI
- @mui/x-data-grid
- Responsive Design Principles
- Accessibility Considerations

### Data Fetching & Forms

- React Query (@tanstack/react-query)
- Axios
- Formik
- React Hook Form
- Yup, Zod (validation)

### Visualization & Rich Content

- Chart.js, react-chartjs-2
- Quill (rich text editor)
- react-markdown, react-syntax-highlighter

### Error Notification System

- Centralized error notification system using React Context API and Material UI.
- See [ADR-012: Centralized Frontend Error Notification System](ADRs/ADR-012-frontend-error-notification-system.md).

## Testing Frameworks

### Backend

- Pytest
- pytest-django
- Django Test Client
- pytest-cov
- factory-boy

### Frontend

- Vitest
- React Testing Library
- Playwright (E2E Testing)
- @testing-library/jest-dom

## DevOps & Infrastructure

### Development Environment

- Visual Studio Code
- Git Version Control

### Deployment Considerations

- No containerization or cloud deployment currently implemented.

## Security

- Django security best practices (middleware, settings)
- Simple JWT for API authentication

## Performance Optimization

- Standard Django and PostgreSQL optimizations
- No Redis, Celery, or explicit caching in use

## Development Workflow

- Trunk-based Development
- Feature Branch Strategy
- Conventional Commits
- Semantic Versioning
- Prettier and ESLint for code quality
- Dependency-cruiser for dependency analysis

## Future Technology Exploration

- No active use of GraphQL, WebSockets, microservices, or ML model serving as of this revision.
