# Task: Extend Database Schema for Learning Tasks

## Task Metadata
- **Task-ID:** TASK-MODEL-001
- **Status:** TODO
- **Priority:** Critical
- **Dependencies:** None
- **Assigned To:** Architect
- **Started At:** 2025-02-26 20:57:25
- **Estimated Completion:** 2025-03-05
- **Story Points:** 6

## Description
Design and implement a robust database schema for Learning Tasks with comprehensive field support and efficient querying. This foundational model will support all task-related features in the learning platform.

## Business Context
Learning Tasks are core components of the educational experience, allowing instructors to create assignments, quizzes, and other activities for students. The database schema must be flexible enough to support various task types while maintaining performance at scale.

## Technical Context
- **System Architecture:** Django-based backend with PostgreSQL database
- **Related Components:** 
  - Course model (existing)
  - User model (existing)
  - Future task submission model (will reference this model)
- **Technical Constraints:**
  - Must use Django ORM
  - Must support PostgreSQL-specific features where beneficial
  - Must maintain backward compatibility with existing Course model

## Requirements

### Inputs
- Existing Course model structure
- Existing User model structure
- Task type requirements from product team
- Performance expectations for task querying

### Outputs
- LearningTask Django model
- Database migrations
- Model documentation
- Query optimization recommendations

### Database Schema Design
1. LearningTask Table Fields
   - `id`: Primary Key (UUID recommended)
   - `title`: String (max 255 characters)
   - `description`: Text field with markdown support
   - `course_id`: Foreign Key to Course model
   - `status`: Enum (Draft, Published, Archived)
   - `created_at`: Timestamp with timezone
   - `updated_at`: Timestamp with timezone
   - `created_by`: Foreign Key to User model
   - `max_submissions`: Integer (optional)
   - `deadline`: DateTime (optional)
   - `task_type`: String (max 50 characters)
   - `points_possible`: Decimal (optional)
   - `time_limit_minutes`: Integer (optional)
   - `settings`: JSONField for type-specific configuration
   - `is_active`: Boolean (default True)

2. Indexing Strategy
   - Create indexes on:
     - `course_id`
     - `status`
     - `created_at`
     - `updated_at`
     - `task_type`
   - Create composite indexes on:
     - `(course_id, status)` for efficient course task filtering
     - `(created_by, created_at)` for instructor task history

3. Model Methods
   - `is_available_to_students()`: Checks if task is published and within deadline
   - `get_submission_count(student)`: Returns number of submissions by a student
   - `can_submit(student)`: Checks if student can submit based on max_submissions and deadline
   - `get_task_settings()`: Returns parsed settings based on task_type

### Technical Requirements
- Use Django ORM for model definition
- Implement custom model methods
- Support data validation
- Ensure database performance
- Implement proper model inheritance if needed for task types

## Implementation Details

### Required Libraries and Versions
- Django 4.2+
- django-model-utils 4.3.1+
- psycopg2-binary 2.9.5+
- djangorestframework 3.14.0+ (for future API integration)

### Code Examples

#### Model Definition
```python
from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from model_utils.models import TimeStampedModel
import uuid

class TaskStatus(models.TextChoices):
    DRAFT = 'draft', 'Draft'
    PUBLISHED = 'published', 'Published'
    ARCHIVED = 'archived', 'Archived'

class LearningTask(TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    course = models.ForeignKey(
        'learning.Course', 
        on_delete=models.CASCADE,
        related_name='learning_tasks'
    )
    status = models.CharField(
        max_length=20,
        choices=TaskStatus.choices,
        default=TaskStatus.DRAFT
    )
    created_by = models.ForeignKey(
        get_user_model(),
        on_delete=models.CASCADE,
        related_name='created_tasks'
    )
    max_submissions = models.PositiveIntegerField(null=True, blank=True)
    deadline = models.DateTimeField(null=True, blank=True)
    task_type = models.CharField(max_length=50)
    points_possible = models.DecimalField(
        max_digits=7, 
        decimal_places=2,
        null=True,
        blank=True
    )
    time_limit_minutes = models.PositiveIntegerField(null=True, blank=True)
    settings = models.JSONField(default=dict, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        indexes = [
            models.Index(fields=['course']),
            models.Index(fields=['status']),
            models.Index(fields=['created_at']),
            models.Index(fields=['updated_at']),
            models.Index(fields=['task_type']),
            models.Index(fields=['course', 'status']),
            models.Index(fields=['created_by', 'created_at']),
        ]
        ordering = ['-created_at']
        
    def is_available_to_students(self):
        if self.status != TaskStatus.PUBLISHED:
            return False
        if self.deadline and timezone.now() > self.deadline:
            return False
        return self.is_active
        
    def get_submission_count(self, student):
        return self.submissions.filter(student=student).count()
        
    def can_submit(self, student):
        if not self.is_available_to_students():
            return False
        if self.max_submissions is None:
            return True
        return self.get_submission_count(student) < self.max_submissions
        
    def get_task_settings(self):
        return self.settings
```

#### Migration Example
```python
# Generated by Django 4.2.1
from django.db import migrations, models
import django.db.models.deletion
import uuid

class Migration(migrations.Migration):

    dependencies = [
        ('learning', '0005_course_model_updates'),
        ('users', '0003_user_role_field'),
    ]

    operations = [
        migrations.CreateModel(
            name='LearningTask',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('title', models.CharField(max_length=255)),
                ('description', models.TextField(blank=True)),
                ('status', models.CharField(choices=[('draft', 'Draft'), ('published', 'Published'), ('archived', 'Archived')], default='draft', max_length=20)),
                ('max_submissions', models.PositiveIntegerField(blank=True, null=True)),
                ('deadline', models.DateTimeField(blank=True, null=True)),
                ('task_type', models.CharField(max_length=50)),
                ('points_possible', models.DecimalField(blank=True, decimal_places=2, max_digits=7, null=True)),
                ('time_limit_minutes', models.PositiveIntegerField(blank=True, null=True)),
                ('settings', models.JSONField(blank=True, default=dict)),
                ('is_active', models.BooleanField(default=True)),
                ('course', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='learning_tasks', to='learning.course')),
                ('created_by', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='created_tasks', to='users.user')),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
        migrations.AddIndex(
            model_name='learningtask',
            index=models.Index(fields=['course'], name='learning_ta_course__idx'),
        ),
        # Additional indexes would be defined here
    ]
```

## Edge Cases and Challenges

### Edge Cases
1. **Task Deletion**: When a course is deleted, all associated tasks should be deleted (CASCADE), but student submissions may need to be preserved for academic records.
2. **Deadline Handling**: Tasks with passed deadlines should still be visible but marked as unavailable for submission.
3. **Task Type Evolution**: The schema must support adding new task types without requiring model changes.
4. **Large Text Content**: Description fields may contain large amounts of formatted text, including embedded media references.
5. **Time Zone Handling**: Deadlines must respect user time zones for global courses.

### Challenges
1. **Performance at Scale**: Courses may have hundreds of tasks, requiring efficient indexing and query optimization.
2. **JSON Field Querying**: Filtering based on settings in the JSONField requires PostgreSQL-specific query techniques.
3. **Migration Strategy**: Ensuring migrations can be applied without downtime on a production system.
4. **Versioning Considerations**: Future requirements may include task versioning for academic integrity.

## Performance Considerations
- Use `select_related` and `prefetch_related` when querying tasks with related course or user data
- Consider denormalizing certain fields if query performance becomes an issue
- Monitor query performance with Django Debug Toolbar during development
- Implement database-level constraints for data integrity
- Consider adding caching for frequently accessed tasks

## Security Considerations
- Ensure proper permission checks before allowing task creation or modification
- Validate all user inputs, especially in the JSONField settings
- Implement row-level security if using PostgreSQL 9.5+
- Sanitize markdown content in the description field to prevent XSS attacks
- Log all changes to task status for audit purposes

## Testing Requirements
- Unit tests for model methods and validation
- Integration tests for database constraints and cascading behavior
- Performance tests with large datasets
- Migration tests to ensure smooth upgrades
- Security tests for permission enforcement

## Validation Criteria
- [x] Schema follows Django ORM best practices
- [x] Tasks are properly stored in the database
- [x] Foreign key relationships are enforced
- [x] Indexing supports efficient queries
- [x] Custom model methods work as expected
- [x] JSONField properly stores and retrieves task settings
- [x] Migrations can be applied and rolled back cleanly

## Acceptance Criteria
1. LearningTask model is created with all specified fields
2. Database migrations work correctly
3. Model supports all required operations
4. Performance is optimized for querying
5. Documentation is complete and accurate
6. Unit tests achieve >90% code coverage
7. Model integrates with existing Course and User models

## Learning Resources
- [Django Model Field Reference](https://docs.djangoproject.com/en/4.2/ref/models/fields/)
- [Django Database Optimization](https://docs.djangoproject.com/en/4.2/topics/db/optimization/)
- [PostgreSQL JSONField Documentation](https://docs.djangoproject.com/en/4.2/ref/contrib/postgres/fields/#jsonfield)
- [Django Migration Operations](https://docs.djangoproject.com/en/4.2/ref/migration-operations/)
- Book: "Django for Professionals" by William S. Vincent (Chapter 6: Database Models)

## Expert Contacts
- **Database Design**: Jane Smith (jane.smith@example.com)
- **Django ORM**: Michael Johnson (michael.johnson@example.com)
- **Performance Optimization**: Sarah Williams (sarah.williams@example.com)

## Related Design Patterns
- **Repository Pattern**: Consider implementing a TaskRepository for complex queries
- **Factory Pattern**: May be useful for creating different task types
- **Strategy Pattern**: Applicable for handling different validation strategies based on task type

## Sample Data Structures

### Example Task Settings (JSONField)
```json
// Multiple choice quiz settings
{
  "questions": [
    {
      "id": "q1",
      "text": "What is the capital of France?",
      "options": [
        {"id": "a", "text": "London"},
        {"id": "b", "text": "Paris"},
        {"id": "c", "text": "Berlin"},
        {"id": "d", "text": "Madrid"}
      ],
      "correctAnswer": "b",
      "points": 1
    }
  ],
  "shuffleQuestions": true,
  "shuffleOptions": true,
  "showCorrectAnswers": false
}

// Essay task settings
{
  "wordLimit": 500,
  "rubric": [
    {
      "criterion": "Content",
      "description": "Addresses all aspects of the prompt",
      "maxPoints": 10
    },
    {
      "criterion": "Organization",
      "description": "Well-structured with clear introduction and conclusion",
      "maxPoints": 5
    }
  ],
  "allowAttachments": true
}
```

## Estimated Effort
- Database Schema Design: 3 story points
- Model Implementation: 2 story points
- Testing: 1 story point
- Total: 6 story points

## Potential Risks
- Complex indexing requirements
- Performance with large numbers of tasks
- Ensuring data integrity across relationships
- Migration complexity in production environment
- Future extensibility requirements
