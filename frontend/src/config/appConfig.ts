/**
 * Central application configuration
 * Contains environment-specific settings and feature flags
 */

// API base URL configuration
export const API_BASE_URL = process.env.NODE_ENV === 'production'
    ? 'https://api.learningplatform.com/api/v1'
    : 'http://localhost:8000/api/v1';

// Authentication settings
export const AUTH_CONFIG = {
    tokenStorageKey: 'accessToken',
    refreshTokenStorageKey: 'refreshToken',
    userStorageKey: 'user',
    tokenExpirationKey: 'tokenExpiration',
    tokenRefreshThreshold: 5 * 60 * 1000, // 5 minutes in milliseconds
};

// Feature flags
export const FEATURES = {
    enableQuizzes: true,
    enableProgressTracking: true,
    enableAnalytics: true,
    enableNotifications: false,
};

// Routing configuration
export const ROUTE_CONFIG = {
    defaultRedirect: '/dashboard',
    loginPath: '/login',
    registerPath: '/register',
    dashboardPaths: {
        student: '/dashboard',
        instructor: '/instructor/dashboard',
        admin: '/admin/dashboard',
        guest: '/login',
    },
};

// Application metadata
export const APP_META = {
    name: 'Learning Platform',
    version: '1.0.0',
    description: 'A comprehensive learning management platform',
    supportEmail: 'support@learningplatform.com',
};

// Pagination defaults
export const PAGINATION = {
    defaultPageSize: 10,
    pageSizeOptions: [5, 10, 25, 50],
};

// Timeout settings in milliseconds
export const TIMEOUTS = {
    apiRequest: 30000, // 30 seconds
    sessionIdle: 30 * 60 * 1000, // 30 minutes
    toastNotification: 5000, // 5 seconds
};

export default {
    API_BASE_URL,
    AUTH_CONFIG,
    FEATURES,
    ROUTE_CONFIG,
    APP_META,
    PAGINATION,
    TIMEOUTS,
};
