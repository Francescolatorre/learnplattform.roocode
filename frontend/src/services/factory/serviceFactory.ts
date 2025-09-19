/**
 * Service Factory (2025 Best Practices)
 *
 * Implements dependency injection and composition patterns
 * for creating service instances with proper abstraction
 */

import { API_CONFIG } from '../api/apiConfig';
import { ModernApiClient, modernApiClient } from '../api/modernApiClient';

/**
 * Base interface for all services
 */
export interface IBaseService {
  setAuthToken?(token: string): void;
}

/**
 * Service configuration interface
 */
export interface ServiceConfig {
  apiClient?: ModernApiClient;
  endpoints?: typeof API_CONFIG.endpoints;
}

/**
 * Abstract base class providing common service functionality
 * Following 2025 best practices: composition over inheritance
 */
export abstract class BaseService implements IBaseService {
  protected apiClient: ModernApiClient;
  protected endpoints: typeof API_CONFIG.endpoints;

  constructor(config: ServiceConfig = {}) {
    this.apiClient = config.apiClient || modernApiClient;
    this.endpoints = config.endpoints || API_CONFIG.endpoints;
  }

  /**
   * Set authentication token (for testing/manual auth)
   */
  setAuthToken(token: string): void {
    this.apiClient.setAuthToken(token);
  }

  /**
   * Build URL with query parameters
   */
  protected buildUrl(baseUrl: string, params?: Record<string, unknown>): string {
    if (!params || Object.keys(params).length === 0) {
      return baseUrl;
    }

    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, String(value));
      }
    });

    const queryString = queryParams.toString();
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
  }

  /**
   * Handle API response normalization
   * Deals with both array responses and paginated responses
   */
  protected normalizeArrayResponse<T>(response: unknown): T[] {
    if (Array.isArray(response)) {
      return response;
    }

    if (response && typeof response === 'object' && 'results' in response) {
      const results = (response as { results: unknown }).results;
      return Array.isArray(results) ? results : [];
    }

    return [];
  }

  /**
   * Handle paginated response normalization
   */
  protected normalizePaginatedResponse<T>(response: unknown): {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
  } {
    if (Array.isArray(response)) {
      return {
        count: response.length,
        next: null,
        previous: null,
        results: response,
      };
    }

    if (response && typeof response === 'object') {
      const paginatedResponse = response as any;
      return {
        count: paginatedResponse.count || 0,
        next: paginatedResponse.next || null,
        previous: paginatedResponse.previous || null,
        results: Array.isArray(paginatedResponse.results) ? paginatedResponse.results : [],
      };
    }

    return {
      count: 0,
      next: null,
      previous: null,
      results: [],
    };
  }
}

/**
 * Service factory for creating service instances with dependency injection
 */
export class ServiceFactory {
  private static instance: ServiceFactory;
  private services: Map<string, IBaseService> = new Map();

  private constructor(private config: ServiceConfig = {}) {}

  /**
   * Get singleton factory instance
   */
  static getInstance(config?: ServiceConfig): ServiceFactory {
    if (!ServiceFactory.instance) {
      ServiceFactory.instance = new ServiceFactory(config);
    }
    return ServiceFactory.instance;
  }

  /**
   * Create or get service instance
   */
  getService<T extends IBaseService>(
    serviceClass: new (config: ServiceConfig) => T,
    serviceKey?: string
  ): T {
    const key = serviceKey || serviceClass.name;

    if (!this.services.has(key)) {
      const service = new serviceClass(this.config);
      this.services.set(key, service);
    }

    return this.services.get(key) as T;
  }

  /**
   * Set global authentication token for all services
   */
  setGlobalAuthToken(token: string): void {
    this.services.forEach(service => {
      if (service.setAuthToken) {
        service.setAuthToken(token);
      }
    });

    // Also set on the default API client
    if (this.config.apiClient) {
      this.config.apiClient.setAuthToken(token);
    }
  }
}
