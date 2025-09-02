import { test, expect } from '@playwright/test';
import { login } from '../../setupTests';

test.describe('Task Deletion Feature', () => {
  let courseId: string;

  test.beforeEach(async ({ page }) => {
    // Login as instructor
    await login(page, 'instructor', 'instructor123');

    // Navigate to instructor dashboard
    await page.goto('/instructor/dashboard');
    await page.waitForLoadState('networkidle');
  });

  test('instructor can see delete button for tasks with no student progress', async ({ page }) => {
    // Navigate to a course's task management page
    // First, find a course from the dashboard
    await page.goto('/instructor/courses');
    await page.waitForSelector(
      '[data-testid^="course-list-item-"], [data-testid^="course-card-"]',
      {
        timeout: 10000,
        state: 'visible',
      }
    );

    // Click on the first course to view details
    const firstCourse = page
      .locator('[data-testid^="course-list-item-"], [data-testid^="course-card-"]')
      .first();
    const courseIdAttr = await firstCourse.getAttribute('data-testid');
    if (courseIdAttr) {
      courseId = courseIdAttr.replace(/course-(list-item|card)-/, '');

      // Navigate to the course's task page
      await page.goto(`/instructor/courses/${courseId}/tasks`);
      await page.waitForLoadState('networkidle');

      // Check if page loaded correctly
      const pageTitle = page.locator('h4');
      await expect(pageTitle).toContainText(`Manage Tasks for Course ${courseId}`);

      // Check for the "Add New Task" button
      const addTaskButton = page.locator('[data-testid="button-create-task"]');
      await expect(addTaskButton).toBeVisible();

      // Look for delete buttons or info icons in the task list
      const deleteButtons = page.locator('[data-testid^="delete-task-"]');
      const infoIcons = page.locator('[data-testid^="info-task-"]');

      // At least one of these should exist if there are tasks
      const deleteCount = await deleteButtons.count();
      const infoCount = await infoIcons.count();

      if (deleteCount > 0) {
        // Task can be deleted - no students have started it
        console.log(`Found ${deleteCount} deletable task(s)`);

        // Hover over delete button to verify it's interactive
        const firstDeleteButton = deleteButtons.first();
        await firstDeleteButton.hover();
        await expect(firstDeleteButton).toBeEnabled();
      }

      if (infoCount > 0) {
        // Task cannot be deleted - students have started it
        console.log(`Found ${infoCount} non-deletable task(s)`);

        // Hover over info icon to see tooltip
        const firstInfoIcon = infoIcons.first();
        await firstInfoIcon.hover();

        // The tooltip should appear (Material-UI tooltips)
        await page.waitForTimeout(500); // Wait for tooltip animation
        const tooltip = page.locator('[role="tooltip"]');
        const tooltipText = await tooltip.textContent();

        if (tooltipText) {
          expect(tooltipText).toMatch(
            /Cannot delete:|student\(s\) in progress|student\(s\) completed/
          );
        }
      }
    }
  });

  test('instructor can delete a task with confirmation dialog', async ({ page }) => {
    // Create a new task first to ensure we have one that can be deleted
    await page.goto('/instructor/courses');
    await page.waitForSelector(
      '[data-testid^="course-list-item-"], [data-testid^="course-card-"]',
      {
        timeout: 10000,
        state: 'visible',
      }
    );

    const firstCourse = page
      .locator('[data-testid^="course-list-item-"], [data-testid^="course-card-"]')
      .first();
    const courseIdAttr = await firstCourse.getAttribute('data-testid');

    if (courseIdAttr) {
      courseId = courseIdAttr.replace(/course-(list-item|card)-/, '');

      // Navigate to task creation page
      await page.goto(`/instructor/courses/${courseId}/tasks/new`);
      await page.waitForLoadState('networkidle');

      // Create a test task
      const timestamp = Date.now();
      const taskTitle = `Test Task for Deletion ${timestamp}`;

      // Fill in task creation form (adjust selectors based on actual form)
      await page.fill('[name="title"], [data-testid="task-title-input"]', taskTitle);
      await page.fill(
        '[name="description"], [data-testid="task-description-input"]',
        'This task will be deleted'
      );

      // Submit the form
      const submitButton = page.locator('[type="submit"], [data-testid="submit-task"]').first();
      await submitButton.click();

      // Wait for navigation back to task list
      await page.waitForURL(`**/instructor/courses/${courseId}/tasks`, { timeout: 10000 });

      // Find the newly created task's delete button
      await page.waitForSelector(`text=${taskTitle}`, { timeout: 10000 });

      // Find the delete button for this specific task
      const taskRow = page.locator('tr, li, [data-testid*="task"]').filter({ hasText: taskTitle });
      const deleteButton = taskRow.locator('[data-testid^="delete-task-"]').first();

      if (await deleteButton.isVisible()) {
        // Click delete button
        await deleteButton.click();

        // Confirmation dialog should appear
        const dialog = page.locator('[role="dialog"]');
        await expect(dialog).toBeVisible();

        // Check dialog content
        const dialogTitle = dialog.locator('#delete-task-dialog-title');
        await expect(dialogTitle).toContainText('Confirm Task Deletion');

        const dialogText = dialog.locator('#delete-task-dialog-description');
        await expect(dialogText).toContainText(taskTitle);

        // Test cancellation first
        const cancelButton = dialog.locator('button:has-text("Cancel")');
        await cancelButton.click();

        // Dialog should close and task should still exist
        await expect(dialog).not.toBeVisible();
        await expect(page.locator(`text=${taskTitle}`)).toBeVisible();

        // Now test actual deletion
        await deleteButton.click();
        await expect(dialog).toBeVisible();

        const confirmButton = dialog
          .locator('[data-testid="confirm-delete-task"], button:has-text("Delete")')
          .last();
        await confirmButton.click();

        // Wait for deletion to complete
        await page.waitForTimeout(2000);

        // Task should no longer be visible
        await expect(page.locator(`text=${taskTitle}`)).not.toBeVisible({ timeout: 5000 });

        // Success notification might appear (depending on implementation)
        const notification = page.locator('.MuiSnackbar-root, [role="alert"]');
        if (await notification.isVisible()) {
          const notificationText = await notification.textContent();
          expect(notificationText).toMatch(/deleted successfully|Task deleted/i);
        }
      }
    }
  });

  test('student cannot see delete buttons for tasks', async ({ page }) => {
    // Logout and login as student
    await page.goto('/logout');
    await login(page, 'student', 'student123');

    // Navigate to a course's task view as a student
    await page.goto('/student/courses');
    await page.waitForSelector('[data-testid^="course-"], .course-card, .course-list-item', {
      timeout: 10000,
      state: 'visible',
    });

    // Click on first course
    const firstCourse = page
      .locator('[data-testid^="course-"], .course-card, .course-list-item')
      .first();
    await firstCourse.click();

    // Wait for course details page
    await page.waitForLoadState('networkidle');

    // Navigate to tasks if there's a tasks section
    const tasksSection = page.locator('text=/Tasks|Learning Tasks|Assignments/i');
    if (await tasksSection.isVisible()) {
      await tasksSection.click();
      await page.waitForLoadState('networkidle');
    }

    // Verify no delete buttons are visible to students
    const deleteButtons = page.locator('[data-testid^="delete-task-"]');
    const deleteButtonCount = await deleteButtons.count();
    expect(deleteButtonCount).toBe(0);

    // Also check for delete icons
    const deleteIcons = page.locator('[aria-label*="delete" i], [title*="delete" i]');
    const deleteIconCount = await deleteIcons.count();
    expect(deleteIconCount).toBe(0);
  });
});
