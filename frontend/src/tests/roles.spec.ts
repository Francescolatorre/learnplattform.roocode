import { test, expect } from '@playwright/test';
import { Page } from '@playwright/test'; // Import Page and Route types

interface MockUserSession {
  // Interface for MockUserSession class
  page: Page;
  loginAs(role: string): Promise<void>;
  logout(): Promise<void>;
}

// Mock UserSession class
class UserSession implements MockUserSession {
  // Implement MockUserSession interface
  page: Page; // Declare page property with type Page
  constructor(page: Page) {
    // Add type Page to constructor parameter
    this.page = page;
  }

  async loginAs(role: string): Promise<void> {
    // Add type string to role parameter and Promise<void> return type
    // Mock loginAs method
    await this.page.route('**/api/auth/me', async route => {
      // Use this.page and add type Route to route parameter
      await route.fulfill({
        status: 200,
        json: { role },
      });
    });
    await this.page.goto('/dashboard'); // Use this.page
  }

  async logout(): Promise<void> {
    // Add Promise<void> return type
    // Mock logout method
  }
}

// Mock login function and mock user roles
const mockLogin = async (page: Page, role: string) => {
  // Add type Page to page parameter and string to role parameter
  await page.route('**/api/auth/me', async route => {
    // Add type Route to route parameter
    await route.fulfill({
      status: 200,
      json: { role },
    });
  });
  await page.goto('/dashboard'); // Use page parameter
};

test.describe('User Roles and Permissions', () => {
  let userSession: UserSession; // Explicitly type userSession

  test.beforeEach(async ({ page }) => {
    userSession = new UserSession(page); // Use mocked UserSession class
    await userSession.loginAs('student'); // Default login as student
  });

  test('Student role can access student views', async ({ page }) => {
    await mockLogin(page, 'student');
    await page.goto('/dashboard');
    await expect(page.locator('h4:has-text("Dashboard")')).toBeVisible();
    await expect(page.locator('li:has-text("Courses")')).toBeVisible();
    await expect(page.locator('li:has-text("Profile")')).toBeVisible();
  });

  test('Instructor role can access instructor and student views', async ({ page }) => {
    await userSession.loginAs('instructor');
    await mockLogin(page, 'instructor');
    await page.goto('/dashboard');
    await expect(page.locator('h4:has-text("Dashboard")')).toBeVisible();
    await expect(page.locator('li:has-text("Courses")')).toBeVisible();
    await expect(page.locator('li:has-text("Profile")')).toBeVisible();
    await expect(page.locator('li:has-text("Instructor Dashboard")')).toBeVisible();
    await expect(page.locator('li:has-text("Tasks")')).toBeVisible();
  });

  test('Admin role can access all views', async ({ page }) => {
    await userSession.loginAs('admin');
    await mockLogin(page, 'admin');
    await page.goto('/dashboard');
    await expect(page.locator('h4:has-text("Dashboard")')).toBeVisible();
    await expect(page.locator('li:has-text("Courses")')).toBeVisible();
    await expect(page.locator('li:has-text("Profile")')).toBeVisible();
    await expect(page.locator('li:has-text("Instructor Dashboard")')).toBeVisible();
    await expect(page.locator('li:has-text("Tasks")')).toBeVisible();
    await expect(page.locator('li:has-text("Admin Dashboard")')).toBeVisible();
    await expect(page.locator('li:has-text("User Management")')).toBeVisible();
  });

  test('Unauthorized role redirects to login page', async ({ page }) => {
    await userSession.logout();
    await page.goto('/dashboard');
    await page.waitForURL('/login');
    expect(page.url()).toContain('/login');
  });
});
