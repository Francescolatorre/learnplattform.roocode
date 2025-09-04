# Learning Platform Backend

## Project Structure

This Django project has been refactored to follow best practices for Django project organization:

```
Backend/
├── config/              # Project settings and configuration
│   ├── __init__.py
│   ├── asgi.py          # ASGI configuration
│   ├── settings.py      # Django settings
│   ├── urls.py          # Main URL configuration
│   └── wsgi.py          # WSGI configuration
├── core/                # Core application
│   ├── __init__.py
│   ├── admin.py         # Admin panel configuration
│   ├── apps.py          # App configuration
│   ├── middleware.py    # Custom middleware
│   ├── models.py        # Database models
│   ├── permissions.py   # Custom permissions
│   ├── serializers.py   # REST API serializers
│   ├── urls.py          # App URL patterns
│   └── views.py         # API view handlers
├── courses/             # Courses application
│   └── __init__.py
├── utils/               # Utility functions
│   └── __init__.py
│   └── markdown_utils.py
└── manage.py            # Django management script
```

## Running the Application

1. Ensure you're in the `Backend` directory
2. Run migrations:

   ```
   python manage.py migrate
   ```

3. Start the development server:

   ```
   python manage.py runserver
   ```

## API Documentation

API documentation is available at:

- `/swagger/` - Swagger UI
- `/redoc/` - ReDoc UI

## Authentication

The API uses JWT authentication:

- `/auth/login/` - Obtain token
- `/auth/register/` - Register new user
- `/auth/logout/` - Logout (blacklist token)
- `/auth/token/refresh/` - Refresh token

## Main Endpoints

- `/api/v1/courses/` - Course management
- `/api/v1/learning-tasks/` - Learning task management
- `/api/v1/enrollments/` - Course enrollment management
- `/api/v1/task-progress/` - Track task completion progress
- `/api/v1/quiz-attempts/` - Quiz attempt tracking

## Implementation Notes

This backend structure follows Django best practices with:

1. Clear separation between project configuration and apps
2. Proper import paths that won't cause module resolution issues
3. Well-structured models with relationship fields
4. ViewSets for consistent API endpoints
5. JWT authentication for secure access

## Model Structure

The core models include:

- User: Extended Django user model with roles
- Course: Educational courses with metadata
- LearningTask: Tasks within courses
- QuizTask: Interactive quizzes (subclass of LearningTask)
- CourseEnrollment: Student enrollment in courses
- TaskProgress: Student progress tracking
