import { useCallback } from 'react';
import { AxiosError } from 'axios';

import { useNotification } from '@/components/Notifications/useNotification';

/**
 * Hook for handling API errors consistently across the application
 * Uses the existing centralized notification system (ADR-012)
 */
export const useApiErrors = () => {
  const notify = useNotification();

  /**
   * Handle API error with appropriate user feedback and logging
   * @param error - The error object from API call
   * @param fallbackMessage - User-friendly fallback message if no specific error is found
   */
  const handleApiError = useCallback(
    (error: unknown, fallbackMessage: string = 'An error occurred') => {
      console.error('API Error:', error);

      // Default error message
      let errorMessage = fallbackMessage;
      let statusCode: number | undefined;
      let errorTitle = 'Error';

      // Handle Axios errors specifically
      if (error instanceof AxiosError) {
        statusCode = error.response?.status;

        // Extract error message from response if available
        if (error.response?.data) {
          if (typeof error.response.data === 'string') {
            errorMessage = error.response.data;
          } else if (error.response.data.message) {
            errorMessage = error.response.data.message;
          } else if (error.response.data.detail) {
            errorMessage = error.response.data.detail;
          } else if (error.response.data.error) {
            errorMessage = error.response.data.error;
          }
        }

        // Status-specific error messages and titles
        if (statusCode) {
          errorTitle = `Error ${statusCode}`;
          if (statusCode === 401) {
            errorTitle = 'Authentication Error';
            errorMessage = 'Your session has expired. Please log in again.';
          } else if (statusCode === 403) {
            errorTitle = 'Permission Denied';
            errorMessage = 'You do not have permission to perform this action.';
          } else if (statusCode === 404) {
            errorTitle = 'Not Found';
            errorMessage = 'The requested resource was not found.';
          } else if (statusCode >= 500) {
            errorTitle = 'Server Error';
            errorMessage = 'Server error. Please try again later.';
          }
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      // Log structured error information
      console.group('API Error Details');
      console.error('Error Message:', errorMessage);
      console.error('Status Code:', statusCode);
      console.error('Original Error:', error);
      console.groupEnd();

      // Show notification using existing centralized system
      notify({
        message: errorMessage,
        title: errorTitle,
        severity: 'error',
        duration: 6000, // 6 seconds
      });

      return { message: errorMessage, statusCode, title: errorTitle };
    },
    [notify]
  );

  /**
   * Format field-specific validation errors from API response
   * @param errorData - Error data object from API response
   */
  const formatValidationErrors = useCallback((errorData: any): Record<string, string> => {
    const formattedErrors: Record<string, string> = {};

    if (!errorData) return formattedErrors;

    // Handle DRF-style validation errors (field: [error_messages])
    Object.entries(errorData).forEach(([field, errors]) => {
      if (Array.isArray(errors)) {
        formattedErrors[field] = errors[0] as string;
      } else if (typeof errors === 'string') {
        formattedErrors[field] = errors as string;
      }
    });

    return formattedErrors;
  }, []);

  return {
    handleApiError,
    formatValidationErrors,
  };
};
