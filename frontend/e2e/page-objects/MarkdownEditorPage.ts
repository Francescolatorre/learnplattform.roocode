import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { NavigationHelper } from './NavigationHelper';

/**
 * Page object representing the Markdown Editor component
 * Uses strict data-testid selectors from the MarkdownEditor component
 */
interface MarkdownSelectors {
  container: string;
  textarea: string;
  preview: string;
  writeTab: string;
  previewTab: string;
  editorTabs: string;
  helpButton: string;
  helpDialog: string;
  helpClose: string;
  previewSelectors: string[];
  descriptionSelectors: string[];
}

export class MarkdownEditorPage extends BasePage {
  readonly page: Page;
  readonly navigation: NavigationHelper;

  private readonly selectors: MarkdownSelectors = {
    container: '[data-testid="markdown-editor"]',
    textarea: '[data-testid="markdown-editor-textarea"]',
    preview: '[data-testid="markdown-preview-container"]',
    writeTab: '[data-testid="markdown-write-tab"]',
    previewTab: '[data-testid="markdown-preview-tab"]',
    editorTabs: '[data-testid="markdown-editor-tabs"]',
    helpButton: '[data-testid="markdown-help-button"]',
    helpDialog: '[data-testid="markdown-help-dialog"]',
    helpClose: '[data-testid="markdown-help-close-button"]',
    // Editor preview selectors ordered by priority
    previewSelectors: [
      '[data-testid="markdown-preview-container"]',
      '[data-testid="markdown-editor-preview"]',
      '[data-testid="markdown-preview"]',
      '[data-testid="markdown-preview-content"]',
      '.markdown-editor-preview',
      '.markdown-preview',
      '.preview-content',
    ],
    // Course description selectors ordered by priority
    descriptionSelectors: [
      '[data-testid="course-description"]',
      '.course-description',
      '[data-testid="course-description-container"]',
      '.course-description-container',
    ],
  };

  constructor(page: Page) {
    super(page, '');
    this.page = page;
    this.navigation = new NavigationHelper(page);
  }

  /**
   * Wait for the markdown editor to be fully loaded and ready
   * Improved with better error handling and fallback selectors
   */
  async waitForEditor(): Promise<void> {
    try {
      // Wait for core editor container with retries
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          await this.page.waitForSelector(this.selectors.container, {
            state: 'visible',
            timeout: 5000,
          });
          break;
        } catch (e) {
          if (attempt === 3) throw e;
          await this.page.waitForTimeout(1000);
        }
      }

      // Wait for textarea to be ready
      const textarea = this.page.locator(this.selectors.textarea);
      await textarea.waitFor({ state: 'visible', timeout: 5000 });

      // Ensure textarea is interactive
      await this.page.waitForFunction(
        selector => {
          const el = document.querySelector(selector) as HTMLTextAreaElement;
          return el && !el.disabled;
        },
        this.selectors.textarea,
        { timeout: 5000 }
      );

      // Check for editor tabs if present
      if (await this.page.locator(this.selectors.editorTabs).isVisible()) {
        await this.page.waitForSelector(this.selectors.editorTabs, {
          state: 'visible',
          timeout: 5000,
        });
      }

      console.log('Markdown editor fully loaded and ready');
    } catch (error) {
      console.error('Error waiting for editor:', error);
      throw new Error(`Markdown editor did not load properly: ${error.message}`);
    }
  }

  /**
   * Enter markdown content into the editor
   * Improved with proper mode switching and content verification
   */
  async enterMarkdown(content: string): Promise<void> {
    await this.waitForEditor();
    await this.switchToWrite();

    const textarea = this.page.locator(this.selectors.textarea);
    await textarea.click();
    await textarea.fill(content);

    // Verify content was entered
    const currentContent = await textarea.inputValue();
    if (currentContent !== content) {
      throw new Error('Content was not properly entered into the editor');
    }

    // Small wait for any debounced updates
    await this.page.waitForTimeout(100);
  }

  /**
   * Switch to preview mode
   * Improved with verification and retry logic
   */
  async switchToPreview(): Promise<void> {
    if (await this.isInPreviewMode()) {
      return; // Already in preview mode
    }

    try {
      const previewTab = this.page.locator(this.selectors.previewTab);
      await previewTab.click();

      // Wait for preview mode with retries
      await expect(async () => {
        expect(await this.isInPreviewMode()).toBeTruthy();
      }).toPass({ timeout: 5000 });

      // Wait for preview content
      await this.waitForPreviewContent();
    } catch (error) {
      throw new Error(`Failed to switch to preview mode: ${error.message}`);
    }
  }

  /**
   * Switch to write mode
   * Improved with verification and retry logic
   */
  async switchToWrite(): Promise<void> {
    if (await this.isInWriteMode()) {
      return; // Already in write mode
    }

    try {
      const writeTab = this.page.locator(this.selectors.writeTab);
      await writeTab.click();

      // Wait for write mode with retries
      await expect(async () => {
        expect(await this.isInWriteMode()).toBeTruthy();
      }).toPass({ timeout: 5000 });

      // Ensure textarea is focused and ready
      const textarea = this.page.locator(this.selectors.textarea);
      await textarea.focus();
    } catch (error) {
      throw new Error(`Failed to switch to write mode: ${error.message}`);
    }
  }

  /**
   * Get current markdown content from the editor
   */
  async getMarkdown(): Promise<string> {
    const textarea = this.page.locator(this.selectors.textarea);
    return textarea.inputValue();
  }

  /**
   * Get current content from the editor
   * Returns content from textarea in write mode or preview in preview mode
   */
  async getContent(): Promise<string> {
    try {
      if (await this.isInPreviewMode()) {
        // Try each preview selector until we find visible content
        for (const selector of this.selectors.previewSelectors) {
          const element = await this.page.locator(selector).first();
          if (await element.isVisible()) {
            return await element.innerText();
          }
        }
        throw new Error('No visible preview content found');
      } else {
        // Get content from textarea in write mode
        const textarea = await this.page.locator(this.selectors.textarea);
        return await textarea.inputValue();
      }
    } catch (error) {
      console.error('Error getting editor content:', error);
      throw error;
    }
  }

  /**
   * Get the rendered HTML from preview
   * Improved with support for multiple preview selectors
   */
  async getRenderedHTML(): Promise<string> {
    await this.switchToPreview();

    for (const selector of [this.selectors.preview, ...this.selectors.previewSelectors]) {
      const preview = this.page.locator(selector);
      if (await preview.isVisible()) {
        return preview.innerHTML();
      }
    }

    throw new Error('Could not find preview content');
  }

  /**
   * Check if specific markdown elements are rendered in the preview
   * Improved with retry logic and better error handling
   */
  async hasRenderedElements(
    elements: Array<
      'heading' | 'paragraph' | 'bold' | 'list' | 'link' | 'image' | 'blockquote' | 'code'
    >
  ): Promise<boolean> {
    await this.switchToPreview();

    const elementMap = {
      heading: 'h1, h2, h3, h4, h5, h6',
      paragraph: 'p',
      bold: 'strong',
      list: 'ul, ol',
      link: 'a',
      image: 'img',
      blockquote: 'blockquote',
      code: 'pre, code',
    };

    // Try all possible preview containers
    for (const selector of [this.selectors.preview, ...this.selectors.previewSelectors]) {
      const preview = this.page.locator(selector);
      if (await preview.isVisible()) {
        for (const element of elements) {
          const selector = elementMap[element];
          const count = await preview.locator(selector).count();
          if (count === 0) {
            return false;
          }
        }
        return true;
      }
    }

    return false;
  }

  /**
   * Open markdown help dialog
   */
  async openHelpDialog(): Promise<void> {
    const helpButton = this.page.locator(this.selectors.helpButton);
    await helpButton.click();
    await this.page.locator(this.selectors.helpDialog).waitFor({ state: 'visible' });
  }

  /**
   * Close markdown help dialog
   */
  async closeHelpDialog(): Promise<void> {
    const closeButton = this.page.locator(this.selectors.helpClose);
    await closeButton.click();
    await this.page.locator(this.selectors.helpDialog).waitFor({ state: 'hidden' });
  }

  /**
   * Check if editor is in write mode
   * Improved with better visibility checks
   */
  async isInWriteMode(): Promise<boolean> {
    try {
      const textarea = this.page.locator(this.selectors.textarea);
      const isVisible = await textarea.isVisible();
      const isEnabled = await textarea.isEnabled();
      return isVisible && isEnabled;
    } catch (error) {
      console.error('Error checking write mode:', error);
      return false;
    }
  }

  /**
   * Check if editor is in preview mode
   * Improved with fallback selectors
   */
  async isInPreviewMode(): Promise<boolean> {
    try {
      // Check each preview selector until we find a visible one
      for (const selector of this.selectors.previewSelectors) {
        const element = this.page.locator(selector).first();
        if (await element.isVisible()) {
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error checking preview mode:', error);
      return false;
    }
  }

  /**
   * Wait for preview content to be visible
   * Improved with retry logic and timeout
   */
  async waitForPreviewContent(timeout: number = 10000): Promise<void> {
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
      // Check each preview selector
      for (const selector of this.selectors.previewSelectors) {
        try {
          const element = this.page.locator(selector).first();
          if (await element.isVisible()) {
            const content = await element.innerText();
            if (content.trim().length > 0) {
              return;
            }
          }
        } catch (error) {
          continue; // Try next selector
        }
      }
      await this.page.waitForTimeout(100); // Short delay between checks
    }
    throw new Error('Preview content not visible after timeout');
  }

  /**
   * Open help dialog
   */
  async openHelp(): Promise<void> {
    const helpButton = this.page.locator(this.selectors.helpButton);
    await helpButton.click();
    await this.page.locator(this.selectors.helpDialog).waitFor({ state: 'visible' });
  }

  /**
   * Close help dialog
   */
  async closeHelp(): Promise<void> {
    const closeButton = this.page.locator(this.selectors.helpClose);
    await closeButton.click();
    await this.page.locator(this.selectors.helpDialog).waitFor({ state: 'hidden' });
  }
}
