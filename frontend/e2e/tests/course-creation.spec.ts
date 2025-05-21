// filepath: c:\DEVELOPMENT\projects\learnplatfom2\frontend\e2e\tests\course-creation.spec.ts
import {test, expect, Page} from '@playwright/test';
import {login, TEST_USERS, takeScreenshot, UserSession} from '../setupTests';
import {logTestAction} from '../utils/debugHelper';
import {LoginPage} from '../page-objects/LoginPage';
import {InstructorDashboardPage} from '../page-objects/DashboardPage';
import {InstructorCoursesPage} from '../page-objects/courses';
import {CourseCreationPage, ICourseCreationData} from '../page-objects/courses/CourseCreationPage';


/**
 * Test suite for course creation functionality
 * Focuses on the ability of instructors to create courses through the UI
 * Refactored to use Page Object Model for better maintainability
 */
test.describe('Course Creation Functionality', () => {
  test.beforeEach(async ({page}) => {
    logTestAction('Starting test case - navigating to login page');
    // Using LoginPage page object instead of direct navigation
    const loginPage = new LoginPage(page);
    await loginPage.navigateTo();
  });

  test('Instructor can create a new course', async ({page}) => {
    logTestAction('TEST STARTED: Instructor can create a new course');

    // 1. Login as instructor using the LoginPage page object
    logTestAction('Logging in as instructor');
    const loginPage = new LoginPage(page);
    await loginPage.login(
      TEST_USERS.lead_instructor.username,
      TEST_USERS.lead_instructor.password
    );
    logTestAction('Login successful, redirected to instructor dashboard');

    // 2. Use InstructorDashboardPage page object
    const instructorDashboard = new InstructorDashboardPage(page);
    await instructorDashboard.waitForPageLoad();
    expect(page.url()).toContain('/instructor/dashboard');

    // 3. Navigate to courses page using the page object
    await instructorDashboard.navigateToInstructorCourses();
    const coursesPage = new InstructorCoursesPage(page);
    await coursesPage.waitForPageLoad();

    // 4. Navigate to course creation page
    logTestAction('Navigating to course creation form');
    await coursesPage.navigateToCreateCourse();

    // 5. Use CourseCreationPage page object to fill and submit the form
    logTestAction('Using CourseCreationPage to create course');
    const courseCreationPage = new CourseCreationPage(page);
    await courseCreationPage.waitForPageLoad();

    // Take screenshot of the form for debugging
    await courseCreationPage.takeScreenshot('course-form-initial');    // 6. Create a course with our page object
    const courseTitle = 'Playwright Test Course';
    const courseDescription = 'This is a test course created by Playwright automated testing to verify the course creation functionality works properly.';

    // Using structured course data
    const courseData: ICourseCreationData = {
      title: courseTitle,
      description: courseDescription,
      category: 'Testing',
      difficulty: 'intermediate',
      isPublished: true
    };

    // Fill all form fields with our page object
    await courseCreationPage.fillCourseForm(courseData);
    await courseCreationPage.takeScreenshot('course-form-filled');

    // 7. Submit the form
    logTestAction('Submitting course creation form');
    await courseCreationPage.submitForm();

    // 8. Wait for success notification using the page object
    logTestAction('Waiting for success notification');
    const {success, courseId} = await courseCreationPage.waitForSuccessNotification(10000);
    expect(success).toBeTruthy();
    expect(courseId).toBeTruthy();

    logTestAction(`Course created successfully with ID: ${courseId}`);

    // 9. Validate course details
    logTestAction('Validating created course details on the course page');
    const validationResult = await courseCreationPage.validateCourseDetails(courseId!, courseTitle);
    expect(validationResult).toBeTruthy();

    logTestAction('Course details validated successfully');

    // 10. Navigate back to courses list to complete the workflow
    logTestAction('Navigating back to course list');
    await page.goto('/instructor/courses');
    await coursesPage.waitForPageLoad();

    // Verify the course appears in the list
    const courseExists = await coursesPage.hasCourse(courseTitle);
    expect(courseExists).toBeTruthy();

    // Final success screenshot
    await takeScreenshot(page, 'course-creation-success');
    logTestAction('TEST COMPLETED SUCCESSFULLY: Course was created and details were verified');
  });

  test('Course creation form validates required fields', async ({page}) => {
    logTestAction('TEST STARTED: Course creation form validates required fields');

    // 1. Login as instructor using the LoginPage page object
    logTestAction('Logging in as instructor');
    const loginPage = new LoginPage(page);
    await loginPage.login(
      TEST_USERS.lead_instructor.username,
      TEST_USERS.lead_instructor.password
    );

    // 2. Navigate directly to course creation page
    const courseCreationPage = new CourseCreationPage(page);
    await courseCreationPage.navigateTo();
    logTestAction('Navigated to course creation page');

    // 3. Try to submit empty form
    logTestAction('Attempting to submit empty form to test validation');
    await courseCreationPage.submitForm();

    // 4. Check for validation errors using the page object
    logTestAction('Looking for validation error messages');
    await courseCreationPage.takeScreenshot('course-form-validation');

    const validationErrors = await courseCreationPage.checkValidationErrors();

    // Expect validation errors to be shown
    expect(validationErrors.hasAnyError).toBeTruthy();
    expect(validationErrors.titleError || validationErrors.descriptionError).toBeTruthy();

    logTestAction(`Validation results - Title error: ${validationErrors.titleError}, Description error: ${validationErrors.descriptionError}`);
    logTestAction('TEST COMPLETED: Form validation works correctly');
  });
});
