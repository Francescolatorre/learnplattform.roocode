import {Page, Locator, expect} from '@playwright/test';
import {BasePage} from './BasePage';
import {NavigationHelper} from './NavigationHelper';

/**
 * Page object for task-related markdown editing.
 * Encapsulates only selectors and logic relevant to task markdown editors.
 */
interface TaskMarkdownSelectors {
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
}

export class TaskMarkdownEditorPage extends BasePage {
    readonly page: Page;
    readonly navigation: NavigationHelper;

    private readonly selectors: TaskMarkdownSelectors = {
        container: '[data-testid="markdown-editor"]',
        textarea: '[data-testid="markdown-editor-textarea"]',
        preview: '[data-testid="markdown-preview-container"]',
        writeTab: '[data-testid="markdown-write-tab"]',
        previewTab: '[data-testid="markdown-preview-tab"]',
        editorTabs: '[data-testid="markdown-editor-tabs"]',
        helpButton: '[data-testid="markdown-help-button"]',
        helpDialog: '[data-testid="markdown-help-dialog"]',
        helpClose: '[data-testid="markdown-help-close-button"]',
        // Editor preview selectors ordered by priority (task context)
        previewSelectors: [
            '[data-testid="markdown-preview-container"]',
            '[data-testid="markdown-editor-preview"]',
            '[data-testid="markdown-preview"]',
            '[data-testid="markdown-preview-content"]',
            '.markdown-editor-preview',
            '.markdown-preview',
            '.preview-content'
        ]
    };

    constructor(page: Page) {
        super(page, '');
        this.page = page;
        this.navigation = new NavigationHelper(page);
    }

    /**
     * Wait for the markdown editor to be fully loaded and ready (task context)
     */
    async waitForEditor(): Promise<void> {
        try {
            for (let attempt = 1; attempt <= 3; attempt++) {
                try {
                    await this.page.waitForSelector(this.selectors.container, {
                        state: 'visible',
                        timeout: 5000
                    });
                    break;
                } catch (e) {
                    if (attempt === 3) throw e;
                    await this.page.waitForTimeout(1000);
                }
            }
            const textarea = this.page.locator(this.selectors.textarea);
            await textarea.waitFor({state: 'visible', timeout: 5000});
            await this.page.waitForFunction(
                (selector) => {
                    const el = document.querySelector(selector) as HTMLTextAreaElement;
                    return el && !el.disabled;
                },
                this.selectors.textarea,
                {timeout: 5000}
            );
            if (await this.page.locator(this.selectors.editorTabs).isVisible()) {
                await this.page.waitForSelector(this.selectors.editorTabs, {
                    state: 'visible',
                    timeout: 5000
                });
            }
        } catch (error) {
            throw new Error(`Markdown editor did not load properly: ${error.message}`);
        }
    }

    /**
     * Enter markdown content into the editor (task context)
     */
    async enterMarkdown(content: string): Promise<void> {
        await this.waitForEditor();
        await this.switchToWrite();
        const textarea = this.page.locator(this.selectors.textarea);
        await textarea.click();
        await textarea.fill(content);
        const currentContent = await textarea.inputValue();
        if (currentContent !== content) {
            throw new Error('Content was not properly entered into the editor');
        }
        await this.page.waitForTimeout(100);
    }

    /**
     * Switch to preview mode (task context)
     */
    async switchToPreview(): Promise<void> {
        if (await this.isInPreviewMode()) {
            return;
        }
        try {
            const previewTab = this.page.locator(this.selectors.previewTab);
            await previewTab.click();
            await expect(async () => {
                expect(await this.isInPreviewMode()).toBeTruthy();
            }).toPass({timeout: 5000});
            await this.waitForPreviewContent();
        } catch (error) {
            throw new Error(`Failed to switch to preview mode: ${error.message}`);
        }
    }

    /**
     * Switch to write mode (task context)
     */
    async switchToWrite(): Promise<void> {
        if (await this.isInWriteMode()) {
            return;
        }
        try {
            const writeTab = this.page.locator(this.selectors.writeTab);
            await writeTab.click();
            await expect(async () => {
                expect(await this.isInWriteMode()).toBeTruthy();
            }).toPass({timeout: 5000});
            const textarea = this.page.locator(this.selectors.textarea);
            await textarea.focus();
        } catch (error) {
            throw new Error(`Failed to switch to write mode: ${error.message}`);
        }
    }

    /**
     * Get current markdown content from the editor (task context)
     */
    async getMarkdown(): Promise<string> {
        const textarea = this.page.locator(this.selectors.textarea);
        return textarea.inputValue();
    }

    /**
     * Get current content from the editor (task context)
     */
    async getContent(): Promise<string> {
        if (await this.isInPreviewMode()) {
            for (const selector of this.selectors.previewSelectors) {
                const element = await this.page.locator(selector).first();
                if (await element.isVisible()) {
                    return await element.innerText();
                }
            }
            throw new Error('No visible preview content found');
        } else {
            const textarea = await this.page.locator(this.selectors.textarea);
            return await textarea.inputValue();
        }
    }

    /**
     * Get the rendered HTML from preview (task context)
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
     * Check if specific markdown elements are rendered in the preview (task context)
     */
    async hasRenderedElements(
        elements: Array<'heading' | 'paragraph' | 'bold' | 'list' | 'link' | 'image' | 'blockquote' | 'code'>
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
            code: 'pre, code'
        };
        for (const selector of [this.selectors.preview, ...this.selectors.previewSelectors]) {
            const preview = this.page.locator(selector);
            if (await preview.isVisible()) {
                for (const element of elements) {
                    const sel = elementMap[element];
                    const count = await preview.locator(sel).count();
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
     * Open markdown help dialog (task context)
     */
    async openHelpDialog(): Promise<void> {
        const helpButton = this.page.locator(this.selectors.helpButton);
        await helpButton.click();
        await this.page.locator(this.selectors.helpDialog).waitFor({state: 'visible'});
    }

    /**
     * Close markdown help dialog (task context)
     */
    async closeHelpDialog(): Promise<void> {
        const closeButton = this.page.locator(this.selectors.helpClose);
        await closeButton.click();
        await this.page.locator(this.selectors.helpDialog).waitFor({state: 'hidden'});
    }

    /**
     * Check if editor is in write mode (task context)
     */
    async isInWriteMode(): Promise<boolean> {
        try {
            const textarea = this.page.locator(this.selectors.textarea);
            const isVisible = await textarea.isVisible();
            const isEnabled = await textarea.isEnabled();
            return isVisible && isEnabled;
        } catch {
            return false;
        }
    }

    /**
     * Check if editor is in preview mode (task context)
     */
    async isInPreviewMode(): Promise<boolean> {
        try {
            for (const selector of this.selectors.previewSelectors) {
                const element = this.page.locator(selector).first();
                if (await element.isVisible()) {
                    return true;
                }
            }
            return false;
        } catch {
            return false;
        }
    }

    /**
     * Wait for preview content to be visible (task context)
     */
    async waitForPreviewContent(timeout: number = 10000): Promise<void> {
        const startTime = Date.now();
        while (Date.now() - startTime < timeout) {
            for (const selector of this.selectors.previewSelectors) {
                try {
                    const element = this.page.locator(selector).first();
                    if (await element.isVisible()) {
                        const content = await element.innerText();
                        if (content.trim().length > 0) {
                            return;
                        }
                    }
                } catch {
                    continue;
                }
            }
            await this.page.waitForTimeout(100);
        }
        throw new Error('Preview content not visible after timeout');
    }
}
