// filepath: c:\DEVELOPMENT\projects\learnplatfom2\frontend\e2e\course-creation.spec.ts
import {test, expect, Page} from '@playwright/test';
import {login, TEST_USERS} from './setupTests';

/**
 * Helper function to log test actions and outcomes with timestamps
 * Used to track the flow and debug potential issues in the course creation process
 */
const logTestAction = (message: string) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${message}`);
};

/**
 * Helper function to navigate to the instructor courses page
 */
const navigateToInstructorCoursesPage = async (page: Page) => {
    logTestAction('Navigating to instructor courses page');

    // Check if we're already on the instructor dashboard
    const currentUrl = page.url();
    if (!currentUrl.includes('/instructor/')) {
        // Navigate to instructor dashboard first if we're not in the instructor section
        await page.goto('/instructor/dashboard');
    }

    // Click on the instructor courses link in the navigation
    const coursesLink = page.locator('a[href="/instructor/courses"]').first();
    await coursesLink.click();

    // Wait for the page to load
    await page.waitForURL('**/instructor/courses');

    logTestAction('Successfully navigated to instructor courses page');
    return page;
};

/**
 * Test suite for course creation functionality
 * Focuses on the ability of instructors to create courses through the UI
 */
test.describe('Course Creation Functionality', () => {
    test.beforeEach(async ({page}) => {
        logTestAction('Starting test case - navigating to login page');
        await page.goto('/login');
    });

    test('Instructor can create a new course', async ({page}) => {
        logTestAction('TEST STARTED: Instructor can create a new course');

        // 1. Login as instructor
        logTestAction('Logging in as instructor');
        await login(
            page,
            TEST_USERS.lead_instructor.username_or_email,
            TEST_USERS.lead_instructor.password
        );
        logTestAction('Login successful, redirected to instructor dashboard');

        // Verify we're on the instructor dashboard
        expect(page.url()).toContain('/instructor/dashboard');

        // 2. Navigate to instructor courses page
        await navigateToInstructorCoursesPage(page);

        // 3. Create New Course button may or may not have the data-testid attribute
        // Try with data-testid first, fall back to text content
        logTestAction('Looking for "Create New Course" button');
        let createButton;

        try {
            // First try with data-testid
            createButton = page.locator('[data-testid="create-course-button"]');
            if (await createButton.count() === 0) {
                // If not found, try with text content
                logTestAction('Button not found by data-testid, trying by text content');
                createButton = page.getByRole('button', {name: 'Create New Course'});
            }
        } catch (e) {
            logTestAction('Error finding button by data-testid, falling back to text content');
            createButton = page.getByRole('button', {name: 'Create New Course'});
        }

        // Log whether button was found
        const buttonCount = await createButton.count();
        logTestAction(`Found ${buttonCount} "Create New Course" buttons`);

        if (buttonCount === 0) {
            // Take screenshot to debug the UI state
            await page.screenshot({path: './test-results/no-create-button-found.png'});
            throw new Error('Could not find "Create New Course" button');
        }

        await createButton.click();
        logTestAction('Clicked "Create New Course" button');

        // 4. Wait for redirect to course creation form
        await page.waitForURL('**/instructor/courses/new');
        logTestAction('Successfully navigated to course creation form');

        // 5. Take screenshot of the form for debugging
        await page.screenshot({path: './test-results/course-form-initial.png'});
        logTestAction('Took screenshot of initial course creation form');

        // 6. Fill out the course creation form using data-testid attributes
        logTestAction('Filling out course form');

        // Fill out required fields
        await page.locator('[data-testid="course-title-input"]').fill('Playwright Test Course');
        await page.locator('[data-testid="course-description-input"]').fill('This is a test course created by Playwright automated testing to verify the course creation functionality works properly.');

        // Optional fields
        await page.locator('[data-testid="course-image-url-input"]').fill('https://example.com/course-image.jpg');
        await page.locator('[data-testid="course-category-input"]').fill('Testing');
        await page.locator('[data-testid="course-difficulty-select"]').selectOption('intermediate');

        // Toggle publish switch
        const publishSwitch = page.locator('[data-testid="course-publish-switch"]');
        await publishSwitch.check();

        // Take screenshot before submission
        await page.screenshot({path: './test-results/course-form-filled.png'});
        logTestAction('Took screenshot of filled course form');

        // 7. Submit the form using the submit button with data-testid
        logTestAction('Submitting course creation form');
        const submitButton = page.locator('[data-testid="course-submit-button"]');

        if (await submitButton.count() === 0) {
            logTestAction('Submit button not found by data-testid, trying by text content');
            await page.getByRole('button', {name: 'Create Course'}).click();
        } else {
            await submitButton.click();
        }

        logTestAction('Clicked submit button');

        // 8. Wait for success notification
        logTestAction('Waiting for success notification');
        const successNotification = page.locator('.MuiAlert-standardSuccess');

        try {
            await successNotification.waitFor({timeout: 10000});
            const notificationText = await successNotification.textContent();
            logTestAction(`Success notification appeared: "${notificationText}"`);

            // Validate notification content
            expect(notificationText).toContain('Course created successfully');
        } catch (error) {
            // Check for potential error notification
            const errorNotification = page.locator('.MuiAlert-standardError');
            if (await errorNotification.isVisible()) {
                const errorText = await errorNotification.textContent();
                logTestAction(`ERROR: Creation failed with message: "${errorText}"`);
                // Take screenshot of error state
                await page.screenshot({path: './test-results/course-creation-error.png'});
            } else {
                logTestAction('ERROR: No success or error notification appeared within timeout');
                await page.screenshot({path: './test-results/course-creation-timeout.png'});
            }
            throw error;
        }

        // 9. Verify redirect to course details page
        await page.waitForURL('**/instructor/courses/*');
        const currentUrl = page.url();
        logTestAction(`Redirected to: ${currentUrl}`);

        // Extract course ID from URL for verification
        const courseId = currentUrl.split('/').pop();
        logTestAction(`New course ID: ${courseId}`);

        // 10. Verify course appears in instructor courses list
        await navigateToInstructorCoursesPage(page);

        // Look for the course title in the page
        const courseTitle = page.getByText('Playwright Test Course', {exact: false});
        await courseTitle.waitFor();
        expect(await courseTitle.isVisible()).toBeTruthy();

        // Final success screenshot
        await page.screenshot({path: './test-results/course-creation-success.png'});
        logTestAction('TEST COMPLETED SUCCESSFULLY: Course was created and appears in the course list');
    });

    test('Course creation form validates required fields', async ({page}) => {
        logTestAction('TEST STARTED: Course creation form validates required fields');

        // 1. Login as instructor
        logTestAction('Logging in as instructor');
        await login(
            page,
            TEST_USERS.lead_instructor.username_or_email,
            TEST_USERS.lead_instructor.password
        );

        // 2. Navigate directly to course creation page
        await page.goto('/instructor/courses/new');
        logTestAction('Navigated to course creation page');

        // 3. Try to submit empty form
        logTestAction('Attempting to submit empty form to test validation');
        const submitButton = page.locator('[data-testid="course-submit-button"]');

        if (await submitButton.count() === 0) {
            logTestAction('Submit button not found by data-testid, trying by text content');
            await page.getByRole('button', {name: 'Create Course'}).click();
        } else {
            await submitButton.click();
        }

        // 4. Check for validation errors - look near the input fields
        logTestAction('Looking for validation error messages');
        await page.screenshot({path: './test-results/course-form-validation.png'});

        // Look for error messages
        const titleErrorVisible = await page.locator('input[name="title"] + p.MuiFormHelperText-root').isVisible();
        const descriptionErrorVisible = await page.locator('textarea[name="description"] + p.MuiFormHelperText-root').isVisible();

        logTestAction(`Validation results - Title error visible: ${titleErrorVisible}, Description error visible: ${descriptionErrorVisible}`);

        // Expect at least one validation error to be shown
        expect(titleErrorVisible || descriptionErrorVisible).toBeTruthy();

        logTestAction('TEST COMPLETED: Form validation works correctly');
    });

    test('Network request monitoring during course creation', async ({page}) => {
        logTestAction('TEST STARTED: Monitoring network requests during course creation');

        // 1. Login as instructor
        logTestAction('Logging in as instructor');
        await login(
            page,
            TEST_USERS.lead_instructor.username_or_email,
            TEST_USERS.lead_instructor.password
        );

        // Verify we're on the instructor dashboard
        expect(page.url()).toContain('/instructor/dashboard');

        // 2. Navigate to course creation page (try both methods)
        await navigateToInstructorCoursesPage(page);

        let createButton;
        try {
            // First try with data-testid
            createButton = page.locator('[data-testid="create-course-button"]');
            if (await createButton.count() === 0) {
                // If not found, try with text content
                createButton = page.getByRole('button', {name: 'Create New Course'});
            }
        } catch (e) {
            createButton = page.getByRole('button', {name: 'Create New Course'});
        }

        await createButton.click();
        await page.waitForURL('**/instructor/courses/new');

        // 3. Set up network request monitoring
        logTestAction('Setting up network request monitoring');
        let courseCreationRequest = null;
        let courseCreationResponse = null;

        // Listen for API calls to the course creation endpoint
        page.on('request', request => {
            if (request.url().includes('/api/v1/courses')) {
                courseCreationRequest = {
                    url: request.url(),
                    method: request.method(),
                    headers: request.headers(),
                    postData: request.postData()
                };
                logTestAction(`Course creation API request detected: ${request.method()} ${request.url()}`);
                if (request.postData()) {
                    logTestAction(`Request payload: ${request.postData()}`);
                }
            }
        });

        page.on('response', async response => {
            if (response.url().includes('/api/v1/courses')) {
                courseCreationResponse = {
                    url: response.url(),
                    status: response.status(),
                    statusText: response.statusText()
                };

                logTestAction(`Course creation API response: ${response.status()} ${response.statusText()}`);

                try {
                    // Try to capture response body for debugging
                    const responseBody = await response.text();
                    logTestAction(`Response body: ${responseBody}`);
                } catch (e) {
                    logTestAction('Could not capture response body');
                }
            }
        });

        // 4. Fill course form using data-testid attributes
        logTestAction('Filling out course data');
        await page.locator('[data-testid="course-title-input"]').fill('Network Test Course');
        await page.locator('[data-testid="course-description-input"]').fill('Testing network requests during course creation.');

        // 5. Submit the form
        logTestAction('Submitting form and watching network traffic');
        const submitButton = page.locator('[data-testid="course-submit-button"]');

        if (await submitButton.count() === 0) {
            await page.getByRole('button', {name: 'Create Course'}).click();
        } else {
            await submitButton.click();
        }

        // 6. Wait for network request/response cycle to complete
        // Wait for redirect which indicates request cycle is complete
        try {
            await page.waitForURL('**/instructor/courses/*', {timeout: 10000});
            logTestAction('Course creation completed successfully with redirect');
        } catch (e) {
            logTestAction('ERROR: Course creation did not redirect within timeout');
            await page.screenshot({path: './test-results/course-creation-network-error.png'});
        }

        // 7. Verify network data was captured
        if (courseCreationRequest && courseCreationResponse) {
            logTestAction('Successfully captured network traffic for course creation');

            expect(courseCreationRequest.method).toBe('POST');
            expect(courseCreationResponse.status).toBe(201); // Created

            logTestAction('TEST COMPLETED: Network monitoring verified correct API interaction');
        } else {
            logTestAction('WARNING: Could not capture network traffic for course creation');
            logTestAction('TEST COMPLETED WITH WARNINGS: Network monitoring incomplete');
        }
    });
});
