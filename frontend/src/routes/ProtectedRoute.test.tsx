/**
 * ProtectedRoute.test.tsx - Behavior-Driven Route Protection Testing
 *
 * Tests route protection behaviors focusing on user access control outcomes
 * and navigation behaviors rather than implementation details.
 *
 * Uses AuthTestBehavior for consistent authentication testing patterns.
 */

import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi, Mock, describe, it, expect, beforeEach, afterEach } from 'vitest';

import { NotificationProvider } from '@/components/Notifications/NotificationProvider';
import { useAuthStore } from '@/store/modernAuthStore';
import { AuthTestBehavior } from '@/test/behaviors/AuthTestBehavior';
import { ServiceTestUtils } from '@/test/utils/ServiceTestUtils';
import { UserRoleEnum } from '@/types/userTypes';

import ProtectedRoute from './ProtectedRoute';

// Mock the modern auth store
vi.mock('@/store/modernAuthStore', () => ({
  useAuthStore: vi.fn(),
}));

describe('ProtectedRoute - Behavior-Driven Access Control Testing', () => {
  let authBehavior: AuthTestBehavior;

  beforeEach(() => {
    vi.clearAllMocks();
    ServiceTestUtils.initialize();
    authBehavior = new AuthTestBehavior();
  });

  afterEach(() => {
    ServiceTestUtils.cleanup();
    authBehavior.reset();
  });

  const renderProtectedContent = (initialRoute = '/dashboard') => {
    return render(
      <NotificationProvider>
        <MemoryRouter initialEntries={[initialRoute]}>
          <Routes>
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <div data-testid="dashboard-content">Protected Dashboard Content</div>
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<div data-testid="login-page">Login Page</div>} />
          </Routes>
        </MemoryRouter>
      </NotificationProvider>
    );
  };

  it('shows loading state while authentication is being restored', () => {
    // Configure authentication restoration in progress
    (useAuthStore as Mock).mockReturnValue({
      isAuthenticated: false,
      isRestoring: true,
      user: null,
      getUserRole: vi.fn().mockReturnValue(UserRoleEnum.GUEST),
    });

    renderProtectedContent();

    // User should see loading state during authentication restoration
    expect(screen.getByTestId('protected-route-loading')).toBeInTheDocument();
    expect(screen.queryByTestId('dashboard-content')).not.toBeInTheDocument();
    expect(screen.queryByTestId('login-page')).not.toBeInTheDocument();
  });

  it('grants access to authenticated users after restoration completes', async () => {
    // Configure successful authentication restoration for student
    authBehavior.configureStudentLogin('student@university.edu');
    const authenticatedUser = authBehavior.getCurrentUser();

    (useAuthStore as Mock).mockReturnValue({
      isAuthenticated: true,
      isRestoring: false,
      user: authenticatedUser,
      getUserRole: vi.fn().mockReturnValue('student'),
    });

    renderProtectedContent();

    // Authenticated user should access protected content
    expect(screen.getByTestId('dashboard-content')).toBeInTheDocument();
    expect(screen.queryByTestId('login-page')).not.toBeInTheDocument();
  });

  it('redirects unauthenticated users to login after restoration completes', async () => {
    // Configure unauthenticated user scenario
    authBehavior.configureUnauthenticatedUser();

    (useAuthStore as Mock).mockReturnValue({
      isAuthenticated: false,
      isRestoring: false,
      user: null,
      getUserRole: vi.fn().mockReturnValue(UserRoleEnum.GUEST),
    });

    renderProtectedContent();

    // Unauthenticated user should be redirected to login
    await waitFor(() => expect(screen.getByTestId('login-page')).toBeInTheDocument());
    expect(screen.queryByTestId('dashboard-content')).not.toBeInTheDocument();
  });

  it('maintains loading state when authentication restoration is incomplete', () => {
    // Configure incomplete authentication restoration
    (useAuthStore as Mock).mockReturnValue({
      isAuthenticated: false,
      isRestoring: true,
      user: null,
      getUserRole: vi.fn().mockReturnValue(UserRoleEnum.GUEST),
    });

    renderProtectedContent();

    // System should maintain loading state until restoration completes
    expect(screen.getByTestId('protected-route-loading')).toBeInTheDocument();
    expect(screen.queryByTestId('dashboard-content')).not.toBeInTheDocument();
    expect(screen.queryByTestId('login-page')).not.toBeInTheDocument();
  });

  it('transitions from loading to authenticated access when restoration succeeds', async () => {
    // Configure authentication restoration process
    authBehavior.configureStudentLogin('student@university.edu');
    const student = authBehavior.getCurrentUser();

    // Start with restoration in progress
    (useAuthStore as Mock).mockReturnValue({
      isAuthenticated: false,
      isRestoring: true,
      user: null,
      getUserRole: vi.fn().mockReturnValue(UserRoleEnum.GUEST),
    });

    const { rerender } = renderProtectedContent();

    // Verify loading state initially
    expect(screen.getByTestId('protected-route-loading')).toBeInTheDocument();

    // Simulate successful authentication restoration
    (useAuthStore as Mock).mockReturnValue({
      isAuthenticated: true,
      isRestoring: false,
      user: student,
      getUserRole: vi.fn().mockReturnValue(UserRoleEnum.STUDENT),
    });

    // Re-render to trigger authentication completion
    rerender(
      <NotificationProvider>
        <MemoryRouter initialEntries={['/dashboard']}>
          <Routes>
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <div data-testid="dashboard-content">Protected Dashboard Content</div>
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<div data-testid="login-page">Login Page</div>} />
          </Routes>
        </MemoryRouter>
      </NotificationProvider>
    );

    // User should now have access to protected content
    await waitFor(() => expect(screen.getByTestId('dashboard-content')).toBeInTheDocument());

    // Verify authentication behavior occurred
    expect(authBehavior.isUserAuthenticated()).toBe(true);
    expect(authBehavior.getCurrentUserRole()).toBe(UserRoleEnum.STUDENT);
  });
});
