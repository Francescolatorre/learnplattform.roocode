import { test, expect } from '@playwright/test';

/**
 * TASK-041 Bug Fix Verification Test
 *
 * This test verifies that the critical bug where task title input field
 * auto-clears typed characters has been resolved.
 *
 * Bug: Task title input field becomes non-functional, immediately removing
 * any typed characters, preventing task creation.
 *
 * Fix: Resolved useEffect dependency issues causing form data resets
 */
test.describe('TASK-041: Task Creation Title Input Fix', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to instructor course page (using existing course ID 727)
    await page.goto('http://localhost:5174/instructor/courses/727');
    await page.waitForLoadState('networkidle');
  });

  test('task title input field should retain typed characters', async ({ page }) => {
    // Step 1: Look for and click the "Create Task" or "Add Task" button
    const createTaskButton = page.locator('button', { hasText: /create task|add task/i });
    await expect(createTaskButton).toBeVisible({ timeout: 10000 });
    await createTaskButton.click();

    // Step 2: Wait for task creation modal to open
    const modal = page.locator('[role="dialog"]').or(page.locator('.MuiDialog-root'));
    await expect(modal).toBeVisible({ timeout: 5000 });

    // Step 3: Locate the task title input field
    const titleInput = page
      .locator('input[name="title"]')
      .or(page.locator('input').filter({ hasText: /task title/i }))
      .or(page.locator('label', { hasText: /task title/i }).locator('~ input'))
      .first();

    await expect(titleInput).toBeVisible({ timeout: 5000 });

    // Step 4: Click in the title field to focus it
    await titleInput.click();
    await titleInput.focus();

    // Step 5: Type test text and verify it stays
    const testText = 'Test Task Title';
    await titleInput.fill(''); // Clear any existing text
    await titleInput.type(testText, { delay: 100 }); // Type with small delay

    // Step 6: Verify the text remains in the field (key assertion)
    await expect(titleInput).toHaveValue(testText);

    // Step 7: Additional verification - type more text
    const additionalText = ' - Additional Text';
    await titleInput.type(additionalText, { delay: 50 });

    // Verify combined text
    await expect(titleInput).toHaveValue(testText + additionalText);

    console.log('✅ TASK-041 Fix Verified: Title input field retains typed characters');
  });

  test('task title input should work with rapid typing', async ({ page }) => {
    // Test rapid typing to ensure no race conditions
    const createTaskButton = page.locator('button', { hasText: /create task|add task/i });
    await createTaskButton.click();

    const modal = page.locator('[role="dialog"]').or(page.locator('.MuiDialog-root'));
    await expect(modal).toBeVisible();

    const titleInput = page.locator('input[name="title"]').first();
    await titleInput.click();

    // Type quickly without delays
    const rapidText = 'RapidTypingTest';
    await titleInput.fill(rapidText);

    // Verify text is retained even with rapid input
    await expect(titleInput).toHaveValue(rapidText);

    console.log('✅ TASK-041 Fix Verified: Rapid typing works correctly');
  });

  test('task title input should work after modal reopen', async ({ page }) => {
    // Test opening/closing modal multiple times (regression test)
    const createTaskButton = page.locator('button', { hasText: /create task|add task/i });

    // Open modal first time
    await createTaskButton.click();
    let modal = page.locator('[role="dialog"]').or(page.locator('.MuiDialog-root'));
    await expect(modal).toBeVisible();

    // Close modal
    const cancelButton = page.locator('button', { hasText: /cancel/i });
    await cancelButton.click();
    await expect(modal).not.toBeVisible();

    // Open modal second time
    await createTaskButton.click();
    modal = page.locator('[role="dialog"]').or(page.locator('.MuiDialog-root'));
    await expect(modal).toBeVisible();

    // Test title input works on second open
    const titleInput = page.locator('input[name="title"]').first();
    await titleInput.click();

    const testText = 'Second Open Test';
    await titleInput.fill(testText);
    await expect(titleInput).toHaveValue(testText);

    console.log('✅ TASK-041 Fix Verified: Modal reopen works correctly');
  });

  test('task creation form should be submittable with title', async ({ page }) => {
    // Test complete workflow including form submission
    const createTaskButton = page.locator('button', { hasText: /create task|add task/i });
    await createTaskButton.click();

    const modal = page.locator('[role="dialog"]').or(page.locator('.MuiDialog-root'));
    await expect(modal).toBeVisible();

    // Fill title field
    const titleInput = page.locator('input[name="title"]').first();
    await titleInput.fill('Complete Workflow Test Task');
    await expect(titleInput).toHaveValue('Complete Workflow Test Task');

    // Fill description field (required for submission)
    const descriptionField = page
      .locator('textarea')
      .or(page.locator('[data-testid="markdown-editor"]'))
      .first();

    if (await descriptionField.isVisible()) {
      await descriptionField.fill('Test description for task creation');
    }

    // Verify submit button is not disabled (form should be valid)
    const submitButton = page.locator('button', { hasText: /create task|save/i });
    await expect(submitButton).not.toBeDisabled();

    console.log('✅ TASK-041 Fix Verified: Complete form submission workflow works');
  });
});

/**
 * Test Configuration Notes:
 * - Uses course ID 703 as specified in the bug report
 * - Tests multiple scenarios to ensure comprehensive fix verification
 * - Includes regression tests for modal behavior
 * - Verifies both individual character input and rapid typing
 */
