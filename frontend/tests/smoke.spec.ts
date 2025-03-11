import { test, expect } from '@playwright/test';

test.describe('Smoke Tests', () => {
  test('Application loads successfully', async ({ page }) => {
    // Navigate to home page
    console.log('Navigating to home page...');
    await page.goto('/');
    await page.screenshot({ path: 'home-page.png' });
    const url = page.url();
    console.log('Current URL:', url);
    expect(url).toMatch(/\/login|\/dashboard/);
    const bodyText = await page.textContent('body');
    expect(bodyText).toBeTruthy();
    console.log('Body text length:', bodyText?.length);
  });

  test('Login form is accessible', async ({ page }) => {
    // Navigate to login page
    console.log('Navigating to login page...');
    await page.goto('/login');
    console.log('Page content:', await page.content()); // Added logging
    await page.screenshot({ path: 'login-form.png' });
    const html = await page.content();
    console.log('Page HTML:', html);
    await page.waitForSelector('form, input, button', { timeout: 30000 });
    console.log('Form elements are present on the page');
    const inputCount = await page.locator('input').count();
    console.log('Number of input fields found:', inputCount);
    expect(inputCount).toBeGreaterThan(0);
    const buttonCount = await page.locator('button').count();
    console.log('Number of buttons found:', buttonCount);
    expect(buttonCount).toBeGreaterThan(0);
  });

  test('Basic login attempt', async ({ page }) => {
    // Navigate to login page
    console.log('Navigating to login page...');
    await page.goto('/login');
    await page.screenshot({ path: 'login-before.png' });
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
    const usernameInput = page.locator('input[type="text"], input[type="email"], input:not([type="password"])').first();
    console.log('Attempting to fill username field...');
    await usernameInput.fill('admin');
    const passwordInput = page.locator('input[type="password"]').first();
    console.log('Attempting to fill password field...');
    await passwordInput.fill('adminpassword');
    await page.screenshot({ path: 'login-filled.png' });
    const submitButton = page.locator('button[type="submit"], button').first();
    console.log('Clicking submit button...');
    await submitButton.click();
    try {
      await page.waitForNavigation({ timeout: 30000 });
      console.log('Navigation occurred after login');
    } catch (e) {
      console.log('No navigation occurred after login attempt');
    }
    await page.screenshot({ path: 'login-after.png' });
    const currentUrl = page.url();
    console.log('Current URL after login attempt:', currentUrl);
  });
});
