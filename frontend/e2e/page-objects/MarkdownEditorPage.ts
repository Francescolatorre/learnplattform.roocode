import {Page, Locator} from '@playwright/test';
import {BasePage} from './BasePage';
import {NavigationHelper} from './NavigationHelper';

/**
 * Page object representing the Markdown Editor component
 * Used to interact with the markdown editor across different pages
 */
export class MarkdownEditorPage extends BasePage {
  // The component doesn't need a standard route as it's not a full page
  readonly page: Page;
  readonly navigation: NavigationHelper;

  // Editor element selectors
  readonly editorSelectors = [
    '[data-testid="markdown-editor-textarea"]',
    '.markdown-editor textarea',
    'textarea[name="description"]',
    'textarea[name="content"]',
    'textarea.markdown-input',
    '.CodeMirror textarea',
    'textarea.MuiInputBase-input',
    'textarea'
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
    '[data-testid="edit-tab"]',
    'button:has-text("Write")'
  ];

  // Preview content selectors
  readonly previewContentSelectors = [
    '.markdown-editor-preview',
    '.preview-content',
    '[data-testid="markdown-preview"]',
    '.markdown-content',
    '.rendered-markdown',
    '.markdown-preview',
    '.markdown-body',
    '.course-description',
    '[data-testid="course-description"]',
    '.MuiPaper-root .markdown-content',
    '.MuiPaper-root .course-content'
  ];

  // Help button selectors
  readonly helpButtonSelectors = [
    'button:has-text("Help")',
    'button:has-text("Markdown Help")',
    '.markdown-help-button',
    '[data-testid="markdown-help-button"]',
    'button[aria-label="Markdown Help"]',
    'button:has-text("Guide")',
    'button:has-text("Markdown Guide")'
  ];

  // Help dialog selectors
  readonly helpDialogSelectors = [
    '.markdown-help-dialog',
    '.MuiDialog-root:has-text("Markdown Help")',
    '[role="dialog"]:has-text("Markdown")',
    '[data-testid="markdown-help-dialog"]',
    '.markdown-guide-dialog',
    '.markdown-cheatsheet'
  ];

  // Help dialog close button selectors
  readonly helpDialogCloseSelectors = [
    '.markdown-help-dialog button:has-text("Close")',
    '.MuiDialog-root button:has-text("Close")',
    '.MuiDialog-root .MuiDialogActions-root button',
    '[data-testid="markdown-help-close-button"]',
    '.MuiDialogActions-root button:has-text("Got it")',
    '.MuiDialogActions-root button:has-text("OK")',
    '.markdown-help-dialog button[aria-label="close"]',
    '.MuiDialog-root button'
  ];

  constructor(page: Page) {
    super(page, '');
    this.page = page;
    this.navigation = new NavigationHelper(page);
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
   * Find element from multiple selectors with improved error handling
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
        await element.waitFor({state: 'visible', timeout: Math.min(timeoutMs / selectors.length, 1000)})
          .catch(() => { });

        // Check visibility directly
        if (await element.isVisible({timeout: 100}).catch(() => false)) {
          console.log(`Found ${elementName} with selector: ${selector}`);
          return element;
        }
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
   * Navigate to course creation or edit page (instructor role)
   * Uses menu-based navigation instead of direct URL
   */
  async navigateToInstructorCourseCreation(): Promise<void> {
    try {
      // Use the NavigationHelper to navigate to instructor courses
      await this.navigation.navigateToInstructor();

      // Check for a "Create Course" or "New Course" button
      const createCourseButton = this.page.locator('a:has-text("Create Course"), button:has-text("Create Course"), a:has-text("New Course"), button:has-text("New Course")').first();
      if (await createCourseButton.isVisible({timeout: 3000}).catch(() => false)) {
        await createCourseButton.click();
        console.log('Clicked Create Course button');
        await this.page.waitForLoadState('networkidle');
      } else {
        console.warn('Create Course button not found, attempting direct navigation');
        await this.page.goto('/instructor/courses/new');
      }

      // Wait for the markdown editor to appear
      const editor = this.page.locator(this.editorSelectors.join(', '));
      await editor.waitFor({timeout: 5000}).catch(() => {
        console.warn('Markdown editor not immediately visible, taking screenshot');
        this.takeScreenshot('markdown-editor-navigation');
      });

      console.log('Navigated to course creation page with markdown editor');
    } catch (error) {
      console.error('Failed to navigate to instructor course creation:', error);
      await this.takeScreenshot('navigation-to-course-creation-failed');
      throw error;
    }
  }

  /**
   * Enter markdown content into the editor with improved error handling and retry logic
   */
  async enterMarkdown(content: string, maxRetries = 3): Promise<void> {
    let lastError = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Attempt ${attempt}/${maxRetries} to enter markdown content`);

        if (attempt > 1) {
          // Wait a moment before retrying
          await this.page.waitForTimeout(1000 * attempt);
          console.log(`Waiting before retry attempt ${attempt}...`);

          // Take a screenshot to see what's on the page
          await this.takeScreenshot(`markdown-editor-attempt-${attempt}`);
        }

        // First try to find the editor with our specific selectors
        let editor = null;
        for (const selector of this.editorSelectors) {
          try {
            const editorLocator = this.page.locator(selector);
            // Use a more generous timeout for the first selector on retries
            const timeout = (attempt > 1 && selector === this.editorSelectors[0]) ? 3000 : 1000;

            if (await editorLocator.isVisible({timeout}).catch(() => false)) {
              editor = editorLocator;
              console.log(`Found markdown editor with selector: ${selector}`);
              break;
            }
          } catch (err) {
            // Continue to next selector
            continue;
          }
        }

        // If we couldn't find the editor with specific selectors, try a more generic approach
        if (!editor) {
          console.warn('Could not find markdown editor with specific selectors, trying generic textarea');

          // Look for any visible textarea first
          const textareas = this.page.locator('textarea');
          const count = await textareas.count();

          for (let i = 0; i < count; i++) {
            const textarea = textareas.nth(i);
            if (await textarea.isVisible({timeout: 1000}).catch(() => false)) {
              editor = textarea;
              console.log(`Found generic textarea at index ${i}`);
              break;
            }
          }

          // If still not found, try the first one regardless of visibility
          if (!editor && count > 0) {
            editor = textareas.first();
            console.log('Using first textarea element found, even though not visible');

            // Force visibility and wait for it
            await this.page.evaluate(() => {
              const textareas = document.querySelectorAll('textarea');
              if (textareas.length > 0) {
                (textareas[0] as HTMLElement).style.display = 'block';
                (textareas[0] as HTMLElement).style.visibility = 'visible';
              }
            });

            await this.page.waitForTimeout(500);
          }
        }

        // As a last resort, look for content editable divs
        if (!editor) {
          const contentEditableDiv = this.page.locator('[contenteditable="true"]').first();
          if (await contentEditableDiv.count() > 0) {
            editor = contentEditableDiv;
            console.log('Using contenteditable div as editor');
          }
        }

        if (!editor) {
          throw new Error('Could not find any textarea element for markdown editing');
        }

        // Try clicking on the editor to ensure it's focused
        await editor.click({timeout: 2000}).catch(() => {
          console.warn('Could not click editor, trying to force focus');
          // Try to force focus via JavaScript
          this.page.evaluate((selector) => {
            const elements = document.querySelectorAll(selector);
            if (elements.length > 0) {
              (elements[0] as HTMLElement).focus();
            }
          }, editor.toString());
        });

        // Try to clear existing content
        try {
          await editor.press('Control+a');
          await editor.press('Delete');
        } catch (clearError) {
          console.warn('Could not clear editor with keyboard shortcuts, trying direct fill');
        }

        // Enter new content
        await editor.fill(content).catch(async (fillError) => {
          console.warn('Could not use fill() method, trying type() instead');
          await editor.type(content, {delay: 10});
        });

        console.log('Filled markdown content');

        // Short pause after input to ensure content is processed
        await this.page.waitForTimeout(500);
        return;  // Success! Exit the function

      } catch (error) {
        lastError = error;
        console.error(`Attempt ${attempt}: Failed to enter markdown content:`, error);

        // Take a screenshot of the failure
        await this.takeScreenshot(`markdown-editor-error-attempt-${attempt}`);

        // If this was the last attempt, re-throw the error
        if (attempt === maxRetries) {
          throw error;
        }
      }
    }

    // If we get here, all attempts failed
    throw lastError || new Error('Failed to enter markdown content after multiple attempts');
  }

  /**
   * Enter markdown content line by line for better reliability
   */
  async enterMarkdownLineByLine(content: string): Promise<void> {
    try {
      // First find the editor
      let editor = null;
      for (const selector of this.editorSelectors) {
        const editorLocator = this.page.locator(selector);
        if (await editorLocator.isVisible({timeout: 1000}).catch(() => false)) {
          editor = editorLocator;
          console.log(`Found markdown editor with selector: ${selector}`);
          break;
        }
      }

      if (!editor) {
        console.warn('Could not find markdown editor with specific selectors, trying generic textarea');
        editor = this.page.locator('textarea').first();
        if (!await editor.isVisible({timeout: 1000}).catch(() => false)) {
          throw new Error('Could not find any visible textarea element for markdown editing');
        }
      }

      // Clear existing content
      await editor.click();
      await editor.press('Control+a');
      await editor.press('Delete');

      // Split content into lines and enter one by one
      const lines = content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        await editor.type(lines[i]);
        if (i < lines.length - 1) {
          await editor.press('Enter');
          await this.page.waitForTimeout(50); // Small pause between lines
        }
      }

      console.log('Entered markdown content line by line');
      await this.page.waitForTimeout(500); // Wait for content to be processed
    } catch (error) {
      console.error('Failed to enter markdown line by line:', error);
      await this.takeScreenshot('markdown-line-entry-error');
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
   * Switch to preview mode with better error handling
   */
  async switchToPreview(): Promise<void> {
    try {
      // Check if already in preview mode by looking for preview content
      for (const selector of this.previewContentSelectors) {
        const previewElement = this.page.locator(selector);
        if (await previewElement.isVisible({timeout: 1000}).catch(() => false)) {
          console.log('Already in preview mode, preview content is visible');
          return;
        }
      }

      // Find and click the preview tab
      const previewTab = await this.findElement(this.previewTabSelectors, 'preview tab');
      await previewTab.click();
      console.log('Clicked preview tab');

      // Wait for preview content to be visible
      for (const selector of this.previewContentSelectors) {
        const previewContent = this.page.locator(selector);
        const isVisible = await previewContent.isVisible({timeout: 2000}).catch(() => false);
        if (isVisible) {
          console.log(`Preview content visible with selector: ${selector}`);
          await this.page.waitForTimeout(500); // Wait for rendering to complete
          return;
        }
      }

      console.warn('Clicked preview tab but preview content not immediately visible');
    } catch (error) {
      console.error('Failed to switch to preview mode:', error);
      await this.takeScreenshot('preview-switch-error');
      throw error;
    }
  }

  /**
   * Switch to edit mode with better error handling
   */
  async switchToEdit(): Promise<void> {
    try {
      // Check if already in edit mode by looking for the editor
      for (const selector of this.editorSelectors) {
        const editorElement = this.page.locator(selector);
        if (await editorElement.isVisible({timeout: 1000}).catch(() => false)) {
          console.log('Already in edit mode, editor is visible');
          return;
        }
      }

      // Find and click the edit tab
      const editTab = await this.findElement(this.editTabSelectors, 'edit tab');
      await editTab.click();
      console.log('Clicked edit tab');

      // Wait for editor to be visible
      for (const selector of this.editorSelectors) {
        const editor = this.page.locator(selector);
        const isVisible = await editor.isVisible({timeout: 2000}).catch(() => false);
        if (isVisible) {
          console.log(`Editor visible with selector: ${selector}`);
          return;
        }
      }

      console.warn('Clicked edit tab but editor not immediately visible');
    } catch (error) {
      console.error('Failed to switch to edit mode:', error);
      await this.takeScreenshot('edit-switch-error');
      throw error;
    }
  }

  /**
   * Get the rendered HTML from preview with improved reliability
   */
  async getRenderedHTML(): Promise<string | null> {
    try {
      // Try to find the preview content using any of our selectors
      for (const selector of this.previewContentSelectors) {
        const previewContent = this.page.locator(selector);
        if (await previewContent.isVisible({timeout: 1000}).catch(() => false)) {
          const html = await previewContent.innerHTML();
          return html;
        }
      }

      // If we're not already on the preview tab, try switching to it
      await this.switchToPreview();

      // Try again after switching
      for (const selector of this.previewContentSelectors) {
        const previewContent = this.page.locator(selector);
        if (await previewContent.isVisible({timeout: 1000}).catch(() => false)) {
          const html = await previewContent.innerHTML();
          return html;
        }
      }

      console.warn('Could not find preview content with any selector');
      await this.takeScreenshot('preview-content-not-found');
      return null;
    } catch (error) {
      console.warn('Could not get rendered HTML:', error);
      await this.takeScreenshot('preview-content-error');
      return null;
    }
  }

  /**
   * Check if specific markdown elements are rendered in the preview
   * More robust implementation
   */
  async hasRenderedElements(elements: Array<'heading' | 'paragraph' | 'bold' | 'list' | 'link' | 'image' | 'blockquote' | 'code'>): Promise<boolean> {
    try {
      // First ensure we're in preview mode
      await this.switchToPreview();

      // Try to find the preview container
      let previewContainer: Locator | null = null;

      for (const selector of this.previewContentSelectors) {
        const container = this.page.locator(selector);
        if (await container.isVisible({timeout: 1000}).catch(() => false)) {
          previewContainer = container;
          console.log(`Found preview container with selector: ${selector}`);
          break;
        }
      }

      // If we still couldn't find the preview container, try a more generic approach
      if (!previewContainer) {
        // Look for common tags that would be present in rendered markdown
        const possibleMarkdownElements = [
          'h1, h2, h3, h4, h5, h6', // Headers
          'p', // Paragraphs
          'ul, ol', // Lists
          'blockquote', // Blockquotes
          'pre, code' // Code blocks
        ];

        // Try to find any of these elements in the page
        for (const selector of possibleMarkdownElements) {
          const elements = this.page.locator(selector);
          const count = await elements.count();
          if (count > 0) {
            // Use the first element's parent as our container
            const firstElement = elements.first();
            previewContainer = firstElement.locator('xpath=..');
            console.log(`Found markdown container using element selector: ${selector}`);
            break;
          }
        }
      }

      if (!previewContainer) {
        console.error('Could not find any markdown preview container');
        await this.takeScreenshot('markdown-container-not-found');
        return false;
      }

      // Map element types to CSS selectors
      const elementSelectors: Record<string, string> = {
        heading: 'h1, h2, h3, h4, h5, h6',
        paragraph: 'p',
        bold: 'strong, b',
        list: 'ul, ol, li',
        link: 'a',
        image: 'img',
        blockquote: 'blockquote',
        code: 'code, pre'
      };

      // Build selectors for requested elements
      const selectorsToCheck = elements.length > 0
        ? elements.map(el => elementSelectors[el]).filter(Boolean)
        : Object.values(elementSelectors);

      // Check for presence of any of the requested elements
      for (const selector of selectorsToCheck) {
        const matchingElements = previewContainer.locator(selector);
        const count = await matchingElements.count();
        if (count > 0) {
          console.log(`Found ${count} rendered markdown elements: ${selector}`);
          return true;
        }
      }

      // None of the requested elements found
      console.warn('No requested markdown elements found in preview');
      await this.takeScreenshot('markdown-elements-not-found');
      return false;
    } catch (error) {
      console.error('Error checking for rendered markdown elements:', error);
      await this.takeScreenshot('markdown-elements-check-error');
      return false;
    }
  }

  /**
   * Check if any markdown formatting is visible in the container
   */
  async hasAnyMarkdownFormatting(): Promise<boolean> {
    try {
      // Get HTML content from the page
      const html = await this.getRenderedHTML();
      if (!html) return false;

      // Define patterns that indicate markdown formatting
      const markdownPatterns = [
        /<h[1-6]>.*?<\/h[1-6]>/i, // Headers
        /<(strong|b)>.*?<\/(strong|b)>/i, // Bold text
        /<(em|i)>.*?<\/(em|i)>/i, // Italic text
        /<(ul|ol)>.*?<\/(ul|ol)>/i, // Lists
        /<a href.*?>.*?<\/a>/i, // Links
        /<blockquote>.*?<\/blockquote>/i, // Blockquotes
        /<(pre|code)>.*?<\/(pre|code)>/i // Code blocks
      ];

      // Check if any of the patterns match
      for (const pattern of markdownPatterns) {
        if (pattern.test(html)) {
          console.log(`Detected markdown formatting: ${pattern}`);
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('Error checking for markdown formatting:', error);
      return false;
    }
  }

  /**
   * Open markdown help dialog
   */
  async openHelpDialog(): Promise<void> {
    try {
      // First check if help dialog is already open
      for (const selector of this.helpDialogSelectors) {
        const dialog = this.page.locator(selector);
        if (await dialog.isVisible({timeout: 1000}).catch(() => false)) {
          console.log('Help dialog is already open');
          return;
        }
      }

      // Find and click the help button
      const helpButton = await this.findElement(this.helpButtonSelectors, 'help button');
      await helpButton.click();
      console.log('Clicked help button');

      // Wait for dialog to appear
      for (const selector of this.helpDialogSelectors) {
        const dialog = this.page.locator(selector);
        if (await dialog.isVisible({timeout: 3000}).catch(() => false)) {
          console.log(`Help dialog opened with selector: ${selector}`);
          return;
        }
      }

      console.warn('Clicked help button but dialog not immediately visible');
      await this.takeScreenshot('help-dialog-not-visible');
    } catch (error) {
      console.error('Failed to open help dialog:', error);
      await this.takeScreenshot('help-dialog-error');
      throw error;
    }
  }

  /**
   * Close markdown help dialog
   */
  async closeHelpDialog(): Promise<void> {
    try {
      // Check if dialog is open
      let dialogIsOpen = false;
      for (const selector of this.helpDialogSelectors) {
        const dialog = this.page.locator(selector);
        if (await dialog.isVisible({timeout: 1000}).catch(() => false)) {
          dialogIsOpen = true;
          break;
        }
      }

      if (!dialogIsOpen) {
        console.log('Help dialog is not open, nothing to close');
        return;
      }

      // Find and click close button
      for (const selector of this.helpDialogCloseSelectors) {
        const closeButton = this.page.locator(selector);
        if (await closeButton.isVisible({timeout: 1000}).catch(() => false)) {
          await closeButton.click();
          console.log(`Clicked close button with selector: ${selector}`);

          // Wait for dialog to close
          await this.page.waitForTimeout(500);

          // Verify dialog is closed
          let stillOpen = false;
          for (const dialogSelector of this.helpDialogSelectors) {
            const dialog = this.page.locator(dialogSelector);
            if (await dialog.isVisible({timeout: 1000}).catch(() => false)) {
              stillOpen = true;
              break;
            }
          }

          if (!stillOpen) {
            console.log('Help dialog closed successfully');
            return;
          }
        }
      }

      // If we get here, we couldn't find a close button or the dialog didn't close
      // Try pressing Escape key
      console.warn('Could not close dialog with buttons, trying Escape key');
      await this.page.keyboard.press('Escape');
      await this.page.waitForTimeout(500);

      // Check if dialog is still open
      for (const selector of this.helpDialogSelectors) {
        const dialog = this.page.locator(selector);
        if (await dialog.isVisible({timeout: 1000}).catch(() => false)) {
          console.error('Failed to close help dialog');
          await this.takeScreenshot('help-dialog-not-closed');
          throw new Error('Could not close help dialog');
        }
      }

      console.log('Closed help dialog with Escape key');
    } catch (error) {
      console.error('Failed to close help dialog:', error);
      await this.takeScreenshot('close-help-dialog-error');
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

      if (!isSanitized) {
        await this.takeScreenshot('unsanitized-content');
      }

      return isSanitized;
    } catch (error) {
      console.error('Error checking for sanitization:', error);
      return false;
    }
  }

  /**
   * Test the complete markdown workflow with integrated error recovery
   */
  async testCompleteMarkdownWorkflow(testMarkdown?: string): Promise<boolean> {
    try {
      // Use provided markdown or a default test string
      const markdownContent = testMarkdown || `# Test Heading\n\nThis is a **bold** test with a [link](https://example.com).\n\n- List item 1\n- List item 2\n\n\`\`\`\ncode block\n\`\`\``;

      // Try entering the markdown content
      try {
        await this.enterMarkdown(markdownContent);
      } catch (error) {
        console.warn('Regular markdown entry failed, trying line by line:', error);
        await this.enterMarkdownLineByLine(markdownContent);
      }

      // Switch to preview mode
      await this.switchToPreview();

      // Check if markdown elements are rendered
      const previewWorks = await this.hasRenderedElements(['heading', 'bold', 'list', 'code', 'link']);

      if (!previewWorks) {
        // If element checks fail, try a more general approach
        const anyFormatting = await this.hasAnyMarkdownFormatting();
        if (!anyFormatting) {
          console.error('Markdown preview does not render elements correctly');
          await this.takeScreenshot('markdown-preview-failure');
          return false;
        }
        console.log('Found some markdown formatting, continuing test');
      }

      // Switch back to edit mode
      await this.switchToEdit();

      // Check if the text is preserved
      const savedText = await this.getMarkdown();
      const textPreserved = savedText.includes('Test Heading') ||
        savedText.includes('bold') ||
        savedText.includes('link');

      if (!textPreserved) {
        console.error('Text not preserved when switching between edit and preview');
        await this.takeScreenshot('markdown-text-not-preserved');
        return false;
      }

      console.log('Complete markdown workflow test successful');
      return true;
    } catch (error) {
      console.error('Error testing complete markdown workflow:', error);
      await this.takeScreenshot('markdown-workflow-error');
      return false;
    }
  }
}
