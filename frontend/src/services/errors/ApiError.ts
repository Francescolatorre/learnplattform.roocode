/**
 * API Error Classes
 *
 * Standardized error handling for API requests.
 * Provides user-friendly error messages and field-level validation errors.
 */

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]> | { detail: string };
  };
}

/**
 * Custom API Error class with enhanced functionality
 */
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code: string,
    public details?: Record<string, string[]> | { detail: string }
  ) {
    super(message);
    this.name = 'ApiError';
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  /**
   * Create ApiError from error response
   */
  static fromResponse(statusCode: number, data: ApiErrorResponse): ApiError {
    return new ApiError(
      statusCode,
      data.error.message,
      data.error.code,
      data.error.details
    );
  }

  /**
   * Create ApiError from unknown error
   */
  static fromUnknown(error: unknown): ApiError {
    if (error instanceof ApiError) {
      return error;
    }

    if (error instanceof Error) {
      return new ApiError(500, error.message, 'unknown_error');
    }

    return new ApiError(500, 'An unknown error occurred', 'unknown_error');
  }

  /**
   * Get user-friendly error message based on status code
   */
  getUserMessage(): string {
    // Use backend message if available and not too technical
    if (this.message && !this.message.includes('database') && !this.message.includes('server')) {
      return this.message;
    }

    // Fallback to generic messages based on status code
    switch (this.statusCode) {
      case 400:
        return 'Invalid request. Please check your input and try again.';
      case 401:
        return 'Please log in to continue.';
      case 403:
        return "You don't have permission to perform this action.";
      case 404:
        return 'The requested resource was not found.';
      case 409:
        return 'This action conflicts with existing data.';
      case 422:
        return 'The data you provided is invalid.';
      case 429:
        return 'Too many requests. Please try again later.';
      case 500:
        return 'Server error. Please try again later.';
      case 502:
      case 503:
        return 'Service temporarily unavailable. Please try again later.';
      case 504:
        return 'Request timed out. Please try again.';
      default:
        return this.message || 'An unexpected error occurred.';
    }
  }

  /**
   * Get field-specific errors for forms
   * Returns a map of field names to error messages
   */
  getFieldErrors(): Record<string, string> {
    if (!this.details || 'detail' in this.details) {
      return {};
    }

    return Object.entries(this.details).reduce((acc, [field, errors]) => {
      // Take first error for each field
      acc[field] = Array.isArray(errors) ? errors[0] : String(errors);
      return acc;
    }, {} as Record<string, string>);
  }

  /**
   * Check if this is a network error
   */
  isNetworkError(): boolean {
    return this.code === 'network_error' || this.statusCode === 0;
  }

  /**
   * Check if this is a validation error
   */
  isValidationError(): boolean {
    return (
      this.code === 'validation_error' ||
      this.statusCode === 400 ||
      this.statusCode === 422
    );
  }

  /**
   * Check if this is an authentication error
   */
  isAuthError(): boolean {
    return this.statusCode === 401;
  }

  /**
   * Check if this is an authorization error
   */
  isPermissionError(): boolean {
    return this.statusCode === 403;
  }

  /**
   * Check if this is a server error
   */
  isServerError(): boolean {
    return this.statusCode >= 500;
  }

  /**
   * Convert to JSON for logging
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      statusCode: this.statusCode,
      code: this.code,
      message: this.message,
      details: this.details,
    };
  }
}

/**
 * Network Error - when request fails to reach server
 */
export class NetworkError extends ApiError {
  constructor(message = 'Network error. Please check your connection.') {
    super(0, message, 'network_error');
    this.name = 'NetworkError';
  }
}

/**
 * Authentication Error - when user is not authenticated
 */
export class AuthenticationError extends ApiError {
  constructor(message = 'Authentication required. Please log in.') {
    super(401, message, 'authentication_error');
    this.name = 'AuthenticationError';
  }
}

/**
 * Authorization Error - when user lacks permissions
 */
export class AuthorizationError extends ApiError {
  constructor(message = 'You do not have permission to perform this action.') {
    super(403, message, 'authorization_error');
    this.name = 'AuthorizationError';
  }
}

/**
 * Validation Error - when data validation fails
 */
export class ValidationError extends ApiError {
  constructor(
    message = 'Validation failed.',
    details?: Record<string, string[]>
  ) {
    super(400, message, 'validation_error', details);
    this.name = 'ValidationError';
  }
}

/**
 * Not Found Error - when resource doesn't exist
 */
export class NotFoundError extends ApiError {
  constructor(message = 'Resource not found.') {
    super(404, message, 'not_found_error');
    this.name = 'NotFoundError';
  }
}

/**
 * Server Error - when server encounters an error
 */
export class ServerError extends ApiError {
  constructor(message = 'Server error. Please try again later.') {
    super(500, message, 'server_error');
    this.name = 'ServerError';
  }
}
