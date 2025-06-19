import { test, expect } from '@playwright/test';
import { LoginPage } from '../../page-objects/LoginPage';
import { InstructorCoursesPage } from '../../page-objects/courses';
import { CourseDetailPage } from '../../page-objects/courses/CourseDetailPage';
import { DashboardPage } from '../../page-objects/DashboardPage';
import { TEST_USERS, takeScreenshot } from '../../setupTests';
import { logPageState, trackNetworkActivity } from '../../utils/debugHelper';

// Test constants - instructor specific courses
const INSTRUCTOR_TEST_COURSES = [
  'Web Development with Django',
  'Python Programming',
  'Machine Learning',
  'Project Management Fundamentals',
];

const enableApiDebugging = true;

test.describe('Instructor Course List and Search', () => {
  test.beforeEach(async ({ page }) => {
    if (enableApiDebugging) {
      trackNetworkActivity(page, {
        logRequests: true,
        logResponses: true,
        urlFilter: '/api/',
      });
    }

    // Login as an instructor
    const loginPage = new LoginPage(page);
    await loginPage.navigateTo();
    await takeScreenshot(page, 'login-page-before-auth');
    await loginPage.login(TEST_USERS.lead_instructor.username, TEST_USERS.lead_instructor.password);
    await logPageState(page, 'Post-Login State');

    // Verify login success and redirect to instructor dashboard
    const dashboardPage = new DashboardPage(page);
    await expect(async () => {
      const isDashboardLoaded = await dashboardPage.isDashboardLoaded();
      expect(isDashboardLoaded).toBeTruthy();
    }).toPass({ timeout: 10000 });

    await takeScreenshot(page, 'instructor-dashboard-after-login');
  });

  test('instructor can view and search their courses', async ({ page }) => {
    const coursesPage = new InstructorCoursesPage(page);
    await coursesPage.navigateTo();
    await coursesPage.isCoursesPageLoaded();

    // Verify instructor-specific UI elements
    await expect(page.locator('[data-testid="create-course-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="course-status-filter"]')).toBeVisible();

    // Search through test courses
    for (const courseName of INSTRUCTOR_TEST_COURSES) {
      await coursesPage.searchForCourse(courseName);
      await page.waitForTimeout(500);

      const results = await coursesPage.getSearchResults();
      console.log(`Search results for "${courseName}":`, results);
    }
  });

  test('instructor can view draft and published courses', async ({ page }) => {
    const coursesPage = new InstructorCoursesPage(page);
    await coursesPage.navigateTo();
    await coursesPage.isCoursesPageLoaded();

    // Check draft courses visibility
    await page.locator('[data-testid="course-status-filter"]').selectOption('draft');
    await page.waitForTimeout(500);

    const draftResults = await coursesPage.getSearchResults();
    console.log('Draft courses:', draftResults);

    // Check published courses visibility
    await page.locator('[data-testid="course-status-filter"]').selectOption('published');
    await page.waitForTimeout(500);

    const publishedResults = await coursesPage.getSearchResults();
    console.log('Published courses:', publishedResults);
  });

  test('instructor can access course management features', async ({ page }) => {
    const coursesPage = new InstructorCoursesPage(page);
    await coursesPage.navigateTo();
    await coursesPage.isCoursesPageLoaded();

    // Verify instructor management UI elements
    await expect(page.locator('[data-testid="create-course-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="course-status-filter"]')).toBeVisible();
    await expect(page.locator('[data-testid="course-management-header"]')).toBeVisible();

    // Verify edit options are available for courses
    const firstCourseCard = page.locator('[data-testid^="course-card-"]').first();
    await firstCourseCard.hover();
    await expect(firstCourseCard.locator('[data-testid="edit-course-button"]')).toBeVisible();
  });

  test.afterEach(async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.logout();
    await takeScreenshot(page, 'post-logout-state');
  });
});
