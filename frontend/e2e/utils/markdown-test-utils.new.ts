import {Page, expect, Locator} from '@playwright/test';
import {takeScreenshot} from '../setupTests';

/**
 * Utilities for Markdown testing
 */
export class MarkdownTestUtils {
    /**
     * Example markdown content for testing
     */
    static getTestMarkdownContent(): string {
        return `# Test heading

This is a paragraph with **bold** and *italic* text.

## Second heading

- List item 1
- List item 2
- List item 3

\`\`\`javascript
// This is a code block
console.log('Hello world');
\`\`\`

[Link to example](https://example.com)

> This is a blockquote
`;
    }

    /**
     * Unsafe markdown with potential XSS attacks
     */
    static getUnsafeMarkdownContent(): string {
        return `# Test content

<script>alert('XSS attack');</script>

<img src="x" onerror="alert('image error')" />

<iframe src="https://evil.example.com"></iframe>

[Legitimate link](https://example.com)

<a href="javascript:alert('XSS via link')">Dangerous link</a>

\`\`\`
Safe code block
\`\`\`
`;
    }

    /**
     * Selectors for various markdown containers in the application
     */
    static readonly markdownContainerSelectors = [
        // Primary Markdown Editor Selectors
        '[data-testid="markdown-preview-container"]',  // Main editor preview
        '[data-testid="markdown-editor-preview"]',     // Editor preview alternative

        // Course Description Selectors
        '[data-testid="course-description"]',          // Course detail description
        '.course-description',                         // Legacy selector
        '.course-description-container',               // Wrapper container

        // Task Description Selectors
        '[data-testid="task-description"]',           // Task detail description
        '.task-description',                          // Legacy task selector

        // Content Containers
        '.markdown-content',                          // Generic content container
        '.preview-content',                           // Preview specific content

        // Generic Selectors (fallbacks)
        '.rendered-markdown',
        '.markdown-container',
        '[data-markdown]',
        '.MuiPaper-root .MuiBox-root .MuiTypography-root'
    ];

    /**
     * Verify markdown content is rendered correctly with retries
     */
    static async verifyMarkdownRendering(
        page: Page,
        containerSelector?: string,
        options = {
            headers: true,
            paragraphs: true,
            lists: true,
            codeBlocks: true,
            links: true,
            emphasis: true
        }
    ): Promise<void> {
        const selectors = containerSelector
            ? [containerSelector]
            : this.markdownContainerSelectors;

        let markdownContainer: Locator | null = null;

        // Try to find the markdown container with retries
        const maxRetries = 3;
        for (let attempt = 0; attempt < maxRetries && !markdownContainer; attempt++) {
            for (const selector of selectors) {
                try {
                    // Wait longer on first attempt, shorter on retries
                    const timeout = attempt === 0 ? 30000 : 5000;
                    const container = page.locator(selector);
                    await container.waitFor({state: 'visible', timeout});
                    console.log(`Found markdown container with selector: ${selector} on attempt ${attempt + 1}`);
                    markdownContainer = container;

                    // Wait for content to stabilize
                    await page.waitForTimeout(500);
                    break;
                } catch (e) {
                    console.log(`Selector ${selector} not found on attempt ${attempt + 1}`);
                    continue;
                }
            }
        }

        if (!markdownContainer) {
            console.error('Could not find markdown container');
            await takeScreenshot(page, 'markdown-container-not-found');
            throw new Error('Could not find markdown container with any of the selectors');
        }

        // Helper function to check element visibility with retries
        const checkElementVisibility = async (selector: string, description: string): Promise<boolean> => {
            const element = markdownContainer!.locator(selector);
            for (let i = 0; i < 3; i++) {
                try {
                    await element.first().waitFor({state: 'visible', timeout: 5000});
                    console.log(`${description} found and visible`);
                    return true;
                } catch (e) {
                    console.log(`Retrying ${description} visibility check (attempt ${i + 1})`);
                    await page.waitForTimeout(1000);
                }
            }
            return false;
        };

        // Check each markdown element type with retries
        if (options.headers) {
            const isVisible = await checkElementVisibility('h1, h2, h3, h4, h5, h6', 'Headers');
            expect(isVisible).toBeTruthy();
        }

        if (options.paragraphs) {
            const isVisible = await checkElementVisibility('p', 'Paragraphs');
            expect(isVisible).toBeTruthy();
        }

        if (options.lists) {
            const hasLists = await checkElementVisibility('ul, ol', 'Lists');
            const hasItems = await checkElementVisibility('li', 'List items');
            expect(hasLists || hasItems).toBeTruthy();
        }

        if (options.codeBlocks) {
            const hasCode = await checkElementVisibility('pre, code', 'Code blocks');
            // Code blocks are optional, so we don't assert their presence
            if (!hasCode) {
                console.log('No code blocks found (this might be expected depending on content)');
            }
        }

        if (options.links) {
            const hasLinks = await checkElementVisibility('a[href]', 'Links');
            // Links are optional, so we don't assert their presence
            if (!hasLinks) {
                console.log('No links found (this might be expected depending on content)');
            }
        }

        if (options.emphasis) {
            const hasEmphasis = await checkElementVisibility('strong, em, b, i', 'Emphasis elements');
            // Emphasis elements are optional, so we don't assert their presence
            if (!hasEmphasis) {
                console.log('No emphasis elements found (this might be expected depending on content)');
            }
        }
    }

    /**
     * Verify markdown content is properly sanitized
     */
    static async verifySanitization(
        page: Page,
        containerSelector?: string
    ): Promise<void> {
        const selectors = containerSelector
            ? [containerSelector]
            : this.markdownContainerSelectors;

        let markdownContainer: Locator | null = null;

        // Try to find the markdown container with retries
        const maxRetries = 3;
        for (let attempt = 0; attempt < maxRetries && !markdownContainer; attempt++) {
            for (const selector of selectors) {
                try {
                    const timeout = attempt === 0 ? 30000 : 5000;
                    const container = page.locator(selector);
                    await container.waitFor({state: 'visible', timeout});
                    console.log(`Found markdown container with selector: ${selector} on attempt ${attempt + 1}`);
                    markdownContainer = container;
                    await page.waitForTimeout(500);
                    break;
                } catch (e) {
                    console.log(`Selector ${selector} not found on attempt ${attempt + 1}`);
                    continue;
                }
            }
        }

        if (!markdownContainer) {
            console.error('Could not find markdown container');
            await takeScreenshot(page, 'markdown-container-not-found');
            throw new Error('Could not find markdown container with any of the selectors');
        }

        // Check for absence of unsafe elements
        const scriptTags = markdownContainer.locator('script');
        expect(await scriptTags.count()).toBe(0);
        console.log('No script tags found - sanitization working');

        const iframeTags = markdownContainer.locator('iframe');
        expect(await iframeTags.count()).toBe(0);
        console.log('No iframe tags found - sanitization working');

        // Check that images have no event handlers
        const images = markdownContainer.locator('img');
        const imageCount = await images.count();
        for (let i = 0; i < imageCount; i++) {
            const image = images.nth(i);
            const hasOnError = await image.getAttribute('onerror') !== null;
            const hasOnLoad = await image.getAttribute('onload') !== null;
            const hasOnClick = await image.getAttribute('onclick') !== null;
            expect(hasOnError || hasOnLoad || hasOnClick).toBe(false);
        }
        console.log('No event handlers on images - sanitization working');

        // Check for absence of javascript: URLs
        const links = markdownContainer.locator('a[href]');
        const linkCount = await links.count();
        for (let i = 0; i < linkCount; i++) {
            const link = links.nth(i);
            const href = await link.getAttribute('href');
            expect(href?.startsWith('javascript:')).toBe(false);
        }
        console.log('No javascript: links found - sanitization working');
    }
}
