import {test, expect} from '@playwright/test';
import {LoginPage} from '../../page-objects/LoginPage';
import {StudentCoursesPage} from '../../page-objects/courses';
import {CourseDetailPage} from '../../page-objects/courses/CourseDetailPage';
import {DashboardPage} from '../../page-objects/DashboardPage';
import {TEST_USERS, takeScreenshot} from '../../setupTests';
import {
    logPageState,
    trackNetworkActivity
} from '../../utils/debugHelper';

// Test constants - ordered by preference
const POSSIBLE_TEST_COURSES = [
    'Web Development with Django',
    'Python Programming',
    'Machine Learning',
    'Project Management Fundamentals'
];

// Enable network activity tracking for API debugging
const enableApiDebugging = true;

test.describe('Student Course List and Search', () => {
    test.beforeEach(async ({page}) => {
        if (enableApiDebugging) {
            trackNetworkActivity(page, {
                logRequests: true,
                logResponses: true,
                urlFilter: '/api/'
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
        }).toPass({timeout: 10000});

        await takeScreenshot(page, 'dashboard-after-login');
    });

    test('student can navigate to courses page and use search', async ({page}) => {
        const coursesPage = new StudentCoursesPage(page);
        await coursesPage.navigateTo();
        await coursesPage.isCoursesPageLoaded();

        // Try searching for each possible test course
        for (const courseName of POSSIBLE_TEST_COURSES) {
            await coursesPage.searchForCourse(courseName);
            await page.waitForTimeout(500); // Wait for search results

            const results = await coursesPage.getSearchResults();
            console.log(`Search results for "${courseName}":`, results);
        }
    });

    test('student can find and view course details using search', async ({page}) => {
        console.log('Starting course details test...');

        // Find a test course using search with validation
        const coursesPage = new StudentCoursesPage(page);
        const testCourse = await coursesPage.findTestCourseWithSearch(POSSIBLE_TEST_COURSES);
        expect(testCourse.title, 'Test course title should be defined').toBeTruthy();
        console.log(`Test course selected: ${testCourse.title}`);

        // Ensure we can find it consistently with search
        console.log(`Searching for course: ${testCourse.title}`);
        await coursesPage.searchForCourse(testCourse.title);

        // Wait for search results with retry and logging
        const searchResults = await expect(async () => {
            console.log('Checking search results...');
            const results = await coursesPage.getSearchResults();
            console.log(`Found ${results.length} results:`, results);
            expect(results).toContain(testCourse.title);
            return results;
        }).toPass({timeout: 10000});

        console.log('Search results validated successfully');

        // Click the course item/card
        await coursesPage.clickCourse(testCourse.title);
        console.log('Clicked course item');

        // Verify course detail page with improved error messaging
        const courseDetailPage = new CourseDetailPage(page);
        await expect(async () => {
            const isLoaded = await courseDetailPage.isCourseDetailPageLoaded();
            expect(isLoaded, 'Course detail page should load').toBeTruthy();
        }).toPass({timeout: 10000});

        // Take a screenshot of the detail page
        await takeScreenshot(page, 'course-detail-page-loaded');

        // Verify course title matches with detailed error on failure
        const displayedTitle = await courseDetailPage.getCourseTitle();
        expect(displayedTitle, `Course title should match. Expected: ${testCourse.title}, Got: ${displayedTitle}`).toBe(testCourse.title);
        console.log('Course details verified successfully');
    });

    test.afterEach(async ({page}) => {
        // Logout after each test
        const dashboardPage = new DashboardPage(page);
        await dashboardPage.logout();
        await takeScreenshot(page, 'post-logout-state');
    });
});
