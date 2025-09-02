//src/context/auth/authinerceptor.tsx

import { AxiosInstance } from 'axios';
import React, { useEffect } from 'react';

import { AUTH_CONFIG } from '../../config/appConfig';
import axiosInstance from '../../services/api/axiosConfig';

import { useAuth } from './AuthContext';
import { authEventService } from './AuthEventService';
import { AuthEventType } from './types';

// Extend Window interface to include apiClient
declare global {
  interface Window {
    apiClient: AxiosInstance;
  }
}

export interface IAuthInterceptorProps {
  onAuthFailure?: () => void;
  onRefreshToken: () => Promise<string | null>;
  getAccessToken: () => string | null;
}

/**
 * Component that listens for authentication events and provides auth interceptor functionality
 * Works with the centralized axiosInstance that already has interceptors
 */
export const AuthInterceptor: React.FC<IAuthInterceptorProps> = ({
  onAuthFailure,
  onRefreshToken,
  getAccessToken,
}) => {
  const { logout } = useAuth();

  // Subscribe to auth events
  useEffect(() => {
    // Make API client available globally for debugging
    window.apiClient = axiosInstance;

    // Subscribe to auth events to handle authentication failures
    const unsubscribe = authEventService.subscribe(event => {
      if (event.type === AuthEventType.AUTH_ERROR) {
        console.log('AuthInterceptor: Handling auth error event');
        if (onAuthFailure) {
          onAuthFailure();
        } else {
          // Default behavior: logout the user
          logout();
        }
      }
    });

    return () => {
      // Clean up the subscription when the component unmounts
      unsubscribe();
    };
  }, [onAuthFailure, logout]);

  return null;
};

/**
 * Returns the API base URL from environment variables
 */
export const getApiBaseUrl = (): string => {
  // Using Vite's import.meta.env instead of process.env
  return import.meta.env.VITE_API_URL || '/api';
};
