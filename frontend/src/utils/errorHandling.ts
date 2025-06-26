import {AxiosError} from 'axios';
import {logger} from './logger';
import {authEventService} from '@context/auth/AuthEventService';
import {AuthEventType} from '@context/auth/types';

/**
 * Error types that can be handled by the managed exception handler
 */
export enum ErrorType {
    NOT_FOUND = 'NOT_FOUND',
    UNAUTHORIZED = 'UNAUTHORIZED',
    FORBIDDEN = 'FORBIDDEN',
    VALIDATION = 'VALIDATION',
    SERVER_ERROR = 'SERVER_ERROR',
    NETWORK_ERROR = 'NETWORK_ERROR',
    UNKNOWN = 'UNKNOWN',
}

/**
 * Custom error class for managed exceptions in the service layer
 */
export class ManagedServiceError extends Error {
    readonly type: ErrorType;
    readonly statusCode?: number;
    readonly originalError?: Error;
    readonly context?: Record<string, unknown>;

    constructor(
        message: string,
        type: ErrorType = ErrorType.UNKNOWN,
        statusCode?: number,
        originalError?: Error,
        context?: Record<string, unknown>
    ) {
        super(message);
        this.name = 'ManagedServiceError';
        this.type = type;
        this.statusCode = statusCode;
        this.originalError = originalError;
        this.context = context;

        // Ensure proper prototype chain for instanceof checks
        Object.setPrototypeOf(this, ManagedServiceError.prototype);
    }
}

/**
 * Options for the managed exception handler
 */
export interface IManagedExceptionOptions {
    /** Service name for logging context */
    serviceName: string;
    /** Method name for logging context */
    methodName: string;
    /** Additional context information to include in logs */
    context?: Record<string, unknown>;
    /** Whether to publish auth events for certain error types */
    publishAuthEvents?: boolean;
}

/**
 * Determines the error type based on the error object
 * @param error The error to analyze
 * @returns The appropriate ErrorType
 */
function determineErrorType(error: unknown): ErrorType {
    if (error instanceof AxiosError) {
        const status = error.response?.status;

        if (status === 404) return ErrorType.NOT_FOUND;
        if (status === 401) return ErrorType.UNAUTHORIZED;
        if (status === 403) return ErrorType.FORBIDDEN;
        if (status && status >= 400 && status < 500) return ErrorType.VALIDATION;
        if (status && status >= 500) return ErrorType.SERVER_ERROR;
        if (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK') return ErrorType.NETWORK_ERROR;
    }

    return ErrorType.UNKNOWN;
}

/**
 * Creates a user-friendly error message based on the error type and original error
 * @param error The original error
 * @param errorType The determined error type
 * @returns A user-friendly error message
 */
function createUserFriendlyMessage(error: unknown, errorType: ErrorType): string {
    if (error instanceof AxiosError) {
        // Try to extract message from response data if available
        const responseData = error.response?.data;
        if (responseData) {
            if (typeof responseData === 'string') return responseData;
            if (responseData.message) return responseData.message;
            if (responseData.detail) return responseData.detail;
            if (responseData.error) return responseData.error;
        }

        // Use status text if available
        if (error.response?.statusText) {
            return error.response.statusText;
        }
    }
    // If it's a custom error (not AxiosError), use its message directly
    if (error instanceof Error) {
        return error.message;
    }
    // Default messages based on error type
    switch (errorType) {
        case ErrorType.NOT_FOUND:
            return 'The requested resource was not found.';
        case ErrorType.UNAUTHORIZED:
            return 'Authentication required. Please log in and try again.';
        case ErrorType.FORBIDDEN:
            return 'You do not have permission to perform this action.';
        case ErrorType.VALIDATION:
            return 'The request contains invalid data.';
        case ErrorType.SERVER_ERROR:
            return 'An unexpected server error occurred. Please try again later.';
        case ErrorType.NETWORK_ERROR:
            return 'Network error. Please check your connection and try again.';
        default:
            return 'An unexpected error occurred.';
    }
}

/**
 * Extracts context information from an error object
 * @param error The error to extract context from
 * @returns Context information as a record
 */
function extractErrorContext(error: unknown): Record<string, unknown> {
    const context: Record<string, unknown> = {};

    if (error instanceof AxiosError) {
        if (error.config) {
            context.url = error.config.url;
            context.method = error.config.method;
        }

        if (error.response) {
            context.status = error.response.status;
            context.statusText = error.response.statusText;

            // Include response data but filter out sensitive information
            const safeResponseData = {...error.response.data};
            if (safeResponseData.password) safeResponseData.password = '[REDACTED]';
            if (safeResponseData.token) safeResponseData.token = '[REDACTED]';
            context.responseData = safeResponseData;
        }

        if (error.code) {
            context.errorCode = error.code;
        }
    }

    return context;
}

/**
 * Managed exception handler for service layer
 * Logs structured error messages and returns custom exceptions with context
 *
 * @param fn The async function to execute with managed exception handling
 * @param options Configuration options for the handler
 * @returns A function that executes the original function with managed exception handling
 */
export function withManagedExceptions<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    options: IManagedExceptionOptions
): T {
    return (async (...args: Parameters<T>): Promise<ReturnType<T>> => {
        const {serviceName, methodName, context = {}, publishAuthEvents = true} = options;

        try {
            return await fn(...args);
        } catch (error: unknown) {
            // Determine error type
            const errorType = determineErrorType(error);

            // Create user-friendly message
            const userMessage = createUserFriendlyMessage(error, errorType);

            // Extract context from error
            const errorContext = {
                ...extractErrorContext(error),
                ...context,
                args: args.map(arg =>
                    // Don't log full objects, just their types and some identifying info
                    typeof arg === 'object' && arg !== null
                        ? {type: arg.constructor?.name || typeof arg, id: arg.id || arg.ID || '[no id]'}
                        : arg
                ),
            };

            // Log structured error message
            const logMessage = `${serviceName}.${methodName}: ${userMessage}`;
            logger.error(logMessage, {errorType, ...errorContext});

            // Publish auth events for certain error types if enabled
            if (publishAuthEvents) {
                if (errorType === ErrorType.UNAUTHORIZED) {
                    authEventService.publish({
                        type: AuthEventType.AUTH_ERROR,
                        payload: {
                            message: userMessage,
                            error: {
                                message: userMessage,
                                code: 'UNAUTHORIZED',
                            },
                        },
                    });
                } else if (errorType === ErrorType.FORBIDDEN) {
                    authEventService.publish({
                        type: AuthEventType.AUTH_ERROR,
                        payload: {
                            message: userMessage,
                            error: {
                                message: userMessage,
                                code: 'FORBIDDEN',
                            },
                        },
                    });
                }
            }

            // Get status code if available
            let statusCode: number | undefined;
            if (error instanceof AxiosError && error.response?.status) {
                statusCode = error.response.status;
            }

            // Throw managed exception
            throw new ManagedServiceError(
                userMessage,
                errorType,
                statusCode,
                error instanceof Error ? error : new Error(String(error)),
                errorContext
            );
        }
    }) as T;
}
