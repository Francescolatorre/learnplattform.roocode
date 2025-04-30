import {Page, Locator} from '@playwright/test';
import {BasePage} from './BasePage';

/**
 * Page object representing the instructor dashboard
 */
export class InstructorDashboardPage extends BasePage {
  // Navigation and sidebar selectors
  readonly coursesLinkSelectors = [
    '[data-testid="courses-link"]',
    'a:has-text("Courses")',
    'a[href*="/instructor/courses"]',
    '.instructor-nav a:has-text("Courses")',
    '.sidebar-nav a:has-text("Courses")'
  ];

  readonly studentsLinkSelectors = [
    '[data-testid="students-link"]',
    'a:has-text("Students")',
    'a[href*="/instructor/students"]',
    '.instructor-nav a:has-text("Students")',
    '.sidebar-nav a:has-text("Students")'
  ];

  readonly analyticsLinkSelectors = [
    '[data-testid="analytics-link"]',
    'a:has-text("Analytics")',
    'a[href*="/instructor/analytics"]',
    '.instructor-nav a:has-text("Analytics")',
    '.sidebar-nav a:has-text("Analytics")'
  ];

  readonly profileLinkSelectors = [
    '[data-testid="profile-link"]',
    'a:has-text("Profile")',
    'a[href*="/instructor/profile"]',
    '.instructor-nav a:has-text("Profile")',
    '.sidebar-nav a:has-text("Profile")'
  ];

  // Dashboard content selectors
  readonly welcomeMessageSelectors = [
    '[data-testid="welcome-message"]',
    '.welcome-message',
    'h1:has-text("Welcome")',
    '.dashboard-header'
  ];

  readonly courseStatsSelectors = [
    '[data-testid="course-stats"]',
    '.course-stats',
    '.stats-container'
  ];

  readonly recentActivitiesSelectors = [
    '[data-testid="recent-activities"]',
    '.recent-activities',
    '.activity-feed'
  ];

  readonly createCourseButtonSelectors = [
    '[data-testid="create-course-button"]',
    'button:has-text("Create Course")',
    'a:has-text("Create Course")',
    '.create-course-button'
  ];

  constructor(page: Page) {
    super(page, '/instructor/dashboard');
  }

  /**
   * Check if user is on instructor dashboard
   */
  async isOnInstructorDashboard(): Promise<boolean> {
    try {
      // Check URL contains instructor/dashboard
      const currentUrl = this.getUrl();
      if (!currentUrl.includes('instructor/dashboard')) {
        return false;
      }

      // Check for welcome message
      const welcomeMessageExists = await this.findElement(
        this.welcomeMessageSelectors,
        'welcome message',
        {timeoutMs: 2000}
      ).then(() => true).catch(() => false);

      return welcomeMessageExists;
    } catch (error) {
      console.error('Error checking if on instructor dashboard:', error);
      return false;
    }
  }

  /**
   * Navigate to courses page
   */
  async navigateToCourses(): Promise<void> {
    try {
      const coursesLink = await this.findElement(this.coursesLinkSelectors, 'courses link');
      await coursesLink.click();
      console.log('Clicked courses link');
      await this.page.waitForURL('**/instructor/courses', {timeout: 5000});
    } catch (error) {
      console.error('Failed to navigate to courses:', error);
      throw error;
    }
  }

  /**
   * Navigate to students page
   */
  async navigateToStudents(): Promise<void> {
    try {
      const studentsLink = await this.findElement(this.studentsLinkSelectors, 'students link');
      await studentsLink.click();
      console.log('Clicked students link');
      await this.page.waitForURL('**/instructor/students', {timeout: 5000});
    } catch (error) {
      console.error('Failed to navigate to students:', error);
      throw error;
    }
  }

  /**
   * Navigate to analytics page
   */
  async navigateToAnalytics(): Promise<void> {
    try {
      const analyticsLink = await this.findElement(this.analyticsLinkSelectors, 'analytics link');
      await analyticsLink.click();
      console.log('Clicked analytics link');
      await this.page.waitForURL('**/instructor/analytics', {timeout: 5000});
    } catch (error) {
      console.error('Failed to navigate to analytics:', error);
      throw error;
    }
  }

  /**
   * Navigate to profile page
   */
  async navigateToProfile(): Promise<void> {
    try {
      const profileLink = await this.findElement(this.profileLinkSelectors, 'profile link');
      await profileLink.click();
      console.log('Clicked profile link');
      await this.page.waitForURL('**/instructor/profile', {timeout: 5000});
    } catch (error) {
      console.error('Failed to navigate to profile:', error);
      throw error;
    }
  }

  /**
   * Click create course button
   */
  async clickCreateCourse(): Promise<void> {
    try {
      const createCourseButton = await this.findElement(this.createCourseButtonSelectors, 'create course button');
      await createCourseButton.click();
      console.log('Clicked create course button');
      await this.page.waitForURL('**/instructor/courses/create', {timeout: 5000});
    } catch (error) {
      console.error('Failed to click create course button:', error);
      throw error;
    }
  }

  /**
   * Get course statistics
   */
  async getCourseStats(): Promise<{[key: string]: string}> {
    try {
      const statsContainer = await this.findElement(this.courseStatsSelectors, 'course stats container');

      // Extract stats from container
      // This is a simplified example - you'll need to adapt to actual structure
      const statsElements = await statsContainer.locator('.stat-item').all();

      const stats: {[key: string]: string} = {};
      for (const statElement of statsElements) {
        const label = await statElement.locator('.stat-label').textContent() || 'Unknown';
        const value = await statElement.locator('.stat-value').textContent() || '0';
        stats[label.trim()] = value.trim();
      }

      return stats;
    } catch (error) {
      console.error('Failed to get course stats:', error);
      return {};
    }
  }

  /**
   * Get recent activities
   */
  async getRecentActivities(): Promise<string[]> {
    try {
      const activitiesContainer = await this.findElement(this.recentActivitiesSelectors, 'recent activities container');

      // Extract activities from container
      const activityElements = await activitiesContainer.locator('.activity-item').all();

      const activities: string[] = [];
      for (const activityElement of activityElements) {
        const text = await activityElement.textContent();
        if (text) {
          activities.push(text.trim());
        }
      }

      return activities;
    } catch (error) {
      console.error('Failed to get recent activities:', error);
      return [];
    }
  }

  /**
   * Wait for page load by checking for key dashboard elements
   */
  override async waitForPageLoad(timeoutMs: number = 10000): Promise<void> {
    try {
      await this.findElement(this.welcomeMessageSelectors, 'welcome message', {timeoutMs});

      // Check for either course stats or create course button as indicators of full page load
      try {
        await this.findElement(this.courseStatsSelectors, 'course stats container', {timeoutMs: 2000});
      } catch {
        await this.findElement(this.createCourseButtonSelectors, 'create course button', {timeoutMs: 2000});
      }

      console.log('Instructor dashboard page loaded');
    } catch (error) {
      console.error('Instructor dashboard did not load properly:', error);
      throw error;
    }
  }
}
