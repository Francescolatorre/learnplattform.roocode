# Test Data Implementation Plan

## Current Issue
- Users can be created but the courses page is empty
- Need to create test courses along with users

## Solution Plan
1. Rename command to `create_test_data` since it will handle both users and courses
2. Integrate course creation from test_data_generator.py:
   - Create instructor roles (LEAD, ASSISTANT, GUEST)
   - Create test courses (3 courses)
   - Assign instructors to courses with appropriate roles

## Implementation Steps
1. Modify the management command to:
   - Import necessary models (Course, CourseInstructorAssignment, InstructorRole)
   - Add create_instructor_roles() method
   - Add create_test_courses() method
   - Update handle() to create both users and courses

## Expected Result
After running the command:
- Test users will be created
- Instructor roles will be defined
- Test courses will be created
- Instructors will be assigned to courses
- Courses page will show the test courses

## Usage
```bash
python manage.py create_test_data