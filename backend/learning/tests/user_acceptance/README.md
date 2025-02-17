# User Acceptance Testing Guide for Course Management System

## Overview
This guide provides instructions for conducting user acceptance testing for the Course Management System, focusing on instructor features and version control workflows.

## Test Data Generation

### Prerequisites
- Ensure Django environment is set up
- Have all dependencies installed
- Be in the project's backend directory

### Generating Test Data
```bash
python manage.py shell < tests/user_acceptance/test_data_generator.py
```

## Test Scenarios

### Quick Start

#### Running Test Environment
```bash
# Ensure npm dependencies are installed
cd frontend
npm install

# Make script executable (if not already)
chmod +x start_test_environment.sh

# Start test servers, generate test data, and run tests
./start_test_environment.sh
```

#### Server Details
- Backend Server: http://localhost:8000
- Frontend Server: http://localhost:5173
- Test data automatically generated

### Instructor Management Testing

1. **Role-Based Access Control**
   - Verify permissions for each instructor role:
     * Lead Instructor: Full course management rights
     * Assistant Instructor: Limited course management
     * Guest Instructor: View-only access

2. **Instructor Assignment Workflows**
   - Test adding/removing instructors
   - Validate role-based permissions
   - Check bulk instructor management

### Version Control Testing

1. **Version Creation**
   - Create new course versions
   - Verify version numbering
   - Check metadata preservation

2. **Version Comparison**
   - Compare different versions of a course
   - Validate change tracking
   - Verify content snapshot accuracy

3. **Rollback Operations**
   - Test rolling back to previous versions
   - Verify data integrity
   - Check constraint enforcement

## Test Credentials

### Users
- Lead Instructor
  * Username: lead_instructor
  * Password: testpass123

- Assistant Instructor
  * Username: assistant_instructor
  * Password: testpass123

- Guest Instructor
  * Username: guest_instructor
  * Password: testpass123

## Feedback Collection

1. Document all test scenarios
2. Record any unexpected behaviors
3. Note performance observations
4. Capture user experience insights

## Reporting Issues

- Provide detailed steps to reproduce
- Include screenshots if possible
- Specify expected vs. actual behavior

## Running Tests

```bash
# Run user acceptance tests
python -m pytest backend/learning/tests/user_acceptance/
```

## Feedback Template

```
Test Scenario: [Scenario Name]
User Role: [User Role]
Steps Taken: 
1. 
2. 
3. 

Observations:
- Expected Behavior: 
- Actual Behavior: 

Recommendations: