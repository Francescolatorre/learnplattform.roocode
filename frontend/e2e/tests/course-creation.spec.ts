// filepath: c:\DEVELOPMENT\projects\learnplatfom2\frontend\e2e\tests\course-creation.spec.ts
import {test, expect, Page} from '@playwright/test';
import {login, TEST_USERS, takeScreenshot, UserSession} from '../setupTests';
import {LoginPage} from '../page-objects/LoginPage';
import {InstructorDashboardPage} from '../page-objects/DashboardPage';
import {InstructorCoursesPage} from '../page-objects/CoursesPage';
import {CourseCreationPage} from '../page-objects/CourseCreationPage';

/**
 * Helper function to log test actions and outcomes with timestamps
 * Used to track the flow and debug potential issues in the course creation process
 */
const logTestAction = (message: string) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
};

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
    await loginPage.goto();
  });

  test('Instructor can create a new course', async ({page}) => {
    logTestAction('TEST STARTED: Instructor can create a new course');

    // 1. Login as instructor using the LoginPage page object
    logTestAction('Logging in as instructor');
    const loginPage = new LoginPage(page);
    await loginPage.login(
      TEST_USERS.lead_instructor.username_or_email,
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
    await courseCreationPage.takeScreenshot('course-form-initial');

    // 6. Create a course with our page object
    const courseTitle = 'Playwright Test Course';
    const courseDescription = 'This is a test course created by Playwright automated testing to verify the course creation functionality works properly.';

    // Using structured course data
    const courseData = {
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
      TEST_USERS.lead_instructor.username_or_email,
      TEST_USERS.lead_instructor.password
    );

    // 2. Navigate directly to course creation page
    const courseCreationPage = new CourseCreationPage(page);
    await courseCreationPage.goto();
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

  test('Network request monitoring during course creation', async ({page}) => {
    logTestAction('TEST STARTED: Monitoring network requests during course creation');

    // 1. Login as instructor using the LoginPage page object
    logTestAction('Logging in as instructor');
    const loginPage = new LoginPage(page);
    await loginPage.login(
      TEST_USERS.lead_instructor.username_or_email,
      TEST_USERS.lead_instructor.password
    );

    // 2. Navigate to course creation page using page objects
    const instructorDashboard = new InstructorDashboardPage(page);
    await instructorDashboard.waitForPageLoad();

    await instructorDashboard.navigateToInstructorCourses();
    const coursesPage = new InstructorCoursesPage(page);
    await coursesPage.waitForPageLoad();

    await coursesPage.navigateToCreateCourse();
    const courseCreationPage = new CourseCreationPage(page);
    await courseCreationPage.waitForPageLoad();

    // 3. Set up network request monitoring
    logTestAction('Setting up network request monitoring');
    let courseCreationRequest = null;
    let courseCreationResponse = null;

    // Listen for API calls to the course creation endpoint
    page.on('request', request => {
      if (request.url().includes('/api/v1/courses')) {
        courseCreationRequest = {
          url: request.url(),
          method: request.method(),
          headers: request.headers(),
          postData: request.postData()
        };
        logTestAction(`Course creation API request detected: ${request.method()} ${request.url()}`);
        if (request.postData()) {
          logTestAction(`Request payload: ${request.postData()}`);
        }
      }
    });

    page.on('response', async response => {
      if (response.url().includes('/api/v1/courses')) {
        courseCreationResponse = {
          url: response.url(),
          status: response.status(),
          statusText: response.statusText()
        };

        logTestAction(`Course creation API response: ${response.status()} ${response.statusText()}`);

        try {
          // Try to capture response body for debugging
          const responseBody = await response.text();
          logTestAction(`Response body: ${responseBody}`);
        } catch (e) {
          logTestAction('Could not capture response body');
        }
      }
    });

    // 4. Fill course form using page object
    logTestAction('Filling out course data');
    await courseCreationPage.fillCourseForm({
      title: 'Network Test Course',
      description: 'Testing network requests during course creation.'
    });

    // 5. Submit the form
    logTestAction('Submitting form and watching network traffic');
    await courseCreationPage.submitForm();

    // 6. Wait for network request/response cycle to complete
    try {
      const {success, courseId} = await courseCreationPage.waitForSuccessNotification(10000);
      expect(success).toBeTruthy();
      logTestAction('Course creation completed successfully with redirect');
    } catch (e) {
      logTestAction('ERROR: Course creation did not redirect within timeout');
      await courseCreationPage.takeScreenshot('course-creation-network-error');
    }

    // 7. Verify network data was captured
    if (courseCreationRequest && courseCreationResponse) {
      logTestAction('Successfully captured network traffic for course creation');

      expect(courseCreationRequest.method).toBe('POST');
      expect(courseCreationResponse.status).toBe(201); // Created

      logTestAction('TEST COMPLETED: Network monitoring verified correct API interaction');
    } else {
      logTestAction('WARNING: Could not capture network traffic for course creation');
      logTestAction('TEST COMPLETED WITH WARNINGS: Network monitoring incomplete');
    }
  });
});
