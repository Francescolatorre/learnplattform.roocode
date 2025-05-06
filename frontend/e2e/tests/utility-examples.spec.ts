import {test, expect, Page} from '@playwright/test';
import {
    login,
    TEST_USERS,
    UserSession,
    takeScreenshot,
    waitForGlobalLoadingToDisappear
} from '../setupTests';
import {
    loginAsStudent,
    loginAsInstructor,
    loginAsAdmin
} from '../utils/auth-helpers';
import {
    logPageState,
    debugElement,
    highlightAndScreenshot,
    saveDOMSnapshot,
    trackNetworkActivity,
    evaluateAndLog
} from '../utils/debugHelper';
import {MarkdownTestUtils} from '../utils/markdown-test-utils';

/**
 * This test file demonstrates how to use all the utility functions available in the e2e test framework.
 * It serves as both documentation and a practical example for each utility.
 */
test.describe('Utility Functions Examples', () => {

    // Example of using auth helpers from setupTests.ts
    test('Example: Basic Login Function', async ({page}) => {
        test.info().annotations.push({
            type: 'example',
            description: 'Demonstrates the basic login function from setupTests.ts'
        });

        // Navigate to home page first
        await page.goto('/');

        // Use the generic login function
        await login(page, TEST_USERS.student.username, TEST_USERS.student.password);

        // Verify login was successful by checking for authenticated elements
        await expect(page.locator('[data-testid="user-menu"], .user-avatar, header .username')).toBeVisible();

        // Take a screenshot to document success
        await takeScreenshot(page, 'basic-login-example');
    });

    // Example of using the UserSession class
    test('Example: UserSession Class', async ({page}) => {
        test.info().annotations.push({
            type: 'example',
            description: 'Demonstrates the UserSession class from setupTests.ts'
        });

        // Create a new user session
        const userSession = new UserSession(page);

        // Login as a student role
        await userSession.loginAs('student');

        // Verify we are logged in
        await expect(page.locator('[data-testid="user-menu"], .user-avatar, header .username')).toBeVisible();

        // Demonstrate logout functionality
        await userSession.logout();

        // Verify we're back at the login page
        await expect(page.url()).toContain('/login');
    });

    // Example of using role-specific login helpers
    test('Example: Role-Specific Login Functions', async ({page}) => {
        test.info().annotations.push({
            type: 'example',
            description: 'Demonstrates the role-specific login helpers from auth-helpers.ts'
        });

        // First example: Login as student
        await loginAsStudent(page);
        await expect(page.locator('[data-testid="role-chip"]:has-text("student")')).toBeVisible();
        await page.goto('/login'); // Go back to login page

        // Second example: Login as instructor
        await loginAsInstructor(page);
        await expect(page.locator('[data-testid="role-chip"]:has-text("instructor")')).toBeVisible();
        await page.goto('/login'); // Go back to login page

        // Third example: Login as admin
        await loginAsAdmin(page);
        await expect(page.locator('[data-testid="role-chip"]:has-text("admin")')).toBeVisible();
    });

    // Examples using debugHelper.ts utilities
    test('Example: Debug Helper Functions', async ({page}) => {
        test.info().annotations.push({
            type: 'example',
            description: 'Demonstrates the debug helper functions from debugHelper.ts'
        });

        // Navigate to the home page
        await page.goto('/');

        // Example: Log the current page state
        await logPageState(page, 'Home Page Example');

        // Example: Debug a specific element
        const loginButton = page.locator('button:has-text("Login"), [role="button"]:has-text("Login")');
        if (await loginButton.isVisible()) {
            await debugElement(page, loginButton, 'login-button');
        }

        // Example: Highlight an element and take a screenshot
        const header = page.locator('header');
        await highlightAndScreenshot(page, header, 'header-highlight');

        // Example: Save the complete DOM for debugging
        await saveDOMSnapshot(page, 'home-page-dom');

        // Example: Track network activity
        trackNetworkActivity(page, {
            logRequests: true,
            logResponses: true,
            urlFilter: '/api/'
        });

        // Example: Evaluate and log JavaScript in the browser context
        await evaluateAndLog(page, `
      // Get details about the page
      return {
        title: document.title,
        url: window.location.href,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight
      }
    `, 'page-details');

        // Example: Wait for global loading to disappear
        await waitForGlobalLoadingToDisappear(page);
    });

    // Examples using MarkdownTestUtils
    test('Example: Markdown Test Utilities', async ({page}) => {
        test.info().annotations.push({
            type: 'example',
            description: 'Demonstrates the markdown testing utilities from markdown-test-utils.ts'
        });

        // Login first to access content
        await loginAsStudent(page);

        // Navigate to a page containing markdown content
        await page.goto('/courses');

        // Example: Get test markdown content
        const testMarkdown = MarkdownTestUtils.getTestMarkdownContent();
        console.log('Example test markdown content:', testMarkdown.substring(0, 100) + '...');

        // Example: Test unsafe markdown content (just log it, don't try to use it)
        const unsafeMarkdown = MarkdownTestUtils.getUnsafeMarkdownContent();
        console.log('Example unsafe markdown content:', unsafeMarkdown.substring(0, 100) + '...');

        // Example: List available markdown container selectors
        console.log('Available markdown container selectors:',
            MarkdownTestUtils.markdownContainerSelectors.slice(0, 3) + '... and more');

        // Example: Verify markdown rendering
        try {
            await MarkdownTestUtils.verifyMarkdownRendering(page);
            console.log('Successfully verified markdown rendering on the page');
        } catch (error) {
            console.log('Could not verify markdown rendering:', error.message);
        }

        // Example: Verify markdown sanitization
        try {
            await MarkdownTestUtils.verifySanitization(page);
            console.log('Successfully verified markdown sanitization on the page');
        } catch (error) {
            console.log('Could not verify markdown sanitization:', error.message);
        }
    });

    // Combining multiple utilities for a practical test scenario
    test('Practical Example: Course Description Workflow', async ({page}) => {
        test.info().annotations.push({
            type: 'example',
            description: 'A practical example combining multiple utilities for testing a course description workflow'
        });

        // Login as instructor who can edit course descriptions
        await loginAsInstructor(page);

        // Navigate to course management
        await page.goto('/instructor/courses');

        // Wait for any loading indicators to disappear
        await waitForGlobalLoadingToDisappear(page);

        // Log the current state of the page
        await logPageState(page, 'Course Management Page');

        // Look for a course to edit
        const courseCard = page.locator('.course-card, [data-testid="course-card"]').first();

        if (await courseCard.isVisible()) {
            // Debug the course card element
            await debugElement(page, courseCard, 'course-card');

            // Click to view/edit course
            await courseCard.click();

            // Wait for any loading to complete
            await waitForGlobalLoadingToDisappear(page);

            // Take a screenshot of the course detail page
            await takeScreenshot(page, 'course-detail-page');

            // Look for and verify markdown content in the course description
            try {
                await MarkdownTestUtils.verifyMarkdownRendering(page, '.course-description, [data-testid="course-description"]');
                console.log('Course description markdown renders correctly');
            } catch (error) {
                console.log('Issue with course description markdown:', error.message);
            }

            // Save the DOM for reference
            await saveDOMSnapshot(page, 'course-detail-dom');
        } else {
            console.log('No courses available to test with');
            await takeScreenshot(page, 'no-courses-available');
        }
    });
});
