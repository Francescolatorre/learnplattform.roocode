import {Page, Locator} from '@playwright/test';
import {BasePage} from './BasePage';

/**
 * Page object representing the login page
 */
export class LoginPage extends BasePage {
  // Form field selectors with multiple options for resilient tests
  readonly emailInputSelectors = [
    '[data-testid="email-input"]',
    'input[name="email"]',
    'input[type="email"]',
    'input[placeholder*="Email"]',
    '.login-form input:nth-child(1)'
  ];

  readonly passwordInputSelectors = [
    '[data-testid="password-input"]',
    'input[name="password"]',
    'input[type="password"]',
    'input[placeholder*="Password"]',
    '.login-form input[type="password"]'
  ];

  readonly loginButtonSelectors = [
    '[data-testid="login-button"]',
    'button[type="submit"]',
    'button:has-text("Login")',
    'button:has-text("Sign In")',
    '.login-button'
  ];

  readonly forgotPasswordLinkSelectors = [
    '[data-testid="forgot-password-link"]',
    'a:has-text("Forgot Password")',
    'a:has-text("Reset Password")',
    '.forgot-password'
  ];

  readonly registerLinkSelectors = [
    '[data-testid="register-link"]',
    'a:has-text("Register")',
    'a:has-text("Sign Up")',
    '.register-link'
  ];

  readonly errorMessageSelectors = [
    '[data-testid="login-error"]',
    '.error-message',
    '.alert-danger',
    '.form-error'
  ];

  constructor(page: Page) {
    super(page, '/login');
  }

  /**
   * Fill in login form with credentials
   */
  async fillLoginForm(email: string, password: string): Promise<void> {
    try {
      const emailInput = await this.findElement(this.emailInputSelectors, 'email input');
      const passwordInput = await this.findElement(this.passwordInputSelectors, 'password input');

      await emailInput.fill(email);
      console.log(`Filled email: ${email}`);

      await passwordInput.fill(password);
      console.log('Filled password (hidden)');
    } catch (error) {
      console.error('Failed to fill login form:', error);
      throw error;
    }
  }

  /**
   * Click login button to submit credentials
   */
  async clickLoginButton(): Promise<void> {
    try {
      const loginButton = await this.findElement(this.loginButtonSelectors, 'login button');
      await loginButton.click();
      console.log('Clicked login button');
    } catch (error) {
      console.error('Failed to click login button:', error);
      throw error;
    }
  }

  /**
   * Login with provided credentials
   */
  async login(email: string, password: string): Promise<void> {
    try {
      await this.fillLoginForm(email, password);
      await this.clickLoginButton();

      // Wait for navigation away from login page
      await this.page.waitForURL(url => !url.pathname.includes('/login'),
        {timeout: 5000}
      );
      console.log('Logged in successfully');
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  /**
   * Get error message text if present
   */
  async getErrorMessage(): Promise<string | null> {
    try {
      const errorMessage = await this.findElement(this.errorMessageSelectors, 'error message');
      const text = await errorMessage.textContent();
      return text ? text.trim() : null;
    } catch (error) {
      console.log('No error message found');
      return null;
    }
  }

  /**
   * Click forgot password link
   */
  async clickForgotPassword(): Promise<void> {
    try {
      const forgotPasswordLink = await this.findElement(this.forgotPasswordLinkSelectors, 'forgot password link');
      await forgotPasswordLink.click();
      console.log('Clicked forgot password link');
      await this.page.waitForURL('**/forgot-password', {timeout: 5000});
    } catch (error) {
      console.error('Failed to click forgot password link:', error);
      throw error;
    }
  }

  /**
   * Click register link to navigate to registration page
   */
  async clickRegisterLink(): Promise<void> {
    try {
      const registerLink = await this.findElement(this.registerLinkSelectors, 'register link');
      await registerLink.click();
      console.log('Clicked register link');
      await this.page.waitForURL('**/register', {timeout: 5000});
    } catch (error) {
      console.error('Failed to click register link:', error);
      throw error;
    }
  }

  /**
   * Check if on login page
   */
  async isOnLoginPage(): Promise<boolean> {
    try {
      const currentUrl = this.getUrl();
      if (!currentUrl.includes('/login')) {
        return false;
      }

      // Check for email input
      const emailInputExists = await this.findElement(
        this.emailInputSelectors,
        'email input',
        {timeoutMs: 2000}
      ).then(() => true).catch(() => false);

      return emailInputExists;
    } catch (error) {
      console.error('Error checking if on login page:', error);
      return false;
    }
  }

  /**
   * Wait for page load by checking for login form elements
   */
  override async waitForPageLoad(timeoutMs: number = 5000): Promise<void> {
    try {
      await this.findElement(this.emailInputSelectors, 'email input', {timeoutMs});
      await this.findElement(this.passwordInputSelectors, 'password input', {timeoutMs});
      await this.findElement(this.loginButtonSelectors, 'login button', {timeoutMs});
      console.log('Login page loaded');
    } catch (error) {
      console.error('Login page did not load properly:', error);
      throw error;
    }
  }
}
