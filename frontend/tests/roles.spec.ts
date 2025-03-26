import { test, expect, Page } from '@playwright/test';

/**
 * Test user credentials for different roles
 */
const USERS = {
  admin: {
    username: 'admin',
    password: 'adminpassword',
    role: 'admin'
  },
  instructor: {
    username: 'instructor',
    password: 'instructor123',
    role: 'instructor'
  },
  student: {
    username: 'student',
    password: 'student123',
    role: 'student'
  }
};

/**
 * Helper class for role-based testing
 */
class UserSession {
  readonly page: Page;
  readonly role: string;
  readonly user: typeof USERS.admin;

  constructor(page: Page, user: typeof USERS.admin) {
    this.page = page;
    this.user = user;
    this.role = user.role;
  }

  /**
   * Login as the user
   */
  async login() {
    // Navigate to login page
    console.log(`Navigating to login page...`);
    await this.page.goto('/login');

    // Take screenshot for debugging
    await this.page.screenshot({ path: `login-page-${this.role}.png` });

    // Log all form elements for debugging
    try {
      const inputs = await this.page.evaluate(() => {
        const inputElements = Array.from(document.querySelectorAll('input'));
        return inputElements.map(input => ({
          name: input.name,
          id: input.id,
          type: input.type,
          placeholder: input.placeholder
        }));
      });
      console.log('Available inputs on login page:', inputs);
    } catch (e) {
      console.error('Failed to get input elements:', e);
    }

    // Get information about the submit button
    try {
      const buttonInfo = await this.page.evaluate(() => {
        const buttonElements = Array.from(document.querySelectorAll('button'));
        return buttonElements.map(button => ({
          text: button.textContent?.trim(),
          type: button.type,
          disabled: button.disabled
        }));
      });
      console.log('Available buttons:', buttonInfo);
    } catch (e) {
      console.error('Failed to get button elements:', e);
    }

    // Try different selector strategies for login form
    console.log(`Attempting to fill username: ${this.user.username}`);

    // Wait for form elements with increased timeout
    await this.page.waitForSelector('input[name="username"], input[name="username_or_email"], [data-testid="username-input"]',
      { timeout: 30000 });

    // Fill in login form with various potential selectors
    try {
      await this.page.fill('input[name="username"], input[name="username_or_email"], [data-testid="username-input"]',
        this.user.username);
      console.log('Username field filled successfully');
    } catch (e) {
      console.error('Failed to fill username field:', e);
      throw e;
    }

    try {
      await this.page.fill('input[name="password"], [data-testid="password-input"]',
        this.user.password);
      console.log('Password field filled successfully');
    } catch (e) {
      console.error('Failed to fill password field:', e);
      throw e;
    }

    // Take screenshot before clicking login
    await this.page.screenshot({ path: `login-form-filled-${this.role}.png` });

    // Click login button with robust selector
    const loginButton = this.page.locator('button[type="submit"], [data-testid="login-button"], button:has-text("Sign In"), button:has-text("Login")');

    console.log('Clicking login button...');
    await loginButton.click();

    // Wait for navigation with increased timeout
    console.log('Waiting for navigation after login...');
    try {
      await this.page.waitForNavigation({ timeout: 30000 });
      console.log('Navigation completed');
    } catch (e) {
      console.error('Navigation timeout error:', e);

      // Check where we ended up
      const currentUrl = this.page.url();
      console.log('Current URL after failed navigation:', currentUrl);

      // Take screenshot to see current state
      await this.page.screenshot({ path: `login-failed-${this.role}.png` });
      throw e;
    }

    // Verify we're on the dashboard and take screenshot
    console.log('Verifying dashboard URL...');
    await this.page.waitForURL('**/dashboard', { timeout: 30000 });
    console.log('Successfully reached dashboard');
    await this.page.screenshot({ path: `dashboard-${this.role}.png` });
  }

  /**
   * Navigate to courses page
   */
  async navigateToCourses() {
    // Navigate to courses page
    await this.page.click('text=Courses');
    await this.page.waitForURL('**/courses');
  }

  /**
   * Navigate to the first course in the list
   */
  async navigateToFirstCourse() {
    await this.navigateToCourses();

    // Wait for course cards to be visible
    await this.page.waitForSelector('[data-testid="course-card"], .MuiCard-root', { timeout: 10000 });

    // Click the first course card
    const courses = await this.page.$$('[data-testid="course-card"], .MuiCard-root');
    if (courses.length > 0) {
      await courses[0].click();
      // Wait for course detail page to load
      await this.page.waitForSelector('h4:has-text("Edit Course"), h4:has-text("Course Details")');
    } else {
      throw new Error('No courses found');
    }
  }

  /**
   * Logout from the application
   */
  async logout() {
    // Click user menu
    await this.page.click('[data-testid="user-menu"], .user-menu, button:has(.MuiAvatar-root)');

    // Click logout option
    await Promise.all([
      this.page.waitForNavigation(),
      this.page.click('text=Logout, button:has-text("Logout")')
    ]);

    // Verify redirect to login page
    await this.page.waitForURL('**/login');
  }
}

test.describe('Role-based access tests', () => {
  test('Admin can view and edit courses', async ({ page }) => {
    // ...existing code...
  });

  test('Instructor can view courses but not manage users', async ({ page }) => {
    // ...existing code...
  });

  test('Student can view enrolled courses but not edit', async ({ page }) => {
    // ...existing code...
  });
});

test.describe('Cross-cutting concerns', () => {
  test('Permissions are respected across different user roles', async ({ page }) => {
    const adminSession = new UserSession(page, USERS.admin);
    await adminSession.login();

    // Admin creates a course
    await adminSession.navigateToCourses();

    // Log out admin
    await adminSession.logout();

    // Login as student
    const studentSession = new UserSession(page, USERS.student);
    await studentSession.login();

    // Navigate to courses
    await studentSession.navigateToCourses();

    // Student should not see admin controls
    await expect(page.locator('button:has-text("Create Course")')).toHaveCount(0);

    // Logout student
    await studentSession.logout();

    // Login as instructor
    const instructorSession = new UserSession(page, USERS.instructor);
    await instructorSession.login();

    // Instructor should see some admin controls but not all
    await instructorSession.navigateToCourses();
    await expect(page.locator('button:has-text("Create Course")')).toBeVisible();
  });

  test('Authentication state persists across page navigation', async ({ page }) => {
    const adminSession = new UserSession(page, USERS.admin);
    await adminSession.login();

    // Navigate to different pages
    await adminSession.navigateToCourses();

    // Go to profile
    await page.click('text=Profile, a:has-text("Profile")');
    await page.waitForURL('**/profile');

    // Go back to dashboard
    await page.click('text=Dashboard, a:has-text("Dashboard")');
    await page.waitForURL('**/dashboard');

    // User should still be logged in
    await expect(page.locator('text=Dashboard')).toBeVisible();
  });
});
