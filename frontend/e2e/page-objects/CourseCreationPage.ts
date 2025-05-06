import {Page, Locator} from '@playwright/test';
import {BasePage} from './BasePage';

/**
 * Interface for course creation data to provide structured input
 */
export interface ICourseCreationData {
  title: string;
  description: string;
  category?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  imageUrl?: string;
  isPublished?: boolean;
}

/**
 * Page object for the course creation form
 */
export class CourseCreationPage extends BasePage {
  // Form field selectors
  readonly titleInputSelectors = [
    '[data-testid="course-title-input"]',
    '#course-title',
    'input[name="title"]',
    'input[placeholder*="title"]'
  ];

  readonly descriptionInputSelectors = [
    '[data-testid="markdown-editor-textarea"]',
    '#course-description',
    'textarea[name="description"]',
    '.markdown-editor textarea'
  ];

  readonly categoryInputSelectors = [
    '[data-testid="course-category-input"]',
    '#course-category',
    'input[name="category"]'
  ];

  readonly difficultySelectSelectors = [
    '[data-testid="course-difficulty-select"]',
    '#course-difficulty',
    'select[name="difficulty"]'
  ];

  readonly imageUrlInputSelectors = [
    '[data-testid="course-image-url-input"]',
    '#course-image-url',
    'input[name="imageUrl"]'
  ];

  readonly publishSwitchSelectors = [
    '[data-testid="course-publish-switch"]',
    '#course-publish',
    'input[name="isPublished"]',
    '.publish-switch'
  ];

  readonly submitButtonSelectors = [
    '[data-testid="course-submit-button"]',
    'button[type="submit"]',
    'button:has-text("Create Course")',
    'button:has-text("Save Course")'
  ];

  readonly errorNotificationSelectors = [
    '.MuiAlert-standardError',
    '.error-notification',
    '[data-testid="error-notification"]'
  ];

  readonly successNotificationSelectors = [
    '.MuiAlert-standardSuccess',
    '.success-notification',
    '[data-testid="success-notification"]'
  ];

  readonly validationErrorSelectors = [
    '.Mui-error',
    '.error-message',
    '.validation-error'
  ];

  constructor(page: Page) {
    super(page, '/instructor/courses/new');
  }

  /**
   * Check if the course form is loaded
   */
  async isFormLoaded(): Promise<boolean> {
    try {
      // Look for the title input field as an indicator of form loading
      for (const selector of this.titleInputSelectors) {
        const titleInput = this.page.locator(selector);
        const isVisible = await titleInput.isVisible({timeout: 2000});
        if (isVisible) {
          console.log('Course form loaded (title field found)');
          return true;
        }
      }

      // If title input not found, check for form element
      const formExists = await this.page.locator('form').isVisible({timeout: 2000});
      if (formExists) {
        console.log('Form element found but title input not found');
        return true;
      }

      console.warn('Course form does not appear to be loaded');
      await this.takeScreenshot('course-form-not-loaded');
      return false;
    } catch (error) {
      console.error('Error checking if course form is loaded:', error);
      return false;
    }
  }

  /**
   * Fill the title field
   */
  async fillTitle(title: string): Promise<void> {
    try {
      const titleInput = await this.findElement(this.titleInputSelectors, 'title input');
      await titleInput.fill(title);
      console.log('Filled course title:', title);
    } catch (error) {
      console.error('Failed to fill course title:', error);
      throw error;
    }
  }

  /**
   * Fill the description field
   */
  async fillDescription(description: string): Promise<void> {
    try {
      const descInput = await this.findElement(this.descriptionInputSelectors, 'description input');
      await descInput.fill(description);
      console.log('Filled course description');
    } catch (error) {
      console.error('Failed to fill course description:', error);
      throw error;
    }
  }

  /**
   * Fill the category field
   */
  async fillCategory(category: string): Promise<void> {
    try {
      const categoryInput = await this.findElement(this.categoryInputSelectors, 'category input', {timeoutMs: 1000})
        .catch(() => null);

      if (categoryInput) {
        await categoryInput.fill(category);
        console.log('Filled course category:', category);
      } else {
        console.log('Category input not found - may be optional');
      }
    } catch (error) {
      console.warn('Could not fill category, it might be optional:', error);
    }
  }

  /**
   * Select difficulty level
   */
  async selectDifficulty(difficulty: 'beginner' | 'intermediate' | 'advanced'): Promise<void> {
    try {
      const difficultySelect = await this.findElement(this.difficultySelectSelectors, 'difficulty select', {timeoutMs: 1000})
        .catch(() => null);

      if (difficultySelect) {
        await difficultySelect.selectOption(difficulty);
        console.log('Selected difficulty:', difficulty);
      } else {
        console.log('Difficulty select not found - may be optional');
      }
    } catch (error) {
      console.warn('Could not select difficulty, it might be optional:', error);
    }
  }

  /**
   * Fill image URL field
   */
  async fillImageUrl(url: string): Promise<void> {
    try {
      const imageUrlInput = await this.findElement(this.imageUrlInputSelectors, 'image URL input', {timeoutMs: 1000})
        .catch(() => null);

      if (imageUrlInput) {
        await imageUrlInput.fill(url);
        console.log('Filled image URL:', url);
      } else {
        console.log('Image URL input not found - may be optional');
      }
    } catch (error) {
      console.warn('Could not fill image URL, it might be optional:', error);
    }
  }

  /**
   * Set publish status
   */
  async setPublishStatus(isPublished: boolean): Promise<void> {
    try {
      const publishSwitch = await this.findElement(this.publishSwitchSelectors, 'publish switch', {timeoutMs: 1000})
        .catch(() => null);

      if (publishSwitch) {
        // Check current status
        const isChecked = await publishSwitch.isChecked();

        // Only change if needed
        if (isChecked !== isPublished) {
          if (isPublished) {
            await publishSwitch.check();
          } else {
            await publishSwitch.uncheck();
          }
          console.log(`Set publish status to ${isPublished}`);
        } else {
          console.log(`Publish status already set to ${isPublished}`);
        }
      } else {
        console.log('Publish switch not found - may be optional');
      }
    } catch (error) {
      console.warn('Could not set publish status, it might be optional:', error);
    }
  }

  /**
   * Fill entire course form with given data
   */
  async fillCourseForm(data: ICourseCreationData): Promise<void> {
    // Required fields
    await this.fillTitle(data.title);
    await this.fillDescription(data.description);

    // Optional fields
    if (data.category) {
      await this.fillCategory(data.category);
    }

    if (data.difficulty) {
      await this.selectDifficulty(data.difficulty);
    }

    if (data.imageUrl) {
      await this.fillImageUrl(data.imageUrl);
    }

    if (data.isPublished !== undefined) {
      await this.setPublishStatus(data.isPublished);
    }

    console.log('Form filled with all provided data');
  }

  /**
   * Submit the form
   */
  async submitForm(): Promise<void> {
    try {
      const submitButton = await this.findElement(this.submitButtonSelectors, 'submit button');
      await submitButton.click();
      console.log('Clicked submit button');
    } catch (error) {
      console.error('Failed to submit form:', error);
      throw error;
    }
  }

  /**
   * Check form for validation errors
   */
  async checkValidationErrors(): Promise<{
    hasAnyError: boolean;
    titleError: boolean;
    descriptionError: boolean;
    errorMessages: string[];
  }> {
    const result = {
      hasAnyError: false,
      titleError: false,
      descriptionError: false,
      errorMessages: [] as string[]
    };

    try {
      // Check title input
      const titleInput = await this.findElement(this.titleInputSelectors, 'title input', {timeoutMs: 1000})
        .catch(() => null);

      if (titleInput) {
        // Check aria-invalid attribute
        result.titleError = await titleInput.evaluate(el => el.getAttribute('aria-invalid') === 'true');

        if (result.titleError) {
          // Get the error message if available
          const titleErrorMessage = await this.getFieldErrorMessage(titleInput);
          if (titleErrorMessage) {
            result.errorMessages.push(titleErrorMessage);
          }
        }
      }

      // Check description input
      const descInput = await this.findElement(this.descriptionInputSelectors, 'description input', {timeoutMs: 1000})
        .catch(() => null);

      if (descInput) {
        result.descriptionError = await descInput.evaluate(el => el.getAttribute('aria-invalid') === 'true')
          .catch(() => false);

        if (result.descriptionError) {
          const descErrorMessage = await this.getFieldErrorMessage(descInput);
          if (descErrorMessage) {
            result.errorMessages.push(descErrorMessage);
          }
        }
      }

      // Check for any validation error elements
      const validationErrors = this.page.locator(this.validationErrorSelectors.join(','));
      const errorCount = await validationErrors.count();

      if (errorCount > 0) {
        result.hasAnyError = true;

        // Collect error messages
        for (let i = 0; i < errorCount; i++) {
          const errorText = await validationErrors.nth(i).textContent();
          if (errorText && !result.errorMessages.includes(errorText.trim())) {
            result.errorMessages.push(errorText.trim());
          }
        }
      }

      // Set hasAnyError if either title or description has errors
      result.hasAnyError = result.hasAnyError || result.titleError || result.descriptionError;

      console.log('Validation errors check result:', result);
      return result;
    } catch (error) {
      console.error('Error checking validation errors:', error);
      result.hasAnyError = true; // Assume error if exception occurs
      return result;
    }
  }

  /**
   * Get the error message associated with a field
   */
  private async getFieldErrorMessage(fieldLocator: Locator): Promise<string | null> {
    try {
      // Try to find error message by id reference
      const fieldId = await fieldLocator.evaluate(el => el.id).catch(() => '');

      if (fieldId) {
        const errorByAriaDescribedby = this.page.locator(`[id="${fieldId}-error"], [id="${fieldId}-helper-text"]`);
        if (await errorByAriaDescribedby.isVisible()) {
          const text = await errorByAriaDescribedby.textContent();
          if (text) return text.trim();
        }
      }

      // Try to find error message near the field
      // Safely handle the parentElement and its locator
      try {
        const parentElement = await fieldLocator.evaluateHandle(el => el.parentElement);
        const parentElementAsElement = parentElement.asElement();

        if (parentElementAsElement) {  // Only proceed if we have a valid element
          // Look for error messages in the parent element
          const errorSelectors = ['.Mui-error', '.error-message', 'p[class*="error"]', 'div[class*="error"]'];

          for (const selector of errorSelectors) {
            const errorElement = parentElementAsElement.locator(selector);
            if (await errorElement.count() > 0 && await errorElement.isVisible()) {
              const text = await errorElement.textContent();
              if (text) return text.trim();
            }
          }

          // Look for helper text
          const helperText = parentElementAsElement.locator('.MuiFormHelperText-root');
          if (await helperText.count() > 0 && await helperText.isVisible()) {
            const text = await helperText.textContent();
            if (text) return text.trim();
          }
        }
      } catch (parentError) {
        console.warn('Error accessing parent element:', parentError);
      }

      // Look for form field error message formats used in Material UI
      const formFieldErrorSelectors = [
        // Look in siblings after the input
        `${fieldLocator}+.MuiFormHelperText-root`,
        `${fieldLocator}~.error-message`,
        `${fieldLocator}~p[class*="error"]`,

        // Look for validation error near field label
        `label[for="${fieldId}"]~.error-message`,
        `.MuiFormLabel-root.Mui-error`
      ];

      for (const selector of formFieldErrorSelectors) {
        try {
          const errorElement = this.page.locator(selector);
          if (await errorElement.count() > 0 && await errorElement.isVisible()) {
            const text = await errorElement.textContent();
            if (text) return text.trim();
          }
        } catch (err) {
          // Ignore errors for individual selectors
        }
      }

      return null;
    } catch (error) {
      console.warn('Could not get field error message:', error);
      return null;
    }
  }

  /**
   * Wait for success notification and extract course ID
   */
  async waitForSuccessNotification(timeoutMs: number = 10000): Promise<{success: boolean; courseId?: string; message?: string}> {
    try {
      // Wait for success notification
      const successNotification = await this.findElement(
        this.successNotificationSelectors,
        'success notification',
        {timeoutMs}
      ).catch(() => null);

      if (!successNotification) {
        // Check if an error notification appeared instead
        const errorNotification = await this.findElement(
          this.errorNotificationSelectors,
          'error notification',
          {timeoutMs: 1000}
        ).catch(() => null);

        if (errorNotification) {
          const errorMessage = await errorNotification.textContent();
          console.error(`Course creation failed with error: ${errorMessage}`);
          await this.takeScreenshot('course-creation-error');
          return {success: false, message: errorMessage?.trim() || 'Unknown error'};
        }

        console.error('No success or error notification appeared');
        await this.takeScreenshot('course-creation-timeout');
        return {success: false, message: 'No notification appeared'};
      }

      // Extract notification text
      const notificationText = await successNotification.textContent() || '';
      console.log(`Success notification appeared: "${notificationText}"`);

      // Wait for URL change to course details page
      await this.page.waitForURL('**/instructor/courses/*');
      const currentUrl = this.page.url();

      // Extract course ID from URL
      const courseId = currentUrl.split('/').pop();
      console.log(`Redirected to course details page with ID: ${courseId}`);

      return {success: true, courseId, message: notificationText};
    } catch (error) {
      console.error('Error waiting for success notification:', error);
      await this.takeScreenshot('notification-error');
      return {success: false, message: error.message};
    }
  }

  /**
   * Validate that the course details page shows the correct information
   */
  async validateCourseDetails(courseId: string, expectedTitle: string): Promise<boolean> {
    try {
      // Ensure we're on the right page
      const currentUrl = this.page.url();
      if (!currentUrl.includes(courseId)) {
        console.error(`Not on the expected course page. Expected URL to contain ${courseId}, but got ${currentUrl}`);
        return false;
      }

      // Wait a moment for the page to fully render
      await this.page.waitForTimeout(500);

      // Take a screenshot to see what's actually displayed
      await this.takeScreenshot('course-details-page');

      // Check for the course title
      const titleVisible = await this.page.getByText(expectedTitle, {exact: true}).isVisible()
        .catch(() => false);

      if (!titleVisible) {
        console.error(`Expected title "${expectedTitle}" not found on page`);
        return false;
      }

      // Check for edit course section/button as another verification
      const hasEditOption = await this.page.getByText('Edit Course').isVisible()
        .catch(() => false);

      console.log(`Course validation results - Title visible: ${titleVisible}, Edit option: ${hasEditOption}`);
      return titleVisible && hasEditOption;
    } catch (error) {
      console.error('Error validating course details:', error);
      return false;
    }
  }
}
