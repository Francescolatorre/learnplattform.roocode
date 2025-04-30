import {test, expect} from '@playwright/test';
import {loginAsInstructor} from '../../utils/auth-helpers';
import {MarkdownTestUtils} from '../../utils/markdown-test-utils';
import {TEST_USERS} from '../../setupTests';
import {
    LoginPage,
    CourseCreationPage,
    MarkdownEditorPage
} from '../../page-objects';

test.describe('Markdown API Integration Tests', () => {
    test('backend correctly processes and returns HTML for markdown content', async ({page}) => {
        // Login as instructor using the page object
        const loginPage = new LoginPage(page);
        await loginPage.navigateTo();
        await loginPage.login(
            TEST_USERS.lead_instructor.username_or_email,
            TEST_USERS.lead_instructor.password
        );

        // Create a course with markdown using page objects
        const courseCreationPage = new CourseCreationPage(page);
        await courseCreationPage.navigateTo();
        await courseCreationPage.waitForPageLoad();

        const title = `API Markdown Test ${Date.now()}`;
        await courseCreationPage.fillTitle(title);

        // Use MarkdownEditorPage for the description
        const markdownEditor = new MarkdownEditorPage(page);
        const markdownContent = MarkdownTestUtils.getTestMarkdownContent();
        await markdownEditor.enterMarkdown(markdownContent);

        // Submit the form
        await courseCreationPage.submitForm();

        // Get the course ID from URL
        const courseId = page.url().split('/').pop();

        // Directly access the course API endpoint to check raw response
        await page.goto(`/api/courses/${courseId}`);

        // Get the JSON response
        const responseText = await page.locator('pre').textContent();
        const courseData = JSON.parse(responseText || '{}');

        // Verify the API returns both markdown and HTML
        expect(courseData.description).toEqual(markdownContent);
        expect(courseData.description_html).toBeDefined();
        expect(courseData.description_html.length).toBeGreaterThan(markdownContent.length);

        // Check that HTML contains expected elements
        expect(courseData.description_html).toContain('<h1>');
        expect(courseData.description_html).toContain('<strong>');
        expect(courseData.description_html).toContain('<ul>');
        expect(courseData.description_html).toContain('<code>');

        // Check that HTML does not contain unsafe elements
        expect(courseData.description_html).not.toContain('<script>');
        expect(courseData.description_html).not.toContain('onclick');
    });

    test('course update preserves markdown formatting', async ({page}) => {
        // Login as instructor using the page object
        const loginPage = new LoginPage(page);
        await loginPage.navigateTo();
        await loginPage.login(
            TEST_USERS.lead_instructor.username_or_email,
            TEST_USERS.lead_instructor.password
        );

        // Create a course with simple markdown using page objects
        const courseCreationPage = new CourseCreationPage(page);
        await courseCreationPage.navigateTo();
        await courseCreationPage.waitForPageLoad();

        const title = `Update Markdown Test ${Date.now()}`;
        await courseCreationPage.fillTitle(title);

        // Use MarkdownEditorPage for the initial simple description
        const markdownEditor = new MarkdownEditorPage(page);
        await markdownEditor.enterMarkdown('# Initial Heading\n\nInitial paragraph.');

        // Submit the form
        await courseCreationPage.submitForm();

        // Get the course ID from URL
        const courseId = page.url().split('/').pop();

        // Go to edit page
        await page.goto(`/instructor/courses/${courseId}/edit`);
        await courseCreationPage.waitForPageLoad();

        // Update with more complex markdown using the page object
        const updatedMarkdown = MarkdownTestUtils.getTestMarkdownContent();
        await markdownEditor.enterMarkdown(updatedMarkdown);
        await courseCreationPage.submitForm();

        // Verify course page shows updated markdown correctly rendered
        await page.goto(`/instructor/courses/${courseId}`);

        // Verify markdown is rendered correctly
        await MarkdownTestUtils.verifyMarkdownRendering(
            page,
            '.course-description',
            {
                headers: true,
                paragraphs: true,
                lists: true,
                codeBlocks: true,
                links: true,
                emphasis: true
            }
        );
    });
});
