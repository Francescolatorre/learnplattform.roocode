# Learning Platform API Documentation

**Version**: 2025.1
**Last Updated**: 2025-09-19
**Status**: Active

---

## Overview

This document provides comprehensive API documentation for the Learning Platform, covering all available endpoints, authentication, request/response formats, and integration patterns.

## Base URL

- **Development**: `http://localhost:8000`
- **Staging**: `https://staging.learningplatform.example.com`
- **Production**: `https://api.learningplatform.example.com`

## Authentication

### JWT Token-Based Authentication

All authenticated endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <access_token>
```

### Token Endpoints

#### Login
```http
POST /auth/login/
Content-Type: application/json

{
  "username": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "access": "jwt_access_token",
  "refresh": "jwt_refresh_token"
}
```

#### Token Refresh
```http
POST /auth/token/refresh/
Content-Type: application/json

{
  "refresh": "jwt_refresh_token"
}
```

**Response:**
```json
{
  "access": "new_jwt_access_token"
}
```

#### Token Validation
```http
POST /auth/validate-token/
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "status": true
}
```

#### Logout
```http
POST /auth/logout/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "refresh": "jwt_refresh_token"
}
```

## User Management Endpoints

### User Registration
```http
POST /auth/register/
Content-Type: application/json

{
  "username": "string",
  "email": "string",
  "password": "string",
  "password2": "string",
  "role": "student|instructor|admin"
}
```

### User Profile
```http
GET /users/profile/
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "id": 1,
  "username": "string",
  "email": "string",
  "role": "student|instructor|admin",
  "display_name": "string",
  "created_at": "2025-01-01T00:00:00Z",
  "updated_at": "2025-01-01T00:00:00Z"
}
```

### Password Reset
```http
POST /auth/password-reset/
Content-Type: application/json

{
  "email": "string"
}
```

```http
POST /auth/password-reset/confirm/
Content-Type: application/json

{
  "token": "string",
  "new_password": "string"
}
```

## Course Management Endpoints

### List Courses
```http
GET /courses/
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `search`: Filter by course title or description
- `status`: Filter by course status (draft, published, archived)
- `creator`: Filter by creator ID
- `ordering`: Sort order (title, created_at, -created_at)
- `page`: Page number for pagination
- `page_size`: Number of results per page

**Response:**
```json
{
  "count": 50,
  "next": "http://api.example.com/courses/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "title": "Course Title",
      "description": "Course description",
      "learning_objectives": "Learning objectives",
      "prerequisites": "Prerequisites",
      "status": "published",
      "visibility": "public",
      "creator": {
        "id": 1,
        "username": "instructor",
        "display_name": "Instructor Name"
      },
      "created_at": "2025-01-01T00:00:00Z",
      "updated_at": "2025-01-01T00:00:00Z"
    }
  ]
}
```

### Get Course Details
```http
GET /courses/{id}/
Authorization: Bearer <access_token>
```

### Create Course
```http
POST /courses/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "title": "string",
  "description": "string",
  "learning_objectives": "string",
  "prerequisites": "string",
  "status": "draft|published|archived",
  "visibility": "public|private"
}
```

### Update Course
```http
PUT /courses/{id}/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "title": "string",
  "description": "string",
  "learning_objectives": "string",
  "prerequisites": "string",
  "status": "draft|published|archived",
  "visibility": "public|private"
}
```

### Delete Course
```http
DELETE /courses/{id}/
Authorization: Bearer <access_token>
```

## Task Management Endpoints

### List Learning Tasks
```http
GET /learning-tasks/
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `course`: Filter by course ID
- `status`: Filter by task status
- `ordering`: Sort order
- `page`: Page number
- `page_size`: Results per page

### Get Task Details
```http
GET /learning-tasks/{id}/
Authorization: Bearer <access_token>
```

### Create Learning Task
```http
POST /learning-tasks/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "title": "string",
  "description": "string",
  "course": 1,
  "task_type": "assignment|quiz|project",
  "status": "draft|published",
  "due_date": "2025-12-31T23:59:59Z",
  "max_points": 100
}
```

### Update Learning Task
```http
PUT /learning-tasks/{id}/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "title": "string",
  "description": "string",
  "task_type": "assignment|quiz|project",
  "status": "draft|published",
  "due_date": "2025-12-31T23:59:59Z",
  "max_points": 100
}
```

### Delete Learning Task
```http
DELETE /learning-tasks/{id}/
Authorization: Bearer <access_token>
```

## Enrollment Management Endpoints

### List User Enrollments
```http
GET /enrollments/
Authorization: Bearer <access_token>
```

### Enroll in Course
```http
POST /enrollments/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "course": 1
}
```

### Get Enrollment Details
```http
GET /enrollments/{id}/
Authorization: Bearer <access_token>
```

### Unenroll from Course
```http
DELETE /enrollments/{id}/
Authorization: Bearer <access_token>
```

## Progress Tracking Endpoints

### Get Student Progress
```http
GET /progress/student/{student_id}/
Authorization: Bearer <access_token>
```

### Get Course Progress
```http
GET /progress/course/{course_id}/
Authorization: Bearer <access_token>
```

### Update Task Progress
```http
POST /progress/task/{task_id}/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "status": "not_started|in_progress|completed",
  "points_earned": 85,
  "submission_data": {}
}
```

## Health and Status Endpoints

### Health Check
```http
GET /health/
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-01T00:00:00Z",
  "version": "2025.1"
}
```

## Error Handling

### Standard Error Response Format
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field_name": ["This field is required."]
    }
  }
}
```

### Common HTTP Status Codes
- `200 OK`: Successful request
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

## Rate Limiting

API requests are limited to:
- **Authenticated users**: 1000 requests per hour
- **Anonymous users**: 100 requests per hour

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

## Pagination

List endpoints support pagination with the following parameters:
- `page`: Page number (default: 1)
- `page_size`: Items per page (default: 20, max: 100)

Paginated responses include:
```json
{
  "count": 100,
  "next": "http://api.example.com/endpoint/?page=3",
  "previous": "http://api.example.com/endpoint/?page=1",
  "results": []
}
```

## WebSocket Endpoints

### Real-time Notifications
```
ws://localhost:8000/ws/notifications/
```

**Authentication**: Include JWT token as query parameter
```
ws://localhost:8000/ws/notifications/?token=<access_token>
```

**Message Format:**
```json
{
  "type": "notification",
  "data": {
    "id": 1,
    "message": "New assignment available",
    "timestamp": "2025-01-01T00:00:00Z"
  }
}
```

## SDK and Client Libraries

### JavaScript/TypeScript
```bash
npm install @learningplatform/api-client
```

```typescript
import { LearningPlatformAPI } from '@learningplatform/api-client';

const api = new LearningPlatformAPI({
  baseURL: 'https://api.learningplatform.example.com',
  token: 'your_access_token'
});

const courses = await api.courses.list();
```

## Testing

### Postman Collection
Download the Postman collection: [Learning Platform API.postman_collection.json](./postman/Learning_Platform_API.postman_collection.json)

### OpenAPI Specification
View the interactive API documentation: [OpenAPI Spec](./openapi/learning-platform-api.yaml)

## Changelog

### 2025.1 (2025-09-19)
- Added comprehensive API documentation
- Documented all authentication endpoints
- Added course management endpoints
- Added task management endpoints
- Added enrollment and progress tracking
- Added WebSocket documentation
- Added error handling specifications

---

**For technical support**: Contact the development team or create an issue in the project repository.
**For API access**: Ensure you have valid authentication credentials and appropriate permissions.