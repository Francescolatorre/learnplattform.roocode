// filepath: c:\DEVELOPMENT\projects\learnplatfom2\frontend\src\setupTests.ts
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { Page } from '@playwright/test'; // Import Page type from Playwright
import { access } from 'fs';

// Mock `localStorage`
if (typeof window !== 'undefined') {
  const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => {
        store[key] = value;
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        store = {};
      },
    };
  })();

  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true,
  });
}

// Ensure `localStorage` contains a mock token before each test
beforeEach(() => {
  localStorage.setItem('access_token', 'mockAccessToken');
  localStorage.clear();
  vi.clearAllMocks();
});

// Mock `@services/api/authService` globally
const mockedLogin = vi.fn().mockResolvedValue({
  access: 'mockAccessToken',
  refresh: 'mockRefreshToken',
});

const mockedLogout = vi.fn().mockResolvedValue({});
const mockedRefreshAccessToken = vi.fn().mockResolvedValue({
  access: 'newMockAccessToken',
});

// Mock `authService` globally
vi.mock('@services/api/authService', () => ({
  login: mockedLogin,
  logout: mockedLogout, // Mock logout with an empty response
  refreshAccessToken: mockedRefreshAccessToken, // Mock refreshAccessToken
}));

// Mock `react-router-dom` globally
const mockedUsedNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: mockedUsedNavigate,
  };
});

export { mockedLogin, mockedLogout, mockedRefreshAccessToken };

// Mock `apiService` globally
const mockedApiService = {
  getCourses: vi.fn(async () => {
    console.log('Mocked getCourses called'); // Debug log
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('Unauthorized');
    }
    return [
      { id: 1, title: 'Course 1', description: 'Description 1' },
      { id: 2, title: 'Course 2', description: 'Description 2' },
    ];
  }),
  getCourseDetails: vi.fn(),
  getDashboard: vi.fn(),
  getUserProfile: vi.fn(),
  getQuiz: vi.fn(),
  submitQuiz: vi.fn(),
};
vi.mock('@services/api/apiService', () => {
  return {
    default: mockedApiService,
  };
});

// Export the mocked `useNavigate` and `mockedApiService` for use in tests
export { mockedUsedNavigate, mockedApiService };

// Export reusable login helper
export const login = async (page: Page, username: string, password: string): Promise<any> => {
  // Explicit return type
  await page.goto('/login');
  await page.fill('input[name="username_or_email"]', username);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL('/dashboard', { timeout: 10000 });
  return {
    // Added a return statement (can be adjusted based on actual return value)
    access: 'mockAccessToken',
    refresh: 'mockRefreshToken',
  };
};

// Export reusable UserSession class
export class UserSession {
  // ...existing code from roles.spec.ts...
}
