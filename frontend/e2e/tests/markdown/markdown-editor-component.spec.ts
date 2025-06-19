import { test, expect } from '@playwright/test';
import { MarkdownTestUtils } from '../../utils/markdown-test-utils';
import { loginAsInstructor } from '../../utils/auth-helpers';
import { TEST_USERS } from '../../setupTests';
import { LoginPage, CourseCreationPage } from '../../page-objects';
import { CourseMarkdownEditorPage } from '../../page-objects/CourseMarkdownEditorPage';

test.describe('Markdown Editor Component', () => {
  test('markdown editor toggles between write and preview modes', async ({ page }) => {
    // Login as instructor
    const loginPage = new LoginPage(page);
    await loginPage.navigateTo();
    await loginPage.login(TEST_USERS.lead_instructor.username, TEST_USERS.lead_instructor.password);

    // Navigate to course creation page where we can test the editor
    const courseCreationPage = new CourseCreationPage(page);
    await courseCreationPage.navigateTo();
    await courseCreationPage.waitForPageLoad();

    // Initialize markdown editor and wait for it to be ready
    const markdownEditor = new CourseMarkdownEditorPage(page);
    await markdownEditor.waitForEditor();

    // Verify initial write mode with explicit wait
    await expect(async () => {
      expect(await markdownEditor.isInWriteMode()).toBeTruthy();
    }).toPass({ timeout: 10000 });

    // Enter test content with verification
    const markdownContent = MarkdownTestUtils.getTestMarkdownContent();
    await markdownEditor.enterMarkdown(markdownContent);
    const initialContent = await markdownEditor.getContent();
    expect(initialContent).toContain('# Test heading');

    // Switch to preview mode with explicit wait
    await markdownEditor.switchToPreview();
    await expect(async () => {
      expect(await markdownEditor.isInPreviewMode()).toBeTruthy();
    }).toPass({ timeout: 10000 });

    // Verify preview content using MarkdownTestUtils with detailed checks
    const result = await MarkdownTestUtils.verifyMarkdownRendering(page);
    expect(result.hasMarkdownElements).toBeTruthy();

    // Verify specific markdown elements are rendered
    const { elementCounts } = result;
    expect(elementCounts.headings, 'Should have headings').toBeGreaterThanOrEqual(2);
    expect(elementCounts.lists, 'Should have list items').toBeGreaterThanOrEqual(1);
    expect(elementCounts.code, 'Should have code block').toBeGreaterThanOrEqual(1);
    expect(elementCounts.links, 'Should have links').toBeGreaterThanOrEqual(1);

    // Switch back to write mode with verification
    await markdownEditor.switchToWrite();
    await expect(async () => {
      expect(await markdownEditor.isInWriteMode()).toBeTruthy();
    }).toPass({ timeout: 10000 });

    // Verify content is preserved after mode switching
    const finalContent = await markdownEditor.getContent();
    expect(finalContent).toBe(initialContent);
  });
});
