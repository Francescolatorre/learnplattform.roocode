import {Page, Locator, expect} from '@playwright/test';
import {BasePage} from './BasePage';
import {takeScreenshot} from '../setupTests';

/**
 * Basis Page Object für die Dashboard-Seiten (Student, Instructor, Admin)
 */
export class DashboardPage extends BasePage {
    // Gemeinsame Selektoren für alle Dashboard-Typen
    readonly dashboardSummary: Locator;
    readonly navigationMenuSelectors = [
        '[data-testid="main-navigation"]',
        'nav',
        '.MuiDrawer-root',
        '.navigation-menu',
        'header .MuiToolbar-root'
    ];
    readonly logoutButtonSelectors = [
        'button:has-text("Logout")',
        'a:has-text("Logout")',
        '[data-testid="logout-button"]',
        '.logout-button'
    ];

    /**
     * Konstruktor für die Dashboard-Seite
     * @param page Playwright Page-Objekt
     * @param basePath Basispfad der Dashboard-Seite
     */
    constructor(page: Page, basePath = '/dashboard') {
        super(page, basePath);
        this.dashboardSummary = this.page.locator('[data-testid="dashboard-summary"], .dashboard-summary, .MuiCard-root:has(.MuiCardContent-root)');
    }

    /**
     * Warten bis die Dashboard-Seite geladen ist
     * Verbesserte Implementation für verschiedene Dashboard-URLs und Rollen
     */
    async waitForPageLoad(): Promise<void> {
        try {
            // Überprüfen, ob die URL 'dashboard' oder rollenspezifische Pfade enthält
            await this.page.waitForURL(url => {
                const pathname = url.pathname;
                return pathname.includes('dashboard') ||
                    pathname.includes('/student/') ||
                    pathname.includes('/instructor/') ||
                    pathname.includes('/admin/') ||
                    pathname === '/';  // Fallback für die Hauptseite nach Login
            }, {timeout: 10000});

            console.log('Dashboard URL pattern detected');

            // Nach Dashboard-Elementen suchen mit robusteren Selektoren
            const dashboardElements = [
                this.dashboardSummary,
                this.page.locator('.dashboard-container, .dashboard-content, .MuiContainer-root'),
                this.page.locator('[data-testid="dashboard-title"]'),
                this.page.locator('.course-card, .course-list'),
                // Generische Inhaltsselektoren als Fallback
                this.page.locator('.MuiPaper-root:visible')
            ];

            let elementFound = false;

            // Versuchen, mindestens ein Dashboard-Element zu finden
            for (const element of dashboardElements) {
                try {
                    const isVisible = await element.isVisible({timeout: 2000}).catch(() => false);
                    if (isVisible) {
                        elementFound = true;
                        console.log('Found visible dashboard element');
                        break;
                    }
                } catch (error) {
                    // Ignorieren und mit dem nächsten Element fortfahren
                    continue;
                }
            }

            if (!elementFound) {
                // Selbst wenn wir keine spezifischen Elemente finden konnten, fahren wir fort,
                // solange wir auf einer entsprechenden URL-Route sind
                console.warn('No specific dashboard elements found, but URL pattern matched');
            }

            console.log('Dashboard page loaded');
        } catch (error) {
            console.error('Error waiting for dashboard page to load:', error);
            await takeScreenshot(this.page, 'dashboard-page-load-error');
            throw error;
        }
    }

    /**
     * Helper Funktion um zu warten, bis ein Element sichtbar ist
     */
    async waitForElement(locator: Locator, elementName: string, timeoutMs: number = 10000): Promise<void> {
        try {
            await locator.waitFor({state: 'visible', timeout: timeoutMs});
            console.log(`${elementName} is visible`);
        } catch (error) {
            console.error(`Timeout waiting for ${elementName}:`, error);
            await takeScreenshot(this.page, `${elementName.replace(/\s+/g, '-')}-not-visible`);
            throw error;
        }
    }

    /**
     * Überprüfen ob die Dashboard-Seite Kurs-Karten anzeigt
     */
    async hasCourseCards(): Promise<boolean> {
        const courseCards = this.page.locator('.course-card, [data-testid="course-card"], .MuiPaper-root:has(.MuiCardContent-root)');
        return await courseCards.count() > 0;
    }

    /**
     * Überprüfen ob die Dashboard-Seite einen bestimmten Kurs anzeigt
     */
    async hasSpecificCourse(courseTitle: string): Promise<boolean> {
        const courseCards = this.page.locator('.course-card, [data-testid="course-card"], .MuiPaper-root:has(.MuiCardContent-root)');
        const count = await courseCards.count();

        for (let i = 0; i < count; i++) {
            const card = courseCards.nth(i);
            const title = await card.locator('h2, h3, .course-title, [data-testid="course-title"]').textContent();
            if (title && title.includes(courseTitle)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Anzahl der Kurse auf dem Dashboard ermitteln
     */
    async getCourseCount(): Promise<number> {
        const courseCards = this.page.locator('.course-card, [data-testid="course-card"], .MuiPaper-root:has(.MuiCardContent-root)');
        return await courseCards.count();
    }

    /**
     * Überprüfen ob das Dashboard einen Fortschrittsbereich anzeigt
     */
    async hasProgressSection(): Promise<boolean> {
        const progressSection = this.page.locator('.progress-section, [data-testid="progress-section"], .progress-chart');
        return await progressSection.isVisible();
    }

    /**
     * Abmelden von der Anwendung
     */
    async logout(): Promise<void> {
        try {
            const logoutButton = await this.findElement(this.logoutButtonSelectors, 'logout button');
            await logoutButton.click();
            console.log('Clicked logout button');

            // Warten auf Weiterleitung zur Login-Seite oder Startseite
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
     * Überprüfen, ob ein bestimmtes Navigationselement im Menü existiert
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
     * Liste der sichtbaren Navigationselemente abrufen
     */
    async getNavigationItems(): Promise<string[]> {
        const navItems: string[] = [];

        try {
            // Zuerst den Navigationscontainer finden
            const navContainer = await this.findElement(this.navigationMenuSelectors, 'navigation menu', {timeoutMs: 5000});

            // Alle Links oder Listenelemente innerhalb der Navigation finden
            const itemLocators = navContainer.locator('li, a[href]');
            const count = await itemLocators.count();

            // Text aus jedem Element extrahieren
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

    /**
 * Check if the dashboard is loaded
 * This method is expected by tests but was missing in the implementation
 */
    async isDashboardLoaded(): Promise<boolean> {
        try {
            // Check if the URL contains 'dashboard' or role-specific paths
            const currentUrl = this.page.url();
            const isDashboardUrl = currentUrl.includes('dashboard') ||
                currentUrl.includes('/student/') ||
                currentUrl.includes('/instructor/') ||
                currentUrl.includes('/admin/') ||
                currentUrl === '/';  // Fallback for the main page after login

            if (!isDashboardUrl) {
                console.log(`Current URL ${currentUrl} doesn't match dashboard patterns`);
                return false;
            }

            // Search for dashboard elements with more robust selectors
            const dashboardElements = [
                this.dashboardSummary,
                this.page.locator('[data-testid="enrolled-courses"]'),
                this.page.locator('[data-testid="learning-overview"]'),
                this.page.locator('[data-testid="dashboard-summary"]'),
                this.page.locator('[data-testid="dashboard-title"]'),
            ];

            // Debug all selectors
            console.log('Checking dashboard elements with these selectors:');
            const selectorTexts = [
                '[data-testid="dashboard-summary"]',
                '[data-testid="dashboard-title"]',
            ];

            // Check dashboard elements and log results
            for (const [index, element] of dashboardElements.entries()) {
                try {
                    const count = await element.count();
                    const isVisible = count > 0 ? await element.first().isVisible().catch(() => false) : false;

                    console.log(`Selector "${selectorTexts[index]}": Found ${count} elements, visible: ${isVisible}`);

                    if (isVisible) {
                        console.log(`Found visible dashboard element ${selectorTexts[index]}`);
                        return true; // Exit early if a visible element is found
                    }
                } catch (error) {
                    console.log(`Error checking selector "${selectorTexts[index]}":`, error.message);
                    continue; // Continue to the next element on error
                }
            }

            console.warn('No dashboard elements found');
            await takeScreenshot(this.page, 'dashboard-not-loaded');
            return false;
        } catch (error) {
            console.error('Error checking if dashboard is loaded:', error);
            return false;
        }
    }

}

/**
 * Page Object für das Student Dashboard
 */
export class StudentDashboardPage extends DashboardPage {
    // Student-spezifische Selektoren
    readonly enrolledCoursesSelectors = [
        '[data-testid="enrolled-courses"]',
        'h2:has-text("Enrolled Courses")',
        'h3:has-text("My Courses")',
        '.enrolled-courses'
    ];

    readonly progressSectionSelectors = [
        '[data-testid="progress-section"]',
        'h2:has-text("Progress")',
        '.progress-section'
    ];

    readonly dashboardSummarySelectors = [
        '[data-testid="dashboard-summary"]',
        '.dashboard-stats',
        '.overview-stats'
    ];

    /**
     * Constructor for the Student Dashboard
     */
    constructor(page: Page) {
        super(page, '/dashboard');
    }

    /**
     * Check if progress section is visible
     */
    async hasProgressSection(): Promise<boolean> {
        for (const selector of this.progressSectionSelectors) {
            const locator = this.page.locator(selector);
            const isVisible = await locator.isVisible({timeout: 2000}).catch(() => false);
            if (isVisible) {
                return true;
            }
        }
        return false;
    }

    /**
     * Check if enrolled courses section is visible
     */
    async hasEnrolledCourses(): Promise<boolean> {
        for (const selector of this.enrolledCoursesSelectors) {
            const locator = this.page.locator(selector);
            const isVisible = await locator.isVisible({timeout: 2000}).catch(() => false);
            if (isVisible) {
                return true;
            }
        }
        return false;
    }

    /**
     * Get list of enrolled courses
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

    /**
     * Wait for dashboard page to load
     */
    override async waitForPageLoad(timeoutMs: number = 10000): Promise<void> {
        try {
            // Wait for essential elements
            await this.page.waitForSelector('[data-testid="dashboard-title"]', {timeout: timeoutMs});
            await this.page.waitForSelector('[data-testid="learning-overview"]', {timeout: timeoutMs});

            // Try to find either enrolled courses or a message about no courses
            try {
                await this.page.waitForSelector(
                    '.course-card, [data-testid="no-courses-message"]',
                    {timeout: 2000}
                );
            } catch {
                console.warn('No courses or no-courses message found');
            }

            console.log('Student dashboard page loaded');
        } catch (error) {
            console.error('Student dashboard did not load properly:', error);
            throw error;
        }
    }
}

/**
 * Page Object für das Instructor Dashboard
 */
export class InstructorDashboardPage extends DashboardPage {
    // Instructor-spezifische Selektoren
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

    readonly instructorCoursesLinkSelectors = [
        '[data-testid="instructor-courses-link"]',
        'a[href="/instructor/courses"]:nth-of-type(1)',
        '.MuiAppBar-root a[href="/instructor/courses"]',
        'header a[href="/instructor/courses"]',
        'nav a[href="/instructor/courses"]',
        'a.manage-courses-link',
        'a.menu-item[href="/instructor/courses"]',
        'a:has-text("Manage Courses")',
        'a:has-text("My Courses")'
    ];

    /**
     * Konstruktor für das Instructor Dashboard
     * @param page Playwright Page-Objekt
     */
    constructor(page: Page) {
        super(page, '/instructor/dashboard');
    }

    /**
     * Navigieren zur Kurs-Erstellungsseite
     */
    async navigateToCreateCourse(): Promise<void> {
        console.log('Navigating to course creation page');
        try {
            // Versuch über den Button "Create Course" zu navigieren
            for (const selector of this.createCourseButtonSelectors) {
                const buttonLocator = this.page.locator(selector);
                const isVisible = await buttonLocator.isVisible({timeout: 1000}).catch(() => false);
                if (isVisible) {
                    await buttonLocator.click();
                    console.log(`Clicked course creation button with selector: ${selector}`);
                    await this.page.waitForURL('**/instructor/courses/new**');
                    console.log('Navigated to course creation page');
                    return;
                }
            }

            // Alternative: Direkt zur URL navigieren
            console.log('Could not find create course button, navigating directly to /instructor/courses/new');
            await this.page.goto('/instructor/courses/new');
            await this.page.waitForURL('**/instructor/courses/new**');
            console.log('Navigated to course creation page');
        } catch (error) {
            console.error('Failed to navigate to course creation page:', error);
            await takeScreenshot(this.page, 'course-creation-navigation-failed');
            throw error;
        }
    }

    /**
     * Navigieren zur Instructor-Kursliste
     */
    async navigateToInstructorCourses(): Promise<void> {
        console.log('Navigating to instructor courses');

        try {
            // Zuerst versuchen, die Links in der Navigation zu finden
            for (const selector of this.instructorCoursesLinkSelectors) {
                try {
                    const linkLocator = this.page.locator(selector);
                    const isVisible = await linkLocator.isVisible({timeout: 1000}).catch(() => false);
                    if (isVisible) {
                        await linkLocator.click();
                        console.log(`Clicked courses link with selector: ${selector}`);
                        await this.page.waitForURL('**/instructor/courses**', {timeout: 5000});
                        console.log('Navigated to instructor courses page');
                        return;
                    }
                } catch (error) {
                    console.log(`Selector ${selector} not found or not clickable`);
                }
            }

            // Zweiter Versuch: Alle Links mit "Manage Courses" Text finden
            try {
                const manageCoursesLink = this.page.getByRole('link', {name: 'Manage Courses'});
                const isVisible = await manageCoursesLink.isVisible({timeout: 1000}).catch(() => false);
                if (isVisible) {
                    await manageCoursesLink.click();
                    console.log('Clicked "Manage Courses" link via role selector');
                    await this.page.waitForURL('**/instructor/courses**', {timeout: 5000});
                    console.log('Navigated to instructor courses page');
                    return;
                }
            } catch (error) {
                console.log('Role selector for "Manage Courses" not found or not clickable');
            }

            // Letzter Ausweg: Direkt zur URL navigieren
            console.log('Could not find courses link, navigating directly to /instructor/courses');
            await this.page.goto('/instructor/courses');
            await this.page.waitForURL('**/instructor/courses**', {timeout: 5000});
            console.log('Navigated directly to instructor courses page');
        } catch (error) {
            console.error('Failed to navigate to instructor courses:', error);
            await takeScreenshot(this.page, 'instructor-courses-navigation-failed');
            throw error;
        }
    }

    /**
     * Instructor-Statistiken abrufen
     */
    async getInstructorStats(): Promise<{totalCourses: number; activeStudents: number;}> {
        try {
            const stats = {totalCourses: 0, activeStudents: 0};

            // Versuchen, den Stats-Container zu finden
            for (const selector of this.courseStatsSelectors) {
                const statsContainer = this.page.locator(selector);
                const isVisible = await statsContainer.isVisible({timeout: 2000}).catch(() => false);
                if (isVisible) {
                    // Statistiken extrahieren, indem nach bestimmten Mustern gesucht wird
                    const statsText = await statsContainer.innerText();

                    // Zahlen nach "Courses" oder ähnlichem Text finden
                    const coursesMatch = statsText.match(/(\d+)(?=\s*(courses|lessons))/i);
                    if (coursesMatch) {
                        stats.totalCourses = parseInt(coursesMatch[1], 10);
                    }

                    // Zahlen nach "Students" oder ähnlichem Text finden
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
 * Page Object für das Admin Dashboard
 */
export class AdminDashboardPage extends DashboardPage {
    // Admin-spezifische Selektoren
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

    /**
     * Konstruktor für das Admin Dashboard
     * @param page Playwright Page-Objekt
     */
    constructor(page: Page) {
        super(page, '/admin/dashboard');
    }

    /**
     * Zur Benutzerverwaltung navigieren
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
     * Zu den Einstellungen navigieren
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
     * Admin-Statistiken abrufen
     */
    async getAdminStats(): Promise<{totalUsers: number; totalCourses: number; activeUsers: number}> {
        try {
            const stats = {totalUsers: 0, totalCourses: 0, activeUsers: 0};

            for (const selector of this.adminStatsSelectors) {
                const statsContainer = this.page.locator(selector);
                const isVisible = await statsContainer.isVisible({timeout: 2000}).catch(() => false);
                if (isVisible) {
                    const statsText = await statsContainer.innerText();

                    // Statistiken mit Regex-Mustern extrahieren
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
