import {Page, Locator} from '@playwright/test';
import {BasePage} from './BasePage';

/**
 * Page object representing the Markdown Editor component
 * Used to interact with the markdown editor across different pages
 */
export class MarkdownEditorPage extends BasePage {
  // The component doesn't need a standard route as it's not a full page
  readonly page: Page;

  // Editor element selectors
  readonly editorSelectors = [
    '[data-testid="markdown-editor-textarea"]',
    '.markdown-editor textarea',
    'textarea[name="description"]',
    'textarea.markdown-input'
  ];

  // Preview tab selectors
  readonly previewTabSelectors = [
    'button:has-text("Preview")',
    '[role="tab"]:has-text("Preview")',
    'a:has-text("Preview")',
    '.markdown-preview-tab',
    '[data-testid="preview-tab"]'
  ];

  // Edit tab selectors
  readonly editTabSelectors = [
    'button:has-text("Edit")',
    '[role="tab"]:has-text("Edit")',
    'a:has-text("Edit")',
    '.markdown-edit-tab',
    '[data-testid="edit-tab"]'
  ];

  // Preview content selectors
  readonly previewContentSelectors = [
    '.markdown-editor-preview',
    '.preview-content',
    '[data-testid="markdown-preview"]',
    '.markdown-content',
    '.rendered-markdown'
  ];

  // Help button selectors
  readonly helpButtonSelectors = [
    'button:has-text("Help")',
    'button:has-text("Markdown Help")',
    '.markdown-help-button',
    '[data-testid="markdown-help-button"]'
  ];

  // Help dialog selectors
  readonly helpDialogSelectors = [
    '.markdown-help-dialog',
    '.MuiDialog-root:has-text("Markdown Help")',
    '[role="dialog"]:has-text("Markdown")',
    '[data-testid="markdown-help-dialog"]'
  ];

  // Help dialog close button selectors
  readonly helpDialogCloseSelectors = [
    '.markdown-help-dialog button:has-text("Close")',
    '.MuiDialog-root button:has-text("Close")',
    '.MuiDialog-root .MuiDialogActions-root button',
    '[data-testid="markdown-help-close-button"]'
  ];

  constructor(page: Page) {
    super(page, '');
    this.page = page;
  }

  /**
   * Take a screenshot with a descriptive name
   */
  async takeScreenshot(name: string): Promise<void> {
    try {
      await this.page.screenshot({path: `./test-results/test-artifacts/${name}.png`});
      console.log(`Took screenshot: ${name}.png`);
    } catch (error) {
      console.error(`Failed to take screenshot ${name}:`, error);
    }
  }

  /**
   * Find element from multiple selectors
   */
  private async findElement(
    selectors: string[],
    elementName: string,
    options: {timeoutMs?: number} = {}
  ): Promise<Locator> {
    const timeoutMs = options.timeoutMs || 5000;

    // Try each selector with a short timeout
    for (const selector of selectors) {
      try {
        const element = this.page.locator(selector);
        // Use a short timeout for each individual selector
        await element.waitFor({state: 'visible', timeout: Math.min(timeoutMs / selectors.length, 1000)});
        return element;
      } catch {
        // Try next selector
        continue;
      }
    }

    // If we get here, none of the selectors worked with the short timeout
    // Try once more with the combined selector and the full timeout
    const combinedSelector = selectors.join(', ');
    try {
      const element = this.page.locator(combinedSelector);
      await element.waitFor({state: 'visible', timeout: timeoutMs});
      return element;
    } catch (error) {
      console.error(`Failed to find ${elementName} with any of the selectors:`, selectors);
      await this.takeScreenshot(`${elementName.replace(/\s+/g, '-')}-not-found`);
      throw new Error(`Could not find ${elementName} with selectors: ${combinedSelector}`);
    }
  }

  /**
   * Enter markdown content into the editor
   */
  async enterMarkdown(content: string): Promise<void> {
    try {
      const editor = await this.findElement(this.editorSelectors, 'markdown editor');
      await editor.fill(content);
      console.log('Filled markdown content');
    } catch (error) {
      console.error('Failed to enter markdown content:', error);
      throw error;
    }
  }

  /**
   * Get current markdown content from the editor
   */
  async getMarkdown(): Promise<string> {
    try {
      const editor = await this.findElement(this.editorSelectors, 'markdown editor');
      const content = await editor.inputValue();
      return content;
    } catch (error) {
      console.error('Failed to get markdown content:', error);
      return '';
    }
  }

  /**
   * Switch to preview mode
   */
  async switchToPreview(): Promise<void> {
    try {
      const previewTab = await this.findElement(this.previewTabSelectors, 'preview tab');
      await previewTab.click();
      console.log('Switched to preview mode');
      await this.page.waitForTimeout(500); // Wait for rendering
    } catch (error) {
      console.error('Failed to switch to preview mode:', error);
      throw error;
    }
  }

  /**
   * Switch to edit mode
   */
  async switchToEdit(): Promise<void> {
    try {
      const editTab = await this.findElement(this.editTabSelectors, 'edit tab');
      await editTab.click();
      console.log('Switched to edit mode');
    } catch (error) {
      console.error('Failed to switch to edit mode:', error);
      throw error;
    }
  }

  /**
   * Get the rendered HTML from preview
   */
  async getRenderedHTML(): Promise<string | null> {
    try {
      const previewContent = await this.findElement(this.previewContentSelectors, 'preview content', {timeoutMs: 2000});
      const html = await previewContent.innerHTML();
      return html;
    } catch (error) {
      console.warn('Could not get rendered HTML:', error);
      return null;
    }
  }

  /**
   * Check if specific markdown elements are rendered in the preview
   */
  async hasRenderedElements(elements: Array<'heading' | 'paragraph' | 'bold' | 'list' | 'link' | 'image' | 'blockquote' | 'code'>): Promise<boolean> {
    try {
      const previewSelector = this.previewContentSelectors.join(', ');
      let selectors: string[] = [];

      // Map element types to CSS selectors
      const elementSelectors: Record<string, string> = {
        heading: `${previewSelector} h1, ${previewSelector} h2, ${previewSelector} h3, ${previewSelector} h4, ${previewSelector} h5, ${previewSelector} h6`,
        paragraph: `${previewSelector} p`,
        bold: `${previewSelector} strong, ${previewSelector} b`,
        list: `${previewSelector} ul, ${previewSelector} ol, ${previewSelector} li`,
        link: `${previewSelector} a`,
        image: `${previewSelector} img`,
        blockquote: `${previewSelector} blockquote`,
        code: `${previewSelector} code, ${previewSelector} pre`
      };

      // Build selectors for requested elements
      elements.forEach(element => {
        if (elementSelectors[element]) {
          selectors.push(elementSelectors[element]);
        }
      });

      // If no specific elements requested, check for any markdown elements
      if (selectors.length === 0) {
        selectors = Object.values(elementSelectors);
      }

      // Check for presence of any of the requested elements
      for (const selector of selectors) {
        const elementExists = await this.page.locator(selector).isVisible()
          .catch(() => false);

        if (elementExists) {
          return true;
        }
      }

      // None of the requested elements found
      return false;
    } catch (error) {
      console.error('Error checking for rendered markdown elements:', error);
      return false;
    }
  }

  /**
   * Open markdown help dialog
   */
  async openHelpDialog(): Promise<void> {
    try {
      const helpButton = await this.findElement(this.helpButtonSelectors, 'help button');
      await helpButton.click();
      console.log('Clicked help button');

      // Wait for dialog to appear
      const helpDialog = await this.findElement(this.helpDialogSelectors, 'help dialog');
      await helpDialog.waitFor({state: 'visible', timeout: 2000});
      console.log('Help dialog opened');
    } catch (error) {
      console.error('Failed to open help dialog:', error);
      throw error;
    }
  }

  /**
   * Close markdown help dialog
   */
  async closeHelpDialog(): Promise<void> {
    try {
      const closeButton = await this.findElement(this.helpDialogCloseSelectors, 'close button');
      await closeButton.click();
      console.log('Clicked close button for help dialog');
    } catch (error) {
      console.error('Failed to close help dialog:', error);
      throw error;
    }
  }

  /**
   * Check if unsafe HTML content is properly sanitized in preview mode
   */
  async isSanitized(): Promise<boolean> {
    try {
      const html = await this.getRenderedHTML();
      if (!html) return false;

      // Check if script tags were removed
      const hasScript = html.includes('<script>') || html.includes('</script>');

      // Check if event handlers were removed
      const hasEventHandlers = html.includes('onerror=') ||
        html.includes('onclick=') ||
        html.includes('onload=');

      // Check if javascript: links were sanitized
      const hasJsLinks = html.includes('javascript:');

      // Check if iframes were removed
      const hasIframe = html.includes('<iframe') || html.includes('</iframe>');

      const isSanitized = !hasScript && !hasEventHandlers && !hasJsLinks && !hasIframe;
      console.log(`Sanitization check results - No scripts: ${!hasScript}, No event handlers: ${!hasEventHandlers}, No JS links: ${!hasJsLinks}, No iframes: ${!hasIframe}`);

      return isSanitized;
    } catch (error) {
      console.error('Error checking for sanitization:', error);
      return false;
    }
  }
}
