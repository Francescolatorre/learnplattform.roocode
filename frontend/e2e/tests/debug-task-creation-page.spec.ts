import { test, expect } from '@playwright/test';

/**
 * Debug Test: Check what's actually on the instructor courses page
 */
test.describe('Debug: Instructor Courses Page Content', () => {
  test('check page content and available buttons', async ({ page }) => {
    // Navigate to instructor course page
    await page.goto('http://localhost:5174/instructor/courses/727');
    await page.waitForLoadState('networkidle');
    
    // Take a screenshot to see what's there
    await page.screenshot({ path: 'debug-instructor-page.png', fullPage: true });
    
    // Log page title
    const title = await page.title();
    console.log('Page title:', title);
    
    // Log current URL
    const url = page.url();
    console.log('Current URL:', url);
    
    // Find all buttons on the page
    const buttons = await page.locator('button').all();
    console.log(`Found ${buttons.length} buttons on page`);
    
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      const text = await button.textContent().catch(() => '');
      const isVisible = await button.isVisible().catch(() => false);
      console.log(`Button ${i + 1}: "${text}" (visible: ${isVisible})`);
    }
    
    // Check if there's any text containing "task" or "create"
    const taskRelatedText = await page.locator('text=/task|create/i').all();
    console.log(`Found ${taskRelatedText.length} elements with task/create text`);
    
    for (let i = 0; i < taskRelatedText.length; i++) {
      const element = taskRelatedText[i];
      const text = await element.textContent().catch(() => '');
      console.log(`Task-related text ${i + 1}: "${text}"`);
    }
    
    // Check if we need to be logged in
    const loginText = await page.locator('text=/login|sign in/i').first().textContent().catch(() => null);
    if (loginText) {
      console.log('⚠️  Login required - found login-related text:', loginText);
    }
    
    // Check for common error messages
    const errorText = await page.locator('text=/error|not found|404/i').first().textContent().catch(() => null);
    if (errorText) {
      console.log('❌ Error detected:', errorText);
    }
  });
});