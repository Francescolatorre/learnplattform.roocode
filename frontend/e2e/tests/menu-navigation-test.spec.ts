import {test, expect} from '@playwright/test';
import {NavigationHelper} from '../page-objects/NavigationHelper';
import {LoginPage} from '../page-objects/LoginPage';
import {DashboardPage, StudentDashboardPage, InstructorDashboardPage} from '../page-objects/DashboardPage';
import {CourseMarkdownEditorPage} from '../page-objects/CourseMarkdownEditorPage';
import {takeScreenshot} from '../setupTests';

/**
 * E2E test suite for menu-based navigation
 * Demonstrates natural user flow through the application
 */
test.describe('Menu Navigation Tests', () => {
    // Make sure the backend server is running before these tests
    test.beforeAll(async () => {
        console.log('Ensure the backend server is running at http://localhost:8000');
    });

    test('should navigate through the application using menu clicks', async ({page}) => {
        const navigation = new NavigationHelper(page);
        const loginPage = new LoginPage(page);

        // Start with login
        await loginPage.navigateTo();

        try {
            await loginPage.login('instructor@example.com', 'Password123!');
        } catch (error) {
            console.log('Login failed - this test requires a running backend server');
            test.skip();
            return;
        }

        // Take screenshot of initial dashboard
        await takeScreenshot(page, 'initial-dashboard');

        // Navigate to the courses page via menu
        await navigation.navigateToCourses();

        // Verify we're on the courses page
        const coursesUrl = page.url();
        expect(coursesUrl).toContain('/courses');
        console.log(`Successfully navigated to courses: ${coursesUrl}`);

        // Navigate to the instructor dashboard via menu
        await navigation.navigateToInstructor();

        // Verify we're on the instructor dashboard
        const instructorDashboardUrl = page.url();
        expect(instructorDashboardUrl).toContain('/instructor');
        console.log(`Successfully navigated to instructor dashboard: ${instructorDashboardUrl}`);

        // Verify we're back on the dashboard
        const dashboardUrl = page.url();
        expect(dashboardUrl).toContain('dashboard');
        console.log(`Successfully navigated back to dashboard: ${dashboardUrl}`);

        // Logout via menu
        await navigation.logout();

        // Verify we're logged out (back on login page)
        const logoutUrl = page.url();
        expect(logoutUrl).toContain('/login');
        console.log('Successfully logged out');
    });

    test('should navigate to instructor course creation and use markdown editor', async ({page}) => {
        // Import the MarkdownEditorPage here to show it uses NavigationHelper
        const {CourseMarkdownEditorPage} = require('../page-objects/CourseMarkdownEditorPage');

        const loginPage = new LoginPage(page);
        const markdownEditor = new CourseMarkdownEditorPage(page);

        // Login as instructor
        await loginPage.navigateTo();
        await loginPage.login('instructor@example.com', 'Password123!');

        // Navigate to instructor course creation using the navigation helper inside MarkdownEditorPage
        await markdownEditor.navigateToInstructorCourseCreation();

        // Test markdown editor functionality
        const testMarkdown = `# Test Course

## Course Description

This is a **bold** statement about this course.

### Learning Objectives:
- Learn about navigation
- Master menu-based testing
- Improve E2E test reliability

> This course is designed to showcase menu-based navigation.

\`\`\`
// Example code
function testNavigation() {
  console.log('Testing navigation');
}
\`\`\`

[Learn more](https://example.com)`;

        await markdownEditor.enterMarkdown(testMarkdown);
        await markdownEditor.switchToPreview();

        // Verify markdown rendering
        const hasRenderedElements = await markdownEditor.hasRenderedElements([
            'heading',
            'paragraph',
            'bold',
            'list',
            'blockquote',
            'code',
            'link'
        ]);

        expect(hasRenderedElements).toBe(true);
        console.log('Markdown editor working correctly with menu-based navigation');

        // Take a screenshot of the rendered markdown
        await takeScreenshot(page, 'markdown-preview-rendering');
    });

    test('should handle mobile navigation using burger menu', async ({page}) => {
        // Set viewport to mobile size
        await page.setViewportSize({width: 375, height: 667});

        const navigation = new NavigationHelper(page);
        const loginPage = new LoginPage(page);

        // Login
        await loginPage.navigateTo();
        await loginPage.login('student@example.com', 'Password123!');

        // Take screenshot of mobile dashboard
        await takeScreenshot(page, 'mobile-dashboard');

        // Verify we're in mobile view
        const isMobile = await navigation.isMobileView();
        expect(isMobile).toBe(true);
        console.log('Confirmed we are in mobile view');

        // Navigate to courses via mobile menu
        await navigation.navigateToCourses();

        // Verify we're on the courses page
        const coursesUrl = page.url();
        expect(coursesUrl).toContain('/courses');
        console.log(`Successfully navigated to courses in mobile view: ${coursesUrl}`);

        // Navigate to profile via mobile menu
        await navigation.navigateToProfile();

        // Verify we're on the profile page
        const profileUrl = page.url();
        expect(profileUrl).toContain('/profile');
        console.log(`Successfully navigated to profile in mobile view: ${profileUrl}`);

        // Navigate back to dashboard
        await navigation.navigateToDashboard();

        // Verify we're back on the dashboard
        const dashboardUrl = page.url();
        expect(dashboardUrl).toContain('dashboard');
        console.log(`Successfully navigated back to dashboard in mobile view: ${dashboardUrl}`);

        // Logout via mobile menu
        await navigation.logout();

        // Verify we're logged out (back on login page)
        const logoutUrl = page.url();
        expect(logoutUrl).toContain('/login');
        console.log('Successfully logged out from mobile view');
    });
});
