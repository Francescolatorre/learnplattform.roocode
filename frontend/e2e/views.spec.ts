import {test, expect} from '@playwright/test';

import {login, TEST_USERS, waitForGlobalLoadingToDisappear} from './setupTests'; // Import the login helper function and TEST_USERS

test.describe('Frontend Views', () => {
  test('Dashboard view renders correctly', async ({page}) => {
    // Log in first
    const instructor = TEST_USERS.lead_instructor;
    await login(page, instructor.username_or_email, instructor.password);

    await page.goto('/dashboard');
    await waitForGlobalLoadingToDisappear(page);
    const dashboardTitle = await page.locator('h4:has-text("Dashboard")').textContent();
    expect(dashboardTitle).toContain('Dashboard');
  });

  test('Profile view renders correctly', async ({page}) => {
    // Log in first
    const instructor = TEST_USERS.lead_instructor;
    await login(page, instructor.username_or_email, instructor.password);

    await page.goto('/profile');
    await waitForGlobalLoadingToDisappear(page);
    const profileTitle = await page.locator('h4:has-text("User Profile")').textContent();
    expect(profileTitle).toContain('User Profile');
  });

  test('Courses view renders correctly', async ({page}) => {
    // Log in first
    const instructor = TEST_USERS.lead_instructor;
    await login(page, instructor.username_or_email, instructor.password);

    await page.goto('/courses');
    await waitForGlobalLoadingToDisappear(page);
    const coursesTitle = await page.locator('h4:has-text("Tasks for:")').textContent();
    expect(coursesTitle).toContain('Tasks for:');
  });

  test('Unauthorized access redirects to login', async ({page}) => {
    // Clear cookies to ensure we're logged out
    await page.context().clearCookies();

    const protectedRoutes = ['/dashboard', '/profile', '/courses'];
    for (const route of protectedRoutes) {
      await page.goto(route);
      await waitForGlobalLoadingToDisappear(page);
      await page.waitForURL('/login', {timeout: 5000});
      expect(page.url()).toContain('/login');
    }
  });
});
