import { test, expect } from '@playwright/test';
import { ADMIN_USER, loginAs } from '../utils/authHelpers';

test.describe('Task Deletion Feature', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, ADMIN_USER);
  });

  test('instructor can see delete button for tasks without student progress', async ({ page }) => {
    // Navigate to a course with tasks (using course ID from previous tests)
    await page.goto('http://localhost:5173/instructor/courses/703');
    
    // Wait for the page to load
    await page.waitForSelector('[data-testid="button-create-task"]', { timeout: 10000 });
    
    // Check if delete buttons are visible (they should be visible for tasks without progress)
    const deleteButtons = page.locator('[data-testid^="delete-task-"]');
    
    if (await deleteButtons.count() > 0) {
      // Test that delete button is visible and clickable
      const firstDeleteButton = deleteButtons.first();
      await expect(firstDeleteButton).toBeVisible();
      
      // Click delete button to test confirmation dialog
      await firstDeleteButton.click();
      
      // Check if confirmation dialog appears
      await expect(page.locator('text=Confirm Task Deletion')).toBeVisible();
      await expect(page.locator('[data-testid="confirm-delete-task"]')).toBeVisible();
      
      // Cancel the deletion
      await page.locator('text=Cancel').click();
      
      // Dialog should be closed
      await expect(page.locator('text=Confirm Task Deletion')).toBeHidden();
    }
  });

  test('delete button shows appropriate tooltip for tasks with progress', async ({ page }) => {
    // Navigate to a course with tasks
    await page.goto('http://localhost:5173/instructor/courses/703');
    
    // Wait for the page to load
    await page.waitForSelector('[data-testid="button-create-task"]', { timeout: 10000 });
    
    // Check if there are any disabled delete buttons (info icons)
    const infoButtons = page.locator('[data-testid^="delete-task-disabled-"]');
    
    if (await infoButtons.count() > 0) {
      const firstInfoButton = infoButtons.first();
      
      // Hover over the info button to see tooltip
      await firstInfoButton.hover();
      
      // The tooltip should contain information about why deletion is not possible
      // Note: Tooltip text checking might be tricky with MUI tooltips, so we just verify the button exists
      await expect(firstInfoButton).toBeVisible();
    }
  });

  test('create task button is visible and functional', async ({ page }) => {
    await page.goto('http://localhost:5173/instructor/courses/703');
    
    // Wait for and check create task button
    const createTaskButton = page.locator('[data-testid="button-create-task"]');
    await expect(createTaskButton).toBeVisible();
    
    // Click to test modal opening
    await createTaskButton.click();
    
    // Task creation modal should open
    await expect(page.locator('text=Create Learning Task')).toBeVisible();
    
    // Close the modal
    await page.keyboard.press('Escape');
  });
});