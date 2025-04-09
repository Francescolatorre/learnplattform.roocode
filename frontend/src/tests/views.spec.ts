import { test, expect } from '@playwright/test';

import { login } from './setupTests'; // Import the login helper function

// Mock login credentials
const TEST_EMAIL = 'lead_instructor';
const TEST_PASSWORD = 'testpass123';

test.describe('Frontend Views', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, TEST_EMAIL, TEST_PASSWORD);
  });

  test('Dashboard view renders correctly', async ({ page }) => {
    await page.goto('/dashboard');
    const dashboardTitle = await page.locator('h4:has-text("Dashboard")').textContent();
    expect(dashboardTitle).toContain('Dashboard');
  });

  test('Profile view renders correctly', async ({ page }) => {
    await page.goto('/profile');
    const profileTitle = await page.locator('h4:has-text("User Profile")').textContent();
    expect(profileTitle).toContain('User Profile');
  });

  test('Courses view renders correctly', async ({ page }) => {
    await page.goto('/courses');
    const coursesTitle = await page.locator('h4:has-text("My Courses")').textContent();
    expect(coursesTitle).toContain('My Courses');
  });

  test('Unauthorized access redirects to login', async ({ page }) => {
    const protectedRoutes = ['/dashboard', '/profile', '/courses'];
    for (const route of protectedRoutes) {
      await page.goto(route);
      await page.waitForURL('/login', { timeout: 5000 });
      expect(page.url()).toContain('/login');
    }
  });
});
