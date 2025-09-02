import { AxiosError } from 'axios';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import { authEventService } from '@context/auth/AuthEventService';
import { AuthEventType } from '@context/auth/types';

import { withManagedExceptions, ManagedServiceError, ErrorType } from './errorHandling';
import { logger } from './logger';


// Mock dependencies
vi.mock('./logger', () => ({
  logger: {
    error: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}));

vi.mock('@context/auth/AuthEventService', () => ({
  authEventService: {
    publish: vi.fn(),
  },
}));

describe('errorHandling utility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('withManagedExceptions', () => {
    it('should pass through successful function calls', async () => {
      // Arrange
      const mockFn = vi.fn().mockResolvedValue('success');
      const wrappedFn = withManagedExceptions(mockFn, {
        serviceName: 'TestService',
        methodName: 'testMethod',
      });

      // Act
      const result = await wrappedFn('arg1', 123);

      // Assert
      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledWith('arg1', 123);
      expect(logger.error).not.toHaveBeenCalled();
    });

    it('should handle AxiosError with 404 status as NOT_FOUND', async () => {
      // Arrange
      const axiosError = new AxiosError(
        'Request failed with status code 404',
        'ERR_BAD_REQUEST',
        {
          headers: {} as any,
          method: 'GET',
          url: '/api/resource/123',
        },
        {},
        {
          status: 404,
          statusText: 'Not Found',
          data: { detail: 'Resource not found' },
          headers: {} as any,
          config: {},
        } as any
      );

      const mockFn = vi.fn().mockRejectedValue(axiosError);
      const wrappedFn = withManagedExceptions(mockFn, {
        serviceName: 'TestService',
        methodName: 'testMethod',
      });

      // Act & Assert
      await expect(wrappedFn('arg1')).rejects.toThrow(ManagedServiceError);
      await expect(wrappedFn('arg1')).rejects.toMatchObject({
        type: ErrorType.NOT_FOUND,
        statusCode: 404,
        message: 'Resource not found',
      });

      expect(logger.error).toHaveBeenCalledWith(
        'TestService.testMethod: Resource not found',
        expect.objectContaining({
          errorType: ErrorType.NOT_FOUND,
          status: 404,
        })
      );
    });

    it('should handle AxiosError with 401 status as UNAUTHORIZED and publish auth event', async () => {
      // Arrange
      const axiosError = new AxiosError(
        'Request failed with status code 401',
        'ERR_BAD_REQUEST',
        {
          headers: {} as any,
          method: 'GET',
          url: '/api/resource',
        },
        {},
        {
          status: 401,
          statusText: 'Unauthorized',
          data: { detail: 'Authentication required' },
          headers: {} as any,
          config: {},
        } as any
      );

      const mockFn = vi.fn().mockRejectedValue(axiosError);
      const wrappedFn = withManagedExceptions(mockFn, {
        serviceName: 'TestService',
        methodName: 'testMethod',
      });

      // Act & Assert
      await expect(wrappedFn()).rejects.toThrow(ManagedServiceError);
      await expect(wrappedFn()).rejects.toMatchObject({
        type: ErrorType.UNAUTHORIZED,
        statusCode: 401,
      });

      expect(logger.error).toHaveBeenCalled();
      expect(authEventService.publish).toHaveBeenCalledWith({
        type: AuthEventType.AUTH_ERROR,
        payload: expect.objectContaining({
          error: expect.objectContaining({
            code: 'UNAUTHORIZED',
          }),
        }),
      });
    });

    it('should handle network errors', async () => {
      // Arrange
      const networkError = new AxiosError(
        'Network Error',
        'ERR_NETWORK',
        {
          headers: {} as any,
          method: 'GET',
          url: '/api/resource',
        },
        {},
        undefined
      );

      const mockFn = vi.fn().mockRejectedValue(networkError);
      const wrappedFn = withManagedExceptions(mockFn, {
        serviceName: 'TestService',
        methodName: 'testMethod',
      });

      // Act & Assert
      await expect(wrappedFn()).rejects.toThrow(ManagedServiceError);
      await expect(wrappedFn()).rejects.toMatchObject({
        type: ErrorType.NETWORK_ERROR,
        message: 'Network Error',
      });

      expect(logger.error).toHaveBeenCalled();
    });

    it('should handle generic errors', async () => {
      // Arrange
      const genericError = new Error('Something went wrong');
      const mockFn = vi.fn().mockRejectedValue(genericError);
      const wrappedFn = withManagedExceptions(mockFn, {
        serviceName: 'TestService',
        methodName: 'testMethod',
      });

      // Act & Assert
      await expect(wrappedFn()).rejects.toThrow(ManagedServiceError);
      await expect(wrappedFn()).rejects.toMatchObject({
        type: ErrorType.UNKNOWN,
        message: 'Something went wrong',
      });

      expect(logger.error).toHaveBeenCalled();
    });

    it('should include additional context in logs', async () => {
      // Arrange
      const error = new Error('Test error');
      const mockFn = vi.fn().mockRejectedValue(error);
      const wrappedFn = withManagedExceptions(mockFn, {
        serviceName: 'TestService',
        methodName: 'testMethod',
        context: { userId: '123', operation: 'test' },
      });

      // Act
      try {
        await wrappedFn('arg1', 'arg2');
      } catch (e) {
        // Expected to throw
      }

      // Assert
      expect(logger.error).toHaveBeenCalledWith(
        'TestService.testMethod: Test error',
        expect.objectContaining({
          userId: '123',
          operation: 'test',
          args: expect.any(Array),
        })
      );
    });

    it('should not publish auth events when disabled', async () => {
      // Arrange
      const axiosError = new AxiosError(
        'Request failed with status code 401',
        'ERR_BAD_REQUEST',
        {
          headers: {} as any,
          method: 'GET',
          url: '/api/resource',
        },
        {},
        {
          status: 401,
          statusText: 'Unauthorized',
          data: { detail: 'Authentication required' },
          headers: {} as any,
          config: {},
        } as any
      );

      const mockFn = vi.fn().mockRejectedValue(axiosError);
      const wrappedFn = withManagedExceptions(mockFn, {
        serviceName: 'TestService',
        methodName: 'testMethod',
        publishAuthEvents: false,
      });

      // Act
      try {
        await wrappedFn();
      } catch (e) {
        // Expected to throw
      }

      // Assert
      expect(authEventService.publish).not.toHaveBeenCalled();
    });
  });

  describe('ManagedServiceError', () => {
    it('should create an error with the correct properties', () => {
      // Act
      const error = new ManagedServiceError(
        'Test message',
        ErrorType.VALIDATION,
        400,
        new Error('Original error'),
        { testContext: true }
      );

      // Assert
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ManagedServiceError);
      expect(error.message).toBe('Test message');
      expect(error.type).toBe(ErrorType.VALIDATION);
      expect(error.statusCode).toBe(400);
      expect(error.originalError).toBeInstanceOf(Error);
      expect(error.context).toEqual({ testContext: true });
    });

    it('should use default values when not provided', () => {
      // Act
      const error = new ManagedServiceError('Test message');

      // Assert
      expect(error.type).toBe(ErrorType.UNKNOWN);
      expect(error.statusCode).toBeUndefined();
      expect(error.originalError).toBeUndefined();
      expect(error.context).toBeUndefined();
    });
  });
});
