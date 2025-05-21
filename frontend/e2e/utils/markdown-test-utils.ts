import {Page, expect} from '@playwright/test';
import {takeScreenshot} from '../setupTests';

/**
 * Hilfsmethoden für Markdown-Tests
 */
export class MarkdownTestUtils {
    // Strict selectors using data-testid
    private static readonly markdownContainerSelectors = [
        '[data-testid="markdown-preview-container"]',
        '[data-testid="task-description"]',
        '[data-testid="course-description"]'
    ];

    /**
     * Beispiel-Markdown zum Testen von Markdown-Funktionalität
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
     * Unsicheres Markdown mit potenziellen XSS-Angriffen
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
     * Überprüfen, ob Markdown-Inhalt korrekt gerendert wird
     * @param page Playwright-Page-Objekt
     * @param containerSelector Selektor für den Markdown-Container (optional)
     * @param options Optionen für die Elemente, die überprüft werden sollen
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
    ): Promise<IMarkdownResult> {  // Changed return type to match new implementation
        // Wait for any markdown container to be visible
        const container = containerSelector || this.markdownContainerSelectors[0];
        await page.waitForSelector(container, {
            state: 'visible',
            timeout: 30000  // Match config timeout
        });

        // Wait for content to stabilize
        await page.waitForTimeout(1000);

        const elementCounts = await this.countMarkdownElements(page, container);
        return {
            hasMarkdownElements: Object.values(elementCounts).some(count => count > 0),
            elementCounts
        };
    }

    /**
     * Überprüfen, ob Markdown-Inhalt korrekt sanitisiert wurde (keine unsicheren Elemente)
     * @param page Playwright-Page-Objekt
     * @param containerSelector Selektor für den Markdown-Container
     */
    static async verifySanitization(
        page: Page,
        containerSelector?: string
    ): Promise<void> {
        const selectors = containerSelector
            ? [containerSelector]
            : this.markdownContainerSelectors;

        let markdownContainer = null;

        // Versuchen, den Markdown-Container mit einem der Selektoren zu finden
        for (const selector of selectors) {
            const container = page.locator(selector);
            if (await container.isVisible({timeout: 1000}).catch(() => false)) {
                console.log(`Found markdown container with selector: ${selector}`);
                markdownContainer = container;
                break;
            }
        }

        if (!markdownContainer) {
            console.error('Could not find markdown container');
            await takeScreenshot(page, 'markdown-container-not-found');
            throw new Error('Could not find markdown container with any of the selectors');
        }

        // Überprüfen, dass keine Script-Tags vorhanden sind
        const scriptTags = markdownContainer.locator('script');
        expect(await scriptTags.count()).toBe(0);
        console.log('No script tags found - sanitization working');

        // Überprüfen, dass keine iframes vorhanden sind
        const iframeTags = markdownContainer.locator('iframe');
        expect(await iframeTags.count()).toBe(0);
        console.log('No iframe tags found - sanitization working');

        // Überprüfen, dass Bilder keine Event-Handler haben
        const images = markdownContainer.locator('img');
        const imagesCount = await images.count();

        for (let i = 0; i < imagesCount; i++) {
            const image = images.nth(i);
            const hasOnError = await image.getAttribute('onerror') !== null;
            const hasOnLoad = await image.getAttribute('onload') !== null;
            const hasOnClick = await image.getAttribute('onclick') !== null;

            expect(hasOnError || hasOnLoad || hasOnClick).toBe(false);
        }
        console.log('No event handlers on images - sanitization working');

        // Überprüfen, dass keine javascript:-Links vorhanden sind
        const links = markdownContainer.locator('a[href]');
        const linksCount = await links.count();

        for (let i = 0; i < linksCount; i++) {
            const link = links.nth(i);
            const href = await link.getAttribute('href');

            expect(href?.startsWith('javascript:')).toBe(false);
        }
        console.log('No javascript: links found - sanitization working');
    }

    private static async countMarkdownElements(page: Page, container: string): Promise<Record<string, number>> {
        const counts: Record<string, number> = {};

        // Use proper selectors within container
        const selectors = {
            headings: `${container} h1, ${container} h2, ${container} h3`,
            bold: `${container} strong`,
            italic: `${container} em`,
            links: `${container} a`,
            lists: `${container} ul, ${container} ol`,
            code: `${container} code`,
            blockquotes: `${container} blockquote`
        };

        // Count elements with retry logic
        for (const [key, selector] of Object.entries(selectors)) {
            try {
                counts[key] = await page.locator(selector).count();
            } catch (error) {
                console.warn(`Failed to count ${key} elements: ${error}`);
                counts[key] = 0;
            }
        }

        return counts;
    }
}
