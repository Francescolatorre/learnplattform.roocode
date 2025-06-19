import { Page, Locator, expect } from '@playwright/test';

/**
 * Base page object with common functionality for all pages
 * Serves as a foundation for the Page Object Model pattern implementation
 */
export class BasePage {
  readonly page: Page;
  readonly basePath: string;

  constructor(page: Page, basePath: string = '/') {
    this.page = page;
    this.basePath = basePath;
  }

  /**
   * Navigate to the page
   * @param options Additional navigation options
   */
  async navigateTo(options?: { waitForNetworkIdle?: boolean }): Promise<void> {
    try {
      await this.page.goto(this.basePath);

      if (options?.waitForNetworkIdle) {
        await this.page.waitForLoadState('networkidle');
      }

      await this.waitForPageLoad();
      console.log(`Navigated to ${this.basePath}`);
    } catch (error) {
      console.error(`Failed to navigate to ${this.basePath}:`, error);
      throw error;
    }
  }

  /**
   * Wait for the page to be fully loaded
   * Override in child classes to implement page-specific loading checks
   */
  async waitForPageLoad(timeoutMs: number = 30000): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded', { timeout: timeoutMs });
    console.log('Page loaded');
  }

  /**
   * Get current URL
   */
  getUrl(): string {
    return this.page.url();
  }

  /**
   * Get page title
   */
  async getTitle(): Promise<string> {
    return await this.page.title();
  }

  /**
   * Find element by multiple potential selectors
   * @param selectors Array of selectors to try
   * @param elementName Name of element for logging
   * @param options Additional options
   * @returns Locator for the found element
   */
  async findElement(
    selectors: string[],
    elementName: string,
    options: { timeoutMs?: number } = {}
  ): Promise<Locator> {
    const timeoutMs = options.timeoutMs || 10000;
    let errors: string[] = [];

    // Try each selector in order until one works
    for (const selector of selectors) {
      try {
        const element = this.page.locator(selector);
        await element.waitFor({ timeout: timeoutMs / selectors.length });
        return element;
      } catch (error) {
        errors.push(`Selector "${selector}" failed: ${error}`);
        continue; // Try next selector
      }
    }

    // If we get here, all selectors failed
    console.error(`Failed to find ${elementName} with any selector. Errors:`, errors);
    throw new Error(`Could not locate ${elementName} element`);
  }

  /**
   * Take a screenshot for debugging
   */
  async takeScreenshot(name: string): Promise<void> {
    await this.page.screenshot({
      path: `./test-results/test-artifacts/${name}-${Date.now()}.png`,
      fullPage: true,
    });
    console.log(`Screenshot saved: ${name}`);
  }

  /**
   * Check if element exists
   */
  async elementExists(selector: string, timeoutMs: number = 1000): Promise<boolean> {
    try {
      await this.page.waitForSelector(selector, { timeout: timeoutMs });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Wait for element to be visible
   */
  async waitForElementVisible(selector: string, timeoutMs: number = 10000): Promise<Locator> {
    try {
      await this.page.waitForSelector(selector, { state: 'visible', timeout: timeoutMs });
      return this.page.locator(selector);
    } catch (error) {
      console.error(`Element not visible: ${selector}`, error);
      throw error;
    }
  }

  /**
   * Assert page has loaded correctly
   */
  async assertPageLoaded(): Promise<void> {
    try {
      await this.waitForPageLoad();
      console.log('Page load assertion passed');
    } catch (error) {
      console.error('Page load assertion failed:', error);
      await this.takeScreenshot('page-load-failed');
      throw error;
    }
  }

  /**
   * Fill form field with text
   */
  async fillField(selector: string, value: string): Promise<void> {
    try {
      const field = this.page.locator(selector);
      await field.waitFor({ state: 'visible' });
      await field.fill(value);
    } catch (error) {
      console.error(`Failed to fill field ${selector}:`, error);
      throw error;
    }
  }

  /**
   * Click on element
   */
  async clickElement(selector: string): Promise<void> {
    try {
      const element = this.page.locator(selector);
      await element.waitFor({ state: 'visible' });
      await element.click();
    } catch (error) {
      console.error(`Failed to click element ${selector}:`, error);
      throw error;
    }
  }

  /**
   * Get text content of element
   */
  async getTextContent(selector: string): Promise<string | null> {
    try {
      const element = this.page.locator(selector);
      await element.waitFor({ state: 'visible' });
      return await element.textContent();
    } catch (error) {
      console.error(`Failed to get text content from ${selector}:`, error);
      throw error;
    }
  }

  /**
   * Assert that URL contains specific path
   */
  async assertUrlContains(path: string): Promise<void> {
    const currentUrl = this.getUrl();
    expect(currentUrl).toContain(path);
    console.log(`URL assertion passed: contains "${path}"`);
  }
}
