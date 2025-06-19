import { test, expect } from '@playwright/test';
import { LoginPage } from '../../page-objects/LoginPage';
import { AdminCoursesPage } from '../../page-objects/courses';
import { CourseDetailPage } from '../../page-objects/courses/CourseDetailPage';
import { DashboardPage } from '../../page-objects/DashboardPage';
import { TEST_USERS, takeScreenshot } from '../../setupTests';
import { logPageState, trackNetworkActivity } from '../../utils/debugHelper';

const enableApiDebugging = true;

test.describe('Admin Course List and Search', () => {
  test.beforeEach(async ({ page }) => {
    if (enableApiDebugging) {
      trackNetworkActivity(page, {
        logRequests: true,
        logResponses: true,
        urlFilter: '/api/',
      });
    }

    // Login as admin
    const loginPage = new LoginPage(page);
    await loginPage.navigateTo();
    await takeScreenshot(page, 'login-page-before-auth');
    await loginPage.login(TEST_USERS.admin.username, TEST_USERS.admin.password);
    await logPageState(page, 'Post-Login State');

    // Verify login success and redirect to admin dashboard
    const dashboardPage = new DashboardPage(page);
    await expect(async () => {
      const isDashboardLoaded = await dashboardPage.isDashboardLoaded();
      expect(isDashboardLoaded).toBeTruthy();
    }).toPass({ timeout: 10000 });

    await takeScreenshot(page, 'admin-dashboard-after-login');
  });

  test('admin can view and search all courses', async ({ page }) => {
    const coursesPage = new AdminCoursesPage(page);
    await coursesPage.navigateTo();
    await coursesPage.isCoursesPageLoaded();

    // Verify admin-specific UI elements
    await expect(page.locator('[data-testid="admin-controls"]')).toBeVisible();
    await expect(page.locator('[data-testid="course-status-filter"]')).toBeVisible();
    await expect(page.locator('[data-testid="instructor-filter"]')).toBeVisible();

    // Test search functionality
    await coursesPage.searchForCourse('test');
    await page.waitForTimeout(500);

    const results = await coursesPage.getSearchResults();
    expect(results.length).toBeGreaterThan(0);
  });

  test('admin can access system-wide course management', async ({ page }) => {
    const coursesPage = new AdminCoursesPage(page);
    await coursesPage.navigateTo();
    await coursesPage.isCoursesPageLoaded();

    // Verify admin management features
    await expect(page.locator('[data-testid="admin-controls"]')).toBeVisible();
    await expect(page.locator('[data-testid="bulk-actions"]')).toBeVisible();
    await expect(page.locator('[data-testid="system-settings"]')).toBeVisible();

    // Check instructor filter functionality
    await page.locator('[data-testid="instructor-filter"]').selectOption('all');
    await page.waitForTimeout(500);
    const allResults = await coursesPage.getSearchResults();

    // Filter by specific instructor
    await page.locator('[data-testid="instructor-filter"]').selectOption('instructor1');
    await page.waitForTimeout(500);
    const filteredResults = await coursesPage.getSearchResults();

    expect(filteredResults.length).toBeLessThanOrEqual(allResults.length);
  });

  test.afterEach(async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.logout();
    await takeScreenshot(page, 'post-logout-state');
  });
});
