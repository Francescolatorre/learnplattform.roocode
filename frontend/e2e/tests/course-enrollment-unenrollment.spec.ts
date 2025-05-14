import {test, expect, Page} from '@playwright/test';
import {LoginPage} from '../page-objects/LoginPage';
import {StudentCoursesPage} from '../page-objects/CoursesPage';
import {CourseDetailPage} from '../page-objects/CourseDetailPage';
import {DashboardPage} from '../page-objects/DashboardPage';
import {TEST_USERS, takeScreenshot} from '../setupTests';
import {
    logPageState,
    debugElement,
    highlightAndScreenshot,
    saveDOMSnapshot,
    trackNetworkActivity,
    evaluateAndLog
} from '../utils/debugHelper';

// Test constants - ordered by preference
const POSSIBLE_TEST_COURSES = [
    'Web Development with Django',
    'Python Programming',
    'Machine Learning',
    'Project Management Fundamentals'
];
let testCourseId: string;
let testCourseTitle: string;

// Enable network activity tracking for API debugging
const enableApiDebugging = true;

test.describe('Student Course Enrollment and Unenrollment Flow', () => {
    // Helper function to find a suitable test course using search
    async function findTestCourseWithSearch(page: Page): Promise<{title: string, id?: string}> {
        console.log('Starting course search process...');
        const coursesPage = new StudentCoursesPage(page);
        await coursesPage.navigateTo();

        // Wait for courses page with retry
        await expect(async () => {
            const isLoaded = await coursesPage.isCoursesPageLoaded();
            expect(isLoaded).toBe(true);
        }).toPass({timeout: 15000});

        // Try each course name with search to find an exact match
        for (const courseName of POSSIBLE_TEST_COURSES) {
            console.log(`\nAttempting to find course: "${courseName}"`);
            await coursesPage.searchForCourse(courseName);

            // Wait for and validate search results
            let searchResults: string[] = [];
            await expect(async () => {
                const results = await coursesPage.getSearchResults();
                console.log('Got search results:', results);
                expect(Array.isArray(results) && results.length > 0).toBeTruthy();
                searchResults = results;
                return true;
            }).toPass({timeout: 10000});

            //console.log(`Search results after validation:`, searchResults);

            // Look for exact match first
            const exactMatch = searchResults.find(title => title === courseName);
            if (exactMatch) {
                console.log(`Found exact match: "${exactMatch}"`);
                return {title: exactMatch};
            }

            // Look for partial match with more detailed logging
            const partialMatch = searchResults.find(title => {
                const isPartialMatch = title.includes(courseName) || courseName.includes(title);
                if (isPartialMatch) {
                    console.log(`Found partial match: "${title}" for search term "${courseName}"`);
                }
                return isPartialMatch;
            });

            if (partialMatch) {
                return {title: partialMatch};
            }
        }

        // If no matches found, use first available course with verification
        console.log('No matches found, falling back to first available course...');
        let allCourses: string[] = [];
        await expect(async () => {
            const courses = await coursesPage.getCoursesTitles();
            console.log('Available courses:', courses);
            expect(Array.isArray(courses) && courses.length > 0).toBeTruthy();
            allCourses = courses;
            return true;
        }).toPass({timeout: 10000});

        console.log(`Using fallback course: "${allCourses[0]}"`);
        return {title: allCourses[0]};
    }

    test.beforeEach(async ({page}) => {
        // Enable API debugging if requested
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

    test('should navigate to courses page and use search functionality', async ({page}) => {
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

    test('should be able to find and view course details using search', async ({page}) => {
        console.log('Starting course details test...');

        // Find a test course using search with validation
        const testCourse = await findTestCourseWithSearch(page);
        expect(testCourse.title, 'Test course title should be defined').toBeTruthy();
        console.log(`Test course selected: ${testCourse.title}`);

        // Ensure we can find it consistently with search
        const coursesPage = new StudentCoursesPage(page);
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

        console.log('Search results validated successfully');        // Click the course item/card
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
    test('should be able to enroll in a course', async ({page}) => {
        console.log('Starting course enrollment test...');

        // Find a test course with validation
        const testCourse = await findTestCourseWithSearch(page);
        expect(testCourse.title, 'Test course title should be defined').toBeTruthy();
        console.log(`Selected test course: ${testCourse.title}`);

        // Click on the course with retry
        const coursesPage = new StudentCoursesPage(page);
        await expect(async () => {
            await coursesPage.clickCourse(testCourse.title);
            console.log('Clicked on course');
        }).toPass({timeout: 10000});

        // Verify we're on the course detail page with improved validation
        const courseDetailPage = new CourseDetailPage(page);
        await expect(async () => {
            const isLoaded = await courseDetailPage.isCourseDetailPageLoaded();
            expect(isLoaded, 'Course detail page should load').toBeTruthy();
        }).toPass({timeout: 10000});

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
            }).toPass({timeout: 15000});

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
        }).toPass({timeout: 15000});

        // Verify enrollment status text with screenshot
        await takeScreenshot(page, 'after-enrollment-success');
        const statusText = await courseDetailPage.getEnrollmentStatusText();
        console.log(`Final enrollment status text: "${statusText}"`);
        expect(statusText.toLowerCase(), 'Status text should indicate enrollment').toContain('enrolled');

        console.log('Enrollment test completed successfully');
    });

    test('should be able to unenroll from a course via the unenroll button', async ({page}) => {
        console.log('Starting course unenrollment test...');

        // Find a test course with validation
        const testCourse = await findTestCourseWithSearch(page);
        expect(testCourse.title, 'Test course title should be defined').toBeTruthy();
        console.log(`Selected test course: ${testCourse.title}`);

        // Click on the course with retry
        const coursesPage = new StudentCoursesPage(page);
        await expect(async () => {
            await coursesPage.clickCourse(testCourse.title);
            console.log('Clicked on course');
        }).toPass({timeout: 10000});

        // Verify we're on the course detail page with validation
        const courseDetailPage = new CourseDetailPage(page);
        await expect(async () => {
            const isLoaded = await courseDetailPage.isCourseDetailPageLoaded();
            expect(isLoaded, 'Course detail page should load').toBeTruthy();
        }).toPass({timeout: 10000});

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
            }).toPass({timeout: 15000});

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
            expect(statusText.toLowerCase(), 'Status should not indicate enrollment')
                .not.toContain('enrolled');
        }).toPass({timeout: 15000});

        await takeScreenshot(page, 'after-unenrollment-success');
        console.log('Unenrollment test completed successfully');
    });

    test('should be able to cancel unenrollment via the cancel button', async ({page}) => {
        // Find a test course
        const testCourse = await findTestCourseWithSearch(page);
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
        const testCourse = await findTestCourseWithSearch(page);
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

    test('e2e enrollment flow with search', async ({page}) => {
        // Find a test course using search
        const testCourse = await findTestCourseWithSearch(page);
        expect(testCourse.title).toBeTruthy();

        // Search for the specific course
        const coursesPage = new StudentCoursesPage(page);
        await coursesPage.searchForCourse(testCourse.title);
        const searchResults = await coursesPage.getSearchResults();
        expect(searchResults).toContain(testCourse.title);

        // Click on the course
        await coursesPage.clickCourse(testCourse.title);

        // Verify course detail page
        const courseDetailPage = new CourseDetailPage(page);
        await courseDetailPage.isCourseDetailPageLoaded();
        const displayedTitle = await courseDetailPage.getCourseTitle();
        expect(displayedTitle).toBe(testCourse.title);

        // If initially enrolled, unenroll first
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

        // Verify final state
        await coursesPage.navigateTo();
        await coursesPage.isCoursesPageLoaded();
        await coursesPage.searchForCourse(testCourse.title);
        const enrolledStatus = await coursesPage.isEnrolledIn(testCourse.title);
        expect(enrolledStatus).toBeFalsy();
    });
});
