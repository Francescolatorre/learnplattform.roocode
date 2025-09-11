# Learning Platform Data Model

## Overview

This document provides a comprehensive data model representation for the Learning Platform, capturing the intricate relationships between different entities across the backend.

## Entity Relationship Diagram

```mermaid
---
title: Learning Platform Data Model
---

erDiagram
    User {
        int id PK
        string username
        string email
        string display_name
        string role
        boolean is_active
    }

    InstructorRole {
        string role_name PK
        string description
        boolean can_edit_course
        boolean can_manage_tasks
        boolean can_grade_submissions
    }

    Course {
        int id PK
        string title
        string description
        int version
        string status
        string visibility
        text learning_objectives
        text prerequisites
        datetime created_at
        datetime updated_at
    }

    CourseVersion {
        int id PK
        int version_number
        datetime created_at
        json content_snapshot
        text notes
    }

    StatusTransition {
        int id PK
        string from_status
        string to_status
        datetime changed_at
        text reason
    }

    LearningTask {
        int id PK
        string title
        string description
    }

    User ||--o{ CourseVersion : "can create versions"
    User ||--o{ StatusTransition : "can change status"
    Course ||--o{ CourseVersion : "has multiple versions"
    Course ||--o{ StatusTransition : "tracks status changes"
    Course ||--o{ LearningTask : "contains multiple tasks"
```

## Component Diagram

```mermaid
graph TD;
    User[User] -->|manages| Auth[Authentication]
    User -->|enrolls in| Courses[Courses]
    Courses -->|contains| Tasks[Tasks]
    Tasks -->|evaluates| Submissions[Submissions]
    Auth -->|secures| AdminPanel[Admin Panel]
    Courses -->|scheduled by| Scheduler[Scheduler]
    Scheduler -->|notifies| Notifications[Notifications]
    Notifications --> User
```

## Model Descriptions

### User Model (App: LearningPlatform)
- Represents platform users with roles like admin, instructor, student
- Unique email address
- Customizable display name
- Role-based access control

### Course Model (App: LearningPlatform)
- Supports versioning and status tracking
- Multiple visibility levels (Private, Internal, Public)
- Supports learning objectives and prerequisites
- Tracks course creation and update timestamps

### Instructor Role Model (App: LearningPlatform)
- Defines granular permissions for course management
- Supports roles like Lead, Assistant, and Guest Instructors
- Configurable permissions for course editing, task management, and grading

### Course Version (App: LearningPlatform)
- Maintains version history of courses
- Stores content snapshots for each version
- Supports version comparison and tracking

### Status Transition (App: LearningPlatform)
- Tracks course status changes
- Records who made the change and when
- Provides audit trail for course lifecycle

### Learning Task (App: LearningPlatform)
- Associated with courses
- Supports task management within courses

## Key Relationships
- Users can be assigned multiple roles in different courses
- Courses can have multiple versions and instructors
- Detailed permission and status tracking across the platform

## Design Principles
- Flexible role-based access control
- Comprehensive versioning and status management
- Support for complex course and user interactions
