/**
 * Service Integration Utilities for Zustand Stores
 *
 * Provides utilities for integrating modern services with Zustand state management
 * following 2025 best practices for state-service interactions.
 */

import { StateCreator } from 'zustand';
import { IBaseService } from '@/services/factory/serviceFactory';

/**
 * Loading state interface for async operations
 */
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

/**
 * Base state interface that all stores should extend
 */
export interface BaseStoreState extends LoadingState {
  reset: () => void;
}

/**
 * Service-aware store middleware that handles common patterns
 */
export interface ServiceStoreSlice<T> extends BaseStoreState {
  data: T;
  setData: (data: T) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  updateLastUpdated: () => void;
}

/**
 * Creates a service-aware store slice with common loading/error handling
 */
export const createServiceSlice = <T>(
  initialData: T
): StateCreator<ServiceStoreSlice<T>, [], [], ServiceStoreSlice<T>> => (set) => ({
  // Data
  data: initialData,

  // Loading state
  isLoading: false,
  error: null,
  lastUpdated: null,

  // Actions
  setData: (data: T) => set((state) => ({
    ...state,
    data,
    isLoading: false,
    error: null,
    lastUpdated: new Date()
  })),

  setLoading: (isLoading: boolean) => set((state) => ({
    ...state,
    isLoading,
    error: isLoading ? null : state.error // Clear error when starting new operation
  })),

  setError: (error: string | null) => set((state) => ({
    ...state,
    error,
    isLoading: false
  })),

  updateLastUpdated: () => set((state) => ({
    ...state,
    lastUpdated: new Date()
  })),

  reset: () => set(() => ({
    data: initialData,
    isLoading: false,
    error: null,
    lastUpdated: null
  }))
});

/**
 * Generic async operation wrapper for service calls
 */
export const withAsyncOperation = async <T>(
  operation: () => Promise<T>,
  setLoading: (loading: boolean) => void,
  setError: (error: string | null) => void,
  onSuccess?: (result: T) => void
): Promise<T | null> => {
  try {
    setLoading(true);
    setError(null);

    const result = await operation();

    if (onSuccess) {
      onSuccess(result);
    }

    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    setError(errorMessage);
    console.error('Store operation failed:', error);
    return null;
  } finally {
    setLoading(false);
  }
};

/**
 * Service instance manager for stores
 */
export class ServiceManager {
  private static services = new Map<string, IBaseService>();

  /**
   * Register a service instance
   */
  static registerService<T extends IBaseService>(name: string, service: T): void {
    this.services.set(name, service);
  }

  /**
   * Get a registered service instance
   */
  static getService<T extends IBaseService>(name: string): T | null {
    return (this.services.get(name) as T) || null;
  }

  /**
   * Set auth token for all registered services
   */
  static setAuthTokenForAll(token: string): void {
    this.services.forEach(service => {
      if (service.setAuthToken) {
        service.setAuthToken(token);
      }
    });
  }

  /**
   * Clear all registered services
   */
  static clear(): void {
    this.services.clear();
  }
}

/**
 * Cache management utilities
 */
export interface CacheConfig {
  ttl: number; // Time to live in milliseconds
  maxSize?: number; // Maximum cache size
}

export class StoreCache<T> {
  private cache = new Map<string, { data: T; timestamp: number }>();
  private config: CacheConfig;

  constructor(config: CacheConfig) {
    this.config = config;
  }

  /**
   * Get cached data if still valid
   */
  get(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const isExpired = Date.now() - cached.timestamp > this.config.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  /**
   * Set cached data
   */
  set(key: string, data: T): void {
    // Implement max size limit
    if (this.config.maxSize && this.cache.size >= this.config.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Clear cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Check if key is cached and valid
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }
}

/**
 * Typed store hook factory for type-safe service interactions
 */
export type StoreHook<T> = () => T;

/**
 * Error type definitions for consistent error handling
 */
export enum StoreErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export interface StoreError {
  type: StoreErrorType;
  message: string;
  details?: unknown;
}

/**
 * Error classification utility
 */
export const classifyError = (error: unknown): StoreError => {
  if (error instanceof Error) {
    // Check for specific error types based on message or properties
    if (error.message.includes('401') || error.message.includes('unauthorized')) {
      return {
        type: StoreErrorType.AUTHORIZATION_ERROR,
        message: 'Authentication required',
        details: error
      };
    }

    if (error.message.includes('404') || error.message.includes('not found')) {
      return {
        type: StoreErrorType.NOT_FOUND_ERROR,
        message: 'Resource not found',
        details: error
      };
    }

    if (error.message.includes('400') || error.message.includes('validation')) {
      return {
        type: StoreErrorType.VALIDATION_ERROR,
        message: 'Invalid data provided',
        details: error
      };
    }

    if (error.message.includes('network') || error.message.includes('fetch')) {
      return {
        type: StoreErrorType.NETWORK_ERROR,
        message: 'Network connection error',
        details: error
      };
    }
  }

  return {
    type: StoreErrorType.UNKNOWN_ERROR,
    message: error instanceof Error ? error.message : 'An unknown error occurred',
    details: error
  };
};