import {Page, expect} from '@playwright/test';
import {takeScreenshot} from '../setupTests';

/**
 * Hilfsmethoden für Markdown-Tests
 */
export class MarkdownTestUtils {
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
     * Selektoren für verschiedene Markdown-Container in der Anwendung
     */
    static readonly markdownContainerSelectors = [
        // Kursdetail-Selektoren
        '.course-description',
        '[data-testid="course-description"]',
        '.course-description-container',
        '.MuiPaper-root .markdown-content',
        '.MuiPaper-root .course-content',
        '.course-detail-description',

        // Markdown-Editor-Selektoren
        '.markdown-editor-preview',
        '.preview-content',
        '[data-testid="markdown-preview"]',
        '.markdown-content',
        '.rendered-markdown',

        // Task-Beschreibung-Selektoren
        '.task-description',
        '[data-testid="task-description"]',
        '.task-content .markdown-content',

        // Generische Markdown-Container
        '.markdown-container',
        '[data-markdown]',
        '.MuiPaper-root .MuiBox-root .MuiTypography-root'
    ];

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
            console.error('Could not find course description container');
            await takeScreenshot(page, 'markdown-container-not-found');
            throw new Error('Could not find markdown container with any of the selectors');
        }

        // Überprüfe die gewünschten Markdown-Elemente
        if (options.headers) {
            const headings = markdownContainer.locator('h1, h2, h3, h4, h5, h6');
            await expect(headings).toBeVisible();
            console.log('Headers found and visible');
        }

        if (options.paragraphs) {
            const paragraphs = markdownContainer.locator('p');
            await expect(paragraphs).toBeVisible();
            console.log('Paragraphs found and visible');
        }

        if (options.lists) {
            const lists = markdownContainer.locator('ul, ol');
            const listItems = markdownContainer.locator('li');

            // Entweder Listen oder Listenelemente sollten sichtbar sein
            const hasLists = await lists.count() > 0;
            const hasListItems = await listItems.count() > 0;

            expect(hasLists || hasListItems).toBeTruthy();
            console.log('Lists or list items found');
        }

        if (options.codeBlocks) {
            const codeBlocks = markdownContainer.locator('pre, code');
            const codeBlocksCount = await codeBlocks.count();

            if (codeBlocksCount > 0) {
                await expect(codeBlocks.first()).toBeVisible();
                console.log('Code blocks found and visible');
            } else {
                console.log('No code blocks found (this might be expected depending on content)');
            }
        }

        if (options.links) {
            const links = markdownContainer.locator('a[href]');
            const linksCount = await links.count();

            if (linksCount > 0) {
                await expect(links.first()).toBeVisible();
                console.log('Links found and visible');
            } else {
                console.log('No links found (this might be expected depending on content)');
            }
        }

        if (options.emphasis) {
            const emphasis = markdownContainer.locator('strong, em, b, i');
            const emphasisCount = await emphasis.count();

            if (emphasisCount > 0) {
                await expect(emphasis.first()).toBeVisible();
                console.log('Emphasis elements found and visible');
            } else {
                console.log('No emphasis elements found (this might be expected depending on content)');
            }
        }
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
}
