import { test, expect } from '@playwright/test';
import {
  login,
  TEST_USERS,
  waitForGlobalLoadingToDisappear,
  takeScreenshot,
} from '../../setupTests';
import { LoginPage } from '../../page-objects/LoginPage';
import { InstructorCoursesPage } from '../../page-objects/courses/InstructorCoursesPage';
import { logTestAction } from '../../utils/debugHelper';
import {
  clearMemory,
  limitDOMElements,
  optimizePage,
  dismissModals,
} from '../../utils/testStability';

test.describe('Course Filtering', () => {
  let coursesPage: InstructorCoursesPage;

  test.beforeEach(async ({ page }) => {
    // Optimize page for testing
    await optimizePage(page);

    // Start with login
    const loginPage = new LoginPage(page);
    await loginPage.navigateTo();
    await loginPage.login(TEST_USERS.lead_instructor.username, TEST_USERS.lead_instructor.password);

    // Navigate to courses page
    coursesPage = new InstructorCoursesPage(page);
    await coursesPage.navigateTo();
    await coursesPage.isCoursesPageLoaded();

    // Limit DOM elements to prevent memory issues
    await limitDOMElements(page, '.course-card', 15);
    await limitDOMElements(page, '.MuiCard-root', 15);
  });

  test.afterEach(async ({ page }) => {
    // Clean up after each test
    await clearMemory(page);
    await dismissModals(page);
  });

  test('search filter correctly filters courses by title', async ({ page }) => {
    logTestAction('Testing course search filter');

    // Get initial course count
    const initialCourses = await coursesPage.getCoursesTitles();
    logTestAction(`Initial course count: ${initialCourses.length}`);

    // Search for a specific term that should match fewer courses
    await coursesPage.searchForCourse('Python');

    // Get filtered course results
    const searchResults = await coursesPage.getSearchResults();
    logTestAction(`Search results count: ${searchResults.length}`);

    // Verify results contain search term and are fewer than initial
    expect(searchResults.length).toBeLessThan(initialCourses.length);
    for (const title of searchResults) {
      expect(title.toLowerCase()).toContain('python');
    }
  });

  test('status filter correctly filters courses by status', async ({ page }) => {
    logTestAction('Testing status filter');

    // Get initial course count
    const initialCourses = await coursesPage.getCoursesTitles();
    logTestAction(`Initial course count: ${initialCourses.length}`);

    // Test draft filter
    logTestAction('Testing draft filter');
    await coursesPage.filterByStatus('draft');
    await limitDOMElements(page, '.course-card', 10); // Limit after filtering
    const draftCourses = await coursesPage.getSearchResults();
    logTestAction(`Draft courses count: ${draftCourses.length}`);
    await clearMemory(page); // Clear memory between filters

    // Test published filter
    logTestAction('Testing published filter');
    await coursesPage.filterByStatus('published');
    await limitDOMElements(page, '.course-card', 10); // Limit after filtering
    const publishedCourses = await coursesPage.getSearchResults();
    logTestAction(`Published courses count: ${publishedCourses.length}`);
    await clearMemory(page); // Clear memory between filters

    // Test archived filter
    logTestAction('Testing archived filter');
    await coursesPage.filterByStatus('archived');
    await limitDOMElements(page, '.course-card', 10); // Limit after filtering
    const archivedCourses = await coursesPage.getSearchResults();
    logTestAction(`Archived courses count: ${archivedCourses.length}`);
    await clearMemory(page); // Clear memory between filters

    // Reset filter to all
    logTestAction('Testing all courses filter');
    await coursesPage.filterByStatus('');
    await limitDOMElements(page, '.course-card', 10); // Limit after filtering
    const allCourses = await coursesPage.getSearchResults();
    logTestAction(`All courses count: ${allCourses.length}`);

    // Verify that course counts make sense - all courses should be >= any individual filter
    expect(allCourses.length).toBeGreaterThanOrEqual(draftCourses.length);
    expect(allCourses.length).toBeGreaterThanOrEqual(publishedCourses.length);
    expect(allCourses.length).toBeGreaterThanOrEqual(archivedCourses.length);

    // Verify that filtering actually reduced the count for each status
    expect(draftCourses.length).toBeLessThan(allCourses.length);
    expect(publishedCourses.length).toBeLessThan(allCourses.length);
    // Note: archived might be 0 or very few, so we don't test < allCourses
  });

  test('search and status filters work together', async ({ page }) => {
    logTestAction('Testing combined search and status filters');

    // Filter by published status
    await coursesPage.filterByStatus('published');
    const publishedCourses = await coursesPage.getSearchResults();

    // Search within published courses
    await coursesPage.searchForCourse('Python');
    const filteredResults = await coursesPage.getSearchResults();

    // Verify results are subset of published courses and match search
    expect(filteredResults.length).toBeLessThanOrEqual(publishedCourses.length);
    for (const title of filteredResults) {
      expect(title.toLowerCase()).toContain('python');
    }
  });

  test('filters persist when switching view modes', async ({ page }) => {
    logTestAction('Testing filter persistence across view modes');

    // Apply filters
    await coursesPage.filterByStatus('published');
    await coursesPage.searchForCourse('Python');

    // Get initial results
    const initialResults = await coursesPage.getSearchResults();

    // Switch view mode if available
    for (const selector of coursesPage.viewSwitchSelectors) {
      const viewSwitch = page.locator(selector);
      if (await viewSwitch.isVisible().catch(() => false)) {
        await viewSwitch.click();
        break;
      }
    }

    // Get results after view switch
    await waitForGlobalLoadingToDisappear(page);
    const newResults = await coursesPage.getSearchResults();

    // Verify filters persisted
    expect(newResults).toEqual(initialResults);

    // Verify status filter persisted
    const currentStatus = await coursesPage.getCurrentStatusFilter();
    expect(currentStatus).toBe('published');
  });
});
