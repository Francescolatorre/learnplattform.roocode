// Playwright-specific test helpers for E2E tests

import {Page} from '@playwright/test';

// Centralized test configuration
export const TEST_USERS = {
    lead_instructor: {
        username_or_email: 'instructor',
        password: 'instructor123',
        expectedRole: 'instructor',
    },
    admin: {
        username_or_email: 'admin',
        password: 'adminpassword',
        expectedRole: 'admin',
    },
    student: {
        username_or_email: 'student',
        password: 'student123',
        expectedRole: 'student',
    },
};

// Reusable login helper for Playwright tests
export const login = async (page: Page, username: string, password: string): Promise<{access: string; refresh: string}> => {
    await page.goto('/login');
    await page.fill('input[data-testid="login-username-input"]', username);
    await page.fill('input[data-testid="login-password-input"]', password);
    await page.click('button[type="submit"]');

    // Check for error notification first (in case of login failure)
    try {
        const errorNotification = await page.waitForSelector('.MuiAlert-standardError, .MuiSnackbar-root', {
            timeout: 3000,
            state: 'visible'
        });

        if (await errorNotification.isVisible()) {
            const errorText = await errorNotification.textContent();
            throw new Error(`Login failed: ${errorText}`);
        }
    } catch (err) {
        // If we didn't find an error notification, continue to check for successful login
        if (!(err instanceof Error) || !err.message.includes('Login failed')) {
            // This is a timeout error (no notification found), which is expected for successful logins
        } else {
            // This is a login error we detected, rethrow it
            throw err;
        }
    }

    // Wait for successful navigation to dashboard
    await page.waitForURL('/dashboard', {timeout: 10000});
    return {
        access: 'mockAccessToken',
        refresh: 'mockRefreshToken',
    };
};

// Reusable UserSession class for Playwright E2E tests
export class UserSession {
    page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async loginAs(role: string): Promise<void> {
        // Map role to the appropriate user from TEST_USERS
        let userData;

        switch (role) {
            case 'instructor':
                userData = TEST_USERS.lead_instructor;
                break;
            case 'admin':
                userData = TEST_USERS.admin;
                break;
            case 'student':
            default:
                userData = TEST_USERS.student;
                break;
        }

        // Mock the authentication response
        await this.page.route('**/api/auth/me', async route => {
            await route.fulfill({
                status: 200,
                json: {role: userData.expectedRole},
            });
        });

        await this.page.goto('/dashboard');
    }

    async logout(): Promise<void> {
        // Clear cookies and local storage
        await this.page.context().clearCookies();
        await this.page.evaluate(() => {
            try {
                localStorage.clear();
            } catch {
                // Ignore SecurityError or other storage errors
            }
        });
        await this.page.goto('/login');
    }
}

// Utility to wait for global loading indicator (isRestoring/loading state) to disappear
// Assumes global loading uses [role="progressbar"] not inside the login button

export async function waitForGlobalLoadingToDisappear(page: Page) {
    // Wait for any global progressbar (not inside login button) to disappear
    // Adjust selector if your app uses a more specific data-testid or class for the global loading
    await page.waitForSelector('[role="progressbar"]', {state: 'detached', timeout: 10000});
}

