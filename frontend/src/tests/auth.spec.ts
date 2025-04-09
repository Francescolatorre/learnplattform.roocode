import { test, expect } from '@playwright/test';

import { login } from './setupTests'; // Import the login helper function from the global utility file

// Centralized test configuration
const TEST_USERS = {
  lead_instructor: {
    username_or_email: 'instructor',
    password: 'instructor123',
    expectedRole: 'instructor',
  },
  admin: {
    username_or_email: 'admin',
    password: 'adminpassword',
    expectedRole: 'admin',
  },
  student: {
    username_or_email: 'student',
    password: 'student123',
    expectedRole: 'student',
  },
};

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('lead instructor can login and access dashboard', async ({ page }) => {
    await login(
      page,
      TEST_USERS.lead_instructor.username_or_email,
      TEST_USERS.lead_instructor.password
    );

    // Verify dashboard elements
    const dashboardTitle = await page.textContent('h4');
    expect(dashboardTitle).toContain('Dashboard');
  });

  test('admin user can login and access dashboard', async ({ page }) => {
    await login(page, TEST_USERS.admin.username_or_email, TEST_USERS.admin.password);

    // Verify dashboard elements
    const dashboardTitle = await page.textContent('h4');
    expect(dashboardTitle).toContain('Dashboard');
  });

  test('shows loading state during login', async ({ page }) => {
    await page.fill(
      'input[name="username_or_email"]',
      TEST_USERS.lead_instructor.username_or_email
    );
    await page.fill('input[name="password"]', TEST_USERS.lead_instructor.password);

    // Capture loading state before submission
    const submitButton = page.locator('button[type="submit"]');
    const loadingIndicator = page.locator('.loading-spinner');

    // Trigger login and wait for navigation
    const loginPromise = Promise.all([
      page.waitForNavigation({ timeout: 10000 }),
      submitButton.click(),
    ]);

    // Verify loading state is shown
    await expect(loadingIndicator).toBeVisible({ timeout: 5000 });

    await loginPromise;
  });

  test('displays error with invalid credentials', async ({ page }) => {
    await page.fill('input[name="username_or_email"]', 'invalid_user');
    await page.fill('input[name="password"]', 'wrong_password');

    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    // Wait for and verify error message in helper text
    const helperText = page.locator('.error-message');
    await expect(helperText).toBeVisible({ timeout: 5000 });
    const errorMessage = await helperText.textContent();
    expect(errorMessage).toContain('Login Failed');
  });

  test('token generation and storage', async ({ page }) => {
    await login(
      page,
      TEST_USERS.lead_instructor.username_or_email,
      TEST_USERS.lead_instructor.password
    );

    // Check local storage for tokens
  });

  test('Valid login redirects to dashboard', async ({ page }) => {
    await login(
      page,
      TEST_USERS.lead_instructor.username_or_email,
      TEST_USERS.lead_instructor.password
    );

    // Verify dashboard elements
    const dashboardTitle = await page.textContent('h4');
    expect(dashboardTitle).toContain('Dashboard');
  });

  test('Invalid login shows error message', async ({ page }) => {
    await page.fill('input[name="username_or_email"]', 'invalid_user');
    await page.fill('input[name="password"]', 'wrong_password');

    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    // Wait for and verify error message in helper text
    const helperText = page.locator('.error-message');
    await expect(helperText).toBeVisible({ timeout: 5000 });
    const errorMessage = await helperText.textContent();
    expect(errorMessage).toContain('Login Failed');
  });

  test('Token storage and refresh', async ({ page }) => {
    await login(
      page,
      TEST_USERS.lead_instructor.username_or_email,
      TEST_USERS.lead_instructor.password
    );

    // Check local storage for tokens
  });
});
