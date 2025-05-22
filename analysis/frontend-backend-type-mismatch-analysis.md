# Frontend–Backend Type/Interface Mismatch Analysis

## Overview

This document compares the key data contracts between the frontend (TypeScript interfaces) and backend (Django REST Framework serializers) for the following entities:

- User
- Course
- Task
- Progress

The goal is to identify mismatches in field names, types, presence/optionality, and semantics that could cause integration issues.

---

## 1. User

### Backend [`UserSerializer`](Backend/core/serializers.py:36)

Fields:

- id (readonly)
- username
- email
- display_name
- role

### Frontend [`IUser`](frontend/src/types/userTypes.ts:17)

Fields:

- id (readonly)
- username
- email
- display_name? (optional)
- role
- created_at (readonly)
- updated_at (readonly)
- is_active? (optional)

#### **Mismatches**

- `created_at`, `updated_at`, and `is_active` exist in frontend but not in backend serializer.
- `display_name` is always present in backend, but optional in frontend.

---

## 2. Course

### Backend [`CourseSerializer`](Backend/core/serializers.py:124)

Fields:

- id (readonly)
- title
- description
- description_html (readonly)
- version
- status
- visibility
- learning_objectives
- prerequisites
- created_at (readonly)
- updated_at (readonly)
- creator
- creator_details (readonly)
- isEnrolled (readonly)
- isCompleted (readonly)

### Frontend [`ICourse`](frontend/src/types/course.ts:18)

Fields:

- id
- title
- description?
- description_html?
- description_markdown?
- version?
- status
- visibility?
- learning_objectives?
- prerequisites?
- created_at?
- updated_at?
- category
- difficulty_level
- image_url?
- instructor_id?
- instructor_name?
- is_published?
- is_archived?
- student_count?
- isEnrolled?
- isCompleted?
- enrollmentDate?
- progress?
- completionDate?

#### **Mismatches**

- Frontend has extra fields: `category`, `difficulty_level`, `description_markdown`, `image_url`, `instructor_id`, `instructor_name`, `is_published`, `is_archived`, `student_count`, `enrollmentDate`, `progress`, `completionDate`.
- Backend has extra fields: `creator`, `creator_details` (frontend uses `instructor_id`/`instructor_name` instead).
- Some fields are optional in frontend but always present in backend (e.g., `description`, `description_html`).
- Field naming differences: `creator`/`creator_details` (backend) vs. `instructor_id`/`instructor_name` (frontend).
- Backend does not expose `category`, `difficulty_level`, or image-related fields.

---

## 3. Task

### Backend [`LearningTaskSerializer`](Backend/core/serializers.py:257)

Fields:

- id (readonly)
- course
- title
- description
- description_html (readonly)
- order
- is_published
- created_at (readonly)
- updated_at (readonly)

### Frontend [`ILearningTask`](frontend/src/types/task.ts:13)

Fields:

- id (readonly)
- course
- course_id
- title
- description
- description_html?
- order
- created_at
- updated_at
- is_published
- points?
- due_date?
- status

#### **Mismatches**

- Frontend has extra fields: `course_id`, `points`, `due_date`, `status`.
- Backend does not expose `points`, `due_date`, or `status`.
- Field naming: `course` (backend, likely integer FK) vs. `course` (frontend, number) and `course_id` (frontend, string).
- `description_html` is always present in backend, optional in frontend.

---

## 4. Progress

### Backend [`TaskProgressSerializer`](Backend/core/serializers.py:382)

Fields:

- id (readonly)
- user
- task
- status
- time_spent
- completion_date
- user_details (readonly)
- task_details (readonly)

### Frontend [`ITaskProgress`](frontend/src/types/task.ts:66)

Fields:

- taskId?
- moduleId?
- title?
- description?
- taskType?
- dueDate?
- score?
- maxScore?
- attempts?
- maxAttempts?
- submissionDate?
- timeSpent?

#### **Mismatches**

- Backend exposes only core progress fields; frontend expects additional UI and grading fields (`score`, `maxScore`, `attempts`, etc.).
- Field naming: `time_spent` (backend) vs. `timeSpent` (frontend).
- Backend provides `user`, `task`, `status`, `completion_date`, but frontend expects more detailed task context.
- Frontend fields are mostly optional and UI-focused, backend is minimal and API-focused.

---

## Recommendations

- **Align field names and types**: Standardize naming (e.g., `time_spent` vs. `timeSpent`), and ensure types match (e.g., string vs. number).
- **Clarify optionality**: Decide which fields are always present and which are optional, and document this in both contracts.
- **Expose missing fields**: If frontend requires fields like `created_at`, `updated_at`, `is_active`, `points`, `due_date`, etc., ensure backend includes them in serializers.
- **Harmonize entity relationships**: Standardize how related entities are referenced (e.g., `creator`/`instructor_id`).
- **Document API contracts**: Consider generating OpenAPI/Swagger specs to serve as a single source of truth for both frontend and backend.

---

_Last updated: 2025-05-22_
