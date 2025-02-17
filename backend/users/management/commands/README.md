# Create Test Data Management Command

## Overview

This Django management command creates comprehensive test data for development and testing, including:
- Test users with different roles
- Instructor roles
- Test courses with multiple instructors

## Users Created

- Lead Instructor
  * Username: lead_instructor
  * Email: lead@example.com
  * Role: Instructor (Full course management rights)

- Assistant Instructor
  * Username: assistant_instructor
  * Email: assistant@example.com
  * Role: Instructor (Limited course management rights)

- Guest Instructor
  * Username: guest_instructor
  * Email: guest@example.com
  * Role: Instructor (View-only access)

## Courses Created

- 3 test courses with:
  * Draft status
  * Internal visibility
  * Multiple instructor assignments
  * Version history

## Usage

To create test data, run the following command from the project's backend directory:

```bash
python manage.py create_test_data
```

## Notes

- Users are created only if they do not already exist
- All users have the password: `testpass123`
- The command uses a transaction to ensure data integrity