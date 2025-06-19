import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { ensureAuthenticated, takeScreenshot, isUserAuthenticated } from '../setupTests';

/**
 * Navigation helper for E2E testing
 * Handles navigation through the application UI rather than direct URL entry
 * Simulates natural user interaction with the navigation menu
 */
export class NavigationHelper extends BasePage {
  // Main navigation selectors
  readonly appBarSelector = 'header, .MuiAppBar-root, [data-testid="main-navigation"]';

  // Desktop navigation selectors
  readonly desktopNavSelectors = {
    coursesButton:
      'header button:has-text("Courses"), .MuiAppBar-root button:has-text("Courses"), [data-testid="nav-courses"]',
    dashboardButton:
      'header button:has-text("Dashboard"), .MuiAppBar-root button:has-text("Dashboard"), [data-testid="nav-dashboard"]',
    profileButton:
      'header button:has-text("Profile"), .MuiAppBar-root button:has-text("Profile"), [data-testid="nav-profile"]',
    instructorButton:
      'header button:has-text("Instructor"), .MuiAppBar-root button:has-text("Instructor"), [data-testid="nav-instructor"]',
    adminButton:
      'header button:has-text("Admin"), .MuiAppBar-root button:has-text("Admin"), [data-testid="nav-admin"]',
    loginButton:
      'header button:has-text("Login"), .MuiAppBar-root button:has-text("Login"), [data-testid="nav-login"]',
    registerButton:
      'header button:has-text("Register"), .MuiAppBar-root button:has-text("Register"), [data-testid="nav-register"]',
    logoutButton:
      'header button:has-text("Logout"), .MuiAppBar-root button:has-text("Logout"), [data-testid="nav-logout"]',
  };

  // Mobile drawer navigation selectors
  readonly mobileNavSelectors = {
    menuButton:
      '.MuiIconButton-root[aria-label="open drawer"], button:has(.MuiSvgIcon-root), [data-testid="menu-button"]',
    drawer: '.MuiDrawer-root, [role="presentation"]',
    coursesItem:
      '.MuiDrawer-root [role="presentation"] a:has-text("Courses"), .MuiDrawer-paper a:has-text("Courses")',
    dashboardItem:
      '.MuiDrawer-root [role="presentation"] a:has-text("Dashboard"), .MuiDrawer-paper a:has-text("Dashboard")',
    profileItem:
      '.MuiDrawer-root [role="presentation"] a:has-text("Profile"), .MuiDrawer-paper a:has-text("Profile")',
    instructorItem:
      '.MuiDrawer-root [role="presentation"] a:has-text("Instructor"), .MuiDrawer-paper a:has-text("Instructor")',
    adminItem:
      '.MuiDrawer-root [role="presentation"] a:has-text("Admin"), .MuiDrawer-paper a:has-text("Admin")',
    logoutItem:
      '.MuiDrawer-root [role="presentation"] li:has-text("Logout"), .MuiDrawer-paper li:has-text("Logout")',
  };

  // Auth status tracking
  private authenticated = false;
  private authVerified = false;
  private userRole: string | null = null;

  constructor(page: Page) {
    super(page, '/');
  }

  /**
   * Sets the user role for this navigation session
   * This allows the helper to re-authenticate as the correct role if needed
   */
  setUserRole(role: string): void {
    this.userRole = role;
    console.log(`Set navigation helper user role to: ${role}`);
  }

  /**
   * Verify authentication is working properly by checking for role chips in the UI
   * This ensures we can properly navigate through protected areas of the app
   */
  async verifyAuthentication(): Promise<boolean> {
    if (this.authVerified && this.authenticated) {
      return this.authenticated;
    }

    try {
      // Check for role chips or other authentication indicators in the UI
      const isAuthenticated = await isUserAuthenticated(this.page);

      if (isAuthenticated) {
        console.log('Authentication verified via role chip detection');
        this.authenticated = true;
        this.authVerified = true;
      } else {
        console.log('No authentication indicators found in the UI');
        this.authenticated = false;
        this.authVerified = true;

        // If we have a role set, try to authenticate as that role
        if (this.userRole) {
          await ensureAuthenticated(this.page, this.userRole);
          // Re-check authentication after login attempt
          this.authenticated = await isUserAuthenticated(this.page);
        }
      }

      return this.authenticated;
    } catch (error) {
      console.warn('Authentication verification failed:', error);
      this.authenticated = false;
      this.authVerified = true;
      return false;
    }
  }

  /**
   * Ensure proper authentication before navigation to avoid unauthorized errors
   */
  async ensureAuthenticated(): Promise<void> {
    const isAuthenticated = await this.verifyAuthentication();

    if (!isAuthenticated) {
      // If on login page, we need to log in first
      const currentUrl = this.page.url();
      if (currentUrl.includes('/login')) {
        throw new Error('Not authenticated. Please log in before attempting navigation.');
      }

      console.warn('User appears to be not authenticated. Taking screenshot for debugging.');
      await takeScreenshot(this.page, 'auth-verification-failed');

      if (this.userRole) {
        console.log(`Attempting to authenticate as ${this.userRole}`);
        await ensureAuthenticated(this.page, this.userRole);

        // Check if authentication was successful
        const success = await isUserAuthenticated(this.page);
        if (!success) {
          throw new Error(
            `Authentication as ${this.userRole} failed. Cannot proceed with navigation.`
          );
        }
        this.authenticated = true;
      } else {
        throw new Error(
          'Authentication verification failed. Cannot navigate when unauthenticated.'
        );
      }
    }
  }

  /**
   * Determine if we're in mobile view by checking if the menu button is visible
   */
  async isMobileView(): Promise<boolean> {
    return await this.page
      .locator(this.mobileNavSelectors.menuButton)
      .isVisible()
      .catch(() => false);
  }

  /**
   * Navigate to courses via the navigation menu
   */
  async navigateToCourses(): Promise<void> {
    await this.ensureAuthenticated();
    await this.clickNavigationItem('courses');
    await this.waitForPathChange('/courses');
    console.log('Navigated to Courses via menu');
  }

  /**
   * Navigate to dashboard via the navigation menu
   */
  async navigateToDashboard(): Promise<void> {
    await this.ensureAuthenticated();
    await this.clickNavigationItem('dashboard');
    // Dashboard path can vary by role (student/instructor/admin)
    await this.waitForPathContains('dashboard');
    console.log('Navigated to Dashboard via menu');
  }

  /**
   * Navigate to profile via the navigation menu
   */
  async navigateToProfile(): Promise<void> {
    await this.ensureAuthenticated();
    await this.clickNavigationItem('profile');
    await this.waitForPathChange('/profile');
    console.log('Navigated to Profile via menu');
  }

  /**
   * Navigate to instructor dashboard via the navigation menu
   */
  async navigateToInstructor(): Promise<void> {
    await this.ensureAuthenticated();
    await this.clickNavigationItem('instructor');
    await this.waitForPathContains('/instructor');
    console.log('Navigated to Instructor via menu');
  }

  /**
   * Navigate to instructor courses via the navigation menu
   */
  async navigateToInstructorCourses(): Promise<void> {
    await this.ensureAuthenticated();
    await this.clickNavigationItem('instructor');
    // Wait for navigation to complete
    await this.waitForPathContains('/instructor');

    // Look for Courses submenu or navigate directly to courses
    const coursesLink = this.page
      .locator('a:has-text("Courses"), [href*="courses"], button:has-text("Courses")')
      .first();
    if (await coursesLink.isVisible().catch(() => false)) {
      await coursesLink.click();
      await this.waitForPathContains('/instructor/courses');
    }

    console.log('Navigated to Instructor Courses via menu');
  }

  /**
   * Navigate to admin dashboard via the navigation menu
   */
  async navigateToAdmin(): Promise<void> {
    await this.ensureAuthenticated();
    await this.clickNavigationItem('admin');
    await this.waitForPathContains('/admin');
    console.log('Navigated to Admin via menu');
  }

  /**
   * Logout via the navigation menu
   */
  async logout(): Promise<void> {
    const isMobile = await this.isMobileView();

    try {
      if (isMobile) {
        // Open mobile menu first
        await this.page.locator(this.mobileNavSelectors.menuButton).click();
        await this.page.waitForTimeout(500); // Wait for drawer animation

        // Click logout from drawer
        await this.page.locator(this.mobileNavSelectors.logoutItem).click();
      } else {
        // Click logout button in desktop view
        await this.page.locator(this.desktopNavSelectors.logoutButton).click();
      }

      // Wait for logout to complete (redirect to login page)
      await this.waitForPathChange('/login');

      // Clear our authentication status
      this.authenticated = false;
      this.authVerified = true;

      console.log('Logged out successfully via menu');
    } catch (error) {
      console.error('Failed to logout via menu:', error);
      await this.takeScreenshot('logout-failure');
      throw error;
    }
  }

  /**
   * Click on a navigation item supporting both mobile and desktop views
   */
  private async clickNavigationItem(
    item: 'courses' | 'dashboard' | 'profile' | 'instructor' | 'admin'
  ): Promise<void> {
    const isMobile = await this.isMobileView();

    try {
      if (isMobile) {
        // Click the menu button to open the drawer
        await this.page.locator(this.mobileNavSelectors.menuButton).click();
        await this.page.waitForTimeout(500); // Wait for drawer animation

        // Click the appropriate item in the mobile drawer
        switch (item) {
          case 'courses':
            await this.page.locator(this.mobileNavSelectors.coursesItem).click();
            break;
          case 'dashboard':
            await this.page.locator(this.mobileNavSelectors.dashboardItem).click();
            break;
          case 'profile':
            await this.page.locator(this.mobileNavSelectors.profileItem).click();
            break;
          case 'instructor':
            await this.page.locator(this.mobileNavSelectors.instructorItem).click();
            break;
          case 'admin':
            await this.page.locator(this.mobileNavSelectors.adminItem).click();
            break;
        }
      } else {
        // Click the appropriate button in desktop view
        switch (item) {
          case 'courses':
            await this.page.locator(this.desktopNavSelectors.coursesButton).click();
            break;
          case 'dashboard':
            await this.page.locator(this.desktopNavSelectors.dashboardButton).click();
            break;
          case 'profile':
            await this.page.locator(this.desktopNavSelectors.profileButton).click();
            break;
          case 'instructor':
            await this.page.locator(this.desktopNavSelectors.instructorButton).click();
            break;
          case 'admin':
            await this.page.locator(this.desktopNavSelectors.adminButton).click();
            break;
        }
      }
    } catch (error) {
      console.error(`Failed to click navigation item '${item}':`, error);
      await this.takeScreenshot(`nav-click-failure-${item}`);
      throw error;
    }
  }

  /**
   * Wait for URL path to change to the specified path
   */
  private async waitForPathChange(expectedPath: string): Promise<void> {
    await this.page.waitForURL(
      url => {
        const pathname = url.pathname;
        return pathname === expectedPath;
      },
      { timeout: 10000 }
    );
  }

  /**
   * Wait for URL path to contain the specified string
   */
  private async waitForPathContains(pathFragment: string): Promise<void> {
    await this.page.waitForURL(
      url => {
        const pathname = url.pathname;
        return pathname.includes(pathFragment);
      },
      { timeout: 10000 }
    );
  }
}
