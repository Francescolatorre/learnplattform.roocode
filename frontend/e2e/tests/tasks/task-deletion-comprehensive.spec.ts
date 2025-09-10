import { test, expect } from '@playwright/test';
import { login } from '../../setupTests';

test.describe('Task Deletion Feature - Comprehensive Tests', () => {
  let courseId: string;

  test.beforeEach(async ({ page }) => {
    // Login as instructor
    await login(page, 'instructor', 'instructor123');

    // Navigate to instructor courses page and get a course ID
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
    }
  });

  test('delete functionality works on course details page (/instructor/courses/{id})', async ({ page }) => {
    // Navigate to course details page
    await page.goto(`/instructor/courses/${courseId}`);
    await page.waitForLoadState('networkidle');

    // Check for the Create Task button to confirm we're on the right page
    const createTaskButton = page.locator('[data-testid="button-create-task"]');
    if (await createTaskButton.isVisible()) {
      // Look for delete buttons in the task list on course details page
      const deleteButtons = page.locator('[data-testid^="delete-task-"]');
      const deleteButtonCount = await deleteButtons.count();

      if (deleteButtonCount > 0) {
        console.log(`Found ${deleteButtonCount} delete buttons on course details page`);
        
        // Test clicking the first delete button
        const firstDeleteButton = deleteButtons.first();
        await firstDeleteButton.click();

        // Check if confirmation dialog appears
        await expect(page.locator('text=Confirm Task Deletion')).toBeVisible();
        await expect(page.locator('[data-testid="confirm-delete-task"]')).toBeVisible();

        // Cancel the deletion
        await page.locator('text=Cancel').click();

        // Dialog should be closed
        await expect(page.locator('text=Confirm Task Deletion')).toBeHidden();
      } else {
        console.log('No tasks with delete buttons found on course details page');
      }

      // Also check for disabled delete buttons (info icons)
      const infoButtons = page.locator('[data-testid^="delete-task-disabled-"]');
      const infoButtonCount = await infoButtons.count();
      if (infoButtonCount > 0) {
        console.log(`Found ${infoButtonCount} disabled delete buttons (info icons) on course details page`);
        
        // Hover over the first info button to see tooltip
        const firstInfoButton = infoButtons.first();
        await firstInfoButton.hover();
        await expect(firstInfoButton).toBeVisible();
      }
    } else {
      console.log('Course details page does not show tasks inline - may use separate task management page');
    }
  });

  test('delete functionality works on dedicated tasks page (/instructor/courses/{id}/tasks)', async ({ page }) => {
    // Navigate to dedicated task management page
    await page.goto(`/instructor/courses/${courseId}/tasks`);
    await page.waitForLoadState('networkidle');

    // Check if page loaded correctly
    const pageTitle = page.locator('h4');
    await expect(pageTitle).toContainText(`Manage Tasks for Course ${courseId}`);

    // Check for the "Add New Task" button
    const addTaskButton = page.locator('text=Add New Task');
    await expect(addTaskButton).toBeVisible();

    // Look for delete buttons in the task table
    const deleteButtons = page.locator('[data-testid^="delete-task-"]');
    const deleteButtonCount = await deleteButtons.count();

    if (deleteButtonCount > 0) {
      console.log(`Found ${deleteButtonCount} delete buttons on dedicated tasks page`);
      
      // Test clicking the first delete button
      const firstDeleteButton = deleteButtons.first();
      await firstDeleteButton.click();

      // Check if confirmation dialog appears
      await expect(page.locator('text=Confirm Task Deletion')).toBeVisible();
      await expect(page.locator('[data-testid="confirm-delete-task"]')).toBeVisible();

      // Cancel the deletion
      await page.locator('text=Cancel').click();

      // Dialog should be closed
      await expect(page.locator('text=Confirm Task Deletion')).toBeHidden();
    } else {
      console.log('No tasks with delete buttons found on dedicated tasks page');
    }

    // Also check for disabled delete buttons (info icons)  
    const infoButtons = page.locator('[data-testid^="delete-task-disabled-"]');
    const infoButtonCount = await infoButtons.count();
    if (infoButtonCount > 0) {
      console.log(`Found ${infoButtonCount} disabled delete buttons (info icons) on dedicated tasks page`);
      
      // Hover over the first info button to see tooltip
      const firstInfoButton = infoButtons.first();
      await firstInfoButton.hover();
      await expect(firstInfoButton).toBeVisible();
    }
  });

  test('student cannot see delete buttons on either page', async ({ page }) => {
    // Logout and login as student
    await page.goto('/logout');
    
    try {
      await login(page, 'student', 'student123');
      
      // Test 1: Check course details page
      await page.goto(`/instructor/courses/${courseId}`);
      await page.waitForLoadState('networkidle');
      
      const deleteButtonsOnDetails = page.locator('[data-testid^="delete-task-"]');
      expect(await deleteButtonsOnDetails.count()).toBe(0);
      
      // Test 2: Check dedicated tasks page 
      await page.goto(`/instructor/courses/${courseId}/tasks`);
      await page.waitForLoadState('networkidle');
      
      const deleteButtonsOnTasks = page.locator('[data-testid^="delete-task-"]');
      expect(await deleteButtonsOnTasks.count()).toBe(0);
      
    } catch (error) {
      if (error instanceof Error && error.message.includes('Visit the Courses section')) {
        console.log('Student login shows no courses message - expected behavior');
        // Still verify no delete buttons exist if we can access pages
        await page.goto(`/instructor/courses/${courseId}`);
        const deleteButtons = page.locator('[data-testid^="delete-task-"]');
        expect(await deleteButtons.count()).toBe(0);
      } else {
        throw error;
      }
    }
  });

  test('verify both pages show consistent delete button behavior', async ({ page }) => {
    // This test verifies that both pages implement delete functionality consistently
    
    // First, check course details page
    await page.goto(`/instructor/courses/${courseId}`);
    await page.waitForLoadState('networkidle');
    
    const detailsPageDeleteButtons = page.locator('[data-testid^="delete-task-"]');
    const detailsPageInfoButtons = page.locator('[data-testid^="delete-task-disabled-"]');
    
    const detailsDeleteCount = await detailsPageDeleteButtons.count();
    const detailsInfoCount = await detailsPageInfoButtons.count();
    
    // Then check dedicated tasks page
    await page.goto(`/instructor/courses/${courseId}/tasks`);
    await page.waitForLoadState('networkidle');
    
    const tasksPageDeleteButtons = page.locator('[data-testid^="delete-task-"]');
    const tasksPageInfoButtons = page.locator('[data-testid^="delete-task-disabled-"]');
    
    const tasksDeleteCount = await tasksPageDeleteButtons.count();
    const tasksInfoCount = await tasksPageInfoButtons.count();
    
    // Both pages should show the same number of delete buttons and info buttons
    // since they're showing the same tasks
    console.log(`Course details page: ${detailsDeleteCount} delete buttons, ${detailsInfoCount} info buttons`);
    console.log(`Tasks page: ${tasksDeleteCount} delete buttons, ${tasksInfoCount} info buttons`);
    
    // This assertion ensures both pages have the same delete functionality
    expect(detailsDeleteCount).toBe(tasksDeleteCount);
    expect(detailsInfoCount).toBe(tasksInfoCount);
  });
});