import {Page, Locator} from '@playwright/test';
import {BasePage} from './BasePage';

/**
 * Base Dashboard page object for common dashboard functionality
 */
export abstract class DashboardPage extends BasePage {
    // Common selectors for dashboards
    readonly dashboardTitleSelectors = [
        'h1:has-text("Dashboard")',
        'h2:has-text("Dashboard")',
        'h3:has-text("Dashboard")',
        'h4:has-text("Dashboard")',
        '[data-testid="dashboard-title"]'
    ];

    readonly navigationMenuSelectors = [
        'nav',
        '.navigation-menu',
        '.sidebar',
        '[role="navigation"]',
        '[data-testid="main-navigation"]'
    ];

    readonly coursesSectionSelectors = [
        'h2:has-text("Courses")',
        'h3:has-text("Courses")',
        'h4:has-text("Courses")',
        '.courses-section',
        '[data-testid="courses-section"]'
    ];

    readonly profileLinkSelectors = [
        'a:has-text("Profile")',
        '[href*="profile"]',
        'li:has-text("Profile")',
        'a[data-testid="profile-link"]'
    ];

    readonly logoutButtonSelectors = [
        'button:has-text("Logout")',
        'button:has-text("Sign Out")',
        '.logout-button',
        '[data-testid="logout-button"]'
    ];

    /**
     * Check if the dashboard has loaded correctly by looking for key elements
     */
    async isDashboardLoaded(): Promise<boolean> {
        try {
            // Check for dashboard title
            for (const selector of this.dashboardTitleSelectors) {
                const titleLocator = this.page.locator(selector);
                const isVisible = await titleLocator.isVisible({timeout: 2000});
                if (isVisible) {
                    console.log('Dashboard title found');
                    return true;
                }
            }

            // If no title was found, look for other dashboard elements
            // like the courses section or profile link
            const elementsToCheck = [
                ...this.navigationMenuSelectors,
                ...this.coursesSectionSelectors,
                ...this.profileLinkSelectors
            ];

            for (const selector of elementsToCheck) {
                const elementLocator = this.page.locator(selector);
                const isVisible = await elementLocator.isVisible({timeout: 1000});
                if (isVisible) {
                    console.log(`Dashboard element found: ${selector}`);
                    return true;
                }
            }

            console.warn('Dashboard does not appear to be loaded - no dashboard elements found');
            await this.takeScreenshot('dashboard-not-loaded');
            return false;
        } catch (error) {
            console.error('Error checking if dashboard is loaded:', error);
            return false;
        }
    }

    /**
     * Navigate to the profile page
     */
    async navigateToProfile(): Promise<void> {
        try {
            const profileLink = await this.findElement(this.profileLinkSelectors, 'profile link');
            await profileLink.click();
            console.log('Clicked profile link');
            await this.waitForPageLoad();
        } catch (error) {
            console.error('Failed to navigate to profile:', error);
            throw error;
        }
    }

    /**
     * Logout from the application
     */
    async logout(): Promise<void> {
        try {
            const logoutButton = await this.findElement(this.logoutButtonSelectors, 'logout button');
            await logoutButton.click();
            console.log('Clicked logout button');

            // Wait for redirect to login page or home page
            await this.page.waitForURL(url => {
                return url.pathname === '/login' || url.pathname === '/' || url.pathname === '/logout';
            }, {timeout: 10000});

            console.log('Logged out successfully');
        } catch (error) {
            console.error('Failed to logout:', error);
            throw error;
        }
    }

    /**
     * Check if a specific navigation item exists in the menu
     */
    async hasNavigationItem(itemText: string): Promise<boolean> {
        try {
            const navLocator = this.page.locator(`li:has-text("${itemText}"), a:has-text("${itemText}")`);
            return await navLocator.isVisible({timeout: 5000});
        } catch (error) {
            return false;
        }
    }

    /**
     * Get a list of visible navigation items
     */
    async getNavigationItems(): Promise<string[]> {
        const navItems: string[] = [];

        try {
            // First find the navigation container
            const navContainer = await this.findElement(this.navigationMenuSelectors, 'navigation menu', {timeout: 5000});

            // Find all links or list items within the navigation
            const itemLocators = navContainer.locator('li, a[href]');
            const count = await itemLocators.count();

            // Extract the text from each item
            for (let i = 0; i < count; i++) {
                const text = await itemLocators.nth(i).textContent();
                if (text && text.trim()) {
                    navItems.push(text.trim());
                }
            }
        } catch (error) {
            console.warn('Could not find navigation items:', error);
        }

        return navItems;
    }
}

/**
 * Student Dashboard page object
 */
export class StudentDashboardPage extends DashboardPage {
    // Student-specific selectors
    readonly enrolledCoursesSelectors = [
        'h2:has-text("Enrolled Courses")',
        'h3:has-text("Enrolled Courses")',
        'h4:has-text("My Courses")',
        '.enrolled-courses',
        '[data-testid="enrolled-courses"]'
    ];

    readonly progressSectionSelectors = [
        'h2:has-text("Progress")',
        'h3:has-text("Progress")',
        '.progress-section',
        '[data-testid="progress-section"]'
    ];

    constructor(page: Page) {
        super(page, '/dashboard');
    }

    /**
     * Check if the enrolled courses section is visible
     */
    async hasEnrolledCourses(): Promise<boolean> {
        for (const selector of this.enrolledCoursesSelectors) {
            const locator = this.page.locator(selector);
            const isVisible = await locator.isVisible({timeout: 2000});
            if (isVisible) {
                return true;
            }
        }
        return false;
    }

    /**
     * Get a list of enrolled courses shown on the dashboard
     */
    async getEnrolledCourses(): Promise<string[]> {
        const courses: string[] = [];

        try {
            // Look for course cards or course list items
            const courseElements = this.page.locator('.course-card, .course-list-item, [data-testid^="course-"]');
            const count = await courseElements.count();

            for (let i = 0; i < count; i++) {
                const titleElement = courseElements.nth(i).locator('h3, h4, .course-title');
                const title = await titleElement.textContent();
                if (title) {
                    courses.push(title.trim());
                }
            }
        } catch (error) {
            console.warn('Error getting enrolled courses:', error);
        }

        return courses;
    }
}

/**
 * Instructor Dashboard page object
 */
export class InstructorDashboardPage extends DashboardPage {
    // Instructor-specific selectors
    readonly createCourseButtonSelectors = [
        'a:has-text("Create Course")',
        'button:has-text("Create Course")',
        'a:has-text("New Course")',
        'button:has-text("New Course")',
        '.create-course-button',
        '[data-testid="create-course-button"]'
    ];

    readonly instructorCoursesSelectors = [
        'h2:has-text("My Courses")',
        'h3:has-text("My Courses")',
        'h4:has-text("Instructor Courses")',
        '.instructor-courses',
        '[data-testid="instructor-courses"]'
    ];

    readonly courseStatsSelectors = [
        '.course-stats',
        '.instructor-stats',
        '.dashboard-stats',
        '[data-testid="instructor-stats"]'
    ];

    constructor(page: Page) {
        super(page, '/instructor/dashboard');
    }

    /**
     * Navigate to the course creation page
     */
    async navigateToCreateCourse(): Promise<void> {
        try {
            const createCourseButton = await this.findElement(this.createCourseButtonSelectors, 'create course button');
            await createCourseButton.click();
            console.log('Clicked create course button');
            await this.waitForPageLoad();
        } catch (error) {
            console.error('Failed to navigate to course creation:', error);
            throw error;
        }
    }

    /**
     * Navigate to the instructor courses page
     */
    async navigateToInstructorCourses(): Promise<void> {
        try {
            // First try finding a direct link to instructor courses
            const coursesSelectors = [
                'a:has-text("My Courses")',
                'a:has-text("Courses")',
                'a[href*="instructor/courses"]'
            ];

            for (const selector of coursesSelectors) {
                const linkLocator = this.page.locator(selector);
                const isVisible = await linkLocator.isVisible({timeout: 1000});
                if (isVisible) {
                    await linkLocator.click();
                    console.log(`Clicked courses link with selector: ${selector}`);
                    await this.waitForPageLoad();
                    return;
                }
            }

            // If we couldn't find a direct link, try using the navigation menu
            const navMenuSelectors = [
                '[data-testid="main-navigation"]',
                'nav',
                '.MuiDrawer-root'
            ];

            for (const selector of navMenuSelectors) {
                const navLocator = this.page.locator(selector);
                const isVisible = await navLocator.isVisible({timeout: 1000});
                if (isVisible) {
                    const coursesLinkInMenu = navLocator.locator('a', {hasText: 'Courses'});
                    await coursesLinkInMenu.click();
                    console.log('Clicked courses link in navigation menu');
                    await this.waitForPageLoad();
                    return;
                }
            }

            console.error('Could not find any way to navigate to instructor courses');
            throw new Error('Navigation to instructor courses failed: No valid link found');
        } catch (error) {
            console.error('Failed to navigate to instructor courses:', error);
            throw error;
        }
    }

    /**
     * Get instructor statistics
     */
    async getInstructorStats(): Promise<{totalCourses: number; activeStudents: number;}> {
        try {
            const stats = {totalCourses: 0, activeStudents: 0};

            // Try to find stats container
            for (const selector of this.courseStatsSelectors) {
                const statsContainer = this.page.locator(selector);
                const isVisible = await statsContainer.isVisible({timeout: 2000});
                if (isVisible) {
                    // Extract statistics by looking for specific patterns
                    const statsText = await statsContainer.innerText();

                    // Match numbers after "Courses" or similar text
                    const coursesMatch = statsText.match(/(\d+)(?=\s*(courses|lessons))/i);
                    if (coursesMatch) {
                        stats.totalCourses = parseInt(coursesMatch[1], 10);
                    }

                    // Match numbers after "Students" or similar text
                    const studentsMatch = statsText.match(/(\d+)(?=\s*(students|learners|enrolled))/i);
                    if (studentsMatch) {
                        stats.activeStudents = parseInt(studentsMatch[1], 10);
                    }

                    return stats;
                }
            }

            console.warn('Could not find instructor stats');
            return stats;
        } catch (error) {
            console.error('Error getting instructor stats:', error);
            return {totalCourses: 0, activeStudents: 0};
        }
    }
}

/**
 * Admin Dashboard page object
 */
export class AdminDashboardPage extends DashboardPage {
    // Admin-specific selectors
    readonly userManagementSelectors = [
        'a:has-text("Users")',
        'a:has-text("User Management")',
        'li:has-text("User Management")',
        '[data-testid="user-management"]'
    ];

    readonly settingsSelectors = [
        'a:has-text("Settings")',
        'li:has-text("Settings")',
        '[data-testid="settings"]'
    ];

    readonly adminStatsSelectors = [
        '.admin-stats',
        '.platform-stats',
        '[data-testid="admin-stats"]'
    ];

    constructor(page: Page) {
        super(page, '/admin/dashboard');
    }

    /**
     * Navigate to user management
     */
    async navigateToUserManagement(): Promise<void> {
        try {
            const userManagementLink = await this.findElement(this.userManagementSelectors, 'user management link');
            await userManagementLink.click();
            console.log('Clicked user management link');
            await this.waitForPageLoad();
        } catch (error) {
            console.error('Failed to navigate to user management:', error);
            throw error;
        }
    }

    /**
     * Navigate to settings
     */
    async navigateToSettings(): Promise<void> {
        try {
            const settingsLink = await this.findElement(this.settingsSelectors, 'settings link');
            await settingsLink.click();
            console.log('Clicked settings link');
            await this.waitForPageLoad();
        } catch (error) {
            console.error('Failed to navigate to settings:', error);
            throw error;
        }
    }

    /**
     * Get admin statistics
     */
    async getAdminStats(): Promise<{totalUsers: number; totalCourses: number; activeUsers: number}> {
        try {
            const stats = {totalUsers: 0, totalCourses: 0, activeUsers: 0};

            for (const selector of this.adminStatsSelectors) {
                const statsContainer = this.page.locator(selector);
                const isVisible = await statsContainer.isVisible({timeout: 2000});
                if (isVisible) {
                    const statsText = await statsContainer.innerText();

                    // Extract statistics using regex patterns
                    const usersMatch = statsText.match(/(\d+)(?=\s*(users|accounts))/i);
                    if (usersMatch) {
                        stats.totalUsers = parseInt(usersMatch[1], 10);
                    }

                    const coursesMatch = statsText.match(/(\d+)(?=\s*(courses|classes))/i);
                    if (coursesMatch) {
                        stats.totalCourses = parseInt(coursesMatch[1], 10);
                    }

                    const activeMatch = statsText.match(/(\d+)(?=\s*(active|online))/i);
                    if (activeMatch) {
                        stats.activeUsers = parseInt(activeMatch[1], 10);
                    }

                    return stats;
                }
            }

            console.warn('Could not find admin stats');
            return stats;
        } catch (error) {
            console.error('Error getting admin stats:', error);
            return {totalUsers: 0, totalCourses: 0, activeUsers: 0};
        }
    }
}
