# Learning Platform API Documentation

## Base URL

```
/api/v1/
```

## Authentication

Most endpoints require JWT authentication. Include the access token in the Authorization header:

```
Authorization: Bearer <access_token>
```

## API Sections

- [Authentication API](#authentication-api)
- [Course API](#course-api)
- [Course Version Control API](#course-version-control-api)
- [Dashboard API](#dashboard-api)
- [Enrollment API](#enrollment-api)
- [Learning Task API](#learning-task-api)
- [Quiz Attempt API](#quiz-attempt-api)
- [Student API](#student-api)
- [Task Progress API](#task-progress-api)

---

# Authentication API

## Base URL

```
/api/v1/auth/
```

## Endpoints

### 1. Register

Create a new user account.

- **URL**: `register/`
- **Method**: `POST`
- **Auth Required**: No
- **Request Body**:

```json
{
    "username": "string",
    "email": "string",
    "password": "string",
    "password2": "string",
    "display_name": "string",
    "role": "string"
}
```

- **Success Response**: `201 Created`

```json
{
    "user": {
        "username": "string",
        "email": "string",
        "display_name": "string"
    },
    "refresh": "string",
    "access": "string"
}
```

- **Error Response**: `400 Bad Request`

```json
{
    "username": ["Username is already taken"],
    "email": ["Invalid email format"],
    "password": ["Passwords do not match"]
}
```

### 2. Login

Authenticate a user and receive tokens.

- **URL**: `login/`
- **Method**: `POST`
- **Auth Required**: No
- **Request Body**:

```json
{
    "username_or_email": "string",
    "password": "string"
}
```

- **Success Response**: `200 OK`

```json
{
    "user": {
        "username": "string",
        "email": "string"
    },
    "refresh": "string",
    "access": "string"
}
```

- **Error Response**: `401 Unauthorized`

```json
{
    "detail": "Invalid credentials"
}
```

### 3. Logout

Invalidate a refresh token.

- **URL**: `logout/`
- **Method**: `POST`
- **Auth Required**: No
- **Request Body**:

```json
{
    "refresh_token": "string"
}
```

- **Success Response**: `205 Reset Content`
- **Error Response**: `400 Bad Request`

```json
{
    "detail": "Invalid token"
}
```

### 4. Token Refresh

Get a new access token using a refresh token.

- **URL**: `token/refresh/`
- **Method**: `POST`
- **Auth Required**: No
- **Request Body**:

```json
{
    "refresh": "string"
}
```

- **Success Response**: `200 OK`

```json
{
    "access": "string"
}
```

- **Error Response**: `401 Unauthorized`

```json
{
    "detail": "Token is invalid or expired"
}
```

### 5. Profile

Manage user profile information.

- **URL**: `/users/profile/`
- **Methods**: `GET`
- **Auth Required**: Yes
- **Headers**:

```
Authorization: Bearer <access_token>
```

- **GET Response**: `200 OK`

```json
{
    "username": "string",
    "email": "string",
    "display_name": "string"
}
```

### Authentication Implementation Guide

#### Authentication Flow

1. **Initial Authentication**:
   - Register a new user or login with existing credentials
   - Store received tokens securely (e.g., in localStorage or secure cookie)
   - Use access token for subsequent requests

2. **Making Authenticated Requests**:

```javascript
const headers = {
  'Authorization': `Bearer ${accessToken}`,
  'Content-Type': 'application/json'
};

fetch('/api/v1/auth/profile/', {
  headers: headers
});
```

3. **Token Refresh Flow**:

```javascript
async function refreshToken() {
  const response = await fetch('/api/v1/auth/token/refresh/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      refresh: refreshToken
    })
  });

  if (response.ok) {
    const data = await response.json();
    // Store new access token
    return data.access;
  } else {
    // Token refresh failed, redirect to login
    window.location.href = '/login';
  }
}
```

4. **Logout Flow**:

```javascript
async function logout() {
  await fetch('/api/v1/auth/logout/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      refresh_token: refreshToken
    })
  });

  // Clear stored tokens
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
}
```

#### Token Lifetimes

- Access Token: 60 minutes
- Refresh Token: 24 hours

#### Security Considerations

1. Store tokens securely
2. Implement token refresh before expiration
3. Clear tokens on logout
4. Use HTTPS for all requests
5. Validate token expiration
6. Handle authentication errors gracefully

---

# Course API

## Base URL

```
/api/v1/courses/
```

## Endpoints

### 1. List Courses

- **URL**: `/`
- **Method**: `GET`
- **Auth Required**: Yes
- **Headers**:

```
Authorization: Bearer <access_token>
```

- **Success Response**: `200 OK`

```json
[
    {
        "id": 1,
        "title": "Course Title",
        "description": "Course Description",
        "instructors": [
            {
                "instructor": 1,
                "role": {
                    "role_name": "LEAD",
                    "description": "Lead Instructor",
                    "can_edit_course": true,
                    "can_manage_tasks": true,
                    "can_grade_submissions": true
                },
                "assigned_at": "2023-01-01T12:00:00Z",
                "is_active": true
            }
        ],
        "created_at": "2023-01-01T12:00:00Z",
        "updated_at": "2023-01-02T12:00:00Z",
        "tasks": [],
        "total_tasks": 0,
        "status": "DRAFT",
        "visibility": "PRIVATE",
        "status_history": [],
        "allowed_transitions": ["PUBLISHED"],
        "version": 1,
        "version_notes": "",
        "created_from": null,
        "version_history": [
            {
                "version_number": 1,
                "created_at": "2023-01-01T12:00:00Z",
                "created_by": 1,
                "notes": "Initial version",
                "changes_from_previous": null,
                "is_current": true
            }
        ]
    }
]
```

### 2. Create Course

- **URL**: `/`
- **Method**: `POST`
- **Auth Required**: Yes
- **Headers**:

```
Authorization: Bearer <access_token>
Content-Type: application/json
```

- **Request Body**:

```json
{
    "title": "New Course",
    "description": "Course Description",
    "status": "DRAFT",
    "visibility": "PRIVATE",
    "version_notes": "Initial version"
}
```

- **Success Response**: `201 Created`

```json
{
    "id": 1,
    "title": "New Course",
    "description": "Course Description",
    "instructors": [],
    "created_at": "2023-01-01T12:00:00Z",
    "updated_at": "2023-01-01T12:00:00Z",
    "tasks": [],
    "total_tasks": 0,
    "status": "DRAFT",
    "visibility": "PRIVATE",
    "status_history": [],
    "allowed_transitions": ["PUBLISHED"],
    "version": 1,
    "version_notes": "Initial version",
    "created_from": null,
    "version_history": [
        {
            "version_number": 1,
            "created_at": "2023-01-01T12:00:00Z",
            "created_by": 1,
            "notes": "Initial version",
            "changes_from_previous": null,
            "is_current": true
        }
    ]
}
```

### 3. Get Course Details

- **URL**: `/{id}/`
- **Method**: `GET`
- **Auth Required**: Yes
- **Headers**:

```
Authorization: Bearer <access_token>
```

- **Success Response**: `200 OK`

  - /api/v1/courses/{id}/analytics/
  - /api/v1/courses/{id}/details/
  - /api/v1/courses/{id}/student-progress/
  - /api/v1/courses/{id}/student-progress/{user_id}/
  - /api/v1/courses/{id}/task-analytics/

```json
{
    "id": 1,
    "title": "Course Title",
    "description": "Course Description",
    "instructors": [
        {
            "instructor": 1,
            "role": {
                "role_name": "LEAD",
                "description": "Lead Instructor",
                "can_edit_course": true,
                "can_manage_tasks": true,
                "can_grade_submissions": true
            },
            "assigned_at": "2023-01-01T12:00:00Z",
            "is_active": true
        }
    ],
    "created_at": "2023-01-01T12:00:00Z",
    "updated_at": "2023-01-02T12:00:00Z",
    "tasks": [],
    "total_tasks": 0,
    "status": "DRAFT",
    "visibility": "PRIVATE",
    "status_history": [],
    "allowed_transitions": ["PUBLISHED"],
    "version": 1,
    "version_notes": "",
    "created_from": null,
    "version_history": [
        {
            "version_number": 1,
            "created_at": "2023-01-01T12:00:00Z",
            "created_by": 1,
            "notes": "Initial version",
            "changes_from_previous": null,
            "is_current": true
        }
    ],
    "learning_tasks": []
}
```

---

# Course Version Control API

## Base URL

```
/api/v1/courses/{id}/versions/
```

## Endpoints

### 1. Create New Version

Create a new version of a course.

- **URL**: `/`
- **Method**: `POST`
- **Auth Required**: Yes
- **Headers**:

```
Authorization: Bearer <access_token>
Content-Type: application/json
```

- **Request Body**:

```json
{
    "notes": "Updated course content"
}
```

- **Success Response**: `201 Created`

```json
{
    "version_number": 2,
    "created_at": "2023-01-02T12:00:00Z",
    "created_by": 1,
    "notes": "Updated course content",
    "changes_from_previous": "Version 2 is newer than version 1.",
    "is_current": true
}
```

- **Error Response**: `403 Forbidden`

```json
{
    "detail": "You do not have permission to create a new version of this course"
}
```

### 2. List Course Versions

Retrieve the version history of a course.

- **URL**: `/`
- **Method**: `GET`
- **Auth Required**: Yes
- **Headers**:

```
Authorization: Bearer <access_token>
```

- **Success Response**: `200 OK`

```json
[
    {
        "version_number": 2,
        "created_at": "2023-01-02T12:00:00Z",
        "created_by": 1,
        "notes": "Updated course content",
        "changes_from_previous": "Version 2 is newer than version 1.",
        "is_current": true
    },
    {
        "version_number": 1,
        "created_at": "2023-01-01T12:00:00Z",
        "created_by": 1,
        "notes": "Initial version",
        "changes_from_previous": null,
        "is_current": false
    }
]
```

### 3. Get Specific Version

Retrieve a specific version of a course.

- **URL**: `/{version_number}/`
- **Method**: `GET`
- **Auth Required**: Yes
- **Headers**:

```
Authorization: Bearer <access_token>
```

- **Success Response**: `200 OK`

```json
{
    "version_number": 1,
    "created_at": "2023-01-01T12:00:00Z",
    "created_by": 1,
    "notes": "Initial version",
    "changes_from_previous": null,
    "is_current": false,
    "content_snapshot": {
        "title": "Course Title",
        "description": "Course Description",
        "tasks": [],
        "status": "DRAFT",
        "visibility": "PRIVATE"
    }
}
```

- **Error Response**: `404 Not Found`

```json
{
    "detail": "Version not found"
}
```

### 4. Compare Versions

Compare two versions of a course.

- **URL**: `/compare/`
- **Method**: `GET`
- **Auth Required**: Yes
- **Headers**:

```
Authorization: Bearer <access_token>
```

- **Query Parameters**:

```
version1=1
version2=2
```

- **Success Response**: `200 OK`

```json
{
    "comparison": "Version 2 is newer than version 1.",
    "version1": {
        "version_number": 1,
        "created_at": "2023-01-01T12:00:00Z",
        "created_by": 1,
        "notes": "Initial version"
    },
    "version2": {
        "version_number": 2,
        "created_at": "2023-01-02T12:00:00Z",
        "created_by": 1,
        "notes": "Updated course content"
    }
}
```

- **Error Response**: `400 Bad Request`

```json
{
    "detail": "Both version1 and version2 parameters are required"
}
```

### 5. Rollback to Version

Rollback a course to a specific version.

- **URL**: `/{version_number}/rollback/`
- **Method**: `POST`
- **Auth Required**: Yes
- **Headers**:

```
Authorization: Bearer <access_token>
Content-Type: application/json
```

- **Request Body**:

```json
{
    "notes": "Updated course content"
}
```

- **Success Response**: `200 OK`

```json
{
    "message": "Course rolled back to version 1",
    "version": {
        "version_number": 1,
        "created_at": "2023-01-01T12:00:00Z",
        "created_by": 1,
        "notes": "Initial version",
        "is_current": true
    }
}
```

- **Error Response**: `404 Not Found`

```json
{
    "detail": "Version not found"
}
```

- **Error Response**: `403 Forbidden`

```json
{
    "detail": "You do not have permission to rollback this course"
}
```

## Models

### Course Model

```json
{
    "id": 1,
    "title": "Course Title",
    "description": "Course Description",
    "instructors": [
        {
            "instructor": 1,
            "role": {
                "role_name": "LEAD",
                "description": "Lead Instructor",
                "can_edit_course": true,
                "can_manage_tasks": true,
                "can_grade_submissions": true
            },
            "assigned_at": "2023-01-01T12:00:00Z",
            "is_active": true
        }
    ],
    "created_at": "2023-01-01T12:00:00Z",
    "updated_at": "2023-01-02T12:00:00Z",
    "tasks": [],
    "total_tasks": 0,
    "status": "DRAFT",
    "visibility": "PRIVATE",
    "status_history": [],
        "allowed_transitions": ["PUBLISHED"],
        "version": 1,
        "version_notes": "Initial version",
        "created_from": null,
        "version_history": [
            {
                "version_number": 1,
                "created_at": "2023-01-01T12:00:00Z",
                "created_by": 1,
                "notes": "Initial version",
                "changes_from_previous": null,
                "is_current": true
            }
        ]
}
```

### CourseVersion Model

```json
{
    "version_number": 1,
    "created_at": "2023-01-01T12:00:00Z",
    "created_by": 1,
    "notes": "Initial version",
    "changes_from_previous": null,
    "is_current": true,
    "content_snapshot": {
        "title": "Course Title",
        "description": "Course Description",
        "tasks": [],
        "status": "DRAFT",
        "visibility": "PRIVATE"
    }
}
```

## Version Control Implementation Guide

### Version Control Flow

1. **Creating a New Version**:

```javascript
async function createNewVersion(courseId, notes) {
  const response = await fetch(`/api/v1/courses/${courseId}/versions/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      notes: notes
    })
  });

  if (response.ok) {
    const data = await response.json();
    return data;
  } else {
    // Handle error
    const error = await response.json();
    throw new Error(error.detail);
  }
}
```

2. **Retrieving Version History**:

```javascript
async function getVersionHistory(courseId) {
  const response = await fetch(`/api/v1/courses/${courseId}/versions/`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (response.ok) {
    const data = await response.json();
    return data;
  } else {
    // Handle error
    const error = await response.json();
    throw new Error(error.detail);
  }
}
```

3. **Rolling Back to a Specific Version**:

```javascript
async function rollbackToVersion(courseId, versionNumber) {
  const response = await fetch(`/api/v1/courses/${courseId}/versions/${versionNumber}/rollback/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (response.ok) {
    const data = await response.json();
    return data;
  } else {
    // Handle error
    const error = await response.json();
    throw new Error(error.detail);
  }
}
```

### Best Practices

1. Always check if the user has permission to perform version control operations
2. Create a new version before making significant changes to a course
3. Use version notes to document the changes made in each version
4. Consider the impact of rolling back to a previous version, especially if the course has active enrollments
5. Implement proper error handling for version control operations

---

# Dashboard API

## Base URL

```
/api/v1/dashboard/
```

## Endpoints

- /api/v1/dashboard/admin-summary/
- /api/v1/instructor/dashboard/

---

# Enrollment API

## Base URL

```
/api/v1/enrollments/
```

## Endpoints

- /api/v1/enrollments/{id}/update_status/

---

# Learning Task API

## Base URL

```
/api/v1/learning-tasks/
```

## Endpoints

- /api/v1/learning-tasks/course/{course_id}/

---

# Quiz Attempt API

## Base URL

```
/api/v1/quiz-attempts/
```

## Endpoints

- /api/v1/quiz-attempts/{id}/responses/
- /api/v1/quiz-attempts/{id}/submit_responses/

---

# Student API

## Base URL

```
/api/v1/students/
```

## Endpoints

- /api/v1/students/{id}/progress/
- /api/v1/students/{id}/quiz-performance/

---

# Task Progress API

## Base URL

```
/api/v1/task-progress/
```

## Endpoints

- /api/v1/task-progress/{id}/update_status/

---

# Course Version Control API

## Base URL

```
/api/v1/courses/{id}/versions/
```

## Endpoints

### 1. Create New Version

Create a new version of a course.

- **URL**: `/`
- **Method**: `POST`
- **Auth Required**: Yes
- **Headers**:

```
Authorization: Bearer <access_token>
Content-Type: application/json
```

- **Request Body**:

```json
{
    "notes": "Updated course content"
}
```

- **Success Response**: `201 Created`

```json
{
    "version_number": 2,
    "created_at": "2023-01-02T12:00:00Z",
    "created_by": 1,
    "notes": "Updated course content",
    "changes_from_previous": "Version 2 is newer than version 1.",
    "is_current": true
}
```

- **Error Response**: `403 Forbidden`

```json
{
    "detail": "You do not have permission to create a new version of this course"
}
```

### 2. List Course Versions

Retrieve the version history of a course.

- **URL**: `/`
- **Method**: `GET`
- **Auth Required**: Yes
- **Headers**:

```
Authorization: Bearer <access_token>
```

- **Success Response**: `200 OK`

```json
[
    {
        "version_number": 2,
        "created_at": "2023-01-02T12:00:00Z",
        "created_by": 1,
        "notes": "Updated course content",
        "changes_from_previous": "Version 2 is newer than version 1.",
        "is_current": true
    },
    {
        "version_number": 1,
        "created_at": "2023-01-01T12:00:00Z",
        "created_by": 1,
        "notes": "Initial version",
        "changes_from_previous": null,
        "is_current": false
    }
]
```

### 3. Get Specific Version

Retrieve a specific version of a course.

- **URL**: `/{version_number}/`
- **Method**: `GET`
- **Auth Required**: Yes
- **Headers**:

```
Authorization: Bearer <access_token>
```

- **Success Response**: `200 OK`

```json
{
    "version_number": 1,
    "created_at": "2023-01-01T12:00:00Z",
    "created_by": 1,
    "notes": "Initial version",
    "changes_from_previous": null,
    "is_current": false,
    "content_snapshot": {
        "title": "Course Title",
        "description": "Course Description",
        "tasks": [],
        "status": "DRAFT",
        "visibility": "PRIVATE"
    }
}
```

- **Error Response**: `404 Not Found`

```json
{
    "detail": "Version not found"
}
```

### 4. Compare Versions

Compare two versions of a course.

- **URL**: `/compare/`
- **Method**: `GET`
- **Auth Required**: Yes
- **Headers**:

```
Authorization: Bearer <access_token>
```

- **Query Parameters**:

```
version1=1
version2=2
```

- **Success Response**: `200 OK`

```json
{
    "comparison": "Version 2 is newer than version 1.",
    "version1": {
        "version_number": 1,
        "created_at": "2023-01-01T12:00:00Z",
        "created_by": 1,
        "notes": "Initial version"
    },
    "version2": {
        "version_number": 2,
        "created_at": "2023-01-02T12:00:00Z",
        "created_by": 1,
        "notes": "Updated course content"
    }
}
```

- **Error Response**: `400 Bad Request`

```json
{
    "detail": "Both version1 and version2 parameters are required"
}
```

### 5. Rollback to Version

Rollback a course to a specific version.

- **URL**: `/{version_number}/rollback/`
- **Method**: `POST`
- **Auth Required**: Yes
- **Headers**:

```
Authorization: Bearer <access_token>
Content-Type: application/json
```

- **Request Body**:

```json
{
    "notes": "Updated course content"
}
```

- **Success Response**: `200 OK`

```json
{
    "message": "Course rolled back to version 1",
    "version": {
        "version_number": 1,
        "created_at": "2023-01-01T12:00:00Z",
        "created_by": 1,
        "notes": "Initial version",
        "is_current": true
    }
}
```

- **Error Response**: `404 Not Found`

```json
{
    "detail": "Version not found"
}
```

- **Error Response**: `403 Forbidden`

```json
{
    "detail": "You do not have permission to rollback this course"
}
```

## Models

### Course Model

```json
{
    "id": 1,
    "title": "Course Title",
    "description": "Course Description",
    "instructors": [
        {
            "instructor": 1,
            "role": {
                "role_name": "LEAD",
                "description": "Lead Instructor",
                "can_edit_course": true,
                "can_manage_tasks": true,
                "can_grade_submissions": true
            },
            "assigned_at": "2023-01-01T12:00:00Z",
            "is_active": true
        }
    ],
    "created_at": "2023-01-01T12:00:00Z",
    "updated_at": "2023-01-02T12:00:00Z",
    "tasks": [],
    "total_tasks": 0,
    "status": "DRAFT",
    "visibility": "PRIVATE",
    "status_history": [],
        "allowed_transitions": ["PUBLISHED"],
        "version": 1,
        "version_notes": "Initial version",
        "created_from": null,
        "version_history": [
            {
                "version_number": 1,
                "created_at": "2023-01-01T12:00:00Z",
                "created_by": 1,
                "notes": "Initial version",
                "changes_from_previous": null,
                "is_current": true
            }
        ]
}
```

### CourseVersion Model

```json
{
    "version_number": 1,
    "created_at": "2023-01-01T12:00:00Z",
    "created_by": 1,
    "notes": "Initial version",
    "changes_from_previous": null,
    "is_current": true,
    "content_snapshot": {
        "title": "Course Title",
        "description": "Course Description",
        "tasks": [],
        "status": "DRAFT",
        "visibility": "PRIVATE"
    }
}
```

## Version Control Implementation Guide

### Version Control Flow

1. **Creating a New Version**:

```javascript
async function createNewVersion(courseId, notes) {
  const response = await fetch(`/api/v1/courses/${courseId}/versions/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      notes: notes
    })
  });

  if (response.ok) {
    const data = await response.json();
    return data;
  } else {
    // Handle error
    const error = await response.json();
    throw new Error(error.detail);
  }
}
```

2. **Retrieving Version History**:

```javascript
async function getVersionHistory(courseId) {
  const response = await fetch(`/api/v1/courses/${courseId}/versions/`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (response.ok) {
    const data = await response.json();
    return data;
  } else {
    // Handle error
    const error = await response.json();
    throw new Error(error.detail);
  }
}
```

3. **Rolling Back to a Specific Version**:

```javascript
async function rollbackToVersion(courseId, versionNumber) {
  const response = await fetch(`/api/v1/courses/${courseId}/versions/${versionNumber}/rollback/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (response.ok) {
    const data = await response.json();
    return data;
  } else {
    // Handle error
    const error = await response.json();
    throw new Error(error.detail);
  }
}
```

### Best Practices

1. Always check if the user has permission to perform version control operations
2. Create a new version before making significant changes to a course
3. Use version notes to document the changes made in each version
4. Consider the impact of rolling back to a previous version, especially if the course has active enrollments
5. Implement proper error handling for version control operations

---

# Dashboard API

## Base URL

```
/api/v1/dashboard/
```

## Endpoints

- /api/v1/dashboard/admin-summary/
- /api/v1/instructor/dashboard/

---

# Enrollment API

## Base URL

```
/api/v1/enrollments/
```

## Endpoints

- /api/v1/enrollments/{id}/update_status/

---

#
