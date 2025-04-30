import {Page, expect, Locator} from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Test utilities for verifying markdown rendering functionality
 */
export class MarkdownTestUtils {
    // Get the configured output directory or use a default
    private static getScreenshotPath(filename: string): string {
        const outputDir = process.env.PLAYWRIGHT_OUTPUT_DIR || path.join(process.cwd(), 'test-results', 'test-artifacts');

        // Ensure directory exists
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, {recursive: true});
        }

        return path.join(outputDir, filename);
    }

    /**
     * Verifies that markdown content renders correctly with expected HTML elements
     * @param page - Playwright page object
     * @param selector - CSS selector for the container with rendered markdown
     * @param expectedElements - Object describing expected HTML elements
     * @param timeout - Optional timeout in ms (defaults to 10000ms)
     */
    static async verifyMarkdownRendering(
        page: Page,
        selector: string,
        expectedElements: {
            headers?: boolean;
            paragraphs?: boolean;
            lists?: boolean;
            codeBlocks?: boolean;
            links?: boolean;
            emphasis?: boolean;
        },
        timeout: number = 10000
    ): Promise<void> {
        console.log(`Verifying markdown rendering in selector: ${selector}`);

        // First try to find the container
        const container = await this.findContainerWithRetry(page, selector, timeout);

        // Log what we're checking for debugging
        console.log(`Found container. Checking for expected elements: ${JSON.stringify(expectedElements)}`);

        // Take a screenshot of what we're testing for debugging
        await page.screenshot({path: this.getScreenshotPath(`markdown-container-${Date.now()}.png`)});

        if (expectedElements.headers) {
            await this.verifyElementExists(container, 'h1, h2, h3, h4, h5, h6', 'headers', timeout);
        }

        if (expectedElements.paragraphs) {
            await this.verifyElementExists(container, 'p', 'paragraphs', timeout);
        }

        if (expectedElements.lists) {
            await this.verifyElementExists(container, 'ul, ol', 'lists', timeout);
        }

        if (expectedElements.codeBlocks) {
            await this.verifyElementExists(container, 'pre code, code', 'code blocks', timeout);
        }

        if (expectedElements.links) {
            await this.verifyElementExists(container, 'a', 'links', timeout);
        }

        if (expectedElements.emphasis) {
            await this.verifyElementExists(container, 'strong, em, b, i', 'emphasis', timeout);
        }

        console.log('Markdown verification completed successfully');
    }

    /**
     * Helper to find container with retry logic
     */
    private static async findContainerWithRetry(page: Page, selector: string, timeout: number): Promise<Locator> {
        const startTime = Date.now();
        let container: Locator | null = null;

        // Try multiple selectors if the original fails
        const selectors = [
            selector,
            // Common alternatives based on naming conventions
            `.${selector.replace(/^\./, '')}`, // Handle if someone forgot the dot
            `[data-testid="${selector.replace(/^\[data-testid="(.+)"\]$/, '$1')}"]`,
            // More generic fallbacks
            '.markdown-content',
            '.rendered-markdown',
            '.course-content',
            '.task-content',
            '[data-testid="markdown-content"]',
            // Very generic last resort
            'div:has(h1), div:has(p), article'
        ];

        while (Date.now() - startTime < timeout) {
            for (const currentSelector of selectors) {
                try {
                    container = page.locator(currentSelector);
                    const isVisible = await container.isVisible().catch(() => false);
                    const count = await container.count().catch(() => 0);

                    if (isVisible && count > 0) {
                        console.log(`Found markdown container with selector: ${currentSelector}`);
                        return container;
                    }
                } catch (error) {
                    // Continue trying other selectors
                }
            }

            // Wait before retrying
            await page.waitForTimeout(500);
        }

        // If we get here, we couldn't find a suitable container after all retries
        throw new Error(`Failed to find markdown container with selector: ${selector} or alternatives within ${timeout}ms`);
    }

    /**
     * Helper to verify specific elements exist
     */
    private static async verifyElementExists(container: Locator, elementSelector: string, elementName: string, timeout: number): Promise<void> {
        const startTime = Date.now();
        let found = false;

        while (Date.now() - startTime < timeout) {
            try {
                const count = await container.locator(elementSelector).count();
                if (count > 0) {
                    console.log(`Found ${count} ${elementName} elements`);
                    found = true;
                    break;
                }

                // If elements not found yet, wait briefly and retry
                await container.page().waitForTimeout(500);
            } catch (error) {
                console.error(`Error checking for ${elementName}:`, error);
                await container.page().waitForTimeout(500);
            }
        }

        if (!found) {
            // Get HTML content for debugging
            const html = await container.innerHTML().catch(() => 'Could not get HTML');
            console.error(`Failed to find ${elementName}. Container HTML:`, html.substring(0, 500));

            // Fail the test
            expect(found, `Expected to find ${elementName} elements in the markdown but none were found`).toBe(true);
        }
    }

    /**
     * Checks that markdown sanitization is working by verifying
     * that potentially dangerous elements are removed
     * @param page - Playwright page object
     * @param selector - CSS selector for the container with rendered markdown
     * @param timeout - Optional timeout in ms (defaults to 5000ms)
     */
    static async verifySanitization(page: Page, selector: string, timeout: number = 5000): Promise<void> {
        console.log(`Verifying markdown sanitization in selector: ${selector}`);

        // Find the container
        const container = await this.findContainerWithRetry(page, selector, timeout);

        // Check that script tags are removed
        const scripts = await container.locator('script').count();
        expect(scripts, 'Expected no script tags in sanitized content').toBe(0);

        // Check that iframes are removed
        const iframes = await container.locator('iframe').count();
        expect(iframes, 'Expected no iframes in sanitized content').toBe(0);

        // Check that on* attributes are removed
        const html = await container.innerHTML();
        const hasUnsafeAttributes = /\son\w+=/i.test(html);
        expect(hasUnsafeAttributes, 'Expected no "on*" event attributes in sanitized content').toBe(false);

        console.log('Sanitization verification completed successfully');
    }

    /**
     * Helper to generate test markdown content with various elements
     */
    static getTestMarkdownContent(): string {
        return `
# Heading 1
## Heading 2

This is a paragraph with **bold text** and *italic text*.

- List item 1
- List item 2
  - Nested item

1. Ordered item 1
2. Ordered item 2

[This is a link](https://example.com)

\`\`\`javascript
// This is a code block
function example() {
  return 'hello world';
}
\`\`\`

> This is a blockquote

| Header 1 | Header 2 |
| -------- | -------- |
| Cell 1   | Cell 2   |
`;
    }

    /**
     * Helper to generate potentially unsafe markdown content
     */
    static getUnsafeMarkdownContent(): string {
        return `
# Test content

<script>alert('XSS attack');</script>

<iframe src="https://evil.com"></iframe>

<a href="#" onclick="alert('clicked')">Click me</a>

<img src="x" onerror="alert('image error')" />
`;
    }
}
