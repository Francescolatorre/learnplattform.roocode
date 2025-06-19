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

test.describe('Course Filtering', () => {
  let coursesPage: InstructorCoursesPage;

  test.beforeEach(async ({ page }) => {
    // Start with login
    const loginPage = new LoginPage(page);
    await loginPage.navigateTo();
    await loginPage.login(TEST_USERS.lead_instructor.username, TEST_USERS.lead_instructor.password);

    // Navigate to courses page
    coursesPage = new InstructorCoursesPage(page);
    await coursesPage.navigateTo();
    await coursesPage.isCoursesPageLoaded();
  });

  test('search filter correctly filters courses by title', async ({ page }) => {
    logTestAction('Testing course search filter');

    // Get initial course count
    const initialCourses = await coursesPage.getCoursesTitles();
    logTestAction(`Initial course count: ${initialCourses.length}`);

    // Search for a specific term that should match some courses
    await coursesPage.searchForCourse('Test');

    // Get filtered course results
    const searchResults = await coursesPage.getSearchResults();
    logTestAction(`Search results count: ${searchResults.length}`);

    // Verify results contain search term
    for (const title of searchResults) {
      expect(title.toLowerCase()).toContain('test');
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
    const draftCourses = await coursesPage.getSearchResults();
    logTestAction(`Draft courses count: ${draftCourses.length}`);

    // Test published filter
    logTestAction('Testing published filter');
    await coursesPage.filterByStatus('published');
    const publishedCourses = await coursesPage.getSearchResults();
    logTestAction(`Published courses count: ${publishedCourses.length}`);

    // Test archived filter
    logTestAction('Testing archived filter');
    await coursesPage.filterByStatus('archived');
    const archivedCourses = await coursesPage.getSearchResults();
    logTestAction(`Archived courses count: ${archivedCourses.length}`);

    // Reset filter to all
    logTestAction('Testing all courses filter');
    await coursesPage.filterByStatus('');
    const allCourses = await coursesPage.getSearchResults();
    logTestAction(`All courses count: ${allCourses.length}`);

    // Verify that course counts make sense
    expect(allCourses.length).toBeGreaterThanOrEqual(
      draftCourses.length + publishedCourses.length + archivedCourses.length
    );
  });

  test('search and status filters work together', async ({ page }) => {
    logTestAction('Testing combined search and status filters');

    // Filter by published status
    await coursesPage.filterByStatus('published');
    const publishedCourses = await coursesPage.getSearchResults();

    // Search within published courses
    await coursesPage.searchForCourse('Test');
    const filteredResults = await coursesPage.getSearchResults();

    // Verify results are subset of published courses and match search
    expect(filteredResults.length).toBeLessThanOrEqual(publishedCourses.length);
    for (const title of filteredResults) {
      expect(title.toLowerCase()).toContain('test');
    }
  });

  test('filters persist when switching view modes', async ({ page }) => {
    logTestAction('Testing filter persistence across view modes');

    // Apply filters
    await coursesPage.filterByStatus('published');
    await coursesPage.searchForCourse('Test');

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
