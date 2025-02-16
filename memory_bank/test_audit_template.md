# Test Audit Template

## Assessment App Tests

### Model Tests (assessment/tests/test_models.py)

| Test Class/Function | Current Markers | DB Usage | Dependencies | Execution Time | Proposed Markers | Migration Status |
|-------------------|----------------|-----------|--------------|----------------|------------------|-----------------|
| TestSubmissionModel.test_submission_creation | django_db | Create/Read | Factory | < 100ms | db | Not Started |
| TestSubmissionModel.test_unique_user_task_constraint | django_db | Create/Validate | Factory | < 100ms | db | Not Started |
| TestSubmissionModel.test_grade_constraints | django_db | Create/Update | Factory | < 100ms | db | Not Started |
| TestSubmissionModel.test_string_representation | django_db | Create/Read | Factory | < 100ms | db | Not Started |
| TestQuizModel.test_quiz_creation | django_db | Create/Read | Factory | < 100ms | db | Not Started |
| TestQuizModel.test_quiz_tasks_relationship | django_db | Create/Update | Factory | < 100ms | db | Not Started |
| TestQuizModel.test_string_representation | django_db | Create/Read | Factory | < 100ms | db | Not Started |
| TestUserProgressModel.test_progress_creation | django_db | Create/Read | Factory | < 100ms | db | Not Started |
| TestUserProgressModel.test_unique_user_quiz_constraint | django_db | Create/Validate | Factory | < 100ms | db | Not Started |
| TestUserProgressModel.test_completed_tasks_relationship | django_db | Create/Update | Factory | < 100ms | db | Not Started |
| TestUserProgressModel.test_string_representation | django_db | Create/Read | Factory | < 100ms | db | Not Started |

## Tasks App Tests

### Model Tests (tasks/tests/test_models.py)

| Test Class/Function | Current Markers | DB Usage | Dependencies | Execution Time | Proposed Markers | Migration Status |
|-------------------|----------------|-----------|--------------|----------------|------------------|-----------------|
| TestBaseTaskBehavior.test_learning_task_creation | django_db | Create/Read | None | < 100ms | db | Not Started |
| TestBaseTaskBehavior.test_assessment_task_creation | django_db | Create/Read | None | < 100ms | db | Not Started |
| TestBaseTaskBehavior.test_title_max_length | django_db | Create/Validate | None | < 100ms | db | Not Started |
| TestLearningTask.test_difficulty_level_optional | django_db | Create/Validate | None | < 100ms | db | Not Started |
| TestLearningTask.test_string_representation | django_db | Create/Read | None | < 100ms | db | Not Started |
| TestAssessmentTask.test_score_fields_optional | django_db | Create/Validate | None | < 100ms | db | Not Started |
| TestAssessmentTask.test_score_decimal_constraints | django_db | Create/Validate | None | < 100ms | db | Not Started |
| TestQuizTask.test_quiz_task_creation | django_db | Create/Read | Factory | < 100ms | db | Not Started |
| TestQuizTask.test_inheritance_from_assessment_task | django_db | Create/Read | Factory | < 100ms | db | Not Started |
| TestQuizTask.test_time_limit_optional | django_db | Create/Validate | None | < 100ms | db | Not Started |
| TestQuizTask.test_is_randomized_default | django_db | Create/Read | None | < 100ms | db | Not Started |
| TestQuizTask.test_string_representation | django_db | Create/Read | None | < 100ms | db | Not Started |

## Learning App Tests

### Model Tests (learning/tests/test_models.py)

| Test Class/Function | Current Markers | DB Usage | Dependencies | Execution Time | Proposed Markers | Migration Status |
|-------------------|----------------|-----------|--------------|----------------|------------------|-----------------|
| TestCourseModel.test_course_creation | django_db | Create/Read | Factory | < 100ms | db | Not Started |
| TestCourseModel.test_unique_title_constraint | django_db | Create/Validate | Factory | < 100ms | db | Not Started |
| TestCourseModel.test_instructor_relationship | django_db | Create/Read/Delete | Factory | < 100ms | db | Not Started |
| TestCourseModel.test_tasks_relationship | django_db | Create/Update | Factory | < 100ms | db | Not Started |
| TestCourseModel.test_get_learning_tasks | django_db | Create/Read | Factory | < 100ms | db | Not Started |
| TestCourseModel.test_string_representation | django_db | Create/Read | Factory | < 100ms | db | Not Started |
| TestCourseModel.test_optional_description | django_db | Create/Validate | Factory | < 100ms | db | Not Started |
| TestCourseModel.test_title_max_length | django_db | Create/Validate | Factory | < 100ms | db | Not Started |

## Users App Tests

### Authentication Tests (users/tests.py)

| Test Class/Function | Current Markers | DB Usage | Dependencies | Execution Time | Proposed Markers | Migration Status |
|-------------------|----------------|-----------|--------------|----------------|------------------|-----------------|
| UserAuthenticationTests.test_user_registration | None | Create/Read | None | < 100ms | integration | Not Started |
| UserAuthenticationTests.test_user_registration_password_mismatch | None | None | None | < 100ms | unit | Not Started |
| UserAuthenticationTests.test_user_login | None | Read | None | < 100ms | integration | Not Started |
| UserAuthenticationTests.test_user_login_with_email | None | Read | None | < 100ms | integration | Not Started |
| UserAuthenticationTests.test_user_login_invalid_credentials | None | Read | None | < 100ms | integration | Not Started |
| UserAuthenticationTests.test_user_logout | None | Read | None | < 100ms | integration | Not Started |

## Migration Notes

### Priority Order
1. Start with Users app tests - mix of unit and integration tests
2. Move to Model tests - all need db marker
3. Handle Repository tests - integration markers
4. Finally Service tests - mix of unit and integration

### Special Considerations
1. Model tests currently all use django_db but some could be unit tests with mocking
2. Authentication tests need proper marker categorization
3. Some integration tests might need slow marker based on setup time
4. Consider adding performance tests for complex queries

### Next Steps
1. Begin with Users app as pilot
2. Document any issues encountered
3. Adjust strategy based on findings
4. Proceed with remaining apps
5. Validate all migrations
6. Update CI pipeline