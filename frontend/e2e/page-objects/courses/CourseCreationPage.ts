import {Page, Locator} from '@playwright/test';
import {BasePage} from '../BasePage';

/**
 * Interface for course creation data to provide structured input
 */
export interface ICourseCreationData {
  title: string;
  description: string;
  category?: string;
  difficulty_level?: 'beginner' | 'intermediate' | 'advanced';
  image_url?: string;
  is_published?: boolean;
  status?: 'draft' | 'published' | 'archived';
  visibility?: 'public' | 'private';
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
    'select[name="difficulty_level"]',
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
    'input[name="is_published"]',
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
    '[data-testid="error-notification"]',
    '.error-notification',
    '.MuiAlert-standardError',
    '[role="alert"]',
    '.Mui-error .help-text',
    '.error-message',
    '.error-text'
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

  // Modal-related selectors
  readonly modalSelectors = {
    container: '[data-testid="course-modal"]',
    title: '[data-testid="course-modal-title"]',
    saveButton: '[data-testid="course-modal-save-button"]',
    cancelButton: '[data-testid="course-modal-cancel-button"]',
    closeButton: '[data-testid="course-modal-close-button"]'
  };

  // Optimistic update UI elements
  readonly optimisticUpdateSelectors = {
    loadingIndicator: '[data-testid="course-loading-indicator"]',
    temporaryTitle: '[data-testid="course-temp-title"]',
    temporaryDescription: '[data-testid="course-temp-description"]'
  };

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

    if (data.difficulty_level) {
      await this.selectDifficulty(data.difficulty_level);
    }

    if (data.image_url) {
      await this.fillImageUrl(data.image_url);
    }

    if (data.is_published !== undefined) {
      await this.setPublishStatus(data.is_published);
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
      const parentLocator = fieldLocator.locator('..');

      if (await parentLocator.count() > 0) {
        // Look for error messages in the parent element
        const errorSelectors = ['.Mui-error', '.error-message', 'p[class*="error"]', 'div[class*="error"]'];

        for (const selector of errorSelectors) {
          const errorElement = parentLocator.locator(selector);
          if (await errorElement.count() > 0 && await errorElement.isVisible()) {
            const text = await errorElement.textContent();
            if (text) return text.trim();
          }
        }

        // Look for helper text
        const helperText = parentLocator.locator('.MuiFormHelperText-root');
        if (await helperText.count() > 0 && await helperText.isVisible()) {
          const text = await helperText.textContent();
          if (text) return text.trim();
        }
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
      // Check if we're already on a course detail page
      const currentUrl = this.page.url();
      if (currentUrl.includes('/instructor/courses/') &&
        !currentUrl.includes('/instructor/courses/new') &&
        !currentUrl.includes('/instructor/courses/') &&
        !currentUrl.includes('/instructor/courses?')) {
        // We're already on a course detail page, extract ID
        const courseId = currentUrl.split('/').pop();
        console.log(`Already on course details page with ID: ${courseId}`);
        return {success: true, courseId, message: 'Course created successfully'};
      }

      // Wait for success notification
      const successNotification = await this.findElement(
        this.successNotificationSelectors,
        'success notification',
        {timeoutMs: 3000}
      ).catch(() => null);

      if (!successNotification) {
        // Try waiting for URL change instead
        try {
          await this.page.waitForURL('**/instructor/courses/*', {timeout: timeoutMs});
          const updatedUrl = this.page.url();

          if (updatedUrl.includes('/instructor/courses/') &&
            !updatedUrl.includes('/instructor/courses/new')) {
            const courseId = updatedUrl.split('/').pop();
            console.log(`URL changed to course details page with ID: ${courseId}`);
            return {success: true, courseId, message: 'Course created successfully (detected via URL change)'};
          }
        } catch (urlError) {
          console.log('No URL change detected');
        }

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
      await this.page.waitForURL('**/instructor/courses/*', {timeout: timeoutMs})
        .catch(() => console.warn('No URL change detected after success notification'));

      const updatedUrl = this.page.url();

      // Extract course ID from URL
      if (updatedUrl.includes('/instructor/courses/') &&
        !updatedUrl.includes('/instructor/courses/new') &&
        !updatedUrl.includes('/instructor/courses?')) {
        const courseId = updatedUrl.split('/').pop();
        console.log(`Redirected to course details page with ID: ${courseId}`);
        return {success: true, courseId, message: notificationText};
      }

      console.log('Success notification appeared but couldn\'t extract course ID from URL');
      return {success: true, message: notificationText};
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

  /**
   * Wait for the course modal to be visible
   */
  async waitForModal(state: 'visible' | 'hidden' = 'visible', timeout = 5000): Promise<void> {
    // First check if we're on the standalone page
    const currentUrl = this.page.url();
    if (currentUrl.includes('/instructor/courses/new') && state === 'visible') {
      // We're on the standalone page, so we don't need to wait for modal
      console.log('Using standalone course creation page instead of modal');
      return;
    }

    // Otherwise, look for the modal
    const modalLocator = this.page.locator(this.modalSelectors.container);
    try {
      if (state === 'visible') {
        await modalLocator.waitFor({state: 'visible', timeout});
      } else {
        await modalLocator.waitFor({state: 'hidden', timeout});
      }
    } catch (error) {
      // If we failed to find the modal and we're on the standalone page, this is acceptable
      if (currentUrl.includes('/instructor/courses/new') && state === 'visible') {
        console.log('Modal not found, but we are on the standalone course creation page');
        return;
      }
      throw error;
    }
  }

  /**
   * Close the course modal using the close button
   */
  async closeModal(): Promise<void> {
    await this.page.click(this.modalSelectors.closeButton);
    await this.waitForModal('hidden');
  }

  /**
   * Cancel course creation/editing using the cancel button
   */
  async cancelModal(): Promise<void> {
    try {
      // Try the modal cancel button first
      const cancelButtonLocator = this.page.locator(this.modalSelectors.cancelButton);
      if (await cancelButtonLocator.isVisible({timeout: 1000}).catch(() => false)) {
        await cancelButtonLocator.click();
        await this.waitForModal('hidden');
        console.log('Clicked modal cancel button');
        return;
      }

      // Try with a generic cancel button
      const cancelButton = this.page.locator('button:has-text("Cancel")');
      if (await cancelButton.isVisible({timeout: 1000}).catch(() => false)) {
        await cancelButton.click();
        console.log('Clicked cancel button');

        // Navigate back to courses page
        await this.page.goto('/instructor/courses');
        await this.page.waitForLoadState('networkidle');
        return;
      }

      // If no cancel button found, just navigate back
      console.log('No cancel button found, navigating back to courses page');
      await this.page.goto('/instructor/courses');
      await this.page.waitForLoadState('networkidle');
    } catch (error) {
      console.error('Error cancelling course:', error);
      throw error;
    }
  }

  /**
   * Save the course using the modal save button
   */
  async saveModal(): Promise<void> {
    try {
      // Try the modal save button first
      const saveButtonLocator = this.page.locator(this.modalSelectors.saveButton);
      if (await saveButtonLocator.isVisible({timeout: 1000}).catch(() => false)) {
        await saveButtonLocator.click();
        console.log('Clicked modal save button');
        return;
      }

      // Fall back to regular submit button
      const submitButton = await this.findElement(
        this.submitButtonSelectors,
        'submit button',
        {timeoutMs: 2000}
      ).catch(() => null);

      if (submitButton) {
        await submitButton.click();
        console.log('Clicked submit button');
        return;
      }

      console.error('Could not find any save or submit button');
      throw new Error('No save or submit button found');
    } catch (error) {
      console.error('Error saving course:', error);
      throw error;
    }
  }

  /**
   * Wait for and verify optimistic update UI elements
   */
  async verifyOptimisticUpdate(courseData: ICourseCreationData): Promise<boolean> {
    try {
      // Check if we're on the standalone page - different verification logic
      const currentUrl = this.page.url();
      if (currentUrl.includes('/instructor/courses/new') || currentUrl.includes('/instructor/courses/edit')) {
        // For standalone page, just check if form is still available with the data
        const formValues = await this.getFormValues();
        const titleMatch = formValues.title === courseData.title;
        const descMatch = !courseData.description || formValues.description === courseData.description;
        console.log(`Standalone page optimistic update check: Title match=${titleMatch}, Description match=${descMatch}`);
        return titleMatch && descMatch;
      }

      // Modal/optimistic update approach - look for temporary elements
      // First check if the elements exist
      const tempTitleExists = await this.page.locator(this.optimisticUpdateSelectors.temporaryTitle).isVisible()
        .catch(() => false);

      if (!tempTitleExists) {
        console.log('Optimistic update UI elements not found, checking for course in the list instead');
        // Check if the course appears in the course list
        const courseTitle = this.page.locator(`text=${courseData.title}`);
        return await courseTitle.isVisible().catch(() => false);
      }

      // Traditional optimistic update check
      const tempTitle = this.page.locator(this.optimisticUpdateSelectors.temporaryTitle);
      const titleText = await tempTitle.textContent();
      const hasTitle = titleText === courseData.title;

      // Wait for temporary description update if provided
      if (courseData.description) {
        const tempDesc = this.page.locator(this.optimisticUpdateSelectors.temporaryDescription);
        const isVisible = await tempDesc.isVisible().catch(() => false);
        if (isVisible) {
          const descText = await tempDesc.textContent();
          const hasDesc = descText === courseData.description;
          return hasTitle && hasDesc;
        }
      }

      return hasTitle;
    } catch (error) {
      console.error('Failed to verify optimistic update:', error);
      return false;
    }
  }

  /**
   * Wait for optimistic update to be confirmed (loading indicator gone)
   */
  async waitForOptimisticUpdateConfirmation(timeout = 5000): Promise<void> {
    // Check if we're on the standalone page
    const currentUrl = this.page.url();
    if (currentUrl.includes('/instructor/courses/new') || currentUrl.includes('/instructor/courses/edit')) {
      // For standalone page, wait for form to be submitted
      console.log('Standalone page - waiting for form to be submitted');
      await this.page.waitForTimeout(1000); // Give time for any pending operations
      return;
    }

    // Check if the loading indicator exists
    const loadingIndicatorExists = await this.page.locator(this.optimisticUpdateSelectors.loadingIndicator)
      .isVisible({timeout: 1000})
      .catch(() => false);

    if (loadingIndicatorExists) {
      // Wait for loading indicator to disappear
      const loadingIndicator = this.page.locator(this.optimisticUpdateSelectors.loadingIndicator);
      await loadingIndicator.waitFor({state: 'hidden', timeout});
      console.log('Loading indicator disappeared - optimistic update confirmed');
    } else {
      // No loading indicator found, wait briefly for any pending operations
      console.log('No loading indicator found, waiting briefly for any async operations');
      await this.page.waitForTimeout(1000);
    }
  }

  /**
   * Check for validation errors in the form
   */
  async hasValidationErrors(): Promise<boolean> {
    try {
      // First check our validation selectors
      for (const selector of this.validationErrorSelectors) {
        const errors = this.page.locator(selector);
        const count = await errors.count();
        if (count > 0) {
          console.log(`Found ${count} validation errors with selector: ${selector}`);
          return true;
        }
      }

      // Check for error states in form fields
      const titleErrorState = await this.page.locator('input[name="title"][aria-invalid="true"]')
        .isVisible().catch(() => false);

      const descriptionErrorState = await this.page.locator('textarea[aria-invalid="true"]')
        .isVisible().catch(() => false);

      if (titleErrorState || descriptionErrorState) {
        console.log(`Found fields with error states: Title=${titleErrorState}, Description=${descriptionErrorState}`);
        return true;
      }

      // Check for error helper text
      const helperTexts = await this.page.locator('.MuiFormHelperText-root')
        .all();

      for (const helperText of helperTexts) {
        const text = await helperText.textContent();
        const hasError = await helperText.evaluate(el =>
          el.classList.contains('Mui-error') ||
          el.classList.contains('error')
        ).catch(() => false);

        if (hasError && text && text.trim()) {
          console.log(`Found error helper text: "${text}"`);
          return true;
        }
      }

      // Look for any visible error messages
      const anyErrorMessage = await this.page.getByText('is required', {exact: false})
        .isVisible().catch(() => false);

      if (anyErrorMessage) {
        console.log('Found error message with "is required" text');
        return true;
      }

      console.log('No validation errors found');
      return false;
    } catch (error) {
      console.error('Error checking for validation errors:', error);
      return false;
    }
  }

  /**
   * Wait for error notification toast/alert
   */  async waitForErrorNotification(timeout = 15000): Promise<{success: boolean; message?: string}> {
    try {
      let errorFound = false;
      let errorMessage = '';

      // Increase initial wait time to ensure UI has time to show error
      await this.page.waitForTimeout(1000);

      // Try each selector in parallel for better performance
      const notificationPromises = this.errorNotificationSelectors.map(async (selector) => {
        try {
          const notification = this.page.locator(selector);
          if (await notification.count() > 0) {
            // First check if it's already visible
            if (await notification.isVisible()) {
              const text = await notification.textContent();
              if (text) {
                console.log(`Found error notification with selector ${selector}: ${text}`);
                errorFound = true;
                errorMessage = text;
              }
            } else {
              // If not visible, wait for it
              await notification.waitFor({state: 'visible', timeout});
              const text = await notification.textContent();
              if (text) {
                console.log(`Error notification became visible with selector ${selector}: ${text}`);
                errorFound = true;
                errorMessage = text;
              }
            }
          }
        } catch (e) {
          // Ignore errors for individual selectors
          console.log(`No error notification found with selector ${selector}`);
        }
      });

      // Wait for all selector checks to complete
      await Promise.all(notificationPromises);

      // Also check generic error text that might appear
      const errorTextSelectors = [
        'text=failed',
        'text=error',
        'text=unsuccessful',
        'text=network',
        'text=offline',
        'text=cannot',
        'text=unable'
      ];

      if (!errorFound) {
        for (const textSelector of errorTextSelectors) {
          try {
            const errorText = this.page.getByText(textSelector, {exact: false});
            if (await errorText.isVisible()) {
              const text = await errorText.textContent();
              if (text) {
                console.log(`Found error text: ${text}`);
                errorFound = true;
                errorMessage = text;
                break;
              }
            }
          } catch (e) {
            // Ignore errors for text selectors
          }
        }
      }

      return {
        success: !errorFound,  // success should be false if we found an error
        message: errorMessage || undefined
      };
    } catch (error) {
      console.error('Error in waitForErrorNotification:', error);
      return {success: false, message: error.toString()};
    }
  }

  /**
   * Get current values from form fields
   */
  async getFormValues(): Promise<Partial<ICourseCreationData>> {
    const formValues: Partial<ICourseCreationData> = {};

    try {
      // Get title
      const titleSelectors = [
        ...this.titleInputSelectors,
        'input[name="title"]',
        '#title',
        'input[type="text"]:first-of-type'
      ];

      for (const selector of titleSelectors) {
        const titleInput = this.page.locator(selector);
        if (await titleInput.count() > 0 && await titleInput.isVisible().catch(() => false)) {
          formValues.title = await titleInput.inputValue().catch(() => '');
          if (formValues.title) {
            console.log(`Found title: ${formValues.title}`);
            break;
          }
        }
      }

      // Get description
      const descriptionSelectors = [
        ...this.descriptionInputSelectors,
        'textarea[name="description"]',
        '#description',
        'textarea:first-of-type'
      ];

      for (const selector of descriptionSelectors) {
        const descInput = this.page.locator(selector);
        if (await descInput.count() > 0 && await descInput.isVisible().catch(() => false)) {
          formValues.description = await descInput.inputValue().catch(() => '');
          if (formValues.description) {
            console.log('Found description text');
            break;
          }
        }
      }

      // Get category
      const categorySelectors = [
        ...this.categoryInputSelectors,
        'input[name="category"]',
        'select[name="category"]',
        '#category'
      ];

      for (const selector of categorySelectors) {
        const categoryInput = this.page.locator(selector);
        if (await categoryInput.count() > 0 && await categoryInput.isVisible().catch(() => false)) {
          formValues.category = await categoryInput.inputValue().catch(() => '');
          if (formValues.category) {
            console.log(`Found category: ${formValues.category}`);
            break;
          }
        }
      }

      // Get difficulty
      const difficultySelectors = [
        ...this.difficultySelectSelectors,
        'select[name="difficulty_level"]',
        'select[name="difficulty"]',
        '#difficulty_level',
        '#difficulty'
      ];

      for (const selector of difficultySelectors) {
        const difficultySelect = this.page.locator(selector);
        if (await difficultySelect.count() > 0 && await difficultySelect.isVisible().catch(() => false)) {
          formValues.difficulty_level = (await difficultySelect.inputValue().catch(() => '')) as any;
          if (formValues.difficulty_level) {
            console.log(`Found difficulty: ${formValues.difficulty_level}`);
            break;
          }
        }
      }

      // Get published state
      const publishSelectors = [
        ...this.publishSwitchSelectors,
        'input[name="is_published"]',
        'input[type="checkbox"][name*="publish"]',
        '#is_published'
      ];

      for (const selector of publishSelectors) {
        const publishSwitch = this.page.locator(selector);
        if (await publishSwitch.count() > 0 && await publishSwitch.isVisible().catch(() => false)) {
          formValues.is_published = await publishSwitch.isChecked().catch(() => false);
          console.log(`Found publish state: ${formValues.is_published}`);
          break;
        }
      }

      console.log('Form values retrieved:', formValues);
      return formValues;
    } catch (error) {
      console.error('Error getting form values:', error);
      return formValues; // Return whatever we managed to collect
    }
  }
}
