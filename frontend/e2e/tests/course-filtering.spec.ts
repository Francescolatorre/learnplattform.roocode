import {test, expect} from '@playwright/test';
import {TEST_USERS, takeScreenshot} from '../setupTests';
import {LoginPage} from '../page-objects/LoginPage';
import {InstructorDashboardPage} from '../page-objects/DashboardPage';
import {InstructorCoursesPage} from '../page-objects/courses';

test.describe('Course Filtering Functionality', () => {
    test.beforeEach(async ({page}) => {
        // Login as instructor for each test
        const loginPage = new LoginPage(page);
        await loginPage.navigateTo();
        await loginPage.login(TEST_USERS.lead_instructor.username, TEST_USERS.lead_instructor.password);

        // Navigate to courses page
        const dashboard = new InstructorDashboardPage(page);
        await dashboard.waitForPageLoad();
        await dashboard.navigateToInstructorCourses();
    });

    test('status filter should work for all states', async ({page}) => {
        const coursesPage = new InstructorCoursesPage(page);
        await coursesPage.waitForPageLoad();
        await takeScreenshot(page, 'before-status-filter');

        // Test each status
        const statuses: Array<'' | 'draft' | 'published' | 'archived'> = ['', 'draft', 'published', 'archived'];

        for (const status of statuses) {
            console.log(`Testing status filter: ${status || 'All'}`);

            // Apply filter
            await coursesPage.filterByStatus(status);
            await takeScreenshot(page, `status-filter-${status || 'all'}`);

            // Get current filter value
            const currentFilter = await coursesPage.getCurrentStatusFilter();
            expect(currentFilter).toBe(status);

            // For non-empty status, verify all visible courses have correct status
            if (status !== '') {
                const courses = await coursesPage.getCoursesTitles();
                console.log(`Found ${courses.length} courses with status ${status}`);

                // Verify that all visible courses have the correct status
                const statusesMatch = await coursesPage.verifyVisibleCourseStatuses(status);
                expect(statusesMatch, `Some courses don't match the selected status: ${status}`).toBe(true);
            }
        }
    });

    test('search filter should work with status filter', async ({page}) => {
        const coursesPage = new InstructorCoursesPage(page);
        await coursesPage.waitForPageLoad();

        // First filter by published status
        await coursesPage.filterByStatus('published');
        await takeScreenshot(page, 'published-courses');

        // Verify courses have published status
        const statusesMatch = await coursesPage.verifyVisibleCourseStatuses('published');
        expect(statusesMatch, `Some courses don't have published status`).toBe(true);

        // Search within published courses
        const searchTerm = 'Test';
        await coursesPage.searchForCourse(searchTerm);
        await takeScreenshot(page, 'search-in-published');

        // Get search results
        const searchResults = await coursesPage.getSearchResults();
        console.log(`Found ${searchResults.length} results for "${searchTerm}" in published courses`);

        // Verify each result contains search term and has published status
        for (const result of searchResults) {
            expect(result.toLowerCase()).toContain(searchTerm.toLowerCase());
        }
        const searchedStatusesMatch = await coursesPage.verifyVisibleCourseStatuses('published');
        expect(searchedStatusesMatch, `Search results contain non-published courses`).toBe(true);
    });

    test('filter persistence across page navigation', async ({page}) => {
        const coursesPage = new InstructorCoursesPage(page);
        await coursesPage.waitForPageLoad();

        // Apply filters
        await coursesPage.filterByStatus('published');
        await coursesPage.searchForCourse('Test');

        // Navigate to a course and back
        const results = await coursesPage.getSearchResults();
        if (results.length > 0) {
            await coursesPage.clickCourse(results[0]);
            await page.goBack();
            await coursesPage.waitForPageLoad();

            // Verify filters are still applied
            const currentFilter = await coursesPage.getCurrentStatusFilter();
            expect(currentFilter).toBe('published');

            const newResults = await coursesPage.getSearchResults();
            expect(newResults).toEqual(results);
        }
    });
});
