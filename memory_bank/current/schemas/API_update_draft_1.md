# API Documentation Update for Course Versioning

This document provides a draft of the updates needed for the `backend/API.md` file to include documentation for the course versioning system.

## Course API Endpoints

### 1. List Courses
- **URL**: `/api/v1/courses/`
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
- **URL**: `/api/v1/courses/`
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
- **URL**: `/api/v1/courses/{id}/`
- **Method**: `GET`
- **Auth Required**: Yes
- **Headers**:
```
Authorization: Bearer <access_token>
```
- **Success Response**: `200 OK`
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
    ],
    "learning_tasks": []
}
```

## Course Version Control Endpoints

### 1. Create New Version
Create a new version of a course.

- **URL**: `/api/v1/courses/{id}/versions/`
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

- **URL**: `/api/v1/courses/{id}/versions/`
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

- **URL**: `/api/v1/courses/{id}/versions/{version_number}/`
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

- **URL**: `/api/v1/courses/{id}/versions/compare/`
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

- **URL**: `/api/v1/courses/{id}/versions/{version_number}/rollback/`
- **Method**: `POST`
- **Auth Required**: Yes
- **Headers**:
```
Authorization: Bearer <access_token>
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

## Implementation Guide

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
