import { test, expect } from '@playwright/test';
import path from 'path';

import { TEST_USERS, login } from '../setupTests';

const ROUTE_CONFIG = {
  loginPath: '/login',
  dashboardPaths: {
    student: '/dashboard',
    instructor: '/instructor/dashboard',
    admin: '/admin/dashboard',
    guest: '/login',
  },
};

test.describe('Smoke Tests', () => {
  test('Application loads and redirects to login', async ({ page }) => {
    await page.goto('/');
    // Wait for navigation to complete
    await page.waitForURL(url => url.pathname === ROUTE_CONFIG.loginPath, {
      timeout: 5000,
    });
    const url = page.url();
    expect(url).toContain(ROUTE_CONFIG.loginPath);
  });

  test('Login form is accessible', async ({ page }) => {
    await page.goto(ROUTE_CONFIG.loginPath);
    await page.waitForSelector('form');
    const inputCount = await page.locator('input').count();
    expect(inputCount).toBeGreaterThan(0);
    const buttonCount = await page.locator('button').count();
    expect(buttonCount).toBeGreaterThan(0);
  });

  test('Basic login attempt with admin role', async ({ page }) => {
    // Use the login helper function and TEST_USERS configuration
    await login(page, TEST_USERS.admin.username, TEST_USERS.admin.password);

    // Wait for navigation to admin dashboard
    await page.waitForURL(url => url.pathname === ROUTE_CONFIG.dashboardPaths.admin, {
      timeout: 10000,
    });

    const currentUrl = page.url();
    expect(currentUrl).toContain(ROUTE_CONFIG.dashboardPaths.admin);
  });
});
