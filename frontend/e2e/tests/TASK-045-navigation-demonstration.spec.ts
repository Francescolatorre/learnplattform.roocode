import { test, expect } from '@playwright/test';

test.describe('TASK-045: Student Task Navigation Fix Demonstration', () => {
  test('demonstrate task navigation fix - component resolves correctly', async ({ page }) => {
    console.log('TASK-045 DEMONSTRATION: Testing component resolution fix');

    // Test the actual route that was broken
    await page.goto('/tasks/1');
    await page.waitForLoadState('networkidle');

    // The bug was: students were redirected to /profile instead of seeing task content
    // After fix: should stay on /tasks/1 and show task content or appropriate error

    console.log('Current URL after navigation:', page.url());

    // CRITICAL: Should NOT be redirected to profile (the bug)
    expect(page.url()).not.toContain('/profile');
    console.log('✅ SUCCESS: No redirect to profile page (bug fixed)');

    // Should stay on task route
    expect(page.url()).toContain('/tasks/1');
    console.log('✅ SUCCESS: Stayed on task route');

    // Component should render (either task content or proper error message)
    const hasTaskTitle = (await page.locator('h4').count()) > 0;
    const hasError = (await page.locator('text=Error:').count()) > 0;
    const hasLoading = (await page.locator('text=Loading').count()) > 0;

    // One of these should be present (proves component rendered)
    expect(hasTaskTitle || hasError || hasLoading).toBe(true);
    console.log('✅ SUCCESS: LearningTaskViewPage component rendered properly');

    if (hasTaskTitle) {
      console.log('📋 Task content loaded successfully');
    } else if (hasError) {
      console.log('⚠️  Error message displayed (expected behavior for non-existent task)');
    } else if (hasLoading) {
      console.log('⏳ Loading state displayed');
    }

    // Take screenshot for PR evidence
    await page.screenshot({
      path: 'test-results/task-045-fix-demonstration.png',
      fullPage: true,
    });

    console.log('📸 Screenshot saved for PR documentation');
  });

  test('verify component import/export fix', async ({ page }) => {
    console.log('TASK-045: Verifying component import/export resolution');

    // The root cause was: AppRoutes imported LearningTaskViewPage but component exported TaskViewPage
    // This test verifies the component loads without JavaScript errors

    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Navigate to any task route
    await page.goto('/tasks/999'); // Non-existent task for consistent behavior
    await page.waitForLoadState('networkidle');

    // Wait a moment for any JavaScript errors to surface
    await page.waitForTimeout(1000);

    // Filter out unrelated errors (network, favicon, etc.)
    const componentErrors = errors.filter(
      error =>
        error.includes('LearningTaskViewPage') ||
        error.includes('TaskViewPage') ||
        error.includes('Cannot read properties of undefined') ||
        error.includes('is not a function')
    );

    console.log('Component-related errors:', componentErrors);

    // Should have no component import/export errors
    expect(componentErrors).toHaveLength(0);
    console.log('✅ SUCCESS: No component import/export errors');

    // Should render error page (not crash)
    const hasContent = await page.locator('body').textContent();
    expect(hasContent).toBeTruthy();
    console.log('✅ SUCCESS: Page rendered without crashing');
  });
});
