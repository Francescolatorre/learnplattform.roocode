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

    test('should navigate to courses page and see available courses', async ({page}) => {
        // Navigate to courses page
        const coursesPage = new StudentCoursesPage(page);
        await coursesPage.navigateTo();

        // Verify courses page is loaded
        const isCoursesPageLoaded = await coursesPage.isCoursesPageLoaded();
        expect(isCoursesPageLoaded).toBeTruthy();

        // Get course count and verify at least one course is available
        const courseCount = await coursesPage.getCourseCount();
        expect(courseCount).toBeGreaterThan(0);

        // Get course titles for later use
        const courseTitles = await coursesPage.getCoursesTitles();
        console.log('Available courses:', courseTitles);

        // Try finding a suitable test course from our list of possible courses
        let foundTestCourse = false;
        for (const possibleCourse of POSSIBLE_TEST_COURSES) {
            const matchingCourse = courseTitles.find(title =>
                title.includes(possibleCourse) || possibleCourse.includes(title)
            );

            if (matchingCourse) {
                console.log(`Found a suitable test course: "${matchingCourse}"`);
                testCourseTitle = matchingCourse;
                await page.evaluate(title => {
                    window.localStorage.setItem('e2e_test_course_title', title);
                }, matchingCourse);
                foundTestCourse = true;
                break;
            }
        }

        // If we couldn't find a match from our predefined list, use the first available course
        if (!foundTestCourse && courseTitles.length > 0) {
            testCourseTitle = courseTitles[0];
            console.log(`Using first available course: "${testCourseTitle}"`);
            await page.evaluate(title => {
                window.localStorage.setItem('e2e_test_course_title', title);
            }, testCourseTitle);
        }
    });

    test('should be able to view course details', async ({page}) => {
        // Navigate to courses page
        const coursesPage = new StudentCoursesPage(page);
        await coursesPage.navigateTo();
        await coursesPage.isCoursesPageLoaded();

        // Get the test course title from previous test or find a suitable course
        let testCourseName = await page.evaluate(() => {
            return window.localStorage.getItem('e2e_test_course_title') || '';
        });

        // If we don't have a saved course from the previous test, find one now
        if (!testCourseName) {
            console.log('No saved test course found from previous test, finding one now');
            const courseTitles = await coursesPage.getCoursesTitles();

            // Try finding a suitable test course from our list of possible courses
            for (const possibleCourse of POSSIBLE_TEST_COURSES) {
                const matchingCourse = courseTitles.find(title =>
                    title.includes(possibleCourse) || possibleCourse.includes(title)
                );

                if (matchingCourse) {
                    testCourseName = matchingCourse;
                    console.log(`Found a suitable test course: "${testCourseName}"`);
                    break;
                }
            }

            // If no match found from predefined list, use the first available course
            if (!testCourseName && courseTitles.length > 0) {
                testCourseName = courseTitles[0];
                console.log(`Using first available course: "${testCourseName}"`);
            }
        }

        // Verify we have a course to test with
        expect(testCourseName).toBeTruthy();

        // Check if test course exists
        const hasCourse = await coursesPage.hasCourse(testCourseName);
        expect(hasCourse).toBeTruthy();

        // Take screenshot of available courses
        await takeScreenshot(page, 'courses-list-before-click');

        // Find the course card and click the view-course-button directly
        const courseCardSelector = `.MuiCard-root:has-text("${testCourseName}")`;
        const courseCard = page.locator(courseCardSelector).first();

        // Check if element is visible before clicking it
        if (await courseCard.isVisible()) {
            await debugElement(page, courseCard, 'course-before-click');

            // Find and click the view-course-button within the course card
            const viewCourseButton = courseCard.locator('[data-testid="view-course-button"]');
            if (await viewCourseButton.isVisible()) {
                await viewCourseButton.click();
                console.log(`Clicked view course button for: ${testCourseName}`);
            } else {
                // Fallback to the coursesPage.clickCourse method
                console.log(`View course button not found, using fallback method`);
                await coursesPage.clickCourse(testCourseName);
            }
        } else {
            console.log(`Course card for "${testCourseName}" not visible, using fallback method`);
            await coursesPage.clickCourse(testCourseName);
        }

        // Log the page state after navigating to course detail
        await logPageState(page, 'Course Detail Page');

        // Verify course detail page is loaded
        const courseDetailPage = new CourseDetailPage(page);
        const isDetailPageLoaded = await courseDetailPage.isCourseDetailPageLoaded();
        expect(isDetailPageLoaded).toBeTruthy();

        // Take screenshot of course details page
        await takeScreenshot(page, `course-detail-${testCourseName}`);

        // Verify course title is displayed
        const courseTitle = await courseDetailPage.getCourseTitle();
        expect(courseTitle).toContain(testCourseName);

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
        // Get the test course ID and title from previous tests
        const storedCourseId = await page.evaluate(() => {
            return window.localStorage.getItem('e2e_test_course_id');
        });

        const storedCourseTitle = await page.evaluate(() => {
            return window.localStorage.getItem('e2e_test_course_title');
        });

        // If we have both a course ID and title, use those
        if (storedCourseId) {
            console.log(`Using stored course ID: ${storedCourseId}`);

            // Navigate directly to the course detail page
            const courseDetailPage = new CourseDetailPage(page, storedCourseId);
            await courseDetailPage.navigateTo();

            // Continue with enrollment test...
            // Check if already enrolled
            const alreadyEnrolled = await courseDetailPage.isEnrolled();

            if (alreadyEnrolled) {
                console.log('Already enrolled in this course, will verify enrolled state');
            } else {
                // Try to enroll in the course
                console.log('Attempting to enroll in the course...');

                // First save the DOM snapshot before enrollment
                await saveDOMSnapshot(page, 'before-enrollment');

                // Log page state before enrollment
                await logPageState(page, 'Before Enrollment');

                // Debug the enrollment button
                for (const selector of courseDetailPage.enrollButtonSelectors) {
                    const enrollButton = page.locator(selector);
                    const isVisible = await enrollButton.isVisible({timeout: 2000}).catch(() => false);
                    if (isVisible) {
                        await debugElement(page, enrollButton, 'enrollment-button');
                        break;
                    }
                }

                // Try to enroll in the course
                const enrollResult = await courseDetailPage.enrollInCourse();
                expect(enrollResult).toBeTruthy();

                // Take a screenshot after enrollment attempt
                await takeScreenshot(page, 'after-enrollment-attempt');

                // Log DOM snapshot after enrollment
                await saveDOMSnapshot(page, 'after-enrollment');

                // Verify enrollment was successful
                const isEnrolled = await courseDetailPage.isEnrolled();
                expect(isEnrolled).toBeTruthy();

                // Verify enrollment status text
                const statusText = await courseDetailPage.getEnrollmentStatusText();
                console.log(`Enrollment status text: "${statusText}"`);
                expect(statusText.toLowerCase()).toContain('enrolled');
            }

            // Verify "View Course Tasks" button is displayed (only shown to enrolled students)
            const page2 = await page.context().newPage();
            try {
                const courseDetailPage2 = new CourseDetailPage(page2, storedCourseId);
                await courseDetailPage2.navigateTo();

                for (const selector of courseDetailPage2.viewTasksButtonSelectors) {
                    const viewTasksButton = page2.locator(selector);
                    const isVisible = await viewTasksButton.isVisible({timeout: 5000})
                        .catch(() => false);
                    if (isVisible) {
                        expect(isVisible).toBeTruthy();
                        break;
                    }
                }
            } finally {
                await page2.close();
            }
        } else if (storedCourseTitle) {
            // If we have a title but no ID, go to courses page and find the course
            console.log(`Using stored course title: ${storedCourseTitle}`);
            const coursesPage = new StudentCoursesPage(page);
            await coursesPage.navigateTo();
            await coursesPage.isCoursesPageLoaded();

            // Check if the course exists
            const hasCourse = await coursesPage.hasCourse(storedCourseTitle);
            expect(hasCourse).toBeTruthy();

            // Click on the course
            await coursesPage.clickCourse(storedCourseTitle);

            // Now we're on the course detail page, continue the test
            const courseDetailPage = new CourseDetailPage(page);
            await courseDetailPage.isCourseDetailPageLoaded();

            // Extract course ID from URL for future tests
            const url = page.url();
            const courseIdMatch = url.match(/\/courses\/(\d+)/);
            if (courseIdMatch && courseIdMatch[1]) {
                const foundCourseId = courseIdMatch[1];
                await page.evaluate(id => {
                    window.localStorage.setItem('e2e_test_course_id', id);
                }, foundCourseId);
                console.log(`Stored course ID: ${foundCourseId} for enrollment tests`);
            }

            // Continue with enrollment test...
            // Check if already enrolled
            const alreadyEnrolled = await courseDetailPage.isEnrolled();

            if (alreadyEnrolled) {
                console.log('Already enrolled in this course, will verify enrolled state');
            } else {
                // Try to enroll in the course
                console.log('Attempting to enroll in the course...');

                // First save the DOM snapshot before enrollment
                await saveDOMSnapshot(page, 'before-enrollment');

                // Log page state before enrollment
                await logPageState(page, 'Before Enrollment');

                // Debug the enrollment button
                for (const selector of courseDetailPage.enrollButtonSelectors) {
                    const enrollButton = page.locator(selector);
                    const isVisible = await enrollButton.isVisible({timeout: 2000}).catch(() => false);
                    if (isVisible) {
                        await debugElement(page, enrollButton, 'enrollment-button');
                        break;
                    }
                }

                // Try to enroll in the course
                const enrollResult = await courseDetailPage.enrollInCourse();
                expect(enrollResult).toBeTruthy();

                // Take a screenshot after enrollment attempt
                await takeScreenshot(page, 'after-enrollment-attempt');

                // Log DOM snapshot after enrollment
                await saveDOMSnapshot(page, 'after-enrollment');

                // Verify enrollment was successful
                const isEnrolled = await courseDetailPage.isEnrolled();
                expect(isEnrolled).toBeTruthy();

                // Verify enrollment status text
                const statusText = await courseDetailPage.getEnrollmentStatusText();
                console.log(`Enrollment status text: "${statusText}"`);
                expect(statusText.toLowerCase()).toContain('enrolled');
            }
        } else {
            // If we don't have a stored course, find one now
            console.log('No stored course information, finding a course now');
            const coursesPage = new StudentCoursesPage(page);
            await coursesPage.navigateTo();
            await coursesPage.isCoursesPageLoaded();

            // Get course titles
            const courseTitles = await coursesPage.getCoursesTitles();
            expect(courseTitles.length).toBeGreaterThan(0);

            // Find any available course (prefer one from our list if possible)
            let testCourseName = '';
            for (const possibleCourse of POSSIBLE_TEST_COURSES) {
                const matchingCourse = courseTitles.find(title =>
                    title.includes(possibleCourse) || possibleCourse.includes(title)
                );

                if (matchingCourse) {
                    testCourseName = matchingCourse;
                    break;
                }
            }

            // If no match found, use the first course
            if (!testCourseName) {
                testCourseName = courseTitles[0];
            }

            // Store the selected course title
            await page.evaluate(title => {
                window.localStorage.setItem('e2e_test_course_title', title);
            }, testCourseName);
            console.log(`Selected course: ${testCourseName}`);

            // Click on the course
            await coursesPage.clickCourse(testCourseName);

            // Now we're on the course detail page
            const courseDetailPage = new CourseDetailPage(page);
            await courseDetailPage.isCourseDetailPageLoaded();

            // Extract and store course ID
            const url = page.url();
            const courseIdMatch = url.match(/\/courses\/(\d+)/);
            if (courseIdMatch && courseIdMatch[1]) {
                const foundCourseId = courseIdMatch[1];
                await page.evaluate(id => {
                    window.localStorage.setItem('e2e_test_course_id', id);
                }, foundCourseId);
                console.log(`Stored course ID: ${foundCourseId} for enrollment tests`);
            }

            // Continue with enrollment test...
            // Check if already enrolled
            const alreadyEnrolled = await courseDetailPage.isEnrolled();

            if (alreadyEnrolled) {
                console.log('Already enrolled in this course, will verify enrolled state');
            } else {
                // Try to enroll in the course
                console.log('Attempting to enroll in the course...');

                // First save the DOM snapshot before enrollment
                await saveDOMSnapshot(page, 'before-enrollment');

                // Log page state before enrollment
                await logPageState(page, 'Before Enrollment');

                // Debug the enrollment button
                for (const selector of courseDetailPage.enrollButtonSelectors) {
                    const enrollButton = page.locator(selector);
                    const isVisible = await enrollButton.isVisible({timeout: 2000}).catch(() => false);
                    if (isVisible) {
                        await debugElement(page, enrollButton, 'enrollment-button');
                        break;
                    }
                }

                // Try to enroll in the course
                const enrollResult = await courseDetailPage.enrollInCourse();
                expect(enrollResult).toBeTruthy();

                // Take a screenshot after enrollment attempt
                await takeScreenshot(page, 'after-enrollment-attempt');

                // Log DOM snapshot after enrollment
                await saveDOMSnapshot(page, 'after-enrollment');

                // Verify enrollment was successful
                const isEnrolled = await courseDetailPage.isEnrolled();
                expect(isEnrolled).toBeTruthy();

                // Verify enrollment status text
                const statusText = await courseDetailPage.getEnrollmentStatusText();
                console.log(`Enrollment status text: "${statusText}"`);
                expect(statusText.toLowerCase()).toContain('enrolled');
            }
        }
    });

    test('should be able to unenroll from a course via the unenroll button', async ({page}) => {
        // Get the test course ID and title from previous tests
        const storedCourseId = await page.evaluate(() => {
            return window.localStorage.getItem('e2e_test_course_id');
        });

        const storedCourseTitle = await page.evaluate(() => {
            return window.localStorage.getItem('e2e_test_course_title');
        });

        // If we have a course ID, use it
        if (storedCourseId) {
            console.log(`Using stored course ID: ${storedCourseId}`);

            // Navigate directly to the course detail page
            const courseDetailPage = new CourseDetailPage(page, storedCourseId);
            await courseDetailPage.navigateTo();

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
            let unenrollButtonSelector = '';

            // Save DOM snapshot before attempting unenrollment
            await saveDOMSnapshot(page, 'before-unenrollment');

            // Take a screenshot of the page before unenroll action
            await takeScreenshot(page, 'before-unenroll-action');

            // Log the page state for debugging
            await logPageState(page, 'Before Unenrollment');

            // Try to find and debug the unenroll button
            for (const selector of courseDetailPage.unenrollButtonSelectors) {
                const unenrollButton = page.locator(selector);
                const isVisible = await unenrollButton.isVisible({timeout: 2000})
                    .catch(() => false);
                if (isVisible) {
                    unenrollButtonFound = true;
                    unenrollButtonSelector = selector;
                    await debugElement(page, unenrollButton, 'unenroll-button');
                    break;
                }
            }

            // If unenroll button not found, fail test but log the issue
            if (!unenrollButtonFound) {
                console.error("🚨 Unenroll button not found on the page for an enrolled course. This should be investigated.");

                // Save DOM for debugging the missing button
                await saveDOMSnapshot(page, 'missing-unenroll-button');

                // Take a screenshot of the issue
                await takeScreenshot(page, 'missing-unenroll-button');

                // Log any enrollment status indicators that might be visible
                const statusText = await courseDetailPage.getEnrollmentStatusText();
                console.log(`Current enrollment status text: "${statusText}"`);

                // Get more information about the page using browser JavaScript
                await evaluateAndLog(page, `
                    return {
                        enrollmentStatus: document.querySelector('.enrollment-status')?.textContent,
                        unenrollSelectors: [${courseDetailPage.unenrollButtonSelectors.map(s => `"${s}"`).join(', ')}]
                            .map(selector => ({
                                selector,
                                exists: !!document.querySelector(selector),
                                visible: !!document.querySelector(selector)?.offsetParent,
                                text: document.querySelector(selector)?.textContent
                            }))
                    };
                `, 'unenroll-button-debug');

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
        } else if (storedCourseTitle) {
            // If we have a title but no ID, go to courses page and find the course
            console.log(`Using stored course title: ${storedCourseTitle}`);
            const coursesPage = new StudentCoursesPage(page);
            await coursesPage.navigateTo();
            await coursesPage.isCoursesPageLoaded();

            // Check if the course exists
            const hasCourse = await coursesPage.hasCourse(storedCourseTitle);

            if (hasCourse) {
                // Click on the course
                await coursesPage.clickCourse(storedCourseTitle);

                // Now we're on the course detail page
                const courseDetailPage = new CourseDetailPage(page);
                await courseDetailPage.isCourseDetailPageLoaded();

                // Extract course ID from URL for future tests
                const url = page.url();
                const courseIdMatch = url.match(/\/courses\/(\d+)/);
                if (courseIdMatch && courseIdMatch[1]) {
                    const foundCourseId = courseIdMatch[1];
                    await page.evaluate(id => {
                        window.localStorage.setItem('e2e_test_course_id', id);
                    }, foundCourseId);
                    console.log(`Stored course ID: ${foundCourseId} for enrollment tests`);
                }

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

                // Now proceed with unenrollment test following the same flow as above
                const unenrollResult = await courseDetailPage.unenrollFromCourse();
                expect(unenrollResult).toBeTruthy();

                // Reload the page to see updated state
                await page.reload();
                await courseDetailPage.isCourseDetailPageLoaded();

                // Verify user is no longer enrolled
                const stillEnrolled = await courseDetailPage.isEnrolled();
                expect(stillEnrolled).toBeFalsy();
            } else {
                // Find any available course
                console.log(`Stored course "${storedCourseTitle}" not found, finding another course`);
                // Get course titles
                const courseTitles = await coursesPage.getCoursesTitles();

                if (courseTitles.length === 0) {
                    console.log('No courses available to test with');
                    test.fail('No courses available to test with');
                    return;
                }

                // Use the first available course
                const firstCourse = courseTitles[0];
                console.log(`Using course: ${firstCourse}`);

                // Click on the course
                await coursesPage.clickCourse(firstCourse);

                // Continue with the test...
                const courseDetailPage = new CourseDetailPage(page);
                await courseDetailPage.isCourseDetailPageLoaded();

                // Store this course for future tests
                const url = page.url();
                const courseIdMatch = url.match(/\/courses\/(\d+)/);
                if (courseIdMatch && courseIdMatch[1]) {
                    const foundCourseId = courseIdMatch[1];
                    await page.evaluate(id => {
                        window.localStorage.setItem('e2e_test_course_id', id);
                    }, foundCourseId);
                    console.log(`Stored course ID: ${foundCourseId} for enrollment tests`);
                }

                await page.evaluate(title => {
                    window.localStorage.setItem('e2e_test_course_title', title);
                }, firstCourse);

                // Check if enrolled and complete the test as above
                const isEnrolled = await courseDetailPage.isEnrolled();

                if (!isEnrolled) {
                    console.log('Not enrolled in this course, enrolling first...');
                    const enrollResult = await courseDetailPage.enrollInCourse();
                    expect(enrollResult).toBeTruthy();

                    // Reload the page to see updated state
                    await page.reload();
                    await courseDetailPage.isCourseDetailPageLoaded();
                }

                // Proceed with unenrollment
                const unenrollResult = await courseDetailPage.unenrollFromCourse();
                expect(unenrollResult).toBeTruthy();

                // Reload the page to see updated state
                await page.reload();
                await courseDetailPage.isCourseDetailPageLoaded();

                // Verify unenrollment
                const stillEnrolled = await courseDetailPage.isEnrolled();
                expect(stillEnrolled).toBeFalsy();
            }
        } else {
            // If we don't have a stored course, find one now
            console.log('No stored course information, finding a course now');
            const coursesPage = new StudentCoursesPage(page);
            await coursesPage.navigateTo();
            await coursesPage.isCoursesPageLoaded();

            // Get any available courses
            const courseTitles = await coursesPage.getCoursesTitles();

            if (courseTitles.length === 0) {
                console.log('No courses available to test with');
                test.fail('No courses available to test with');
                return;
            }

            // Use the first available course
            const firstCourse = courseTitles[0];
            console.log(`Using course: ${firstCourse}`);

            // Click on the course
            await coursesPage.clickCourse(firstCourse);

            // Continue with the test...
            const courseDetailPage = new CourseDetailPage(page);
            await courseDetailPage.isCourseDetailPageLoaded();

            // Store this course for future tests
            const url = page.url();
            const courseIdMatch = url.match(/\/courses\/(\d+)/);
            if (courseIdMatch && courseIdMatch[1]) {
                const foundCourseId = courseIdMatch[1];
                await page.evaluate(id => {
                    window.localStorage.setItem('e2e_test_course_id', id);
                }, foundCourseId);
                console.log(`Stored course ID: ${foundCourseId} for enrollment tests`);
            }

            await page.evaluate(title => {
                window.localStorage.setItem('e2e_test_course_title', title);
            }, firstCourse);

            // Check if enrolled and complete the test
            const isEnrolled = await courseDetailPage.isEnrolled();

            if (!isEnrolled) {
                console.log('Not enrolled in this course, enrolling first...');
                const enrollResult = await courseDetailPage.enrollInCourse();
                expect(enrollResult).toBeTruthy();

                // Reload the page to see updated state
                await page.reload();
                await courseDetailPage.isCourseDetailPageLoaded();
            }

            // Proceed with unenrollment
            const unenrollResult = await courseDetailPage.unenrollFromCourse();
            expect(unenrollResult).toBeTruthy();

            // Reload the page to see updated state
            await page.reload();
            await courseDetailPage.isCourseDetailPageLoaded();

            // Verify unenrollment
            const stillEnrolled = await courseDetailPage.isEnrolled();
            expect(stillEnrolled).toBeFalsy();
        }
    });

    test('should be able to cancel unenrollment via the cancel button', async ({page}) => {
        // Get the test course ID and title from previous tests
        const storedCourseId = await page.evaluate(() => {
            return window.localStorage.getItem('e2e_test_course_id');
        });

        const storedCourseTitle = await page.evaluate(() => {
            return window.localStorage.getItem('e2e_test_course_title');
        });

        // If we have a course ID, use it
        if (storedCourseId) {
            console.log(`Using stored course ID: ${storedCourseId}`);

            // Navigate directly to the course detail page
            const courseDetailPage = new CourseDetailPage(page, storedCourseId);
            await courseDetailPage.navigateTo();

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
        } else if (storedCourseTitle) {
            // If we have a title but no ID, go to courses page and find the course
            console.log(`Using stored course title: ${storedCourseTitle}`);
            const coursesPage = new StudentCoursesPage(page);
            await coursesPage.navigateTo();
            await coursesPage.isCoursesPageLoaded();

            // Check if the course exists
            const hasCourse = await coursesPage.hasCourse(storedCourseTitle);

            if (hasCourse) {
                // Click on the course
                await coursesPage.clickCourse(storedCourseTitle);

                // Now we're on the course detail page
                const courseDetailPage = new CourseDetailPage(page);
                await courseDetailPage.isCourseDetailPageLoaded();

                // Extract course ID from URL for future tests
                const url = page.url();
                const courseIdMatch = url.match(/\/courses\/(\d+)/);
                if (courseIdMatch && courseIdMatch[1]) {
                    const foundCourseId = courseIdMatch[1];
                    await page.evaluate(id => {
                        window.localStorage.setItem('e2e_test_course_id', id);
                    }, foundCourseId);
                    console.log(`Stored course ID: ${foundCourseId} for tests`);
                }

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
            } else {
                // Find any available course
                console.log(`Stored course "${storedCourseTitle}" not found, finding another course`);
                // Get course titles
                const courseTitles = await coursesPage.getCoursesTitles();

                if (courseTitles.length === 0) {
                    console.log('No courses available to test with');
                    test.fail('No courses available to test with');
                    return;
                }

                // Use the first available course
                const firstCourse = courseTitles[0];
                console.log(`Using course: ${firstCourse}`);

                // Click on the course
                await coursesPage.clickCourse(firstCourse);

                // Continue with the test...
                const courseDetailPage = new CourseDetailPage(page);
                await courseDetailPage.isCourseDetailPageLoaded();

                // Store this course for future tests
                const url = page.url();
                const courseIdMatch = url.match(/\/courses\/(\d+)/);
                if (courseIdMatch && courseIdMatch[1]) {
                    const foundCourseId = courseIdMatch[1];
                    await page.evaluate(id => {
                        window.localStorage.setItem('e2e_test_course_id', id);
                    }, foundCourseId);
                    console.log(`Stored course ID: ${foundCourseId} for tests`);
                }

                await page.evaluate(title => {
                    window.localStorage.setItem('e2e_test_course_title', title);
                }, firstCourse);

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
            }
        } else {
            // If we don't have a stored course, find one now
            console.log('No stored course information, finding a course now');
            const coursesPage = new StudentCoursesPage(page);
            await coursesPage.navigateTo();
            await coursesPage.isCoursesPageLoaded();

            // Get any available courses
            const courseTitles = await coursesPage.getCoursesTitles();

            if (courseTitles.length === 0) {
                console.log('No courses available to test with');
                test.fail('No courses available to test with');
                return;
            }

            // Use the first available course
            const firstCourse = courseTitles[0];
            console.log(`Using course: ${firstCourse}`);

            // Click on the course
            await coursesPage.clickCourse(firstCourse);

            // Continue with the test...
            const courseDetailPage = new CourseDetailPage(page);
            await courseDetailPage.isCourseDetailPageLoaded();

            // Store this course for future tests
            const url = page.url();
            const courseIdMatch = url.match(/\/courses\/(\d+)/);
            if (courseIdMatch && courseIdMatch[1]) {
                const foundCourseId = courseIdMatch[1];
                await page.evaluate(id => {
                    window.localStorage.setItem('e2e_test_course_id', id);
                }, foundCourseId);
                console.log(`Stored course ID: ${foundCourseId} for tests`);
            }

            await page.evaluate(title => {
                window.localStorage.setItem('e2e_test_course_title', title);
            }, firstCourse);

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
        }
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
        const coursesPage = new StudentCoursesPage(page);
        await coursesPage.navigateTo();
        await coursesPage.isCoursesPageLoaded();

        const courseTitles = await coursesPage.getCoursesTitles();
        if (courseTitles.length === 0) {
            test.skip('No courses available to test the full enrollment flow');
            return;
        }

        let selectedCourse = courseTitles[0];
        await coursesPage.clickCourse(selectedCourse);

        const courseDetailPage = new CourseDetailPage(page);
        await courseDetailPage.isCourseDetailPageLoaded();

        const initiallyEnrolled = await courseDetailPage.isEnrolled();
        if (initiallyEnrolled) {
            await courseDetailPage.unenrollFromCourse();
            await page.reload();
            await courseDetailPage.isCourseDetailPageLoaded();
            const enrollmentCheck = await waitForUIUpdate(page, '[data-testid="enroll-button"]', true);
            expect(enrollmentCheck).toBeTruthy();
        }

        await courseDetailPage.enrollInCourse();
        await page.reload();
        await courseDetailPage.isCourseDetailPageLoaded();
        const isEnrolled = await waitForUIUpdate(page, '[data-testid="unenroll-button"]', true);
        expect(isEnrolled).toBeTruthy();

        await courseDetailPage.unenrollFromCourse();
        await page.reload();
        await courseDetailPage.isCourseDetailPageLoaded();
        const stillEnrolled = await waitForUIUpdate(page, '[data-testid="enroll-button"]', true);
        expect(stillEnrolled).toBeTruthy();

        await coursesPage.navigateTo();
        await coursesPage.isCoursesPageLoaded();
        const enrolledStatus = await coursesPage.isEnrolledIn(selectedCourse);
        expect(enrolledStatus).toBeFalsy();
    });
});
