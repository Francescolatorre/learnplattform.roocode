import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { takeScreenshot } from '../setupTests';
import { NavigationHelper } from './NavigationHelper';

/**
 * Page object for the login page
 */
export class LoginPage extends BasePage {
  // Selektoren für Benutzernamenfeld (wird auch für E-Mail verwendet)
  readonly usernameSelectors = [
    '[data-testid="login-username-input"]',
    '[data-testid="email-input"]',
    'input[name="username"]',
    'input[name="email"]',
    'input[type="email"]',
    'input[placeholder*="Email"]',
    'input[placeholder*="Username"]',
    '.login-form input:nth-child(1)',
  ];

  // Selektoren für Passwortfeld
  readonly passwordSelectors = [
    '[data-testid="login-password-input"]',
    '[data-testid="password-input"]',
    'input[name="password"]',
    'input[type="password"]',
    'input[placeholder*="Password"]',
    '.login-form input:nth-child(2)',
    '.login-form input[type="password"]',
  ];

  // Selektoren für Login-Button
  readonly loginButtonSelectors = [
    'button[type="submit"]',
    'button:has-text("Login")',
    'button:has-text("Sign in")',
    'button[data-testid="login-button"]',
    '.login-form button',
  ];

  // Selektoren für Fehlermeldungen
  readonly errorMessageSelectors = [
    '.error-message',
    '.login-error',
    '[data-testid="login-error"]',
    '.alert-error',
    '.text-danger',
  ];

  // Eigenschaften für Elemente auf der Seite
  private _usernameInput: Locator | null = null;
  private _passwordInput: Locator | null = null;
  private _loginButton: Locator | null = null;
  private _authToken: string | null = null;
  private _refreshToken: string | null = null;
  private _navigationHelper: NavigationHelper;

  /**
   * Konstruktor für LoginPage
   * @param page Playwright Page-Objekt
   */
  constructor(page: Page) {
    super(page, '/login');
    this._navigationHelper = new NavigationHelper(page);
  }

  /**
   * Warten bis die Login-Seite geladen ist
   */
  async waitForPageLoad(): Promise<void> {
    console.log('Navigated to login page');
    await this.page.waitForURL('**/login**', { timeout: 10000 });

    // Überprüfen ob die Seite geladen ist
    const currentUrl = this.page.url();
    console.log(`Current URL: ${currentUrl}`);

    const pageTitle = await this.page.title();
    console.log(`Page title: ${pageTitle}`);

    try {
      // Versuchen, das Benutzernamenfeld (oder E-Mail-Feld) zu finden
      this._usernameInput = await this.findElement(
        this.usernameSelectors,
        'username or email input'
      );

      // Versuchen, das Passwortfeld zu finden
      this._passwordInput = await this.findElement(this.passwordSelectors, 'password input');

      // Versuchen, den Login-Button zu finden
      this._loginButton = await this.findElement(this.loginButtonSelectors, 'login button');
    } catch (error) {
      console.error('Login page did not load properly:', error);
      await takeScreenshot(this.page, 'login-page-load-failed');
      throw error;
    }
  }

  /**
   * Login mit den gegebenen Anmeldedaten
   * @param username Benutzername oder E-Mail
   * @param password Passwort
   */
  async login(username: string, password: string): Promise<void> {
    try {
      // Benutzernamenfeld und Passwortfeld ausfüllen
      if (this._usernameInput) {
        await this._usernameInput.fill(username);
      } else {
        this._usernameInput = await this.findElement(
          this.usernameSelectors,
          'username or email input'
        );
        await this._usernameInput.fill(username);
      }

      if (this._passwordInput) {
        await this._passwordInput.fill(password);
      } else {
        this._passwordInput = await this.findElement(this.passwordSelectors, 'password input');
        await this._passwordInput.fill(password);
      }

      // Login-Button suchen und klicken
      if (this._loginButton) {
        await this._loginButton.click();
      } else {
        this._loginButton = await this.findElement(this.loginButtonSelectors, 'login button');
        await this._loginButton.click();
      }

      console.log('Filled login form');
      console.log('Clicked login button');

      // Auf mögliche Fehlermeldungen prüfen
      const hasError = await this.checkForLoginErrors();
      if (hasError) {
        console.error('Login error detected');
        throw new Error('Login failed: Error message displayed');
      }

      console.log('No error messages detected - continuing with login verification');

      // Warten auf erfolgreiche Authentifizierung und Token-Speicherung überprüfen
      const tokensFound = await this.captureAuthTokens();

      // Wenn kein Token gefunden wurde, aber keine Fehlerseite angezeigt wird,
      // versuchen wir einen Fallback über Network-Requests
      if (!tokensFound) {
        console.warn('No tokens found in localStorage, attempting network fallback');
        await this.setupNetworkListeners();
      }

      // Letzter Check: Überprüfen ob wir erfolgreich eingeloggt sind
      const isLoggedIn = await this.verifyLoggedInState();
      if (!isLoggedIn) {
        console.error('Login verification failed');
        await takeScreenshot(this.page, 'login-verification-failed');
        throw new Error('Login appeared to succeed but verification failed');
      }

      // The setAuthTokens method doesn't exist in NavigationHelper
      // Just store the tokens locally in this class
      // No need to share with NavigationHelper anymore
    } catch (error) {
      console.error('Login failed:', error);
      await takeScreenshot(this.page, 'login-failed');
      throw error;
    }
  }

  /**
   * Überprüfen, ob Fehlermeldungen angezeigt werden
   */
  async checkForLoginErrors(): Promise<boolean> {
    for (const selector of this.errorMessageSelectors) {
      const errorElement = this.page.locator(selector);
      const isVisible = await errorElement.isVisible().catch(() => false);

      if (isVisible) {
        const errorText = await errorElement.textContent();
        console.error(`Login error: ${errorText}`);
        return true;
      }
    }
    return false;
  }

  /**
   * Netzwerk-Listener für die Erfassung des Auth-Tokens einrichten
   */
  private async setupNetworkListeners(): Promise<void> {
    console.log('Setting up network listeners to capture authentication token');

    // Prüfen, ob bereits ein Token im localStorage vorhanden ist
    const existingToken = await this.page.evaluate(() => {
      return (
        localStorage.getItem('accessToken') ||
        localStorage.getItem('authToken') ||
        localStorage.getItem('token') ||
        localStorage.getItem('jwt')
      );
    });

    if (existingToken) {
      console.log('Found existing auth token in localStorage');
      this._authToken = existingToken;
      return;
    }

    // Auf den nächsten Request mit Auth-Token warten (max. 5 Sekunden)
    try {
      // Warten auf eine erfolgreiche Antwort von /auth/login/ oder /auth/token/
      const response = await this.page.waitForResponse(
        response => {
          return (
            (response.url().includes('/auth/login/') ||
              response.url().includes('/auth/token/') ||
              response.url().includes('/api/auth/')) &&
            response.status() === 200
          );
        },
        { timeout: 5000 }
      );

      // Token aus der Response extrahieren
      const responseData = await response.json().catch(() => ({}));
      const token =
        responseData.access || responseData.token || responseData.accessToken || responseData.jwt;

      if (token) {
        console.log('Retrieved auth token from network response');
        this._authToken = token;

        // Token im localStorage speichern für weitere Requests
        await this.page.evaluate(token => {
          // Verschiedene gängige Token-Keys versuchen
          localStorage.setItem('accessToken', token);
          localStorage.setItem('authToken', token);
          localStorage.setItem('token', token);
          localStorage.setItem('jwt', token);
        }, token);

        console.log('Stored auth token in localStorage');
        return;
      }
    } catch (error) {
      console.warn('Failed to capture auth token from network:', error);
    }
  }

  /**
   * Warten auf erfolgreiche Authentifizierung (Weiterleitung zu einer geschützten Route)
   * und Überprüfen des Tokens
   */
  async waitForAuthenticationSuccess(): Promise<boolean> {
    console.log('Waiting for authenticated state');

    // Warten auf Weiterleitung (maximal 10 Sekunden)
    // Dies lässt genug Zeit für das Login und die Speicherung des Tokens
    await this.page.waitForTimeout(1000);

    // URL überprüfen und auf Weiterleitung warten
    const currentUrl = this.page.url();
    console.log(`Current URL after login attempt: ${currentUrl}`);

    // Token im localStorage überprüfen
    const token = await this.page.evaluate(() => {
      return (
        localStorage.getItem('accessToken') ||
        localStorage.getItem('authToken') ||
        localStorage.getItem('token') ||
        localStorage.getItem('jwt')
      );
    });

    if (token) {
      console.log('Found authentication token in localStorage');
      this._authToken = token;
      return true;
    }

    // Wenn wir nicht mehr auf der Login-Seite sind, haben wir uns erfolgreich angemeldet
    // obwohl wir den Token nicht direkt gefunden haben
    if (!currentUrl.includes('/login')) {
      console.log(`Authenticated URL detected: ${currentUrl}, but no token found in localStorage`);
      return false;
    }

    // Wenn wir immer noch auf der Login-Seite sind, prüfen wir auf Fehlermeldungen
    const hasError = await this.checkForLoginErrors();
    if (hasError) {
      console.error('Login error detected during authentication check');
      await takeScreenshot(this.page, 'login-error-after-submit');
      throw new Error('Login failed: Error message displayed after submission');
    }

    // Wenn wir immer noch auf der Login-Seite sind und keine Fehler sehen,
    // könnte es ein Problem mit der Weiterleitung geben
    console.warn('Still on login page, but no error detected');
    await takeScreenshot(this.page, 'login-still-on-login-page');
    return false;
  }

  /**
   * Überprüfen ob der Benutzer tatsächlich eingeloggt ist
   * Über UI-Elemente und URL-Änderungen
   */
  async verifyLoggedInState(): Promise<boolean> {
    // URL überprüfen
    const currentUrl = this.page.url();

    // Wenn wir auf einer geschützten Route sind, sind wir wahrscheinlich eingeloggt
    if (
      !currentUrl.includes('/login') &&
      (currentUrl.includes('/dashboard') ||
        currentUrl.includes('/courses') ||
        currentUrl.includes('/profile') ||
        currentUrl.includes('/instructor') ||
        currentUrl.includes('/admin') ||
        currentUrl === this.page.url().split('/').slice(0, 3).join('/') + '/')
    ) {
      console.log('User appears to be logged in based on URL');
      return true;
    }

    // Prüfen auf UI-Elemente, die auf einen eingeloggten Zustand hindeuten
    const logoutButtonVisible = await this.page
      .locator('button:has-text("Logout"), a:has-text("Logout"), [data-testid="logout-button"]')
      .isVisible()
      .catch(() => false);

    const userInfoVisible = await this.page
      .locator('.user-info, .user-avatar, .username, [data-testid="user-info"]')
      .isVisible()
      .catch(() => false);

    const dashboardLinkVisible = await this.page
      .locator('a:has-text("Dashboard"), [data-testid="dashboard-link"]')
      .isVisible()
      .catch(() => false);

    if (logoutButtonVisible || userInfoVisible || dashboardLinkVisible) {
      console.log('User appears to be logged in based on UI elements');
      return true;
    }

    // Letzter Versuch: Prüfen, ob wir einen Auth-Token haben
    if (this._authToken) {
      console.log('User appears to be logged in based on auth token existence');
      return true;
    }

    console.warn('Could not verify logged in state');
    return false;
  }

  /**
   * Überprüfen, ob ein Benutzer mit der gegebenen Rolle angemeldet ist
   */
  async verifyUserLoggedIn(role: string): Promise<void> {
    // Überprüfen, ob wir auf einer geschützten Route sind
    const currentUrl = this.page.url();

    // Einfache Validierung basierend auf erwarteten URLs für verschiedene Rollen
    if (role === 'instructor' && currentUrl.includes('/instructor')) {
      console.log(`Authentication verified for ${role}`);
      return;
    } else if (
      role === 'student' &&
      (currentUrl.includes('/dashboard') || currentUrl.includes('/courses'))
    ) {
      console.log(`Authentication verified for ${role}`);
      return;
    } else if (role === 'admin' && currentUrl.includes('/admin')) {
      console.log(`Authentication verified for ${role}`);
      return;
    } else if (!currentUrl.includes('/login')) {
      // Generischer Fall: Wir sind nicht auf der Login-Seite, also wahrscheinlich authentifiziert
      console.log(`Authentication verified for ${role}`);
      return;
    }

    // Wenn keine der obigen Bedingungen zutrifft, sind wir wahrscheinlich nicht authentifiziert
    console.error(`Authentication failed for ${role}`);
    await takeScreenshot(this.page, 'login-authentication-failed');
    throw new Error(`Authentication failed for ${role}`);
  }

  /**
   * Get stored auth token (if available)
   */
  getAuthToken(): string | null {
    return this._authToken;
  }

  /**
   * Wait for authentication success and capture tokens from localStorage
   * @returns True if authentication tokens were found
   */
  async captureAuthTokens(): Promise<boolean> {
    // Wait for redirect or token storage (max 10 seconds)
    for (let i = 0; i < 10; i++) {
      try {
        // Check for tokens in localStorage
        const tokens = await this.page.evaluate(() => {
          return {
            access:
              localStorage.getItem('accessToken') ||
              localStorage.getItem('authToken') ||
              localStorage.getItem('token') ||
              localStorage.getItem('jwt'),
            refresh: localStorage.getItem('refreshToken'),
          };
        });

        if (tokens.access) {
          this._authToken = tokens.access;
          this._refreshToken = tokens.refresh;
          console.log('Authentication tokens found in localStorage');
          return true;
        }

        // Check if we've been redirected to dashboard or home page
        const currentUrl = this.page.url();
        if (
          currentUrl.includes('/dashboard') ||
          currentUrl.includes('/student') ||
          currentUrl.includes('/instructor') ||
          currentUrl.includes('/admin') ||
          (currentUrl.endsWith('/') && !currentUrl.includes('/login'))
        ) {
          console.log('Redirected to dashboard or home page');

          // Try once more to get tokens
          const tokens = await this.page.evaluate(() => {
            return {
              access:
                localStorage.getItem('accessToken') ||
                localStorage.getItem('authToken') ||
                localStorage.getItem('token') ||
                localStorage.getItem('jwt'),
              refresh: localStorage.getItem('refreshToken'),
            };
          });

          if (tokens.access) {
            this._authToken = tokens.access;
            this._refreshToken = tokens.refresh;
            console.log('Authentication tokens found after redirect');
          } else {
            console.warn('Redirected to authenticated page but no tokens found in localStorage');
          }

          return tokens.access !== null;
        }

        // Wait a bit before checking again
        await this.page.waitForTimeout(500);
      } catch (error) {
        console.error('Error capturing auth tokens:', error);
      }
    }

    console.warn('No authentication tokens found after 10 attempts');
    return false;
  }

  /**
   * Set up network listeners to capture authentication tokens from API responses
   */
  async setupNetworkListeners(): Promise<void> {
    try {
      // Set up a request listener for future requests
      await this.page.route('**/auth/login/**', async (route, request) => {
        console.log('Intercepted login request');
        await route.continue();
      });

      // Set up a response listener to capture auth tokens
      this.page.on('response', async response => {
        const url = response.url();
        if (url.includes('/auth/login') || url.includes('/auth/token')) {
          try {
            const contentType = response.headers()['content-type'] || '';
            if (contentType.includes('application/json')) {
              const data = await response.json().catch(() => null);
              if (data && (data.access || data.token || data.accessToken)) {
                console.log('Captured authentication tokens from network response');
                this._authToken = data.access || data.token || data.accessToken;
                this._refreshToken = data.refresh || data.refreshToken || null;

                // Store tokens in localStorage
                await this.page.evaluate(
                  ({ access, refresh }) => {
                    localStorage.setItem('accessToken', access || '');
                    if (refresh) localStorage.setItem('refreshToken', refresh);
                  },
                  {
                    access: this._authToken,
                    refresh: this._refreshToken,
                  }
                );
              }
            }
          } catch (error) {
            console.error('Error processing auth response:', error);
          }
        }
      });

      console.log('Network listeners set up for authentication');
    } catch (error) {
      console.error('Error setting up network listeners:', error);
    }
  }
}
