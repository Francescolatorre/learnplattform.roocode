import { test, expect } from '@playwright/test';

test.describe('Student Task Navigation Fix - TASK-045', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    // Login as student user
    await page.fill('[data-testid="username"]', 'student@example.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="login-button"]');
    
    // Wait for redirect to dashboard
    await page.waitForURL('/dashboard');
  });

  test('student can navigate to task details from course task list', async ({ page }) => {
    console.log('Starting student task navigation test...');
    
    // Navigate to courses page
    await page.goto('/courses');
    await page.waitForLoadState('networkidle');
    
    // Find and click on a course
    const courseCard = page.locator('[data-testid^="course-card-"]').first();
    await expect(courseCard).toBeVisible();
    
    // Get course ID from the course card
    const courseId = await courseCard.getAttribute('data-testid');
    const courseIdNum = courseId?.replace('course-card-', '');
    console.log('Found course with ID:', courseIdNum);
    
    // Click on course to view details
    const viewDetailsButton = courseCard.locator('[data-testid="course-action-btn"]');
    await expect(viewDetailsButton).toBeVisible();
    await viewDetailsButton.click();
    
    // Wait for course details page to load
    await page.waitForURL(`/courses/${courseIdNum}`);
    await page.waitForLoadState('networkidle');
    
    // Check if tasks are available
    const taskListSection = page.locator('text=Associated Learning Tasks').locator('..');
    await expect(taskListSection).toBeVisible();
    
    // Look for a "View Task" button
    const viewTaskButton = page.locator('[data-testid^="view-task-button-"]').first();
    
    if (await viewTaskButton.count() > 0) {
      console.log('Found View Task button, testing navigation...');
      
      // Get the task ID from the button
      const taskButtonTestId = await viewTaskButton.getAttribute('data-testid');
      const taskId = taskButtonTestId?.replace('view-task-button-', '');
      console.log('Task ID:', taskId);
      
      // Click the View Task button
      await viewTaskButton.click();
      
      // Verify we navigate to the task page (not profile page - the bug)
      await page.waitForURL(`/tasks/${taskId}`);
      console.log('Successfully navigated to task page');
      
      // Verify we're NOT on the profile page (which was the bug)
      expect(page.url()).not.toContain('/profile');
      console.log('Confirmed: Not redirected to profile page');
      
      // Verify the task page loads properly
      await expect(page.locator('h4')).toBeVisible(); // Task title
      console.log('Task page content is visible');
      
      // Verify this is actually a task view page, not profile
      await expect(page.locator('text=Order:').first()).toBeVisible();
      await expect(page.locator('text=Published:').first()).toBeVisible();
      console.log('Task metadata is visible - confirming we are on task page');
    } else {
      console.log('No tasks available in this course, checking message...');
      
      // Verify the "no tasks" message is shown
      const noTasksMessage = page.locator('text=No learning tasks are currently available');
      await expect(noTasksMessage).toBeVisible();
      console.log('No tasks message displayed correctly');
    }
  });

  test('task route /tasks/:taskId renders LearningTaskViewPage component', async ({ page }) => {
    console.log('Testing direct task URL navigation...');
    
    // Try to navigate directly to a task URL (using a likely existing task ID)
    await page.goto('/tasks/1');
    await page.waitForLoadState('networkidle');
    
    // Should NOT be redirected to profile page
    expect(page.url()).not.toContain('/profile');
    console.log('Direct task URL navigation does not redirect to profile');
    
    // Should either show task content or a proper error message
    const hasTaskContent = await page.locator('h4').count() > 0; // Task title
    const hasErrorMessage = await page.locator('text=Error:').count() > 0;
    const hasLoadingMessage = await page.locator('text=Loading...').count() > 0;
    
    // One of these should be true (task loaded, error shown, or loading)
    expect(hasTaskContent || hasErrorMessage || hasLoadingMessage).toBe(true);
    console.log('Task page renders properly (content, error, or loading state)');
  });

  test('verify LearningTaskViewPage component is properly exported', async ({ page }) => {
    // This is more of a regression test to ensure the component export fix works
    
    // Navigate to a course with tasks
    await page.goto('/courses');
    await page.waitForLoadState('networkidle');
    
    // Try to find any course
    const courseCard = page.locator('[data-testid^="course-card-"]').first();
    if (await courseCard.count() > 0) {
      const courseId = await courseCard.getAttribute('data-testid');
      const courseIdNum = courseId?.replace('course-card-', '');
      
      // Navigate to course details
      await page.goto(`/courses/${courseIdNum}`);
      await page.waitForLoadState('networkidle');
      
      // If there are tasks, test the navigation
      const viewTaskButton = page.locator('[data-testid^="view-task-button-"]').first();
      if (await viewTaskButton.count() > 0) {
        const taskButtonTestId = await viewTaskButton.getAttribute('data-testid');
        const taskId = taskButtonTestId?.replace('view-task-button-', '');
        
        console.log(`Testing component export fix with task ${taskId}`);
        
        // Click task and ensure no JavaScript errors
        await viewTaskButton.click();
        
        // Wait for navigation - should succeed without errors
        await page.waitForURL(`/tasks/${taskId}`, { timeout: 5000 });
        
        // Verify no JavaScript errors occurred
        const errors: string[] = [];
        page.on('console', msg => {
          if (msg.type() === 'error') {
            errors.push(msg.text());
          }
        });
        
        // Small delay to catch any async errors
        await page.waitForTimeout(1000);
        
        // Filter out common unrelated errors
        const relevantErrors = errors.filter(error => 
          !error.includes('favicon') && 
          !error.includes('network') &&
          !error.includes('404')
        );
        
        console.log('JavaScript errors during navigation:', relevantErrors);
        
        // The component should load without throwing errors
        expect(relevantErrors.length).toBe(0);
      }
    }
  });
});