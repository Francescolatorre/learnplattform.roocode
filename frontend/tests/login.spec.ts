import { test, expect } from '@playwright/test';

test.describe('Login Functionality', () => {
    test('should log in successfully with valid credentials', async ({ page }) => {
        await page.goto('http://localhost:3000/login'); // Ensure this matches your server's URL

        // Fill in the login form
        await page.fill('input[name="username"]', 'testuser'); // Replace with a valid username
        await page.fill('input[name="password"]', 'password123'); // Replace with a valid password

        // Submit the form
        await page.click('button[type="submit"]');

        // Wait for navigation or a success indicator
        await page.waitForURL('http://localhost:3000/dashboard'); // Adjust the URL to your post-login page

        // Assert that the user is logged in
        const welcomeMessage = await page.textContent('h1');
        expect(welcomeMessage).toContain('Welcome'); // Adjust the selector and text as needed
    });

    test('should show an error message for invalid credentials', async ({ page }) => {
        await page.goto('http://localhost:3000/login'); // Ensure this matches your server's URL

        // Fill in the login form with invalid credentials
        await page.fill('input[name="username"]', 'invaliduser');
        await page.fill('input[name="password"]', 'wrongpassword');

        // Submit the form
        await page.click('button[type="submit"]');

        // Assert that an error message is displayed
        const errorMessage = await page.textContent('.error-message'); // Adjust the selector as needed
        expect(errorMessage).toContain('Invalid username or password'); // Adjust the text as needed
    });
});
