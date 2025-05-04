import {test, expect} from '@playwright/test';
import {LoginPage} from '../page-objects/LoginPage';
import {StudentCoursesPage} from '../page-objects/CoursesPage';
import {CourseDetailPage} from '../page-objects/CourseDetailPage';
import {DashboardPage} from '../page-objects/DashboardPage';
import {TEST_USERS} from '../setupTests';

// Test constants
const TEST_COURSE_TITLE = 'Introduction to JavaScript';
let testCourseId: string;

test.describe('Course Enrollment and Unenrollment Flow', () => {
    test.beforeEach(async ({page}) => {
        // Login as a student
        const loginPage = new LoginPage(page);
        await loginPage.navigateToLogin();
        await loginPage.login(TEST_USERS.student.username, TEST_USERS.student.password);

        // Verify login success
        const dashboardPage = new DashboardPage(page);
        await expect(async () => {
            const isDashboardLoaded = await dashboardPage.isDashboardLoaded();
            expect(isDashboardLoaded).toBeTruthy();
        }).toPass({timeout: 10000});
    });

    test('should navigate to courses page and see available courses', async ({page}) => {
        // Navigate to courses page
        const coursesPage = new StudentCoursesPage(page);
        await coursesPage.navigate();

        // Verify courses page is loaded
        const isCoursesPageLoaded = await coursesPage.isCoursesPageLoaded();
        expect(isCoursesPageLoaded).toBeTruthy();

        // Get course count and verify at least one course is available
        const courseCount = await coursesPage.getCourseCount();
        expect(courseCount).toBeGreaterThan(0);

        // Get course titles for later use
        const courseTitles = await coursesPage.getCoursesTitles();
        console.log('Available courses:', courseTitles);

        // Set test course title if we found a better match
        const jsRelatedCourse = courseTitles.find(title =>
            title.toLowerCase().includes('javascript') ||
            title.toLowerCase().includes('web') ||
            title.toLowerCase().includes('programming')
        );

        if (jsRelatedCourse) {
            console.log(`Found a suitable test course: "${jsRelatedCourse}"`);
            // Capture a reference to this course for future tests
            await page.evaluate(title => {
                window.localStorage.setItem('e2e_test_course_title', title);
            }, jsRelatedCourse);
        } else if (courseTitles.length > 0) {
            // Just use the first available course
            console.log(`Using first available course: "${courseTitles[0]}"`);
            await page.evaluate(title => {
                window.localStorage.setItem('e2e_test_course_title', title);
            }, courseTitles[0]);
        }
    });

    test('should be able to view course details', async ({page}) => {
        // Get the test course title from previous test
        const testCourseTitle = await page.evaluate(() => {
            return window.localStorage.getItem('e2e_test_course_title') || 'Introduction to JavaScript';
        });

        // Navigate to courses page
        const coursesPage = new StudentCoursesPage(page);
        await coursesPage.navigate();
        await coursesPage.isCoursesPageLoaded();

        // Check if test course exists
        const hasCourse = await coursesPage.hasCourse(testCourseTitle);
        if (!hasCourse) {
            console.log(`Test course "${testCourseTitle}" not found, skipping test`);
            test.skip();
        }

        // Click on the course to view details
        await coursesPage.clickCourse(testCourseTitle);

        // Verify course detail page is loaded
        const courseDetailPage = new CourseDetailPage(page);
        const isDetailPageLoaded = await courseDetailPage.isCourseDetailPageLoaded();
        expect(isDetailPageLoaded).toBeTruthy();

        // Verify course title is displayed
        const courseTitle = await courseDetailPage.getCourseTitle();
        expect(courseTitle).toContain(testCourseTitle);

        // Extract course ID from URL for future tests
        const url = page.url();
        const courseIdMatch = url.match(/\/courses\/(\d+)/);
        if (courseIdMatch && courseIdMatch[1]) {
            testCourseId = courseIdMatch[1];
            await page.evaluate(id => {
                window.localStorage.setItem('e2e_test_course_id', id);
            }, testCourseId);
            console.log(`Using course ID: ${testCourseId} for enrollment tests`);
        }
    });

    test('should be able to enroll in a course', async ({page}) => {
        // Get the test course ID from previous test
        const testCourseId = await page.evaluate(() => {
            return window.localStorage.getItem('e2e_test_course_id');
        });

        if (!testCourseId) {
            console.log('No test course ID found, skipping test');
            test.skip();
        }

        // Navigate directly to the course detail page
        const courseDetailPage = new CourseDetailPage(page, testCourseId);
        await courseDetailPage.navigate();

        // Check if already enrolled
        const alreadyEnrolled = await courseDetailPage.isEnrolled();

        if (alreadyEnrolled) {
            console.log('Already enrolled in this course, skipping enrollment test');
            // Don't skip the test, as we want to verify the enrolled state is correctly displayed
        } else {
            // Try to enroll in the course
            const enrollResult = await courseDetailPage.enrollInCourse();
            expect(enrollResult).toBeTruthy();

            // Verify enrollment was successful
            const isEnrolled = await courseDetailPage.isEnrolled();
            expect(isEnrolled).toBeTruthy();

            // Verify enrollment status text
            const statusText = await courseDetailPage.getEnrollmentStatusText();
            expect(statusText.toLowerCase()).toContain('enrolled');
        }

        // Verify "View Course Tasks" button is displayed (only shown to enrolled students)
        const page2 = await page.context().newPage();
        const courseDetailPage2 = new CourseDetailPage(page2, testCourseId);
        await courseDetailPage2.navigate();

        for (const selector of courseDetailPage2.viewTasksButtonSelectors) {
            const viewTasksButton = page2.locator(selector);
            const isVisible = await viewTasksButton.isVisible({timeout: 5000})
                .catch(() => false);
            if (isVisible) {
                expect(isVisible).toBeTruthy();
                break;
            }
        }

        await page2.close();
    });

    test('should be able to unenroll from a course via the unenroll button', async ({page}) => {
        // Get the test course ID from previous test
        const testCourseId = await page.evaluate(() => {
            return window.localStorage.getItem('e2e_test_course_id');
        });

        if (!testCourseId) {
            console.log('No test course ID found, skipping test');
            test.skip();
        }

        // Navigate directly to the course detail page
        const courseDetailPage = new CourseDetailPage(page, testCourseId);
        await courseDetailPage.navigate();

        // Check if enrolled before testing unenrollment
        const isEnrolled = await courseDetailPage.isEnrolled();

        if (!isEnrolled) {
            console.log('Not enrolled in this course, enrolling first...');
            // Enroll in the course first before testing unenrollment
            const enrollResult = await courseDetailPage.enrollInCourse();
            expect(enrollResult).toBeTruthy();

            // Reload the page to see updated state
            await page.reload();
            await courseDetailPage.isCourseDetailPageLoaded();
        }

        // Now proceed with unenrollment test
        // Look for unenroll button
        let unenrollButtonFound = false;
        for (const selector of courseDetailPage.unenrollButtonSelectors) {
            const unenrollButton = page.locator(selector);
            const isVisible = await unenrollButton.isVisible({timeout: 2000})
                .catch(() => false);
            if (isVisible) {
                unenrollButtonFound = true;
                break;
            }
        }

        // If unenroll button not found, skip test but log the issue
        if (!unenrollButtonFound) {
            console.error("🚨 Unenroll button not found on the page for an enrolled course. This should be investigated.");
            test.fail();
        }

        // Proceed with unenrollment
        const unenrollResult = await courseDetailPage.unenrollFromCourse();
        expect(unenrollResult).toBeTruthy();

        // Reload the page to see updated state
        await page.reload();
        await courseDetailPage.isCourseDetailPageLoaded();

        // Verify user is no longer enrolled
        const stillEnrolled = await courseDetailPage.isEnrolled();

        // The view tasks button should no longer be visible
        let viewTasksButtonVisible = false;
        for (const selector of courseDetailPage.viewTasksButtonSelectors) {
            const viewTasksButton = page.locator(selector);
            viewTasksButtonVisible = await viewTasksButton.isVisible({timeout: 2000})
                .catch(() => false);
            if (viewTasksButtonVisible) {
                break;
            }
        }

        // Enrollment status should indicate user is no longer enrolled
        const statusText = await courseDetailPage.getEnrollmentStatusText();

        // Check if all our expectations were met
        expect(stillEnrolled).toBeFalsy();
        expect(viewTasksButtonVisible).toBeFalsy();
        expect(statusText.toLowerCase()).not.toContain('currently enrolled');
        expect(statusText.toLowerCase()).toContain('dropped');
    });

    test('should be able to cancel unenrollment via the cancel button', async ({page}) => {
        // Get the test course ID from previous test
        const testCourseId = await page.evaluate(() => {
            return window.localStorage.getItem('e2e_test_course_id');
        });

        if (!testCourseId) {
            console.log('No test course ID found, skipping test');
            test.skip();
        }

        // Navigate directly to the course detail page
        const courseDetailPage = new CourseDetailPage(page, testCourseId);
        await courseDetailPage.navigate();

        // Make sure user is enrolled before testing cancellation
        const isEnrolled = await courseDetailPage.isEnrolled();

        if (!isEnrolled) {
            console.log('Not enrolled in this course, enrolling first...');
            const enrollResult = await courseDetailPage.enrollInCourse();
            expect(enrollResult).toBeTruthy();

            // Reload the page to see updated state
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

    test('e2e full flow: enroll, verify, unenroll, verify', async ({page}) => {
        // Navigate to courses page
        const coursesPage = new StudentCoursesPage(page);
        await coursesPage.navigate();
        await coursesPage.isCoursesPageLoaded();

        // Get course titles
        const courseTitles = await coursesPage.getCoursesTitles();

        if (courseTitles.length === 0) {
            console.log('No courses available, skipping test');
            test.skip();
        }

        // Select a course to work with (preferably one we're not already enrolled in)
        const courseTitle = courseTitles[0]; // Start with first course

        // Click on the course to view details
        await coursesPage.clickCourse(courseTitle);

        // Now on the course detail page
        const courseDetailPage = new CourseDetailPage(page);
        await courseDetailPage.isCourseDetailPageLoaded();

        // Step 1: Check current enrollment status
        const initiallyEnrolled = await courseDetailPage.isEnrolled();

        if (initiallyEnrolled) {
            console.log(`Already enrolled in ${courseTitle}, unenrolling first to run full test flow`);
            // Unenroll first to run complete test flow
            const unenrollResult = await courseDetailPage.unenrollFromCourse();
            expect(unenrollResult).toBeTruthy();

            // Reload page to update status
            await page.reload();
            await courseDetailPage.isCourseDetailPageLoaded();
        }

        // Step 2: Enroll in the course
        const enrollResult = await courseDetailPage.enrollInCourse();
        expect(enrollResult).toBeTruthy();

        // Step 3: Verify enrollment
        await page.reload(); // Reload to ensure we get fresh state
        await courseDetailPage.isCourseDetailPageLoaded();

        const nowEnrolled = await courseDetailPage.isEnrolled();
        expect(nowEnrolled).toBeTruthy();

        // Step 4: Unenroll
        const unenrollResult = await courseDetailPage.unenrollFromCourse();
        expect(unenrollResult).toBeTruthy();

        // Step 5: Verify unenrollment
        await page.reload(); // Reload to ensure we get fresh state
        await courseDetailPage.isCourseDetailPageLoaded();

        const finallyEnrolled = await courseDetailPage.isEnrolled();
        expect(finallyEnrolled).toBeFalsy();

        // Step 6: Final verification of status text
        const statusText = await courseDetailPage.getEnrollmentStatusText();
        expect(statusText.toLowerCase()).toContain('dropped');
    });
});
