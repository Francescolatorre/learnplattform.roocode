import { test, expect } from '@playwright/test';
import { LoginPage } from '../../page-objects/LoginPage';
import { InstructorCoursesPage } from '../../page-objects/courses';
import { CourseDetailPage } from '../../page-objects/courses/CourseDetailPage';
import { DashboardPage } from '../../page-objects/DashboardPage';
import { TEST_USERS, takeScreenshot } from '../../setupTests';
import { logPageState, trackNetworkActivity } from '../../utils/debugHelper';
import { 
  optimizePage, 
  clearMemory, 
  waitForRoleDashboard, 
  waitForDashboardWithAPI,
  limitDOMElements 
} from '../../utils/testStability';

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
    // Optimize page for testing
    await optimizePage(page);
    
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

    // Use basic role-specific dashboard waiting (no API waiting for now)
    console.log('Waiting for instructor dashboard...');
    const dashboardLoaded = await waitForRoleDashboard(page, 'instructor', 15000);
    expect(dashboardLoaded).toBeTruthy();

    await takeScreenshot(page, 'instructor-dashboard-after-login');
    
    // Limit DOM elements to prevent memory issues
    await limitDOMElements(page, '.course-card', 15);
  });
  
  test.afterEach(async ({ page }) => {
    await clearMemory(page);
  });

  test('instructor can view and search their courses', async ({ page }) => {
    const coursesPage = new InstructorCoursesPage(page);
    await coursesPage.navigateTo();
    await coursesPage.isCoursesPageLoaded();
    
    // Limit DOM elements after page load
    await limitDOMElements(page, '.course-card', 10);

    // Verify instructor-specific UI elements
    await expect(page.locator('[data-testid="create-course-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="course-status-filter"]')).toBeVisible();

    // Search through test courses (limit to first 2 to prevent memory issues)
    const testCourses = INSTRUCTOR_TEST_COURSES.slice(0, 2);
    for (const courseName of testCourses) {
      await coursesPage.searchForCourse(courseName);
      await page.waitForTimeout(500);

      const results = await coursesPage.getSearchResults();
      console.log(`Search results for "${courseName}":`, results);
      
      // Clear memory between searches
      await clearMemory(page);
    }
  });

  test('instructor can view draft and published courses', async ({ page }) => {
    const coursesPage = new InstructorCoursesPage(page);
    await coursesPage.navigateTo();
    await coursesPage.isCoursesPageLoaded();

    // Wait for any courses to appear
    await page.waitForSelector('[data-testid^="course-list-item-"], [data-testid^="course-card-"]', { 
      timeout: 15000,
      state: 'visible' 
    });

    // Check draft courses visibility
    await page.locator('[data-testid="course-status-filter"]').selectOption('draft');
    await page.waitForTimeout(1000);

    const draftResults = await coursesPage.getSearchResults();
    console.log('Draft courses:', draftResults);

    // Check published courses visibility
    await page.locator('[data-testid="course-status-filter"]').selectOption('published');
    await page.waitForTimeout(1000);

    const publishedResults = await coursesPage.getSearchResults();
    console.log('Published courses:', publishedResults);
    
    // Verify we have some courses
    expect(draftResults.length + publishedResults.length).toBeGreaterThan(0);
  });

  test('instructor can access course management features', async ({ page }) => {
    const coursesPage = new InstructorCoursesPage(page);
    await coursesPage.navigateTo();
    await coursesPage.isCoursesPageLoaded();

    // Verify instructor management UI elements
    await expect(page.locator('[data-testid="create-course-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="course-status-filter"]')).toBeVisible();
    await expect(page.locator('[data-testid="course-management-header"]')).toBeVisible();

    // Wait for any course elements to load
    await page.waitForSelector('[data-testid^="course-list-item-"], [data-testid^="course-card-"]', { 
      timeout: 15000,
      state: 'visible'
    });
    
    // Check if we have course list items or course cards
    const courseListItems = page.locator('[data-testid^="course-list-item-"]');
    const courseCards = page.locator('[data-testid^="course-card-"]');
    
    const listItemCount = await courseListItems.count();
    const cardCount = await courseCards.count();
    
    if (listItemCount > 0) {
      // For list items, check edit button with the course ID
      const firstItem = courseListItems.first();
      const courseId = (await firstItem.getAttribute('data-testid'))?.replace('course-list-item-', '');
      if (courseId) {
        const editButton = page.locator(`[data-testid="edit-course-${courseId}"]`);
        // Edit button should exist (may need to scroll or hover to see it)
        await expect(editButton).toBeAttached();
      }
    } else if (cardCount > 0) {
      // For course cards, check if action button exists
      const firstCard = courseCards.first();
      await firstCard.scrollIntoViewIfNeeded();
      await firstCard.hover();
      // Look for either action button or edit button
      const actionButton = firstCard.locator('[data-testid="course-action-btn"], [data-testid^="edit-course-"]').first();
      await expect(actionButton).toBeAttached();
    } else {
      // No courses found, verify the create course button is still available
      await expect(page.locator('[data-testid="create-course-button"]')).toBeVisible();
    }
  });

  test.afterEach(async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.logout();
    await takeScreenshot(page, 'post-logout-state');
  });
});
