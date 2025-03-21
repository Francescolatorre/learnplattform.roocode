# API Service Architecture

## Overview

The `ApiService` is a centralized, robust API management solution designed to streamline HTTP requests, handle authentication, and provide a flexible interface for interacting with backend services.

## Key Features

### Authentication Management
- Automatic token injection
- Token refresh mechanism
- Secure logout handling

### Request Handling
- Generic request method supporting all HTTP verbs
- Type-safe generic methods
- Configurable request options
- Comprehensive error handling

### Resource Management
- Resource-specific service creation
- CRUD operations out of the box
- Flexible custom endpoint support

## Usage Examples

### Basic HTTP Requests
```typescript
// GET request
const courses = await apiService.get<Course[]>('/courses');

// POST request
const newCourse = await apiService.post<Course>('/courses', courseData);

// PUT request
const updatedCourse = await apiService.put<Course>('/courses/1', courseData);
```

### Resource-Specific Services
```typescript
// Pre-configured resource services
import { courseService, taskService } from './apiService';

// Get all courses
const courses = await courseService.getAll();

// Get course by ID
const course = await courseService.getById(1);

// Create a new task
const newTask = await taskService.create(taskData);
```

### File Upload
```typescript
const uploadedFile = await apiService.uploadFile<FileResponse>(
  '/upload',
  fileBlob,
  'avatar',
  { userId: '123' }
);
```

### Custom Endpoint Handling
```typescript
// Custom resource method
const customResult = await courseService.custom(
  'enroll',
  'POST',
  { courseId: 1 }
);
```

## Advanced Configuration

### Token Refresh
- Automatic 401 error handling
- Seamless token refresh
- Fallback to login on refresh failure

### Error Handling
- Detailed error parsing
- Support for different error response formats
- Fallback error messages

## Interceptors

### Request Interceptor
- Automatically adds Bearer token
- Supports dynamic token management

### Response Interceptor
- Token refresh logic
- Error standardization

## Configuration Options

- Base URL configuration
- API version support
- Timeout settings
- Custom headers

## Benefits

- **Centralization**: Single point of API interaction
- **Type Safety**: Generic methods with TypeScript
- **Flexibility**: Adaptable to various backend structures
- **Security**: Built-in authentication management
- **Error Handling**: Comprehensive error parsing
- **Extensibility**: Easy to customize and extend

## Best Practices

- Use resource-specific services when possible
- Leverage type generics for type safety
- Handle errors gracefully
- Use environment variables for configuration
