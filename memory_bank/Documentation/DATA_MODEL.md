# Learning Platform Data Model Documentation

**Version**: 2025.1
**Last Updated**: 2025-09-19
**Status**: Active

---

## Overview

This document provides comprehensive documentation of the Learning Platform's data model, including entity relationships, field specifications, validation rules, and database schema design patterns.

## Entity Relationship Diagram

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│    User     │       │   Course    │       │LearningTask │
│             │       │             │       │             │
│ • id        │◄─────►│ • id        │◄─────►│ • id        │
│ • username  │       │ • title     │       │ • title     │
│ • email     │       │ • creator   │       │ • course    │
│ • role      │       │ • status    │       │ • type      │
│ • profile   │       │ • created   │       │ • status    │
└─────────────┘       └─────────────┘       └─────────────┘
        │                       │                       │
        │              ┌─────────────┐                  │
        └─────────────►│ Enrollment  │◄─────────────────┘
                       │             │
                       │ • user      │
                       │ • course    │
                       │ • status    │
                       │ • progress  │
                       └─────────────┘
```

## Core Entities

### User Model

**Table**: `auth_user` (Django built-in) + `userprofile`

```typescript
interface IUser {
  id: string;
  username: string;
  email: string;
  role: UserRoleEnum;
  display_name?: string;
  created_at: string;
  updated_at: string;
}

enum UserRoleEnum {
  ADMIN = 'admin',
  INSTRUCTOR = 'instructor',
  STUDENT = 'student',
  GUEST = 'guest'
}
```

**Database Schema:**
```sql
CREATE TABLE auth_user (
    id SERIAL PRIMARY KEY,
    username VARCHAR(150) UNIQUE NOT NULL,
    email VARCHAR(254) NOT NULL,
    first_name VARCHAR(150),
    last_name VARCHAR(150),
    is_staff BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    date_joined TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE userprofile (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES auth_user(id),
    role VARCHAR(20) DEFAULT 'student',
    display_name VARCHAR(200),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Field Specifications:**
- `id`: Auto-generated primary key
- `username`: Unique identifier, 3-150 characters, alphanumeric + underscores
- `email`: Valid email format, unique per user
- `role`: Enum value defining user permissions
- `display_name`: Optional friendly name for display
- `created_at`: Timestamp of user creation
- `updated_at`: Timestamp of last profile update

**Validation Rules:**
- Username must be unique and match pattern: `^[a-zA-Z0-9_]+$`
- Email must be valid format and unique
- Role must be one of the defined enum values
- Display name is optional but limited to 200 characters

### Course Model

**Table**: `courses_course`

```typescript
interface ICourse {
  id: string;
  title: string;
  description: string;
  learning_objectives?: string;
  prerequisites?: string;
  status: CourseStatus;
  visibility: CourseVisibility;
  creator: IUser;
  created_at: string;
  updated_at: string;
  enrollment_count?: number;
  task_count?: number;
}

enum CourseStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived'
}

enum CourseVisibility {
  PUBLIC = 'public',
  PRIVATE = 'private'
}
```

**Database Schema:**
```sql
CREATE TABLE courses_course (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    learning_objectives TEXT,
    prerequisites TEXT,
    status VARCHAR(20) DEFAULT 'draft',
    visibility VARCHAR(20) DEFAULT 'public',
    creator_id INTEGER REFERENCES auth_user(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_courses_status ON courses_course(status);
CREATE INDEX idx_courses_creator ON courses_course(creator_id);
CREATE INDEX idx_courses_visibility ON courses_course(visibility);
```

**Field Specifications:**
- `id`: Auto-generated primary key
- `title`: Course name, 1-200 characters, required
- `description`: Detailed course description, markdown supported
- `learning_objectives`: What students will learn
- `prerequisites`: Required knowledge or courses
- `status`: Publication status affecting visibility
- `visibility`: Access control (public/private)
- `creator`: Reference to instructor who created the course

**Validation Rules:**
- Title is required and must be 1-200 characters
- Status must be one of: draft, published, archived
- Visibility must be one of: public, private
- Creator must be a user with instructor or admin role
- Only published courses are visible to students

### Learning Task Model

**Table**: `tasks_learningtask`

```typescript
interface ILearningTask {
  id: string;
  title: string;
  description: string;
  course: ICourse;
  task_type: TaskType;
  status: TaskStatus;
  due_date?: string;
  max_points?: number;
  created_at: string;
  updated_at: string;
  submission_count?: number;
  completion_rate?: number;
}

enum TaskType {
  ASSIGNMENT = 'assignment',
  QUIZ = 'quiz',
  PROJECT = 'project',
  DISCUSSION = 'discussion'
}

enum TaskStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived'
}
```

**Database Schema:**
```sql
CREATE TABLE tasks_learningtask (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    course_id INTEGER REFERENCES courses_course(id),
    task_type VARCHAR(20) DEFAULT 'assignment',
    status VARCHAR(20) DEFAULT 'draft',
    due_date TIMESTAMP WITH TIME ZONE,
    max_points INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_tasks_course ON tasks_learningtask(course_id);
CREATE INDEX idx_tasks_status ON tasks_learningtask(status);
CREATE INDEX idx_tasks_type ON tasks_learningtask(task_type);
CREATE INDEX idx_tasks_due_date ON tasks_learningtask(due_date);
```

**Field Specifications:**
- `id`: Auto-generated primary key
- `title`: Task name, 1-200 characters, required
- `description`: Detailed task instructions, markdown supported
- `course`: Reference to parent course
- `task_type`: Classification of task for different handling
- `status`: Publication status affecting student visibility
- `due_date`: Optional deadline for task completion
- `max_points`: Maximum score possible (for graded tasks)

**Validation Rules:**
- Title is required and must be 1-200 characters
- Course reference must exist and be accessible
- Task type must be one of the defined enum values
- Status must be one of: draft, published, archived
- Due date must be in the future when set
- Max points must be positive integer when set

### Enrollment Model

**Table**: `enrollments_enrollment`

```typescript
interface IEnrollment {
  id: string;
  user: IUser;
  course: ICourse;
  status: EnrollmentStatus;
  enrollment_date: string;
  completion_date?: string;
  progress_percentage: number;
  last_activity: string;
}

enum EnrollmentStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  DROPPED = 'dropped',
  SUSPENDED = 'suspended'
}
```

**Database Schema:**
```sql
CREATE TABLE enrollments_enrollment (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES auth_user(id),
    course_id INTEGER REFERENCES courses_course(id),
    status VARCHAR(20) DEFAULT 'active',
    enrollment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completion_date TIMESTAMP WITH TIME ZONE,
    progress_percentage DECIMAL(5,2) DEFAULT 0.00,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, course_id)
);

CREATE INDEX idx_enrollments_user ON enrollments_enrollment(user_id);
CREATE INDEX idx_enrollments_course ON enrollments_enrollment(course_id);
CREATE INDEX idx_enrollments_status ON enrollments_enrollment(status);
```

**Field Specifications:**
- `id`: Auto-generated primary key
- `user`: Reference to enrolled student
- `course`: Reference to enrolled course
- `status`: Current enrollment state
- `enrollment_date`: When user enrolled
- `completion_date`: When course was completed (if applicable)
- `progress_percentage`: Calculated completion percentage (0-100)
- `last_activity`: Last interaction with course content

**Validation Rules:**
- User-course combination must be unique (one enrollment per user per course)
- User must have student role for enrollment
- Course must be published for enrollment
- Progress percentage must be between 0 and 100
- Completion date can only be set when status is 'completed'

### Progress Tracking Model

**Table**: `progress_taskprogress`

```typescript
interface ITaskProgress {
  id: string;
  user: IUser;
  task: ILearningTask;
  status: ProgressStatus;
  points_earned?: number;
  submission_data?: Record<string, unknown>;
  started_at: string;
  completed_at?: string;
  last_updated: string;
}

enum ProgressStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  SUBMITTED = 'submitted',
  GRADED = 'graded'
}
```

**Database Schema:**
```sql
CREATE TABLE progress_taskprogress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES auth_user(id),
    task_id INTEGER REFERENCES tasks_learningtask(id),
    status VARCHAR(20) DEFAULT 'not_started',
    points_earned INTEGER,
    submission_data JSONB,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, task_id)
);

CREATE INDEX idx_progress_user ON progress_taskprogress(user_id);
CREATE INDEX idx_progress_task ON progress_taskprogress(task_id);
CREATE INDEX idx_progress_status ON progress_taskprogress(status);
```

**Field Specifications:**
- `id`: Auto-generated primary key
- `user`: Reference to student working on task
- `task`: Reference to learning task
- `status`: Current progress state
- `points_earned`: Score achieved (for graded tasks)
- `submission_data`: JSON data containing submission details
- `started_at`: When user first accessed the task
- `completed_at`: When task was marked complete
- `last_updated`: Last interaction timestamp

**Validation Rules:**
- User-task combination must be unique
- User must be enrolled in the task's course
- Points earned cannot exceed task's max_points
- Status transitions must follow logical progression
- Completed_at can only be set when status is 'completed' or later

## Relationship Specifications

### User → Course (Creator)
- **Type**: One-to-Many
- **Constraint**: Only instructors and admins can create courses
- **Cascade**: SET NULL on user deletion (preserve course data)

### User → Course (Enrollment)
- **Type**: Many-to-Many (through Enrollment)
- **Constraint**: Students can enroll in multiple courses
- **Cascade**: DELETE on user deletion, RESTRICT on course deletion

### Course → Learning Task
- **Type**: One-to-Many
- **Constraint**: Tasks belong to exactly one course
- **Cascade**: CASCADE on course deletion (delete all tasks)

### User → Learning Task (Progress)
- **Type**: Many-to-Many (through TaskProgress)
- **Constraint**: Students can have progress on multiple tasks
- **Cascade**: DELETE on user deletion, CASCADE on task deletion

## Data Integrity Rules

### Referential Integrity
- All foreign key references must exist
- Orphaned records are prevented by database constraints
- Cascade rules prevent inconsistent states

### Business Logic Constraints
- Students cannot enroll in draft courses
- Tasks cannot be created for non-existent courses
- Progress cannot be recorded for non-enrolled students
- Instructors can only modify their own courses

### Data Validation
- Email addresses must be unique and valid format
- Usernames must be unique and follow naming conventions
- Dates must be in valid ISO format
- Percentages must be between 0 and 100
- Points cannot be negative

## Indexing Strategy

### Primary Indexes
- All tables have primary key indexes (auto-generated)
- Unique constraints create implicit indexes

### Performance Indexes
- Foreign key columns for JOIN optimization
- Status fields for filtering
- Date fields for time-based queries
- Composite indexes for common query patterns

### Full-Text Search
```sql
-- Course search index
CREATE INDEX idx_courses_search ON courses_course
USING gin(to_tsvector('english', title || ' ' || description));

-- Task search index
CREATE INDEX idx_tasks_search ON tasks_learningtask
USING gin(to_tsvector('english', title || ' ' || description));
```

## Data Migration Patterns

### Version Control
- All schema changes tracked in Django migrations
- Rollback procedures documented for each migration
- Data transformations tested in staging environment

### Backward Compatibility
- New columns added with default values
- Deprecated columns marked but not immediately removed
- API versioning supports legacy data formats

## Performance Considerations

### Query Optimization
- Pagination implemented for large datasets
- Eager loading used for related objects
- Database query analysis with EXPLAIN ANALYZE

### Caching Strategy
- Course data cached for 15 minutes
- User profile data cached for 1 hour
- Task progress cached for 5 minutes
- Cache invalidation on data updates

### Scaling Considerations
- Read replicas for report generation
- Partitioning strategy for large progress tables
- Archive strategy for completed courses

## Security and Privacy

### Data Protection
- Personal data encrypted at rest
- Access logging for audit trails
- GDPR compliance for data retention

### Access Control
- Row-level security for multi-tenant isolation
- Role-based permissions enforced at database level
- API-level authorization checks

## Backup and Recovery

### Backup Strategy
- Full database backups daily
- Incremental backups every 4 hours
- Point-in-time recovery capability
- Cross-region backup replication

### Recovery Procedures
- RTO (Recovery Time Objective): 4 hours
- RPO (Recovery Point Objective): 1 hour
- Automated failover procedures
- Data consistency verification

---

**For technical questions**: Contact the database administration team
**For schema changes**: Follow the migration request process
**For performance issues**: Review query analysis procedures