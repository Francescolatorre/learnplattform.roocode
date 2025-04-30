import {test, expect} from '@playwright/test';

import {login, TEST_USERS} from '../setupTests'; // Adjusted the path to correctly locate the setupTests file



test.describe('Authentication', () => {
  test.beforeEach(async ({page}) => {
    await page.goto('/login');
  });

  test('lead instructor can login and access dashboard', async ({page}) => {
    await login(
      page,
      TEST_USERS.lead_instructor.username_or_email,
      TEST_USERS.lead_instructor.password
    );
    // login() already waits for /instructor/dashboard
    expect(page.url()).toContain('/instructor/dashboard');
  });

  test('admin user can login and access dashboard', async ({page}) => {
    await login(page, TEST_USERS.admin.username_or_email, TEST_USERS.admin.password);
    // login() already waits for /instructor/dashboard
    expect(page.url()).toContain('/admin/dashboard');
  });

  test('shows loading state during login', async ({page}) => {
    await page.fill(
      'input[data-testid="login-username-input"]',
      TEST_USERS.lead_instructor.username_or_email
    );
    await page.fill('input[data-testid="login-password-input"]', TEST_USERS.lead_instructor.password);

    // Capture loading state before submission
    const submitButton = page.locator('button[type="submit"]');
    const loadingIndicator = page.locator('button[data-testid="login-submit-button"] [role="progressbar"]');

    // Trigger login and wait for navigation
    const loginPromise = Promise.all([
      page.waitForNavigation({timeout: 10000}),
      submitButton.click(),
    ]);

    // Verify loading state is shown
    await expect(loadingIndicator).toBeVisible({timeout: 5000});

    await loginPromise;
  });

  test('displays error with invalid credentials', async ({page}) => {
    await page.fill('input[data-testid="login-username-input"]', 'invalid_user');
    await page.fill('input[data-testid="login-password-input"]', 'wrong_password');

    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    // Wait for the centralized error notification to appear
    // This checks for the error notification from the ErrorNotifier component
    const errorNotification = await page.waitForSelector('.MuiAlert-standardError, .MuiSnackbar-root', {timeout: 5000});
    expect(await errorNotification.isVisible()).toBeTruthy();

    // Verify the error message content
    const errorMessage = await errorNotification.textContent();
    expect(errorMessage).toMatch(/login failed|invalid credentials|error/i);
  });

  test('token generation and storage', async ({page}) => {
    await login(
      page,
      TEST_USERS.lead_instructor.username_or_email,
      TEST_USERS.lead_instructor.password
    );

    // Check local storage for tokens
  });

  test('Valid login redirects to dashboard', async ({page}) => {
    await login(
      page,
      TEST_USERS.lead_instructor.username_or_email,
      TEST_USERS.lead_instructor.password
    );
    // login() already waits for the appropriate dashboard path
    expect(page.url()).toContain('/instructor/dashboard');
  });

  // Duplicate of "displays error with invalid credentials" above; removed for clarity.

  test('Token storage and refresh', async ({page}) => {
    await login(
      page,
      TEST_USERS.lead_instructor.username_or_email,
      TEST_USERS.lead_instructor.password
    );

    // Check local storage for tokens
  });
});
