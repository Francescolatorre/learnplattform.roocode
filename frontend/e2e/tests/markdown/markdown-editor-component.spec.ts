import {test, expect} from '@playwright/test';
import {MarkdownTestUtils} from '../../utils/markdown-test-utils';
import {loginAsInstructor} from '../../utils/auth-helpers';
import {TEST_USERS} from '../../setupTests';
import {
    LoginPage,
    CourseCreationPage,
    MarkdownEditorPage
} from '../../page-objects';

test.describe('Markdown Editor Component', () => {
    test('markdown editor toggles between write and preview modes', async ({page}) => {
        // Login as instructor using the page object
        const loginPage = new LoginPage(page);
        await loginPage.navigateTo();
        await loginPage.login(
            TEST_USERS.lead_instructor.username,
            TEST_USERS.lead_instructor.password
        );

        // Navigate to course creation page using the page object
        const courseCreationPage = new CourseCreationPage(page);
        await courseCreationPage.navigateTo();
        await courseCreationPage.waitForPageLoad();

        // Use the MarkdownEditor page object to interact with the editor
        const markdownEditor = new MarkdownEditorPage(page);
        const markdownContent = MarkdownTestUtils.getTestMarkdownContent();
        await markdownEditor.enterMarkdown(markdownContent);

        // Initially we should be in write mode - verify using data-testid
        await expect(page.locator('[data-testid="markdown-editor-textarea"]')).toBeVisible();

        // Use the page object to switch to preview mode
        await markdownEditor.switchToPreview();

        // Now we should see the preview and not the textarea - verify with data-testid
        await expect(page.locator('[data-testid="markdown-editor-textarea"]')).not.toBeVisible();
        await expect(page.locator('[data-testid="markdown-preview-container"]')).toBeVisible();

        // Check markdown elements are properly rendered
        await MarkdownTestUtils.verifyMarkdownRendering(
            page,
            '[data-testid="markdown-preview-container"]',
            {
                headers: true,
                paragraphs: true,
                lists: true,
                codeBlocks: true,
                links: true,
                emphasis: true
            }
        );

        // Use the page object to switch back to edit mode
        await markdownEditor.switchToEdit();

        // We should be back in write mode - verify with data-testid
        await expect(page.locator('[data-testid="markdown-editor-textarea"]')).toBeVisible();
    });

    test('markdown help dialog shows formatting reference', async ({page}) => {
        // Login as instructor using the page object
        const loginPage = new LoginPage(page);
        await loginPage.navigateTo();
        await loginPage.login(
            TEST_USERS.lead_instructor.username,
            TEST_USERS.lead_instructor.password
        );

        // Navigate to course creation page using the page object
        const courseCreationPage = new CourseCreationPage(page);
        await courseCreationPage.navigateTo();
        await courseCreationPage.waitForPageLoad();

        // Use the MarkdownEditor page object to open the help dialog
        const markdownEditor = new MarkdownEditorPage(page);
        await markdownEditor.openHelpDialog();

        // Verify help dialog is shown using data-testid
        await expect(page.locator('[data-testid="markdown-help-dialog"]')).toBeVisible();

        // Verify it contains help sections using specific data-testid selectors
        await expect(page.locator('[data-testid="markdown-help-headers"]')).toBeVisible();
        await expect(page.locator('[data-testid="markdown-help-emphasis"]')).toBeVisible();
        await expect(page.locator('[data-testid="markdown-help-lists"]')).toBeVisible();
        await expect(page.locator('[data-testid="markdown-help-links"]')).toBeVisible();
        await expect(page.locator('[data-testid="markdown-help-code"]')).toBeVisible();

        // Check if it contains code examples using data-testid
        await expect(page.locator('[data-testid="markdown-help-headers-example"]')).toBeVisible();

        // Close dialog using the page object
        await markdownEditor.closeHelpDialog();

        // Verify dialog is closed
        await expect(page.locator('[data-testid="markdown-help-dialog"]')).not.toBeVisible();
    });
});
