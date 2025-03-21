# User Progress Tracking Models

This document describes the data models used for tracking user progress through courses and learning activities in the Learning Platform.

## Core Models

### CourseEnrollment

The `CourseEnrollment` model tracks which students are enrolled in which courses.

**Fields:**
- `user`: ForeignKey to User model
- `course`: ForeignKey to Course model
- `enrollment_date`: DateTimeField (auto-set to current time on creation)
- `status`: CharField with choices:
  - "active": User is actively participating in the course
  - "completed": User has completed the course
  - "dropped": User has dropped the course
- `settings`: JSONField for course-specific settings for the student

**Methods:**
- `is_course_completed()`: Checks if all tasks in the course are completed by the user
- `calculate_course_progress()`: Calculates the percentage of completed tasks in the course

### TaskProgress

The `TaskProgress` model tracks progress on individual learning tasks.

**Fields:**
- `user`: ForeignKey to User model
- `task`: ForeignKey to LearningTask model
- `status`: CharField with choices:
  - "not_started": User has not started the task
  - "in_progress": User is working on the task
  - "completed": User has completed the task
- `time_spent`: DurationField tracking time spent on the task
- `completion_date`: DateTimeField (null if not completed)

### QuizAttempt

The `QuizAttempt` model tracks quiz attempts by students.

**Fields:**
- `user`: ForeignKey to User model
- `quiz`: ForeignKey to QuizTask model
- `score`: IntegerField representing the score achieved
- `time_taken`: DurationField tracking time taken to complete the quiz
- `completion_status`: CharField with choices:
  - "completed": Quiz was completed
  - "incomplete": Quiz was not completed
- `attempt_date`: DateTimeField (auto-set to current time on creation)

**Methods:**
- `get_latest_attempt()`: Returns the latest attempt for this quiz by the user

### QuizResponse

The `QuizResponse` model stores student responses to individual quiz questions.

**Fields:**
- `attempt`: ForeignKey to QuizAttempt model
- `question`: ForeignKey to QuizQuestion model
- `selected_option`: ForeignKey to QuizOption model
- `is_correct`: BooleanField indicating if the response was correct
- `time_spent`: DurationField tracking time spent on the question

## User Model Extensions

The User model has been extended with the following methods:

- `calculate_progress_percentage()`: Calculates the overall progress percentage across all tasks for the user
- `get_latest_quiz_attempt(quiz=None)`: Gets the latest quiz attempt for the user, optionally filtered by quiz

## Relationships

1. **User to CourseEnrollment**: One-to-many
   - A user can be enrolled in multiple courses
   - Each enrollment belongs to one user

2. **Course to CourseEnrollment**: One-to-many
   - A course can have multiple enrollments
   - Each enrollment belongs to one course

3. **CourseEnrollment to TaskProgress**: One-to-many (implicit)
   - A course enrollment implies progress on tasks within that course
   - Task progress is linked to both the user and the task

4. **User to TaskProgress**: One-to-many
   - A user can have progress on multiple tasks
   - Each task progress belongs to one user

5. **LearningTask to TaskProgress**: One-to-many
   - A learning task can have progress records from multiple users
   - Each task progress belongs to one learning task

6. **QuizTask to QuizAttempt**: One-to-many
   - A quiz can have multiple attempts from multiple users
   - Each attempt belongs to one quiz

7. **User to QuizAttempt**: One-to-many
   - A user can have multiple quiz attempts
   - Each attempt belongs to one user

8. **QuizAttempt to QuizResponse**: One-to-many
   - A quiz attempt can have multiple responses (one for each question)
   - Each response belongs to one attempt

9. **QuizQuestion to QuizResponse**: One-to-many
   - A quiz question can have multiple responses from multiple users
   - Each response is for one question

## API Endpoints

The following API endpoints are available for the progress tracking models:

- `/api/v1/course-enrollments/`: List and create course enrollments
- `/api/v1/task-progress/`: List and create task progress records
- `/api/v1/quiz-attempts/`: List and create quiz attempts
- `/api/v1/quiz-responses/`: List and create quiz responses

## Usage Examples

### Enrolling a User in a Course

```python
enrollment = CourseEnrollment.objects.create(
    user=user,
    course=course,
    status="active"
)
```

### Tracking Task Progress

```python
progress = TaskProgress.objects.create(
    user=user,
    task=task,
    status="in_progress"
)

# Later, when the task is completed:
progress.status = "completed"
progress.completion_date = timezone.now()
progress.save()
```

### Recording a Quiz Attempt

```python
attempt = QuizAttempt.objects.create(
    user=user,
    quiz=quiz,
    score=80,
    time_taken=datetime.timedelta(minutes=15),
    completion_status="completed"
)

# Record responses for each question
for question, answer in zip(questions, answers):
    QuizResponse.objects.create(
        attempt=attempt,
        question=question,
        selected_option=answer,
        is_correct=answer.is_correct,
        time_spent=datetime.timedelta(minutes=1)
    )
```

### Checking Course Completion

```python
enrollment = CourseEnrollment.objects.get(user=user, course=course)
if enrollment.is_course_completed():
    enrollment.status = "completed"
    enrollment.save()
```

### Getting User Progress

```python
# Get overall progress percentage
progress_percentage = user.calculate_progress_percentage()

# Get course-specific progress
enrollment = CourseEnrollment.objects.get(user=user, course=course)
course_progress = enrollment.calculate_course_progress()
