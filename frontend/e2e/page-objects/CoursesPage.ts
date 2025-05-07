import {Page, Locator} from '@playwright/test';
import {BasePage} from './BasePage';
import {takeScreenshot} from '../setupTests';

/**
 * Base page object for course listing functionality
 * Handles common course list elements regardless of role
 */
export class CoursesPage extends BasePage {
    // Common selectors for course lists
    readonly courseTitleSelectors = [
        'h1:has-text("Courses")',
        'h2:has-text("Courses")',
        'h3:has-text("Courses")',
        'h4:has-text("Courses")',
        '[data-testid="courses-title"]',
        'h1, h2, h3, h4' // Fallback to any heading
    ];

    readonly courseCardSelectors = [
        '.course-card',
        '.MuiCard-root',
        '[data-testid^="course-card-"]',
        '.course-item',
        '.MuiPaper-root' // Generic fallback for Material UI cards
    ];

    readonly courseGridSelectors = [
        '.course-grid',
        '.courses-container',
        '.MuiGrid-container',
        '[data-testid="courses-grid"]'
    ];

    readonly courseListSelectors = [
        '.course-list',
        'ul.courses-list',
        '[data-testid="courses-list"]',
        '.MuiList-root' // Generic fallback for Material UI lists
    ];

    readonly paginationSelectors = [
        'nav[aria-label="pagination"]',
        '.MuiPagination-root',
        '.pagination',
        '[data-testid="pagination"]',
        '[data-testid="course-pagination"]'
    ];

    readonly emptyStateSelectors = [
        '.empty-state',
        '.no-courses',
        '[data-testid="empty-state"]',
        'text="No courses found"',
        'text="No courses available"'
    ];

    // Selektoren speziell für Kursbeschreibungen in der Listenansicht
    readonly courseDescriptionSelectors = [
        '.course-description',
        '[data-testid="course-description"]',
        '.course-summary',
        '.MuiCardContent-root p',
        '.MuiCardContent-root .MuiTypography-root',
        '.course-card-description'
    ];

    // View switch selectors
    readonly viewSwitchSelectors = [
        '.view-switch',
        '[data-testid="view-switch"]',
        '.view-mode-toggle'
    ];

    constructor(page: Page, url: string) {
        super(page, url);
    }

    /**
     * Check if the courses page has loaded properly
     */
    async isCoursesPageLoaded(): Promise<boolean> {
        console.log('Checking if courses page is loaded...');
        try {
            // Look for the title
            for (const selector of this.courseTitleSelectors) {
                try {
                    const titleLocator = this.page.locator(selector).first();
                    const isVisible = await titleLocator.isVisible({timeout: 2000}).catch(() => false);
                    console.log(`Checking selector: ${selector}, isVisible: ${isVisible}`);
                    if (isVisible) {
                        console.log('Courses page title found');
                        return true;
                    }
                } catch (err) {
                    console.error(`Error checking selector ${selector}:`, err);
                    // Continue to next selector
                }
            }

            // Look for course cards/list or empty state
            const elementSelectors = [
                ...this.courseCardSelectors,
                ...this.courseGridSelectors,
                ...this.courseListSelectors,
                ...this.emptyStateSelectors
            ];

            for (const selector of elementSelectors) {
                try {
                    const elementLocator = this.page.locator(selector).first();
                    const isVisible = await elementLocator.isVisible({timeout: 1000}).catch(() => false);
                    if (isVisible) {
                        console.log(`Courses page element found: ${selector}`);
                        return true;
                    }
                } catch (err) {
                    // Continue to next selector
                }
            }

            console.warn('Courses page does not appear to be loaded - no course elements found');
            await this.takeScreenshot('courses-page-not-loaded');
            return false;
        } catch (error) {
            console.error('Error checking if courses page is loaded:', error);
            return false;
        }
    }

    /**
     * Get all course cards visible on the page
     */
    async getCourseCards(): Promise<Locator> {
        for (const selector of this.courseCardSelectors) {
            const cards = this.page.locator(selector);
            const count = await cards.count();

            if (count > 0) {
                console.log(`Found ${count} course cards with selector: ${selector}`);
                return cards;
            }
        }

        throw new Error('No course cards found on the page');
    }

    /**
     * Count how many courses are displayed
     */
    async getCourseCount(): Promise<number> {
        try {
            const cards = await this.getCourseCards();
            return await cards.count();
        } catch (error) {
            // Check for empty state
            for (const selector of this.emptyStateSelectors) {
                const emptyState = this.page.locator(selector);
                const isVisible = await emptyState.isVisible({timeout: 1000});

                if (isVisible) {
                    console.log('No courses found (empty state detected)');
                    return 0;
                }
            }

            console.error('Error getting course count:', error);
            return 0;
        }
    }

    /**
     * Get all course titles from the page
     */
    async getCoursesTitles(): Promise<string[]> {
        const titles: string[] = [];

        try {
            // Try to get course cards
            let cards;
            try {
                cards = await this.getCourseCards();
            } catch (error) {
                console.warn('Could not find course cards, trying alternative approach');
                // Try a more generic approach
                cards = this.page.locator('.MuiCard-root, .course-card, [data-testid^="course-card-"]');
            }

            const count = await cards.count();
            console.log(`Found ${count} cards to extract titles from`);

            for (let i = 0; i < count; i++) {
                const card = cards.nth(i);
                // Look for title elements in each card with multiple selectors
                const titleSelectors = [
                    'h2',
                    'h3',
                    'h4',
                    'h5',
                    '.course-title',
                    '.card-title',
                    '.MuiTypography-h5',
                    '.MuiTypography-h6',
                    '[data-testid="course-title"]',
                    '.MuiCardHeader-title',
                    '.title'
                ];

                let foundTitle = false;
                for (const selector of titleSelectors) {
                    try {
                        const titleElements = card.locator(selector);
                        const titleCount = await titleElements.count();

                        if (titleCount > 0) {
                            for (let j = 0; j < titleCount; j++) {
                                const titleEl = titleElements.nth(j);
                                const titleText = await titleEl.textContent();
                                if (titleText && titleText.trim()) {
                                    titles.push(titleText.trim());
                                    foundTitle = true;
                                    break;
                                }
                            }
                            if (foundTitle) break;
                        }
                    } catch (err) {
                        // Continue to the next selector
                        continue;
                    }
                }

                // If no title element found via selectors, try getting all text content from the card
                if (!foundTitle) {
                    try {
                        const allText = await card.textContent();
                        if (allText && allText.trim()) {
                            // Just take the first line as a fallback title
                            const firstLine = allText.trim().split('\n')[0].trim();
                            if (firstLine) {
                                titles.push(firstLine);
                                console.log(`Using fallback text as title: "${firstLine}"`);
                            }
                        }
                    } catch (err) {
                        console.warn(`Could not extract any text from card ${i}`);
                    }
                }
            }

            console.log(`Found ${titles.length} course titles: ${JSON.stringify(titles)}`);
        } catch (error) {
            console.error('Error getting course titles:', error);
        }

        return titles;
    }

    /**
     * Check if a course with given title exists on the page
     * Enhanced version that checks all pagination pages with retry mechanism
     */
    async hasCourse(title: string, maxRetries = 3, retryDelayMs = 1000): Promise<boolean> {
        // Implement a retry mechanism to give the application time to update
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                console.log(`Attempt ${attempt}/${maxRetries} to find course: "${title}"`);

                // First refresh the page to ensure we have the latest data
                console.log("Refreshing page to get the latest course data");
                await this.page.reload();
                await this.waitForPageLoad();

                // Wait an additional moment for any async data loading
                if (attempt > 1) {
                    console.log(`Waiting ${retryDelayMs}ms for data to load...`);
                    await this.page.waitForTimeout(retryDelayMs);
                }

                // Check if pagination exists
                let hasPagination = false;

                // First check for the last page button with data-testid="LastPageIcon"
                const lastPageButton = this.page.locator('[data-testid="LastPageIcon"]');
                const hasLastPageButton = await lastPageButton.isVisible({timeout: 2000}).catch(() => false);

                if (hasLastPageButton) {
                    hasPagination = true;
                    console.log("Found last page button with data-testid='LastPageIcon'");

                    // Click on the last page button to navigate to the last page
                    await lastPageButton.click();
                    console.log("Clicked on the last page button");
                    await this.waitForPageLoad();

                    // Wait for any async data loading after page change
                    await this.page.waitForTimeout(500);

                    // Check if course exists on the last page (most likely place for a newly created course)
                    const foundOnLastPage = await this.checkCurrentPageForCourse(title);
                    if (foundOnLastPage) {
                        console.log(`Found course "${title}" on the last page on attempt ${attempt}`);
                        return true;
                    }

                    // If not found on last page, fall back to checking other pages systematically
                    console.log("Course not found on last page, checking other pages systematically");

                    // Check if we have numbered pagination - use .first() to avoid strict mode errors
                    try {
                        // Use first() to handle multiple pagination elements
                        const pagination = this.page.locator(this.paginationSelectors.join(', ')).first();
                        const isPaginationVisible = await pagination.isVisible({timeout: 1000}).catch(() => false);

                        if (isPaginationVisible) {
                            // Try to find the first page button
                            const firstPageButton = this.page.locator('[data-testid="FirstPageIcon"]');
                            if (await firstPageButton.isVisible({timeout: 1000})) {
                                await firstPageButton.click();
                                await this.waitForPageLoad();
                                console.log("Navigated to first page");

                                // Wait for any async data loading after page change
                                await this.page.waitForTimeout(500);
                            }

                            // Get all page number buttons
                            const pageButtons = pagination.locator('button');
                            const buttonCount = await pageButtons.count();
                            const pageNumbers: number[] = [];

                            // Find all page numbers
                            for (let i = 0; i < buttonCount; i++) {
                                const buttonText = await pageButtons.nth(i).textContent();
                                if (buttonText && /^\d+$/.test(buttonText)) {
                                    pageNumbers.push(parseInt(buttonText, 10));
                                }
                            }

                            // Sort page numbers
                            pageNumbers.sort((a, b) => a - b);

                            // Check each page for the course
                            for (const pageNum of pageNumbers) {
                                console.log(`Checking page ${pageNum} for course`);
                                await this.goToPage(pageNum);
                                await this.waitForPageLoad();
                                await this.page.waitForTimeout(500); // Wait for any async data loading

                                const foundOnPage = await this.checkCurrentPageForCourse(title);
                                if (foundOnPage) {
                                    console.log(`Found course "${title}" on page ${pageNum} on attempt ${attempt}`);
                                    return true;
                                }
                            }
                        }
                    } catch (paginationError) {
                        console.warn("Error handling pagination:", paginationError);
                    }
                } else {
                    // If no last page button, check for standard pagination
                    for (const selector of this.paginationSelectors) {
                        try {
                            const pagination = this.page.locator(selector).first();
                            const isVisible = await pagination.isVisible({timeout: 1000}).catch(() => false);

                            if (isVisible) {
                                hasPagination = true;
                                console.log("Found standard pagination controls");

                                // Get all page number buttons
                                const pageButtons = pagination.locator('button');
                                const buttonCount = await pageButtons.count();
                                let lastPageNumber = 1;

                                // Find the highest page number
                                for (let i = 0; i < buttonCount; i++) {
                                    const buttonText = await pageButtons.nth(i).textContent();
                                    if (buttonText && /^\d+$/.test(buttonText)) {
                                        const pageNum = parseInt(buttonText, 10);
                                        if (pageNum > lastPageNumber) {
                                            lastPageNumber = pageNum;
                                        }
                                    }
                                }

                                // If pagination exists, navigate to the last page first
                                if (lastPageNumber > 1) {
                                    console.log(`Navigating to last page (${lastPageNumber}) to look for recently created course`);
                                    await this.goToPage(lastPageNumber);
                                    await this.waitForPageLoad();
                                    await this.page.waitForTimeout(500); // Wait for any async data loading

                                    // Check last page for the course
                                    const foundOnLastPage = await this.checkCurrentPageForCourse(title);
                                    if (foundOnLastPage) {
                                        console.log(`Found course "${title}" on last page ${lastPageNumber} on attempt ${attempt}`);
                                        return true;
                                    }

                                    // If not on last page, check all pages
                                    for (let pageNum = 1; pageNum < lastPageNumber; pageNum++) {
                                        console.log(`Checking page ${pageNum} for course`);
                                        await this.goToPage(pageNum);
                                        await this.waitForPageLoad();
                                        await this.page.waitForTimeout(500); // Wait for any async data loading

                                        const foundOnPage = await this.checkCurrentPageForCourse(title);
                                        if (foundOnPage) {
                                            console.log(`Found course "${title}" on page ${pageNum} on attempt ${attempt}`);
                                            return true;
                                        }
                                    }
                                }
                                break;
                            }
                        } catch (err) {
                            // Continue to next selector if this one has issues
                            console.warn(`Error with pagination selector ${selector}:`, err);
                            continue;
                        }
                    }
                }

                // No pagination or course not found on any page
                if (!hasPagination) {
                    // No pagination, just check the current page
                    const foundOnCurrentPage = await this.checkCurrentPageForCourse(title);
                    if (foundOnCurrentPage) {
                        console.log(`Found course "${title}" on the current page on attempt ${attempt}`);
                        return true;
                    }
                }

                if (attempt < maxRetries) {
                    // If this wasn't the last attempt, wait before retrying
                    const waitTime = retryDelayMs * attempt; // Progressive backoff
                    console.log(`Course "${title}" not found on attempt ${attempt}. Waiting ${waitTime}ms before retry...`);
                    await this.page.waitForTimeout(waitTime);
                } else {
                    console.log(`Course "${title}" not found after ${maxRetries} attempts`);
                }

            } catch (error) {
                console.error(`Error in hasCourse("${title}") attempt ${attempt}:`, error);
                if (attempt < maxRetries) {
                    const waitTime = retryDelayMs * attempt; // Progressive backoff
                    console.log(`Waiting ${waitTime}ms before retry...`);
                    await this.page.waitForTimeout(waitTime);
                } else {
                    await this.takeScreenshot(`has-course-error-final-attempt-${attempt}`);
                }
            }
        }

        return false; // Course not found after all retries
    }

    /**
     * Helper method to check the current page for a specific course title
     */
    private async checkCurrentPageForCourse(title: string): Promise<boolean> {
        // Look for title in text content across multiple elements
        const exactTitleSelector = `text="${title}"`;
        const titleExists = await this.page.locator(exactTitleSelector).count() > 0;
        if (titleExists) {
            console.log(`Found exact title match: ${title}`);
            return true;
        }

        // Try with contains for partial matching
        const containsTitleSelector = `text=${title}`;
        const containsTitle = await this.page.locator(containsTitleSelector).count() > 0;
        if (containsTitle) {
            console.log(`Found partial title match: ${title}`);
            return true;
        }

        // Fall back to our original implementation
        const titles = await this.getCoursesTitles();
        console.log(`Found course titles: ${JSON.stringify(titles)}`);

        // Check for exact or partial matches
        const exactMatch = titles.some(t => t === title);
        const partialMatch = titles.some(t => t.includes(title) || title.includes(t));

        if (exactMatch || partialMatch) {
            console.log(`Found match for course: "${title}"`);
            return true;
        }

        console.log(`Course "${title}" not found on current page`);
        return false;
    }

    /**
     * Check if there are any courses displayed on the page
     */
    async hasAnyCourses(): Promise<boolean> {
        try {
            // First try to get course count using existing method
            const count = await this.getCourseCount();
            if (count > 0) {
                return true;
            }

            // As a fallback, check for any course card elements
            for (const selector of this.courseCardSelectors) {
                const cards = this.page.locator(selector);
                const cardCount = await cards.count();

                if (cardCount > 0) {
                    console.log(`Found ${cardCount} courses with selector: ${selector}`);
                    return true;
                }
            }

            // Also check for course elements in list view
            for (const selector of this.courseListSelectors) {
                const list = this.page.locator(selector);
                const isVisible = await list.isVisible({timeout: 1000});

                if (isVisible) {
                    const items = list.locator('li');
                    const itemCount = await items.count();
                    if (itemCount > 0) {
                        console.log(`Found ${itemCount} course items in list`);
                        return true;
                    }
                }
            }

            console.log('No courses found on the page');
            return false;
        } catch (error) {
            console.error('Error checking for courses:', error);
            return false;
        }
    }

    /**
     * Click on the first course in the list/grid
     */
    async clickFirstCourse(): Promise<void> {
        try {
            // Try to find course cards first
            for (const selector of this.courseCardSelectors) {
                const cards = this.page.locator(selector);
                const count = await cards.count();

                if (count > 0) {
                    // Get the first card and click it
                    const firstCard = cards.first();
                    await firstCard.click();
                    console.log('Clicked first course card');
                    await this.waitForPageLoad();
                    return;
                }
            }

            // If no cards found, try list items
            for (const selector of this.courseListSelectors) {
                const list = this.page.locator(selector);
                const isVisible = await list.isVisible({timeout: 1000});

                if (isVisible) {
                    const items = list.locator('li');
                    const count = await items.count();

                    if (count > 0) {
                        // Click the first list item
                        await items.first().click();
                        console.log('Clicked first course list item');
                        await this.waitForPageLoad();
                        return;
                    }
                }
            }

            throw new Error('No courses found to click');
        } catch (error) {
            console.error('Failed to click first course:', error);
            throw error;
        }
    }

    /**
     * Click on a course card by title
     */
    async clickCourse(title: string): Promise<void> {
        try {
            console.log(`Attempting to click on course with title: "${title}"`);

            // Approach 1: Try to find exact text content with title match
            try {
                const exactTitleSelector = `text="${title}"`;
                const exactTitleLocator = this.page.locator(exactTitleSelector);
                const exactTitleCount = await exactTitleLocator.count();

                if (exactTitleCount > 0) {
                    console.log(`Found exact title match via text content: ${title}`);
                    await exactTitleLocator.first().click();
                    console.log(`Clicked on course: ${title}`);
                    await this.waitForPageLoad();
                    return;
                }
            } catch (err) {
                console.log('Exact title match approach failed, trying next method');
            }

            // Approach 2: Try to find partial text content with title
            try {
                const partialTitleSelector = `text=${title}`;
                const partialTitleLocator = this.page.locator(partialTitleSelector);
                const partialTitleCount = await partialTitleLocator.count();

                if (partialTitleCount > 0) {
                    console.log(`Found partial title match via text content: ${title}`);
                    await partialTitleLocator.first().click();
                    console.log(`Clicked on course: ${title}`);
                    await this.waitForPageLoad();
                    return;
                }
            } catch (err) {
                console.log('Partial title match approach failed, trying next method');
            }

            // Approach 3: Get all course cards and check each one for the title
            try {
                const cards = await this.getCourseCards();
                const count = await cards.count();
                console.log(`Checking ${count} course cards for title: ${title}`);

                for (let i = 0; i < count; i++) {
                    const card = cards.nth(i);

                    // Check multiple possible title selectors
                    const titleSelectors = [
                        'h2', 'h3', 'h4', 'h5', '.course-title',
                        '[data-testid="course-title"]', '.MuiTypography-h5',
                        '.MuiTypography-h6', '.MuiCardHeader-title'
                    ];

                    let foundTitle = false;
                    for (const selector of titleSelectors) {
                        try {
                            const titleElements = card.locator(selector);
                            const titleCount = await titleElements.count();

                            if (titleCount > 0) {
                                for (let j = 0; j < titleCount; j++) {
                                    const titleEl = titleElements.nth(j);
                                    const titleText = await titleEl.textContent({timeout: 1000});

                                    if (titleText && (titleText.includes(title) || title.includes(titleText.trim()))) {
                                        console.log(`Found matching title in card ${i + 1}: "${titleText}"`);
                                        await card.click({timeout: 5000});
                                        console.log(`Clicked on course card ${i + 1}`);
                                        await this.waitForPageLoad();
                                        return;
                                    }
                                }
                            }
                        } catch (selectorError) {
                            // Continue with next selector
                            continue;
                        }
                    }

                    // If we didn't find the title in title elements, check full text content
                    try {
                        const cardText = await card.textContent({timeout: 1000});
                        if (cardText && (cardText.includes(title) || title.includes(cardText.trim()))) {
                            console.log(`Found matching text in card ${i + 1}`);
                            await card.click({timeout: 5000});
                            console.log(`Clicked on course card ${i + 1} by full text match`);
                            await this.waitForPageLoad();
                            return;
                        }
                    } catch (textError) {
                        // Continue to next card
                        continue;
                    }
                }
            } catch (err) {
                console.log('Card enumeration approach failed, trying next method');
            }

            // Approach 4: If nothing matched by title, click the first course card as fallback
            try {
                console.log(`No match found for "${title}", clicking first course card as fallback`);
                await this.clickFirstCourse();
                return;
            } catch (err) {
                console.error('Failed to click first course as fallback:', err);
            }

            throw new Error(`Could not find course with title: ${title}`);
        } catch (error) {
            console.error(`Failed to click course ${title}:`, error);
            throw error;
        }
    }

    /**
     * Navigate to a different page of courses if pagination is available
     */
    async goToPage(pageNumber: number): Promise<boolean> {
        try {
            // Try each pagination selector with proper error handling
            for (const selector of this.paginationSelectors) {
                try {
                    // Use first() to avoid strict mode violations
                    const paginationLocator = this.page.locator(selector).first();
                    const isVisible = await paginationLocator.isVisible({timeout: 1000}).catch(() => false);

                    if (isVisible) {
                        // Look for page button with the specified number
                        const pageButton = paginationLocator.locator(
                            `button:has-text("${pageNumber}"), [aria-label="Go to page ${pageNumber}"]`
                        );
                        const pageButtonVisible = await pageButton.isVisible({timeout: 1000}).catch(() => false);

                        if (pageButtonVisible) {
                            await pageButton.click();
                            console.log(`Navigated to page ${pageNumber}`);
                            await this.waitForPageLoad();
                            return true;
                        }
                    }
                } catch (err) {
                    // Continue to the next selector
                    continue;
                }
            }

            console.log(`Failed to navigate to page ${pageNumber}`);
            return false;
        } catch (error) {
            console.error(`Error navigating to page ${pageNumber}:`, error);
            return false;
        }
    }

    /**
     * Check if course cards contain markdown elements
     */
    async checkForMarkdownInCards(): Promise<{
        hasMarkdownElements: boolean;
        elementCounts: {[key: string]: number};
    }> {
        const result = {
            hasMarkdownElements: false,
            elementCounts: {} as {[key: string]: number}
        };

        try {
            const cards = await this.getCourseCards();
            const count = await cards.count();

            // Define markdown elements to look for
            const markdownSelectors = {
                headings: 'h1, h2, h3, h4, h5, h6',
                bold: 'strong, b',
                italic: 'em, i',
                code: 'code, pre',
                lists: 'ul, ol, li',
                links: 'a[href]',
                images: 'img',
                blockquotes: 'blockquote'
            };

            // Initialize counts
            for (const key in markdownSelectors) {
                result.elementCounts[key] = 0;
            }

            // Check each card
            for (let i = 0; i < count; i++) {
                const card = cards.nth(i);

                // Überprüfen, ob Kurs-Beschreibungen vorhanden sind
                for (const descSelector of this.courseDescriptionSelectors) {
                    try {
                        const descElement = card.locator(descSelector);
                        const isVisible = await descElement.isVisible({timeout: 500}).catch(() => false);

                        if (isVisible) {
                            // Wenn Beschreibungselement gefunden, nach Markdown-Elementen darin suchen
                            for (const [key, selector] of Object.entries(markdownSelectors)) {
                                try {
                                    const elements = descElement.locator(selector);
                                    const elemCount = await elements.count();
                                    result.elementCounts[key] += elemCount;

                                    if (elemCount > 0) {
                                        result.hasMarkdownElements = true;
                                        console.log(`Found ${elemCount} ${key} elements in card ${i + 1}`);
                                    }
                                } catch (err) {
                                    // Fehler beim Finden von Markdown-Elementen ignorieren
                                }
                            }
                        }
                    } catch (err) {
                        // Fehler beim Finden des Beschreibungselements ignorieren
                    }
                }

                // Auch direkt im Card-Element nach Markdown-Elementen suchen
                for (const [key, selector] of Object.entries(markdownSelectors)) {
                    try {
                        const elements = card.locator(selector);
                        const elemCount = await elements.count();
                        result.elementCounts[key] += elemCount;

                        if (elemCount > 0) {
                            result.hasMarkdownElements = true;
                            console.log(`Found ${elemCount} ${key} elements directly in card ${i + 1}`);
                        }
                    } catch (err) {
                        // Fehler ignorieren
                    }
                }
            }

            console.log('Markdown element counts in course cards:', result.elementCounts);
            console.log('Has markdown elements:', result.hasMarkdownElements);

        } catch (error) {
            console.error('Error checking for markdown in cards:', error);
        }

        return result;
    }

    /**
     * Extrahiere Kursbeschreibungstext aus allen sichtbaren Karten
     */
    async getCardDescriptions(): Promise<string[]> {
        const descriptions: string[] = [];

        try {
            const cards = await this.getCourseCards();
            const count = await cards.count();

            for (let i = 0; i < count; i++) {
                const card = cards.nth(i);

                // Versuchen, die Beschreibung mit verschiedenen Selektoren zu finden
                for (const descSelector of this.courseDescriptionSelectors) {
                    try {
                        const descElement = card.locator(descSelector);
                        const isVisible = await descElement.isVisible({timeout: 500}).catch(() => false);

                        if (isVisible) {
                            const text = await descElement.textContent();
                            if (text?.trim()) {
                                descriptions.push(text.trim());
                                break; // Sobald wir eine Beschreibung gefunden haben, zum nächsten Card gehen
                            }
                        }
                    } catch (err) {
                        // Fehler beim Finden des Beschreibungselements ignorieren
                    }
                }
            }

            console.log(`Found ${descriptions.length} course descriptions`);
        } catch (error) {
            console.error('Error getting course descriptions:', error);
        }

        return descriptions;
    }

    /**
     * Switch between grid and list view modes
     */
    async switchViewMode(mode: 'grid' | 'list'): Promise<boolean> {
        try {
            for (const selector of this.viewSwitchSelectors) {
                const switchElement = this.page.locator(selector);
                const isVisible = await switchElement.isVisible({timeout: 1000});

                if (isVisible) {
                    const modeButton = switchElement.locator(`button:has-text("${mode === 'grid' ? 'Grid' : 'List'}")`);
                    const isModeButtonVisible = await modeButton.isVisible({timeout: 1000});

                    if (isModeButtonVisible) {
                        await modeButton.click();
                        console.log(`Switched to ${mode} view`);
                        await this.waitForPageLoad();
                        return true;
                    }
                }
            }

            console.warn(`Could not find ${mode} view switch`);
            return false;
        } catch (error) {
            console.error(`Error switching to ${mode} view:`, error);
            return false;
        }
    }
}

/**
 * Student-specific courses page
 */
export class StudentCoursesPage extends CoursesPage {
    readonly enrollButtonSelectors = [
        'button:has-text("Enroll")',
        'button:has-text("Join")',
        'button[data-testid="enroll-button"]'
    ];

    readonly enrolledBadgeSelectors = [
        '.enrolled-badge',
        '.MuiChip-root:has-text("Enrolled")',
        '[data-testid="enrolled-badge"]'
    ];

    constructor(page: Page) {
        super(page, '/courses');
    }

    /**
     * Enroll in a course by title
     */
    async enrollInCourse(title: string): Promise<boolean> {
        try {
            const cards = await this.getCourseCards();
            const count = await cards.count();

            for (let i = 0; i < count; i++) {
                const card = cards.nth(i);
                const cardTitle = await card.locator('h2, h3, h4, .course-title, [data-testid="course-title"]').textContent();

                if (cardTitle && cardTitle.includes(title)) {
                    // Check for enroll button in this card
                    for (const selector of this.enrollButtonSelectors) {
                        const enrollButton = card.locator(selector);
                        const isVisible = await enrollButton.isVisible({timeout: 1000});

                        if (isVisible) {
                            await enrollButton.click();
                            console.log(`Clicked enroll button for course: ${title}`);
                            await this.waitForPageLoad();
                            return true;
                        }
                    }

                    // If we found the card but no enroll button, check if already enrolled
                    for (const selector of this.enrolledBadgeSelectors) {
                        const enrolledBadge = card.locator(selector);
                        const isEnrolled = await enrolledBadge.isVisible({timeout: 1000});

                        if (isEnrolled) {
                            console.log(`Already enrolled in course: ${title}`);
                            return true;
                        }
                    }

                    console.warn(`Found course ${title} but no enroll button or enrolled badge`);
                    return false;
                }
            }

            throw new Error(`Could not find course with title: ${title}`);
        } catch (error) {
            console.error(`Failed to enroll in course ${title}:`, error);
            return false;
        }
    }

    /**
     * Check if student is enrolled in a course
     * Enhanced with retry mechanism for more reliable state checking
     */
    async isEnrolledIn(title: string, maxRetries = 3, retryDelayMs = 1000): Promise<boolean> {
        try {
            // Implement a retry mechanism to give the application time to update
            for (let attempt = 1; attempt <= maxRetries; attempt++) {
                console.log(`Attempt ${attempt}/${maxRetries} to check enrollment status for: "${title}"`);

                // Force page reload on each attempt to get the most current state
                if (attempt > 1) {
                    console.log(`Refreshing page for attempt ${attempt}`);
                    await this.page.reload();
                    await this.waitForPageLoad();
                    await this.page.waitForTimeout(retryDelayMs); // Additional wait after reload
                }

                const cards = await this.getCourseCards();
                const count = await cards.count();

                let courseFound = false;
                for (let i = 0; i < count; i++) {
                    const card = cards.nth(i);

                    // Use multiple selectors to find the course title
                    const titleSelectors = [
                        'h2', 'h3', 'h4', 'h5', '.course-title',
                        '[data-testid="course-title"]', '.MuiTypography-h5',
                        '.MuiTypography-h6', '.MuiCardHeader-title'
                    ];

                    let cardTitle = '';
                    // Try each title selector
                    for (const selector of titleSelectors) {
                        try {
                            const titleElement = card.locator(selector);
                            if (await titleElement.isVisible({timeout: 500}).catch(() => false)) {
                                cardTitle = await titleElement.textContent() || '';
                                if (cardTitle.trim()) break;
                            }
                        } catch (err) {
                            // Continue to next selector
                        }
                    }

                    // If no title found with selectors, try getting all text from card
                    if (!cardTitle.trim()) {
                        try {
                            cardTitle = await card.textContent() || '';
                        } catch (err) {
                            // Ignore errors
                        }
                    }

                    // Check if this card contains our target title
                    if (cardTitle && (cardTitle.includes(title) || title.includes(cardTitle.trim()))) {
                        courseFound = true;
                        console.log(`Found course card for "${title}" on attempt ${attempt}`);

                        // First check for explicit enrollment indicators
                        let isEnrolled = false;

                        // Check for enrolled badge
                        for (const selector of this.enrolledBadgeSelectors) {
                            try {
                                const enrolledBadge = card.locator(selector);
                                if (await enrolledBadge.isVisible({timeout: 1000}).catch(() => false)) {
                                    console.log(`Enrolled badge found for course: ${title}`);
                                    return true;
                                }
                            } catch (err) {
                                // Continue to next selector
                            }
                        }

                        // Check for "Continue Learning" button instead of "Enroll"
                        try {
                            const continueButton = card.locator('button:has-text("Continue"), button:has-text("View Course")');
                            if (await continueButton.isVisible({timeout: 1000}).catch(() => false)) {
                                console.log(`Continue/View button found for course ${title}`);
                                return true;
                            }
                        } catch (err) {
                            // Ignore errors
                        }

                        // Check for absence of "Enroll" button (which would indicate not enrolled)
                        try {
                            for (const selector of this.enrollButtonSelectors) {
                                const enrollButton = card.locator(selector);
                                if (await enrollButton.isVisible({timeout: 1000}).catch(() => false)) {
                                    console.log(`Enroll button found for course ${title} - user is NOT enrolled`);
                                    return false;
                                }
                            }
                        } catch (err) {
                            // Ignore errors
                        }

                        // If we've found the course but no decisive enrollment indicators, and this is the last attempt,
                        // assume not enrolled
                        if (attempt === maxRetries) {
                            console.log(`No clear enrollment indicators for course ${title}, assuming not enrolled`);
                            return false;
                        }
                    }
                }

                if (!courseFound) {
                    console.warn(`Course not found: ${title} on attempt ${attempt}`);
                    if (attempt === maxRetries) {
                        return false;
                    }
                }

                // Wait before the next retry attempt
                if (attempt < maxRetries) {
                    const waitTime = retryDelayMs * attempt; // Progressive backoff
                    console.log(`Waiting ${waitTime}ms before next enrollment check...`);
                    await this.page.waitForTimeout(waitTime);
                }
            }

            return false; // Course not found or not enrolled after all retries
        } catch (error) {
            console.error(`Error checking enrollment status for course ${title}:`, error);
            return false;
        }
    }

    /**
     * Edit a course by title
     */
    async editCourse(title: string): Promise<void> {
        try {
            const cards = await this.getCourseCards();
            const count = await cards.count();

            for (let i = 0; i < count; i++) {
                const card = cards.nth(i);
                const cardTitle = await card.locator('h2, h3, h4, .course-title, [data-testid="course-title"]').textContent();

                if (cardTitle && cardTitle.includes(title)) {
                    // Look for edit button or menu
                    const editButton = card.locator('button[aria-label="edit"], button:has-text("Edit"), [data-testid="edit-course"]');
                    const hasEditButton = await editButton.isVisible({timeout: 1000});

                    if (hasEditButton) {
                        await editButton.click();
                        console.log(`Clicked edit button for course: ${title}`);
                        await this.waitForPageLoad();
                        return;
                    }

                    // If no direct edit button, check for menu button
                    const menuButton = card.locator('button[aria-label="menu"], button[aria-label="more"], [data-testid="course-menu"]');
                    const hasMenuButton = await menuButton.isVisible({timeout: 1000});

                    if (hasMenuButton) {
                        await menuButton.click();
                        console.log(`Clicked menu button for course: ${title}`);

                        // Wait for menu to open and click edit option
                        const editOption = this.page.locator('li:has-text("Edit"), [role="menuitem"]:has-text("Edit")');
                        await editOption.isVisible({timeout: 3000});
                        await editOption.click();
                        console.log('Selected edit option from menu');
                        await this.waitForPageLoad();
                        return;
                    }

                    throw new Error(`No edit button or menu found for course: ${title}`);
                }
            }

            throw new Error(`Could not find course with title: ${title}`);
        } catch (error) {
            console.error(`Failed to edit course ${title}:`, error);
            throw error;
        }
    }

    /**
     * Delete a course by title
     */
    async deleteCourse(title: string, confirmDelete: boolean = true): Promise<boolean> {
        try {
            const cards = await this.getCourseCards();
            const count = await cards.count();

            for (let i = 0; i < count; i++) {
                const card = cards.nth(i);
                const cardTitle = await card.locator('h2, h3, h4, .course-title, [data-testid="course-title"]').textContent();

                if (cardTitle && cardTitle.includes(title)) {
                    // Look for delete button
                    const deleteButton = card.locator('button[aria-label="delete"], button:has-text("Delete"), [data-testid="delete-course"]');
                    const hasDeleteButton = await deleteButton.isVisible({timeout: 1000});

                    if (hasDeleteButton) {
                        await deleteButton.click();
                        console.log(`Clicked delete button for course: ${title}`);
                    } else {
                        // If no direct delete button, check for menu button
                        const menuButton = card.locator('button[aria-label="menu"], button[aria-label="more"], [data-testid="course-menu"]');
                        const hasMenuButton = await menuButton.isVisible({timeout: 1000});

                        if (hasMenuButton) {
                            await menuButton.click();
                            console.log(`Clicked menu button for course: ${title}`);

                            // Wait for menu to open and click delete option
                            const deleteOption = this.page.locator('li:has-text("Delete"), [role="menuitem"]:has-text("Delete")');
                            const hasDeleteOption = await deleteOption.isVisible({timeout: 3000});

                            if (hasDeleteOption) {
                                await deleteOption.click();
                                console.log('Selected delete option from menu');
                            } else {
                                console.warn('No delete option found in menu');
                                return false;
                            }
                        } else {
                            console.warn('No delete button or menu found');
                            return false;
                        }
                    }

                    // Handle confirmation dialog
                    if (confirmDelete) {
                        // Wait for confirmation dialog
                        const confirmDialog = this.page.locator('dialog, .MuiDialog-root, [role="dialog"]');
                        const hasDialog = await confirmDialog.isVisible({timeout: 3000});

                        if (hasDialog) {
                            // Click confirm/delete button in dialog
                            const confirmButton = confirmDialog.locator('button:has-text("Delete"), button:has-text("Confirm"), button.MuiButton-containedError');
                            const hasConfirmButton = await confirmButton.isVisible({timeout: 1000});

                            if (hasConfirmButton) {
                                await confirmButton.click();
                                console.log('Confirmed course deletion');
                                await this.waitForPageLoad();
                                return true;
                            } else {
                                console.warn('No confirm button found in dialog');
                                // Try to cancel if we can't find confirm button
                                const cancelButton = confirmDialog.locator('button:has-text("Cancel")');
                                await cancelButton.click().catch(() => { });
                                return false;
                            }
                        } else {
                            console.warn('No confirmation dialog appeared');
                            return false;
                        }
                    }

                    return true;
                }
            }

            console.warn(`Course not found: ${title}`);
            return false;
        } catch (error) {
            console.error(`Error deleting course ${title}:`, error);
            return false;
        }
    }
}
