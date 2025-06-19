import { test, expect, Page } from '@playwright/test';
import { LoginPage } from '../page-objects/LoginPage';
import { StudentCoursesPage } from '../page-objects/courses';
import { CourseDetailPage } from '../page-objects/courses/CourseDetailPage';
import { DashboardPage } from '../page-objects/DashboardPage';
import { TEST_USERS, takeScreenshot, ApiHelper } from '../setupTests';
import {
  logPageState,
  debugElement,
  highlightAndScreenshot,
  saveDOMSnapshot,
  trackNetworkActivity,
  evaluateAndLog,
} from '../utils/debugHelper';

// Test constants - ordered by preference
const POSSIBLE_TEST_COURSES = [
  'Web Development with Django',
  'Python Programming',
  'Machine Learning',
  'Project Management Fundamentals',
];

// Enable network activity tracking for API debugging
const enableApiDebugging = true;

test.describe('Student Course Enrollment and Unenrollment Flow', () => {
  // Helper function to find a suitable test course using search
  // Use StudentCoursesPage.findTestCourseWithSearch in all tests below

  // UI-driven tests: login as student, navigate, enroll/unenroll via UI
  test.beforeEach(async ({ page }) => {
    if (enableApiDebugging) {
      trackNetworkActivity(page, {
        logRequests: true,
        logResponses: true,
        urlFilter: '/api/',
      });
    }

    // Login as a student
    const loginPage = new LoginPage(page);
    await loginPage.navigateTo();
    await takeScreenshot(page, 'login-page-before-auth');
    await loginPage.login(TEST_USERS.student.username, TEST_USERS.student.password);
    await logPageState(page, 'Post-Login State');

    // Verify login success
    const dashboardPage = new DashboardPage(page);
    await expect(async () => {
      const isDashboardLoaded = await dashboardPage.isDashboardLoaded();
      expect(isDashboardLoaded).toBeTruthy();
    }).toPass({ timeout: 10000 });

    await takeScreenshot(page, 'dashboard-after-login');
  });
  test('should be able to enroll in a course', async ({ page }) => {
    console.log('Starting course enrollment test...');

    // Find a test course with validation
    const coursesPage = new StudentCoursesPage(page);
    const testCourse = await coursesPage.findTestCourseWithSearch(POSSIBLE_TEST_COURSES);
    expect(testCourse.title, 'Test course title should be defined').toBeTruthy();
    console.log(`Selected test course: ${testCourse.title}`);

    // Click on the course with retry
    await expect(async () => {
      await coursesPage.clickCourse(testCourse.title);
      console.log('Clicked on course');
    }).toPass({ timeout: 10000 });

    // Verify we're on the course detail page with improved validation
    const courseDetailPage = new CourseDetailPage(page);
    await expect(async () => {
      const isLoaded = await courseDetailPage.isCourseDetailPageLoaded();
      expect(isLoaded, 'Course detail page should load').toBeTruthy();
    }).toPass({ timeout: 10000 });

    console.log('Course detail page loaded');
    await takeScreenshot(page, 'course-detail-before-enrollment');

    // If already enrolled, unenroll first with validation
    const alreadyEnrolled = await courseDetailPage.isEnrolled();
    if (alreadyEnrolled) {
      console.log('Course already enrolled, unenrolling first...');
      await courseDetailPage.unenrollFromCourse();

      // Wait for unenrollment to complete and verify
      await expect(async () => {
        await page.reload();
        await courseDetailPage.isCourseDetailPageLoaded();
        const stillEnrolled = await courseDetailPage.isEnrolled();
        expect(stillEnrolled, 'Course should be unenrolled').toBeFalsy();
      }).toPass({ timeout: 15000 });

      console.log('Successfully unenrolled from course');
    }

    // Try to enroll in the course with detailed logging
    console.log('Attempting to enroll in the course...');
    await takeScreenshot(page, 'before-enrollment-action');

    const enrollResult = await courseDetailPage.enrollInCourse();
    expect(enrollResult, 'Enrollment action should succeed').toBeTruthy();

    // Verify enrollment was successful with retries
    await expect(async () => {
      await page.reload();
      await courseDetailPage.isCourseDetailPageLoaded();
      const isEnrolled = await courseDetailPage.isEnrolled();
      expect(isEnrolled, 'Course should show as enrolled').toBeTruthy();
    }).toPass({ timeout: 15000 });

    // Verify enrollment status text with screenshot
    await takeScreenshot(page, 'after-enrollment-success');
    const statusText = await courseDetailPage.getEnrollmentStatusText();
    console.log(`Final enrollment status text: "${statusText}"`);
    expect(statusText.toLowerCase(), 'Status text should indicate enrollment').toContain(
      'enrolled'
    );

    console.log('Enrollment test completed successfully');
  });

  test('should be able to unenroll from a course via the unenroll button', async ({ page }) => {
    console.log('Starting course unenrollment test...');

    // Find a test course with validation
    const coursesPage = new StudentCoursesPage(page);
    const testCourse = await coursesPage.findTestCourseWithSearch(POSSIBLE_TEST_COURSES);
    expect(testCourse.title, 'Test course title should be defined').toBeTruthy();
    console.log(`Selected test course: ${testCourse.title}`);

    // Click on the course with retry
    await expect(async () => {
      await coursesPage.clickCourse(testCourse.title);
      console.log('Clicked on course');
    }).toPass({ timeout: 10000 });

    // Verify we're on the course detail page with validation
    const courseDetailPage = new CourseDetailPage(page);
    await expect(async () => {
      const isLoaded = await courseDetailPage.isCourseDetailPageLoaded();
      expect(isLoaded, 'Course detail page should load').toBeTruthy();
    }).toPass({ timeout: 10000 });

    console.log('Course detail page loaded');
    await takeScreenshot(page, 'course-detail-before-unenrollment');

    // If not enrolled, enroll first with validation
    const isEnrolled = await courseDetailPage.isEnrolled();
    if (!isEnrolled) {
      console.log('Course not enrolled, enrolling first...');
      const enrollResult = await courseDetailPage.enrollInCourse();
      expect(enrollResult, 'Enrollment action should succeed').toBeTruthy();

      // Wait for enrollment to complete and verify
      await expect(async () => {
        await page.reload();
        await courseDetailPage.isCourseDetailPageLoaded();
        const nowEnrolled = await courseDetailPage.isEnrolled();
        expect(nowEnrolled, 'Course should be enrolled').toBeTruthy();
      }).toPass({ timeout: 15000 });

      console.log('Successfully enrolled in course');
    }

    // Now proceed with unenrollment with improved error handling
    console.log('Attempting to unenroll from the course...');
    await takeScreenshot(page, 'before-unenrollment-action');

    const unenrollResult = await courseDetailPage.unenrollFromCourse();
    expect(unenrollResult, 'Unenrollment action should succeed').toBeTruthy();

    // Verify unenrollment was successful with retries
    await expect(async () => {
      await page.reload();
      await courseDetailPage.isCourseDetailPageLoaded();
      const stillEnrolled = await courseDetailPage.isEnrolled();
      expect(stillEnrolled, 'Course should show as not enrolled').toBeFalsy();

      // Also verify status text
      const statusText = await courseDetailPage.getEnrollmentStatusText();
      expect(statusText.toLowerCase(), 'Status should not indicate enrollment').not.toContain(
        'enrolled'
      );
    }).toPass({ timeout: 15000 });

    await takeScreenshot(page, 'after-unenrollment-success');
    console.log('Unenrollment test completed successfully');
  });

  test('should be able to cancel unenrollment via the cancel button', async ({ page }) => {
    // Find a test course
    const coursesPage = new StudentCoursesPage(page);
    const testCourse = await coursesPage.findTestCourseWithSearch(POSSIBLE_TEST_COURSES);
    expect(testCourse.title).toBeTruthy();

    // Click on the course
    await coursesPage.clickCourse(testCourse.title);

    // Verify we're on the course detail page
    const courseDetailPage = new CourseDetailPage(page);
    await courseDetailPage.isCourseDetailPageLoaded();

    // If not enrolled, enroll first
    const isEnrolled = await courseDetailPage.isEnrolled();
    if (!isEnrolled) {
      const enrollResult = await courseDetailPage.enrollInCourse();
      expect(enrollResult).toBeTruthy();
      await page.reload();
      await courseDetailPage.isCourseDetailPageLoaded();
    }

    // Attempt to unenroll but cancel the operation
    const cancelResult = await courseDetailPage.cancelUnenrollment();
    expect(cancelResult).toBeTruthy();

    // Verify user is still enrolled
    const stillEnrolled = await courseDetailPage.isEnrolled();
    expect(stillEnrolled).toBeTruthy();

    // View tasks button should still be visible
    let viewTasksButtonVisible = false;
    for (const selector of courseDetailPage.viewTasksButtonSelectors) {
      const viewTasksButton = page.locator(selector);
      viewTasksButtonVisible = await viewTasksButton
        .isVisible({ timeout: 2000 })
        .catch(() => false);
      if (viewTasksButtonVisible) {
        break;
      }
    }
    expect(viewTasksButtonVisible).toBeTruthy();
  });

  // Add explicit waits and improved retry logic
  async function waitForUIUpdate(page, selector, expectedState, timeout = 5000) {
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
      const element = page.locator(selector);
      const isVisible = await element.isVisible().catch(() => false);
      if (isVisible === expectedState) {
        return true;
      }
      await page.waitForTimeout(500); // Wait before retrying
    }
    return false;
  }

  // ... (all UI-driven tests remain unchanged)
  // (tests from test('should navigate to courses page ...') to test('e2e enrollment flow with search', ...) remain here)
});

// API-driven setup test: creates a course and enrolls student via API, then tests UI unenrollment
test.describe('API-driven Course Unenrollment Flow', () => {
  test('should be able to unenroll from a course via the unenroll button (API setup)', async ({
    page,
  }) => {
    console.log('Starting course unenrollment test (API-driven)...');

    // Arrange - Setup API helpers
    const instructorHelper = new ApiHelper();
    const studentHelper = new ApiHelper();

    await instructorHelper.authenticate(
      TEST_USERS.lead_instructor.username,
      TEST_USERS.lead_instructor.password
    );
    await studentHelper.authenticate(TEST_USERS.student.username, TEST_USERS.student.password);

    // Get user IDs via profile API
    const instructorProfile = await instructorHelper.getUserProfile();
    const instructorUserId = instructorProfile.id;
    const studentProfile = await studentHelper.getUserProfile();
    const studentUserId = studentProfile.id;

    // Create a unique test course via API as instructor
    const testCourseTitle = `E2E Test Course ${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const coursePayload = {
      title: testCourseTitle,
      description: 'E2E test course for unenrollment flow',
      creator: instructorUserId,
      status: 'published',
      visibility: 'public',
      start_date: '2023-01-01',
      end_date: '2025-12-31',
      enrollment_start: '2023-01-01',
      enrollment_end: '2025-12-31',
      max_students: 50,
    };
    const createdCourse = await instructorHelper.createCourse(coursePayload);
    const testCourseId = createdCourse.id;

    // Enroll student via API before test
    await instructorHelper.enrollInCourse(testCourseId, studentUserId);

    // Login as student via UI
    const loginPage = new LoginPage(page);
    await loginPage.navigateTo();
    await takeScreenshot(page, 'login-page-before-auth');
    await loginPage.login(TEST_USERS.student.username, TEST_USERS.student.password);
    await logPageState(page, 'Post-Login State');

    // Navigate directly to the course detail page using the known course ID
    await page.goto(`/courses/${testCourseId}`);
    console.log(`Navigated directly to /courses/${testCourseId}`);

    // Verify we're on the course detail page
    const courseDetailPage = new CourseDetailPage(page);
    await expect(async () => {
      const isLoaded = await courseDetailPage.isCourseDetailPageLoaded();
      expect(isLoaded, 'Course detail page should load').toBeTruthy();
    }).toPass({ timeout: 10000 });

    await takeScreenshot(page, 'course-detail-before-unenrollment');

    // Ensure student is enrolled (should be true from setup)
    const isEnrolled = await courseDetailPage.isEnrolled();
    expect(isEnrolled).toBeTruthy();

    // Unenroll in the course via UI
    console.log('Attempting to unenroll from the course...');
    await takeScreenshot(page, 'before-unenrollment-action');
    const unenrollResult = await courseDetailPage.unenrollFromCourse();
    expect(unenrollResult, 'Unenrollment action should succeed').toBeTruthy();

    // Verify unenrollment was successful
    await expect(async () => {
      await page.reload();
      await courseDetailPage.isCourseDetailPageLoaded();
      const stillEnrolled = await courseDetailPage.isEnrolled();
      expect(stillEnrolled, 'Course should show as not enrolled').toBeFalsy();
    }).toPass({ timeout: 15000 });

    await takeScreenshot(page, 'after-unenrollment-success');
    console.log('Unenrollment test completed successfully');
  });
});
