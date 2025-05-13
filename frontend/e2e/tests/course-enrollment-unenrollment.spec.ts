import {test, expect} from '@playwright/test';
import {LoginPage} from '../page-objects/LoginPage';
import {StudentCoursesPage} from '../page-objects/CoursesPage';
import {CourseDetailPage} from '../page-objects/CourseDetailPage';
import {DashboardPage} from '../page-objects/DashboardPage';
import {TEST_USERS, takeScreenshot} from '../setupTests';
// Import debugging utilities
import {
    logPageState,
    debugElement,
    highlightAndScreenshot,
    saveDOMSnapshot,
    trackNetworkActivity,
    evaluateAndLog
} from '../utils/debugHelper';

// Test constants - prefer courses that might exist in the test database
const POSSIBLE_TEST_COURSES = [
    'Introduction to JavaScript',
    'Introduction to Python Programming',
    'Web Development with Django',
    'Playwright Test Course',
    'Advanced Machine Learning'
];
let testCourseId: string;
let testCourseTitle: string;

// Enable network activity tracking for API debugging
const enableApiDebugging = true;

test.describe('Student Course Enrollment and Unenrollment Flow', () => {
    // Set up network tracking for API calls at the top level
    test.beforeAll(async ({browser}) => {
        console.log('Setting up test suite for enrollment/unenrollment debugging');
    });

    test.afterAll(async () => {
        console.log('Completed enrollment/unenrollment test suite');
    });

    test.beforeEach(async ({page}) => {
        // Enable API debugging if requested
        if (enableApiDebugging) {
            trackNetworkActivity(page, {
                logRequests: true,
                logResponses: true,
                urlFilter: '/api/'
            });
            console.log('Network activity tracking enabled for API calls');
        }

        // Login as a student
        const loginPage = new LoginPage(page);
        await loginPage.navigateTo();

        // Take a screenshot of the login page for reference
        await takeScreenshot(page, 'login-page-before-auth');

        await loginPage.login(TEST_USERS.student.username, TEST_USERS.student.password);

        // Log page state after login
        await logPageState(page, 'Post-Login State');

        // Verify login success
        const dashboardPage = new DashboardPage(page);
        await expect(async () => {
            const isDashboardLoaded = await dashboardPage.isDashboardLoaded();
            expect(isDashboardLoaded).toBeTruthy();
        }).toPass({timeout: 10000});

        // Take a screenshot of the dashboard after successful login
        await takeScreenshot(page, 'dashboard-after-login');
    });

    // Helper function to find a suitable test course
    async function findTestCourse(page: Page): Promise<{title: string, id?: string}> {
        const coursesPage = new StudentCoursesPage(page);
        await coursesPage.navigateTo();
        await coursesPage.isCoursesPageLoaded();

        const courseTitles = await coursesPage.getCoursesTitles();
        expect(courseTitles.length).toBeGreaterThan(0);

        // Try finding a course from our predefined list first
        for (const possibleCourse of POSSIBLE_TEST_COURSES) {
            const matchingCourse = courseTitles.find(title =>
                title.includes(possibleCourse) || possibleCourse.includes(title)
            );
            if (matchingCourse) {
                console.log(`Found a suitable test course: "${matchingCourse}"`);
                return {title: matchingCourse};
            }
        }

        // Fall back to first available course
        console.log(`Using first available course: "${courseTitles[0]}"`);
        return {title: courseTitles[0]};
    }

    test('should navigate to courses page and see available courses', async ({page}) => {
        const coursesPage = new StudentCoursesPage(page);
        await coursesPage.navigateTo();
        const isCoursesPageLoaded = await coursesPage.isCoursesPageLoaded();
        expect(isCoursesPageLoaded).toBeTruthy();

        const courseCount = await coursesPage.getCourseCount();
        expect(courseCount).toBeGreaterThan(0);
    });

    test('should be able to view course details', async ({page}) => {
        // Find a test course
        const testCourse = await findTestCourse(page);
        expect(testCourse.title).toBeTruthy();

        // Find the view course button and click it
        const viewButton = page.locator(`[data-testid="view-course-button"]`).first();
        await viewButton.click();

        // Verify course detail page loaded
        const courseDetailPage = new CourseDetailPage(page);
        const isDetailPageLoaded = await courseDetailPage.isCourseDetailPageLoaded();
        expect(isDetailPageLoaded).toBeTruthy();

        // Verify course title matches what we clicked
        const displayedTitle = await courseDetailPage.getCourseTitle();
        expect(displayedTitle).toBe(testCourse.title);
    });

    test('should be able to enroll in a course', async ({page}) => {
        // Find a test course
        const testCourse = await findTestCourse(page);
        expect(testCourse.title).toBeTruthy();

        // Click on the course
        const coursesPage = new StudentCoursesPage(page);
        await coursesPage.clickCourse(testCourse.title);

        // Verify we're on the course detail page
        const courseDetailPage = new CourseDetailPage(page);
        await courseDetailPage.isCourseDetailPageLoaded();

        // If already enrolled, unenroll first
        const alreadyEnrolled = await courseDetailPage.isEnrolled();
        if (alreadyEnrolled) {
            await courseDetailPage.unenrollFromCourse();
            await page.reload();
            await courseDetailPage.isCourseDetailPageLoaded();
        }

        // Try to enroll in the course
        console.log('Attempting to enroll in the course...');
        const enrollResult = await courseDetailPage.enrollInCourse();
        expect(enrollResult).toBeTruthy();

        // Verify enrollment was successful
        const isEnrolled = await courseDetailPage.isEnrolled();
        expect(isEnrolled).toBeTruthy();

        // Verify enrollment status text
        const statusText = await courseDetailPage.getEnrollmentStatusText();
        console.log(`Enrollment status text: "${statusText}"`);
        expect(statusText.toLowerCase()).toContain('enrolled');
    });

    test('should be able to unenroll from a course via the unenroll button', async ({page}) => {
        // Find a test course
        const testCourse = await findTestCourse(page);
        expect(testCourse.title).toBeTruthy();

        // Click on the course
        const coursesPage = new StudentCoursesPage(page);
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

        // Now proceed with unenrollment
        const unenrollResult = await courseDetailPage.unenrollFromCourse();
        expect(unenrollResult).toBeTruthy();

        // Verify unenrollment was successful
        await page.reload();
        await courseDetailPage.isCourseDetailPageLoaded();
        const stillEnrolled = await courseDetailPage.isEnrolled();
        expect(stillEnrolled).toBeFalsy();
    });

    test('should be able to cancel unenrollment via the cancel button', async ({page}) => {
        // Find a test course
        const testCourse = await findTestCourse(page);
        expect(testCourse.title).toBeTruthy();

        // Click on the course
        const coursesPage = new StudentCoursesPage(page);
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
            viewTasksButtonVisible = await viewTasksButton.isVisible({timeout: 2000})
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

    // Update the 'e2e full flow' test with explicit waits
    test('e2e full flow: enroll, verify, unenroll, verify', async ({page}) => {
        // Find a test course
        const testCourse = await findTestCourse(page);
        expect(testCourse.title).toBeTruthy();

        // Click on the course
        const coursesPage = new StudentCoursesPage(page);
        await coursesPage.clickCourse(testCourse.title);

        const courseDetailPage = new CourseDetailPage(page);
        await courseDetailPage.isCourseDetailPageLoaded();

        // If initially enrolled, unenroll first to start from clean state
        const initiallyEnrolled = await courseDetailPage.isEnrolled();
        if (initiallyEnrolled) {
            await courseDetailPage.unenrollFromCourse();
            await page.reload();
            await courseDetailPage.isCourseDetailPageLoaded();
            const enrollmentCheck = await waitForUIUpdate(page, '[data-testid="enroll-button"]', true);
            expect(enrollmentCheck).toBeTruthy();
        }

        // Test enrollment
        await courseDetailPage.enrollInCourse();
        await page.reload();
        await courseDetailPage.isCourseDetailPageLoaded();
        const isEnrolled = await waitForUIUpdate(page, '[data-testid="unenroll-button"]', true);
        expect(isEnrolled).toBeTruthy();

        // Test unenrollment
        await courseDetailPage.unenrollFromCourse();
        await page.reload();
        await courseDetailPage.isCourseDetailPageLoaded();
        const stillEnrolled = await waitForUIUpdate(page, '[data-testid="enroll-button"]', true);
        expect(stillEnrolled).toBeTruthy();

        // Verify final state on courses page
        await coursesPage.navigateTo();
        await coursesPage.isCoursesPageLoaded();
        const enrolledStatus = await coursesPage.isEnrolledIn(testCourse.title);
        expect(enrolledStatus).toBeFalsy();
    });
});
