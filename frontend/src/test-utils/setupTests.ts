// src/test-utils/setupTests.ts
import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';
import React from 'react';
import { vi } from 'vitest';
// Axios Mocking (move up before vi.mock)
const mockAxiosInstance = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
  patch: vi.fn(),
  request: vi.fn(),
  interceptors: {
    request: { use: vi.fn(), eject: vi.fn() },
    response: { use: vi.fn(), eject: vi.fn() },
  },
  defaults: {},
};

const mockAxios = {
  create: vi.fn(() => mockAxiosInstance),
  ...mockAxiosInstance,
};

// Log timer state before any test setup
console.log(
  '🧪 [setup] BEFORE vi.useFakeTimers:',
  typeof vi.getMockedSystemTime === 'function' ? vi.getMockedSystemTime() : 'n/a'
);

// Ensure MUI Snackbar/Modal portals render into the test container
configure({ defaultHidden: true });
// Log timer state after all test setup (but before tests)
console.log(
  '🧪 [setup] AFTER setup (no vi.useFakeTimers yet):',
  typeof vi.getMockedSystemTime === 'function' ? vi.getMockedSystemTime() : 'n/a'
);

// Mock for MarkdownRenderer component
vi.mock('@/components/common/MarkdownRenderer', () => ({
  __esModule: true,
  default: vi.fn(({ content }) => {
    return React.createElement('div', {
      className: 'markdown-content',
      'data-testid': 'markdown-content',
      dangerouslySetInnerHTML: { __html: content || '' },
    });
  }),
}));

// Axios mock (now safe, after all variables/imports)
vi.mock('axios', () => {
  // Import here to avoid hoisting issues

  const { AxiosError } = require('axios');
  return {
    __esModule: true,
    default: mockAxios,
    AxiosError,
  };
});

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
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Auth Kontext Mock
const useAuth = vi.fn(() => ({
  user: null,
  isAuthenticated: false,
  isRestoring: false,
  error: null,
  login: vi.fn(),
  logout: vi.fn(),
  register: vi.fn(),
  getUserRole: () => 'guest',
  redirectToDashboard: vi.fn(),
}));

vi.mock('@context/auth/AuthContext', async () => {
  const RealModule = await vi.importActual<any>('@context/auth/AuthContext');
  return {
    __esModule: true,
    ...RealModule,
    AuthContext: React.createContext({}),
    useAuth,
    AuthProvider: function AuthProvider(props: React.PropsWithChildren<{}>) {
      return React.createElement(React.Fragment, null, props.children);
    },
  };
});

// Global mock for useNotification (for tests that do not use NotificationProvider)
vi.mock('@/components/Notifications/useNotification', () => ({
  __esModule: true,
  default: vi.fn(() => {
    const fn = vi.fn() as any;
    fn.success = vi.fn();
    fn.error = vi.fn();
    fn.info = vi.fn();
    fn.warning = vi.fn();
    return fn;
  }),
}));

// Expose mocks for tests
Object.assign(globalThis, { mockAxios, mockAxiosInstance });

console.log('🧪 Unit test setup loaded (axios, notifications, localStorage, auth mocked)');

import 'vitest';
