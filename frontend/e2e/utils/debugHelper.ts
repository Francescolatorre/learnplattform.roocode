import {Page, Locator, ElementHandle} from '@playwright/test';
import {takeScreenshot} from '../setupTests';
import path from 'path';
import fs from 'fs';

/**
 * Enhanced debugging utilities for Playwright E2E tests
 */

/**
 * Logs detailed information about the current page state
 * @param page Playwright Page object
 * @param context Additional context information to include in logs
 */
export async function logPageState(page: Page, context: string = ''): Promise<void> {
    console.log(`----- PAGE STATE ${context ? `(${context})` : ''} -----`);
    console.log(`URL: ${page.url()}`);

    const title = await page.title();
    console.log(`Title: ${title}`);

    // Get all cookies
    const cookies = await page.context().cookies();
    console.log(`Cookies: ${cookies.length}`);

    // Log console messages going forward
    page.on('console', msg => {
        console.log(`BROWSER CONSOLE: ${msg.type()}: ${msg.text()}`);
    });
}

/**
 * Captures element state details and takes a screenshot
 * @param page Playwright Page object
 * @param locator Element locator
 * @param name Name for the debug files
 */
export async function debugElement(page: Page, locator: Locator, name: string): Promise<void> {
    console.log(`Debugging element: ${name}`);

    try {
        // Check if element exists
        const exists = await locator.count() > 0;
        console.log(`Element exists: ${exists}`);

        if (exists) {
            // Get element properties
            const isVisible = await locator.isVisible();
            const isEnabled = await locator.isEnabled();
            const boundingBox = await locator.boundingBox();

            console.log({
                name,
                isVisible,
                isEnabled,
                boundingBox
            });

            // Take a screenshot highlighting this element
            await highlightAndScreenshot(page, locator, `debug-element-${name}`);
        } else {
            await takeScreenshot(page, `element-missing-${name}`);
        }
    } catch (error) {
        console.error(`Error debugging element ${name}:`, error);
        await takeScreenshot(page, `debug-element-error-${name}`);
    }
}

/**
 * Highlights an element and takes a screenshot
 * @param page Playwright Page object
 * @param locator Element to highlight
 * @param name Screenshot name
 */
export async function highlightAndScreenshot(page: Page, locator: Locator, name: string): Promise<void> {
    try {
        // Add a red border to the element
        await page.evaluate((selector) => {
            const element = document.querySelector(selector);
            if (element) {
                element.setAttribute('data-test-highlight', 'true');
                element.style.outline = '3px solid red';
                element.style.outlineOffset = '2px';
            }
        }, await locator.evaluate(el => {
            // Create a unique selector for this element
            return el.id ? `#${el.id}` : el.className ? `.${el.className.split(' ')[0]}` : el.tagName.toLowerCase();
        }));

        // Take the screenshot
        await takeScreenshot(page, `highlight-${name}`);

        // Remove the highlight
        await page.evaluate((selector) => {
            const element = document.querySelector(selector);
            if (element) {
                element.removeAttribute('data-test-highlight');
                element.style.outline = '';
                element.style.outlineOffset = '';
            }
        }, await locator.evaluate(el => {
            return el.id ? `#${el.id}` : el.className ? `.${el.className.split(' ')[0]}` : el.tagName.toLowerCase();
        }));
    } catch (error) {
        console.error('Error highlighting element:', error);
        await takeScreenshot(page, `highlight-error-${name}`);
    }
}

/**
 * Saves current DOM HTML to a file for debugging
 * @param page Playwright Page object
 * @param name Name for the output file
 */
export async function saveDOMSnapshot(page: Page, name: string): Promise<void> {
    try {
        const html = await page.content();

        // Ensure the screenshots directory exists
        const dir = path.resolve('./test-results/dom-snapshots');
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, {recursive: true});
        }

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = path.join(dir, `${name}-${timestamp}.html`);

        fs.writeFileSync(filename, html);
        console.log(`DOM snapshot saved to: ${filename}`);
    } catch (error) {
        console.error('Error saving DOM snapshot:', error);
    }
}

/**
 * Logs network requests for debugging API interactions
 * @param page Playwright Page object
 * @param options Configuration options
 */
export function trackNetworkActivity(
    page: Page,
    options: {
        logRequests?: boolean;
        logResponses?: boolean;
        urlFilter?: string
    } = {}
): void {
    const {logRequests = true, logResponses = true, urlFilter} = options;

    if (logRequests) {
        page.on('request', request => {
            const url = request.url();
            if (!urlFilter || url.includes(urlFilter)) {
                console.log(`Network request: ${request.method()} ${url}`);
                if (request.method() !== 'GET') {
                    console.log(`Request body:`, request.postData());
                }
            }
        });
    }

    if (logResponses) {
        page.on('response', async response => {
            const url = response.url();
            if (!urlFilter || url.includes(urlFilter)) {
                console.log(`Network response: ${response.status()} ${response.url()}`);

                try {
                    const contentType = response.headers()['content-type'] || '';
                    if (contentType.includes('application/json')) {
                        const body = await response.json().catch(() => null);
                        console.log('Response body:', body);
                    }
                } catch (error) {
                    console.log('Could not parse response body');
                }
            }
        });
    }
}

/**
 * Executes and logs the results of custom JavaScript in the browser context
 * @param page Playwright Page object
 * @param script JavaScript to execute in browser context
 * @param name Identifier for this debug operation
 */
export async function evaluateAndLog(page: Page, script: string, name: string): Promise<void> {
    console.log(`Running browser script: ${name}`);
    try {
        const result = await page.evaluate(script);
        console.log(`Script result (${name}):`, result);
        return result;
    } catch (error) {
        console.error(`Script error (${name}):`, error);
        await takeScreenshot(page, `script-error-${name}`);
    }
}


/**
 * Helper function to log test actions and outcomes with timestamps
 * Used to track the flow and debug potential issues in the course creation process
 */
export const logTestAction = (message: string) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${message}`);
};
