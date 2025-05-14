// src/test-utils/setupTests.ts
import {vi} from 'vitest';
import '@testing-library/jest-dom'; // Removed for Vitest compatibility
import React from 'react';

// Mock for MarkdownRenderer component
vi.mock('@/components/common/MarkdownRenderer', () => ({
  __esModule: true,
  default: vi.fn(({content}) => {
    return React.createElement('div', {
      className: 'markdown-content',
      'data-testid': 'markdown-content',
      dangerouslySetInnerHTML: {__html: content || ''}
    });
  })
}));

// Axios Mocking
const mockAxiosInstance = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
  patch: vi.fn(),
  request: vi.fn(),
  interceptors: {
    request: {use: vi.fn(), eject: vi.fn()},
    response: {use: vi.fn(), eject: vi.fn()},
  },
  defaults: {},
};

const mockAxios = {
  create: vi.fn(() => mockAxiosInstance),
  ...mockAxiosInstance,
};

vi.mock('axios', () => ({
  __esModule: true,
  default: mockAxios,
}));

// Globale Mocks für LocalStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();
Object.defineProperty(window, 'localStorage', {value: localStorageMock});

// Auth Kontext Mock
vi.mock('@context/auth/AuthContext', () => ({
  useAuth: () => ({
    isAuthenticated: true,
    user: {id: '1', username: 'testuser', role: 'user'},
    login: vi.fn(),
    logout: vi.fn(),
    getUserRole: vi.fn().mockReturnValue('user'), // Diese Funktion fehlte
  }),
}));

// Note: ErrorNotifier mocks have been removed to allow tests to use the actual implementation

// Expose mocks for tests
Object.assign(globalThis, {mockAxios, mockAxiosInstance});

console.log('🧪 Unit test setup loaded (axios mocked, ErrorNotifier using actual implementation)');

import 'vitest';
