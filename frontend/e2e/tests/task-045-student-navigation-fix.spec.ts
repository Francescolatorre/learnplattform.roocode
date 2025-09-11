import { test, expect } from '@playwright/test';
import { login } from '../setupTests';

test.describe('TASK-045: Student Task Navigation Fix', () => {
  test('student can successfully navigate from course to individual task details', async ({
    page,
  }) => {
    // Test configuration for video recording
    test.setTimeout(60000);

    console.log('🎬 Starting TASK-045 E2E Test with Video Recording');

    // Step 1: Login as student
    console.log('📝 Step 1: Login as student');
    await login(page, 'student', 'student123');

    // Verify we're logged in by checking for dashboard/navigation elements
    await page.waitForSelector('nav, [data-testid*="nav"], [data-testid*="menu"]', {
      timeout: 10000,
      state: 'visible',
    });

    // Step 2: Navigate to courses
    console.log('📝 Step 2: Navigate to student courses');
    await page.goto('http://localhost:5173/courses');
    await page.waitForLoadState('networkidle');

    // Take screenshot for documentation
    await page.screenshot({
      path: `test-results/task-045-step2-courses-page-${Date.now()}.png`,
    });

    // Step 3: Find and click on first available course
    console.log('📝 Step 3: Select a course');
    await page.waitForSelector('[data-testid^="course-"], .course-card, .course-item', {
      timeout: 15000,
      state: 'visible',
    });

    const courseElements = await page.locator(
      '[data-testid^="course-"], .course-card, .course-item'
    );
    const firstCourse = courseElements.first();

    // Get course info for logging
    const courseText = await firstCourse.textContent();
    console.log(`📚 Found course: ${courseText?.substring(0, 50)}...`);

    await firstCourse.click();
    await page.waitForLoadState('networkidle');

    // Step 4: Verify we're on course details page and look for tasks
    console.log('📝 Step 4: Verify course details page and find tasks');
    await page.waitForSelector('h1, h2, h3, h4, [data-testid*="course-title"]', {
      timeout: 10000,
    });

    // Take screenshot of course details
    await page.screenshot({
      path: `test-results/task-045-step4-course-details-${Date.now()}.png`,
    });

    // Step 5: Look for tasks section - wait for it to load
    console.log('📝 Step 5: Locate learning tasks section');

    // Wait for tasks section to appear (might take time to load)
    try {
      await page.waitForSelector('[data-testid*="task"], .task-', {
        timeout: 15000,
        state: 'visible',
      });
      console.log('✅ Tasks section found');
    } catch (error) {
      console.log('⚠️  Tasks section not immediately visible, checking for enrollment requirement');

      // Check if we need to enroll first
      const enrollButton = page.locator('button:has-text("Enroll"), [data-testid*="enroll"]');
      if (await enrollButton.isVisible()) {
        console.log('📝 Step 5a: Enrolling in course first');
        await enrollButton.click();
        await page.waitForTimeout(2000); // Wait for enrollment to process

        // Wait for tasks to appear after enrollment
        await page.waitForSelector('[data-testid*="task"], .task-', {
          timeout: 10000,
          state: 'visible',
        });
        console.log('✅ Tasks section found after enrollment');
      }
    }

    // Step 6: Find and click "View Task" button - this is the critical test!
    console.log('📝 Step 6: CRITICAL TEST - Click "View Task" button');

    // Look for the "View Task" button that was previously broken
    const viewTaskButtons = page.locator(
      'button:has-text("View Task"), [data-testid*="view-task"]'
    );
    await expect(viewTaskButtons.first()).toBeVisible({ timeout: 10000 });

    const firstViewTaskButton = viewTaskButtons.first();

    // Get the task name for logging
    const taskContainer = firstViewTaskButton.locator('..').locator('..');
    const taskName = await taskContainer.textContent();
    console.log(`🎯 About to click "View Task" for: ${taskName?.substring(0, 50)}...`);

    // Take screenshot before clicking
    await page.screenshot({
      path: `test-results/task-045-step6-before-click-${Date.now()}.png`,
    });

    // THIS IS THE CRITICAL MOMENT - Click "View Task"
    // Before our fix: This would fail with 404
    // After our fix: This should navigate to task details
    await firstViewTaskButton.click();

    // Step 7: VERIFICATION - Task details page should load
    console.log('📝 Step 7: CRITICAL VERIFICATION - Task details page loads');

    // Wait for navigation to complete
    await page.waitForLoadState('networkidle');

    // Verify we're on the task details page (/tasks/{taskId})
    await expect(page).toHaveURL(/\/tasks\/\d+/);
    console.log(`✅ URL matches task pattern: ${page.url()}`);

    // Verify task details content is visible
    await page.waitForSelector('h1, h2, h3, h4', { timeout: 10000 });

    // Task details should be visible
    const taskTitle = page.locator('h1, h2, h3, h4').first();
    await expect(taskTitle).toBeVisible();

    const title = await taskTitle.textContent();
    console.log(`✅ Task details loaded: "${title}"`);

    // Take final success screenshot
    await page.screenshot({
      path: `test-results/task-045-SUCCESS-task-details-${Date.now()}.png`,
    });

    // Step 8: Final verification - check for expected content
    console.log('📝 Step 8: Verify task details content structure');

    // Should have task description or content area
    const hasContent = (await page.locator('p, div').count()) > 5; // Should have substantial content
    expect(hasContent).toBe(true);

    console.log('🎉 TASK-045 E2E TEST PASSED SUCCESSFULLY!');
    console.log('✅ Student task navigation is now working correctly');
    console.log('✅ The missing /tasks/:taskId route has been fixed');
  });

  test('verify task details page accessibility and content', async ({ page }) => {
    // Additional test to verify the task details page works properly
    console.log('🎬 Testing direct task details page access');

    // Login first
    await login(page, 'student', 'student123');

    // Try to access a task directly by URL
    await page.goto('http://localhost:5173/tasks/1');
    await page.waitForLoadState('networkidle');

    // Should not get 404 or error page
    const errorIndicators = page.locator(
      'h1:has-text("404"), h1:has-text("Not Found"), h1:has-text("Error")'
    );
    const hasError = (await errorIndicators.count()) > 0;
    expect(hasError).toBe(false);

    console.log('✅ Direct task URL access works (no 404 error)');
  });
});
