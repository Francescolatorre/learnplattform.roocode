import {test, expect} from '@playwright/test';

import {TEST_USERS, login} from './setupTests';

test.describe('Smoke Tests', () => {
  test('Application loads successfully', async ({page}) => {
    await page.goto('/');
    const url = page.url();
    expect(url).toMatch(/\/login|\/dashboard/);
    const bodyText = await page.textContent('body');
    expect(bodyText).toBeTruthy();
  });

  test('Login form is accessible', async ({page}) => {
    await page.goto('/login');
    await page.waitForSelector('form');
    const inputCount = await page.locator('input').count();
    expect(inputCount).toBeGreaterThan(0);
    const buttonCount = await page.locator('button').count();
    expect(buttonCount).toBeGreaterThan(0);
  });

  test('Basic login attempt', async ({page}) => {
    // Use the login helper function and TEST_USERS configuration
    await login(page, TEST_USERS.admin.username_or_email, TEST_USERS.admin.password);

    // Verify successful login
    await page.waitForURL('/profile', {timeout: 10000});
    const currentUrl = page.url();
    expect(currentUrl).toContain('/profile');
  });
});
