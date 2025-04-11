import {test, expect} from '@playwright/test';
import {TEST_USERS, UserSession} from './setupTests';

test.describe('User Roles and Permissions', () => {
  let userSession: UserSession;

  test.beforeEach(async ({page}) => {
    userSession = new UserSession(page);
  });

  test('Student role can access student views', async ({page}) => {
    await userSession.loginAs('student');

    await page.goto('/dashboard');
    await expect(page.locator('h4:has-text("Dashboard")')).toBeVisible();
    await expect(page.locator('li:has-text("Courses")')).toBeVisible();
    await expect(page.locator('li:has-text("Profile")')).toBeVisible();
  });

  test('Instructor role can access instructor and student views', async ({page}) => {
    await userSession.loginAs('instructor');
    await page.goto('/dashboard');
    await expect(page.locator('h4:has-text("Dashboard")')).toBeVisible();
    await expect(page.locator('li:has-text("Courses")')).toBeVisible();
    await expect(page.locator('li:has-text("Profile")')).toBeVisible();
    await expect(page.locator('li:has-text("Instructor Dashboard")')).toBeVisible();
    await expect(page.locator('li:has-text("Tasks")')).toBeVisible();
  });

  test('Admin role can access all views', async ({page}) => {
    await userSession.loginAs('admin');
    await page.goto('/dashboard');
    await expect(page.locator('h4:has-text("Dashboard")')).toBeVisible();
    await expect(page.locator('li:has-text("Courses")')).toBeVisible();
    await expect(page.locator('li:has-text("Profile")')).toBeVisible();
    await expect(page.locator('li:has-text("Instructor Dashboard")')).toBeVisible();
    await expect(page.locator('li:has-text("Tasks")')).toBeVisible();
    await expect(page.locator('li:has-text("Admin Dashboard")')).toBeVisible();
    await expect(page.locator('li:has-text("User Management")')).toBeVisible();
  });

  test('Unauthorized role redirects to login page', async ({page}) => {
    await userSession.logout();
    await page.goto('/dashboard');
    await page.waitForURL('/login');
    expect(page.url()).toContain('/login');
  });
});
