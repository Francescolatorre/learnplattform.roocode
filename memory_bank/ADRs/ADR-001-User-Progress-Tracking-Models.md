# ADR-001: User Progress Tracking Models

## Status

Accepted

## Context

The Learning Platform needs to track user progress through courses and learning activities. This includes tracking course enrollments, task progress, quiz attempts, and quiz responses. This functionality is essential for:

1. Allowing students to track their learning journey
2. Enabling instructors to monitor student engagement and performance
3. Supporting analytics and reporting on learning outcomes
4. Providing personalized learning experiences based on progress

## Decision

We have implemented the following data models to track user progress:

1. **CourseEnrollment**: Tracks which students are enrolled in which courses, including enrollment status and date.
2. **TaskProgress**: Tracks progress on individual learning tasks, including completion status and time spent.
3. **QuizAttempt**: Tracks quiz attempts by students, including score, time taken, and completion status.
4. **QuizResponse**: Stores student responses to individual quiz questions, including correctness and time spent.

Additionally, we've extended the User model with helper methods to calculate progress percentages and retrieve latest quiz attempts.

## Consequences

### Positive

1. **Comprehensive Progress Tracking**: The implemented models provide a comprehensive system for tracking user progress at multiple levels (course, task, quiz).
2. **Performance Metrics**: The models capture important performance metrics like time spent, completion status, and quiz scores.
3. **Flexible Relationships**: The relationships between models allow for complex queries and analytics.
4. **API Support**: The models are fully supported by REST API endpoints for frontend integration.
5. **Extensibility**: The design allows for future extensions, such as adding more detailed analytics or gamification features.

### Negative

1. **Database Size**: Tracking detailed progress information will increase database size, especially for courses with many students and activities.
2. **Query Complexity**: Some queries involving multiple relationships may be complex and require optimization.
3. **Maintenance Overhead**: More models mean more code to maintain and test.

### Neutral

1. **Migration Path**: Existing courses and users can be gradually migrated to use the new progress tracking features.
2. **API Changes**: Frontend applications will need to be updated to use the new API endpoints.

## Implementation Details

The implementation includes:

1. Django models with appropriate fields and relationships
2. Helper methods for calculating progress percentages and determining course completion
3. REST API serializers for all models
4. API endpoints for CRUD operations
5. Comprehensive test coverage
6. Documentation of models, relationships, and usage examples

## Alternatives Considered

1. **Event-based Progress Tracking**: Instead of storing progress state directly, we considered tracking events (started task, completed quiz, etc.) and calculating progress on-demand. This would provide more detailed history but would be more complex to query.

2. **Simplified Model Structure**: We considered a simpler model with fewer entities, but this would limit the granularity of progress tracking.

3. **NoSQL Approach**: For very large scale, a NoSQL solution might offer better performance for certain types of queries, but would sacrifice the relational integrity that is important for this feature.

## References

- Django model documentation: https://docs.djangoproject.com/en/stable/topics/db/models/
- REST framework serializer patterns: https://www.django-rest-framework.org/api-guide/serializers/
- Learning analytics best practices: https://www.learninganalytics.net/
