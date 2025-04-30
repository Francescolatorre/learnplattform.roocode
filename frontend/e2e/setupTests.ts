// Playwright-specific test helpers for E2E tests

import {Page, expect} from '@playwright/test';
import path from 'path';
import fs from 'fs';

// Function to get the screenshot directory
function getScreenshotPath(filename: string): string {
    // Use the environment variable that Playwright sets, or fall back to our directory
    const outputDir = process.env.PLAYWRIGHT_OUTPUT_DIR || path.join(process.cwd(), 'test-results', 'test-artifacts');

    // Ensure directory exists
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, {recursive: true});
    }

    return path.join(outputDir, filename);
}

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

    // Use more flexible selectors to find form elements
    try {
        // Look for username field with multiple possible selectors
        await page.fill(
            'input[data-testid="login-username-input"], ' +
            'input[name="username"], ' +
            'input[name="email"], ' +
            'input[type="email"], ' +
            'input[placeholder*="username"], ' +
            'input[data-testid="login-username-input"]'
            , username);
    } catch (error) {
        console.error('Failed to find username input field');
        await page.screenshot({path: getScreenshotPath(`login-username-not-found-${Date.now()}.png`)});
        throw error;
    }

    try {
        // Look for password field with multiple possible selectors
        await page.fill(
            'input[data-testid="login-password-input"], ' +
            'input[name="password"], ' +
            'input[type="password"], ' +
            'input[placeholder*="password"]'
            , password);
    } catch (error) {
        console.error('Failed to find password input field');
        await page.screenshot({path: getScreenshotPath(`login-password-not-found-${Date.now()}.png`)});
        throw error;
    }

    try {
        // Look for login button with multiple possible selectors
        await page.click(
            'button[type="submit"], ' +
            'button:has-text("Login"), ' +
            'button:has-text("Sign in"), ' +
            'button:has-text("Log in"), ' +
            '[role="button"]:has-text("Login"), ' +
            '[role="button"]:has-text("Sign in")',
            'button[type="submit"]'
        )
    }
    catch (error) {
        console.error('Failed to find login button');
        await page.screenshot({path: getScreenshotPath(`login-button-not-found-${Date.now()}.png`)});
        throw error;
    }

    // Check for error notification first (in case of login failure)
    try {
        const errorNotification = await page.waitForSelector(
            '.MuiAlert-standardError, ' +
            '.error-notification, ' +
            '.MuiSnackbar-root, ' +
            '[role="alert"], ' +
            '.error-message',
            {timeout: 3000, state: 'visible'}
        );

        // Check for text separately
        const errorText = await page.locator('text="Invalid credentials"').isVisible() ||
            await page.locator('text="Login failed"').isVisible();

        if (await errorNotification.isVisible()) {
            const errorText = await errorNotification.textContent();
            console.error(`Login failed with message: ${errorText}`);
            await page.screenshot({path: getScreenshotPath(`login-failed-error-${Date.now()}.png`)});
            throw new Error(`Login failed: ${errorText}`);
        }
    } catch (err) {
        // If we didn't find an error notification, continue to check for successful login
        if (!(err instanceof Error) || !err.message.includes('Login failed')) {
            // This is a timeout error (no notification found), which is expected for successful logins
            console.log('No error notification found, login appears successful');
        } else {
            // This is a login error we detected, rethrow it
            throw err;
        }
    }

    // Wait for authenticated state using multiple indicators
    try {
        await Promise.race([
            // Option 1: Wait for URL change
            page.waitForURL(url => {
                const patterns = ['/dashboard', '/instructor/dashboard', '/courses', '/admin', '/profile'];
                return patterns.some(pattern => url.pathname.includes(pattern));
            }, {timeout: 20000}),

            // Option 2: Wait for authenticated UI elements
            page.waitForSelector(
                '.user-profile, ' +
                '.logout-button, ' +
                'button:has-text("Logout"), ' +
                'button:has-text("Sign out"), ' +
                '[data-testid="user-menu"], ' +
                '.avatar, ' +
                '.user-avatar, ' +
                'header .username'
                , {timeout: 20000}),

            // Option 3: Wait for welcome message
            page.waitForSelector(
                `text=Welcome ${username}, ` +
                `text=Hello ${username}, ` +
                `text=Hi ${username}, ` +
                'text=Welcome back, ' +
                'text=You are logged in'
                , {timeout: 20000})
        ]);

        console.log('Authentication detected successfully');
        await page.screenshot({path: getScreenshotPath(`login-success-${Date.now()}.png`)});

    } catch (error) {
        console.error('Failed to detect authenticated state', error);
        await page.screenshot({path: getScreenshotPath(`login-auth-check-failed-${Date.now()}.png`)});
        throw new Error(`Login appeared to succeed but we couldn't detect authenticated state: ${error.message}`);
    }

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

        console.log(`Logging in as ${role} with username: ${userData.username_or_email}`);

        // Take a screenshot of current state
        await this.page.screenshot({path: getScreenshotPath(`pre-login-${role}-${Date.now()}.png`)});

        // Navigate to login page and ensure it's loaded
        await this.page.goto('/login');
        console.log('Navigated to login page');

        // Log important page state information
        console.log('Current URL:', this.page.url());
        console.log('Page title:', await this.page.title());

        // Wait a moment for the page to stabilize
        await this.page.waitForTimeout(1000);

        // Use more flexible selectors with fallbacks
        const usernameInput = await this.findElement([
            'input[data-testid="login-username-input"]',
            'input[name="username"]',
            'input[name="email"]',
            'input[type="email"]',
            'input[placeholder*="username"]',
            'input[placeholder*="email"]'
        ], 'username input');

        const passwordInput = await this.findElement([
            'input[data-testid="login-password-input"]',
            'input[name="password"]',
            'input[type="password"]',
            'input[placeholder*="password"]'
        ], 'password input');

        const loginButton = await this.findElement([
            'button[type="submit"]',
            'button:has-text("Login")',
            'button:has-text("Sign in")',
            'button:has-text("Log in")',
            '[role="button"]:has-text("Login")',
            '[role="button"]:has-text("Sign in")'
        ], 'login button');

        // Fill in login form
        await usernameInput.fill(userData.username_or_email);
        await passwordInput.fill(userData.password);
        console.log('Filled login form');

        // Click the login button
        await loginButton.click();
        console.log('Clicked login button');

        // Take screenshot right after clicking login
        await this.page.screenshot({path: getScreenshotPath(`post-click-login-${role}-${Date.now()}.png`)});

        // Improved error detection - check for error messages
        const errorSelector = [
            '.MuiAlert-standardError',
            '.error-notification',
            '.MuiSnackbar-root',
            '[role="alert"]',
            '.error-message',
            'text=\\"Invalid credentials\\"',
            'text=\\"Login failed\\"'
        ].join(',');

        // Check for errors with proper timeout handling
        let errorFound = false;
        try {
            const errorElement = await this.page.waitForSelector(errorSelector, {
                timeout: 3000,
                state: 'visible'
            });
            if (errorElement) {
                const errorText = await errorElement.textContent() || 'Unknown error';
                errorFound = true;
                console.error(`Login error detected: ${errorText}`);
                await this.page.screenshot({path: getScreenshotPath(`login-error-${role}-${Date.now()}.png`)});
                throw new Error(`Login failed: ${errorText}`);
            }
        } catch (err) {
            // Only throw if we found an error - otherwise timeout is expected
            if (errorFound) throw err;
            console.log('No error messages detected - continuing with login verification');
        }

        // Wait for authenticated state using a more robust approach
        console.log('Waiting for authenticated state');

        try {
            // First, wait a moment for any redirects/state changes to occur
            await this.page.waitForTimeout(2000);

            // Log current URL to help with debugging
            console.log('Current URL after login attempt:', this.page.url());

            // Check if we're on a known authenticated page
            const currentUrl = this.page.url();
            const authenticatedUrls = ['/dashboard', '/instructor/dashboard', '/courses', '/admin', '/profile'];
            const isAuthenticatedUrl = authenticatedUrls.some(path => currentUrl.includes(path));

            if (isAuthenticatedUrl) {
                console.log('Authenticated URL detected:', currentUrl);
            } else {
                console.log('Not on authenticated URL yet, looking for authenticated UI elements');

                // Look for authenticated UI elements if not on a known URL
                const authElementSelector = [
                    '.user-profile',
                    '.logout-button',
                    'button:has-text("Logout")',
                    'button:has-text("Sign out")',
                    '[data-testid="user-menu"]',
                    '.avatar',
                    '.user-avatar',
                    'header .username',
                    `text=Welcome ${userData.username_or_email}`,
                    `text=Hello ${userData.username_or_email}`,
                    'text=Dashboard',
                    'text=My Courses'
                ].join(',');

                await this.page.waitForSelector(authElementSelector, {
                    timeout: 20000,
                    state: 'visible'
                });

                console.log('Found authentication indicator element');
            }

            // Take a verification screenshot of authenticated state
            await this.page.screenshot({path: getScreenshotPath(`login-success-${role}-${Date.now()}.png`)});
            console.log('Authentication verified for', role);

        } catch (error) {
            console.error('Failed to verify authenticated state:', error);
            await this.page.screenshot({path: getScreenshotPath(`login-verification-failed-${role}-${Date.now()}.png`)});

            // Log HTML content for debugging
            const htmlContent = await this.page.content();
            console.log('Page content excerpt:', htmlContent.substring(0, 500) + '...');

            throw new Error(`Failed to verify authentication as ${role}: ${error.message}`);
        }
    }

    // Helper to find an element using multiple possible selectors
    private async findElement(selectors: string[], elementName: string) {
        for (const selector of selectors) {
            try {
                const element = await this.page.waitForSelector(selector, {timeout: 5000, state: 'visible'});
                console.log(`Found ${elementName} with selector: ${selector}`);
                return element;
            } catch (error) {
                // Continue with next selector
            }
        }

        console.error(`Could not find ${elementName} with any selector`);
        await this.page.screenshot({path: getScreenshotPath(`element-not-found-${elementName}-${Date.now()}.png`)});
        throw new Error(`Could not find ${elementName} on the page`);
    }

    async logout(): Promise<void> {
        // Try to find and click a logout button first
        try {
            const logoutSelector = [
                'button:has-text("Logout")',
                'button:has-text("Sign out")',
                '.logout-button',
                '[data-testid="logout-button"]',
                'a:has-text("Logout")',
                'a:has-text("Sign out")'
            ].join(',');

            const logoutButton = await this.page.waitForSelector(logoutSelector, {
                timeout: 5000,
                state: 'visible'
            });

            if (logoutButton) {
                console.log('Found logout button, clicking it');
                await logoutButton.click();
                await this.page.waitForTimeout(2000); // Wait for logout process
            }
        } catch (error) {
            console.log('No logout button found or could not click it, proceeding with manual cleanup');
        }

        // Clear cookies and local storage
        await this.page.context().clearCookies();
        await this.page.evaluate(() => {
            try {
                localStorage.clear();
                sessionStorage.clear();
            } catch {
                // Ignore SecurityError or other storage errors
            }
        });

        // Navigate to login page to ensure we're logged out
        await this.page.goto('/login');
        console.log('Logged out and navigated to login page');
    }
}

// Utility to wait for global loading indicator (isRestoring/loading state) to disappear
export async function waitForGlobalLoadingToDisappear(page: Page, timeout = 20000) {
    // Wait for any global progressbar (not inside login button) to disappear
    try {
        await page.waitForFunction(() => {
            // Check for common loading indicators
            const loaders = [
                document.querySelector('[role="progressbar"]'),
                document.querySelector('.loading-spinner'),
                document.querySelector('.loading-indicator'),
                document.querySelector('[data-testid="loading-indicator"]')
            ];

            // Return true if none are visible (loading has finished)
            return loaders.every(loader => !loader || !loader.isVisible);
        }, {timeout});

        console.log('Global loading indicators have disappeared');
    } catch (error) {
        console.warn('Timeout waiting for loading indicators to disappear or none found');
    }
}

// Helper to save screenshots with context information
export async function takeScreenshot(page: Page, name: string, addTimestamp = true): Promise<void> {
    const timestamp = addTimestamp ? `-${Date.now()}` : '';
    const filename = `${name}${timestamp}.png`;
    await page.screenshot({path: getScreenshotPath(filename)});
    console.log(`Screenshot saved: ${filename}`);
}

