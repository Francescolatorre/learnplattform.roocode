import {test, expect} from '@playwright/test';
import {LoginPage} from '../page-objects/LoginPage';
import {StudentDashboardPage} from '../page-objects/DashboardPage';
import {TEST_USERS, takeScreenshot, UserSession} from '../setupTests';

test.describe('Student Dashboard', () => {
    let dashboardPage: StudentDashboardPage;

    test.beforeEach(async ({page}) => {
        // Login as student
        const userSession = new UserSession(page);
        await userSession.loginAs('student');

        // Initialize dashboard page object
        dashboardPage = new StudentDashboardPage(page);
        await dashboardPage.waitForPageLoad();
    });

    test('displays dashboard components correctly', async ({page}) => {
        // Check presence of key dashboard elements
        await expect(page.locator('[data-testid="dashboard-title"]')).toBeVisible();
        await expect(page.locator('[data-testid="learning-overview"]')).toBeVisible();

        // Verify enrolled courses section exists
        const hasEnrolledCourses = await dashboardPage.hasEnrolledCourses();
        expect(hasEnrolledCourses).toBeTruthy();

        // Verify progress section exists
        const hasProgressSection = await dashboardPage.hasProgressSection();
        expect(hasProgressSection).toBeTruthy();

        // Take a screenshot for visual verification
        await takeScreenshot(page, 'student-dashboard-components');
    });

    test('shows course progress correctly', async ({page}) => {
        // Get enrolled courses
        const enrolledCourses = await dashboardPage.getEnrolledCourses();
        expect(enrolledCourses.length).toBeGreaterThan(0);

        // Verify progress indicators exist for each course
        for (const courseElement of await page.locator('.course-card').all()) {
            const progressBar = courseElement.locator('.MuiLinearProgress-root');
            await expect(progressBar).toBeVisible();

            // Verify progress percentage is within valid range
            const progressText = await courseElement.locator('[data-testid="course-progress"]').textContent();
            const percentage = parseFloat(progressText?.replace('%', '') || '0');
            expect(percentage).toBeGreaterThanOrEqual(0);
            expect(percentage).toBeLessThanOrEqual(100);
        }
    });

    test('displays correct statistics', async ({page}) => {
        // Check overall statistics
        const stats = await page.locator('[data-testid="dashboard-summary"] .MuiCard-root').all();
        expect(stats.length).toBeGreaterThan(0);

        // Verify statistics values are numbers
        for (const stat of stats) {
            const value = await stat.locator('h3, h4').textContent();
            expect(Number.isNaN(parseInt(value || '0', 10))).toBeFalsy();
        }
    });

    test('navigation to courses works', async ({page}) => {
        // Click on a course card
        const courseCards = page.locator('.course-card');
        const firstCard = courseCards.first();

        if (await firstCard.isVisible()) {
            await firstCard.click();

            // Verify navigation to course detail page
            await expect(page).toHaveURL(/\/courses\/\d+/);

            // Verify course detail page loads
            await expect(page.locator('[data-testid="course-title"]')).toBeVisible();
        }
    });
});
