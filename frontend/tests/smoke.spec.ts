import { test, expect } from '@playwright/test';

test.describe('Smoke Tests', () => {
  test('Application loads successfully', async ({ page }) => {
    // Navigate to home page
    console.log('Navigating to home page...');
    await page.goto('/');
    
    // Take screenshot
    await page.screenshot({ path: 'home-page.png' });
    
    // Check if we're redirected to login page
    const url = page.url();
    console.log('Current URL:', url);
    
    // Expect the URL to contain /login or /dashboard
    expect(url).toMatch(/\/login|\/dashboard/);
    
    // Check if the page has loaded properly
    const bodyText = await page.textContent('body');
    expect(bodyText).toBeTruthy();
    console.log('Body text length:', bodyText?.length);
  });
  
  test('Login form is accessible', async ({ page }) => {
    // Navigate to login page
    console.log('Navigating to login page...');
    await page.goto('/login');
    
    // Take screenshot
    await page.screenshot({ path: 'login-form.png' });
    
    // Log all HTML for debugging
    const html = await page.content();
    console.log('Page HTML length:', html.length);
    
    // Wait for any form element to be present
    await page.waitForSelector('form, input, button', { timeout: 30000 });
    console.log('Form elements are present on the page');
    
    // Check if there are input fields on the page
    const inputCount = await page.locator('input').count();
    console.log('Number of input fields found:', inputCount);
    expect(inputCount).toBeGreaterThan(0);
    
    // Check if there are buttons on the page
    const buttonCount = await page.locator('button').count();
    console.log('Number of buttons found:', buttonCount);
    expect(buttonCount).toBeGreaterThan(0);
  });
  
  test('Basic login attempt', async ({ page }) => {
    // Navigate to login page
    console.log('Navigating to login page...');
    await page.goto('/login');
    
    // Take screenshot before login attempt
    await page.screenshot({ path: 'login-before.png' });
    
    // Find all input fields and log their attributes
    console.log('Examining input fields...');
    const inputs = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('input')).map(input => ({
        name: input.name,
        id: input.id,
        type: input.type,
        placeholder: input.placeholder
      }));
    });
    console.log('Input fields:', inputs);
    
    // Find username/email input field
    const usernameInput = page.locator('input[type="text"], input[type="email"], input:not([type="password"])').first();
    console.log('Attempting to fill username field...');
    await usernameInput.fill('admin');
    
    // Find password input field
    const passwordInput = page.locator('input[type="password"]').first();
    console.log('Attempting to fill password field...');
    await passwordInput.fill('adminpassword');
    
    // Take screenshot after filling the form
    await page.screenshot({ path: 'login-filled.png' });
    
    // Find and click submit button
    const submitButton = page.locator('button[type="submit"], button').first();
    console.log('Clicking submit button...');
    await submitButton.click();
    
    // Wait for navigation or error
    try {
      await page.waitForNavigation({ timeout: 30000 });
      console.log('Navigation occurred after login');
    } catch (e) {
      console.log('No navigation occurred after login attempt');
    }
    
    // Take screenshot after login attempt
    await page.screenshot({ path: 'login-after.png' });
    
    // Log current URL
    const currentUrl = page.url();
    console.log('Current URL after login attempt:', currentUrl);
  });
});