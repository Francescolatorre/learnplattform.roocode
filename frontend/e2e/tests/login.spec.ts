import { test, expect } from '@playwright/test';

import { TEST_USERS, waitForGlobalLoadingToDisappear } from '../setupTests';

test.describe('Login Functionality', () => {
  test('should log in successfully with valid credentials', async ({ page }) => {
    await page.goto('/login');

    // Fill in the login form with credentials from the centralized configuration
    await page.fill('input[data-testid="login-username-input"]', TEST_USERS.student.username);
    await page.fill('input[data-testid="login-password-input"]', TEST_USERS.student.password);

    // Submit the form
    await page.click('button[type="submit"]');

    // Wait for navigation or a success indicator
    await page.waitForURL('/dashboard');
    await waitForGlobalLoadingToDisappear(page);

    // Assert that the user is logged in
    // Check for the dashboard page title
    const dashboardTitle = await page.textContent('h4');
    expect(dashboardTitle).toContain('Dashboard');
  });

  test('should show an error message for invalid credentials', async ({ page }) => {
    await page.goto('/login');

    // Fill in the login form with invalid credentials
    await page.fill('input[data-testid="login-username-input"]', 'invaliduser');
    await page.fill('input[data-testid="login-password-input"]', 'wrongpassword');

    // Submit the form
    await page.click('button[type="submit"]');

    // Check for the centralized error notification using multiple possible selectors
    // to account for different implementation details
    const errorNotification = await page.waitForSelector(
      [
        '[role="alert"]',
        '[data-testid^="notification-error"]',
        '.MuiAlert-standardError',
        '.MuiAlert-filledError',
        '.error-message',
        '.MuiSnackbar-root .MuiAlert-root',
      ].join(', '),
      {
        timeout: 5000,
      }
    );

    expect(await errorNotification.isVisible()).toBeTruthy();

    // Check the error message content
    const errorMessage = await errorNotification.textContent();
    expect(errorMessage).toMatch(/login failed|invalid credentials|error/i);
  });
});
