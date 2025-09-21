import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach, afterEach, Mock } from 'vitest';

import { UserRoleEnum } from '@/types/userTypes';
import { useAuthStore } from '@/store/modernAuthStore';
import { AuthTestBehavior, AuthTestScenarios } from '@/test/behaviors/AuthTestBehavior';
import { TestDataBuilder } from '@/test/builders/TestDataBuilder';
import { ServiceTestUtils } from '@/test/utils/ServiceTestUtils';

import LoginPage from './LoginPage';

// Mock the modern auth store
vi.mock('@/store/modernAuthStore', () => ({
  useAuthStore: vi.fn(),
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock useNotification
const mockNotify = vi.fn();
vi.mock('@/components/Notifications/useNotification', () => ({
  default: () => mockNotify,
}));

const renderWithRouter = () => {
  return render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>
  );
};

describe('LoginPage - Behavior-Driven Authentication Testing', () => {
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

  it('displays login form for user authentication', () => {
    // Configure unauthenticated user scenario
    authBehavior.configureUnauthenticatedUser();
    const mockAuthService = authBehavior.createMockAuthService();

    // Mock auth store with basic functionality
    (useAuthStore as Mock).mockReturnValue({
      login: mockAuthService.authenticateUser,
      getUserRole: mockAuthService.getUserRole,
      user: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,
    });

    renderWithRouter();

    // Verify login form is available for user interaction
    expect(screen.getByRole('heading', { name: 'Login' })).toBeInTheDocument();
    expect(screen.getByLabelText('Username')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByTestId('login-submit-button')).toBeInTheDocument();
  });

  it('prevents submission when user provides incomplete credentials', async () => {
    // Configure unauthenticated user trying to login without credentials
    authBehavior.configureUnauthenticatedUser();
    const mockAuthService = authBehavior.createMockAuthService();

    // Mock auth store with validation behavior
    (useAuthStore as Mock).mockReturnValue({
      login: mockAuthService.authenticateUser,
      getUserRole: mockAuthService.getUserRole,
      user: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,
    });

    renderWithRouter();

    // User attempts to submit empty form
    const submitButton = screen.getByTestId('login-submit-button');
    fireEvent.click(submitButton);

    // System should provide clear feedback about required fields
    await waitFor(() => {
      expect(screen.getByText('Username is required')).toBeInTheDocument();
      expect(screen.getByText('Password is required')).toBeInTheDocument();
    });
  });

  it('attempts authentication when user provides credentials', async () => {
    // Configure authentication behavior for testing
    const mockAuthService = authBehavior.createMockAuthService();
    authBehavior.configureStudentLogin('testuser@university.edu');

    // Mock auth store to use behavior
    (useAuthStore as Mock).mockReturnValue({
      login: mockAuthService.authenticateUser,
      getUserRole: mockAuthService.getUserRole,
      user: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,
    });

    renderWithRouter();

    // User enters credentials and submits
    const usernameInput = screen.getByLabelText('Username');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByTestId('login-submit-button');

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    // Verify authentication was attempted (behavior, not implementation)
    await waitFor(() => {
      expect(authBehavior.wasAuthenticationAttempted()).toBe(true);
    });
  });

  it('shows loading feedback during authentication process', () => {
    // Configure loading state during authentication
    (useAuthStore as Mock).mockReturnValue({
      login: vi.fn(),
      getUserRole: vi.fn().mockReturnValue('student'),
      user: null,
      isLoading: true,
      isAuthenticated: false,
      error: null,
    });

    renderWithRouter();

    // User should see loading indicators and disabled controls
    const submitButton = screen.getByTestId('login-submit-button');
    expect(submitButton).toBeDisabled();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('navigates student to dashboard after successful authentication', async () => {
    // Configure successful student login behavior
    authBehavior.configureStudentLogin('student@university.edu');
    const mockAuthService = authBehavior.createMockAuthService();
    const student = authBehavior.getCurrentUser();

    // Setup post-login navigation behavior
    authBehavior.simulateNavigationTo('/dashboard');

    (useAuthStore as Mock).mockReturnValue({
      login: mockAuthService.authenticateUser,
      getUserRole: mockAuthService.getUserRole,
      user: student,
      isLoading: false,
      isAuthenticated: true,
      error: null,
    });

    renderWithRouter();

    const usernameInput = screen.getByLabelText('Username');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByTestId('login-submit-button');

    fireEvent.change(usernameInput, { target: { value: 'student@university.edu' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    // Verify student navigation behavior occurred
    await waitFor(() => {
      expect(authBehavior.verifyUserNavigatedTo('/dashboard')).toBe(true);
      expect(authBehavior.getCurrentUserRole()).toBe(UserRoleEnum.STUDENT);
    });
  });

  it('navigates instructor to courses dashboard after successful authentication', async () => {
    // Configure successful instructor login behavior
    authBehavior.configureInstructorLogin('instructor@university.edu');
    const mockAuthService = authBehavior.createMockAuthService();
    const instructor = authBehavior.getCurrentUser();

    // Setup instructor navigation behavior
    authBehavior.simulateNavigationTo('/instructor/dashboard');

    (useAuthStore as Mock).mockReturnValue({
      login: mockAuthService.authenticateUser,
      getUserRole: mockAuthService.getUserRole,
      user: instructor,
      isLoading: false,
      isAuthenticated: true,
      error: null,
    });

    renderWithRouter();

    // Instructor performs login
    fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'instructor@university.edu' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password' } });
    fireEvent.click(screen.getByTestId('login-submit-button'));

    // Verify instructor navigation behavior
    await waitFor(() => {
      expect(authBehavior.verifyUserNavigatedTo('/instructor/dashboard')).toBe(true);
      expect(authBehavior.getCurrentUserRole()).toBe(UserRoleEnum.INSTRUCTOR);
    });
  });

  it('provides error feedback when authentication fails', async () => {
    // Configure login failure behavior
    authBehavior.configureLoginFailure('Invalid credentials');
    const mockAuthService = authBehavior.createMockAuthService();

    (useAuthStore as Mock).mockReturnValue({
      login: mockAuthService.authenticateUser,
      getUserRole: mockAuthService.getUserRole,
      user: null,
      isLoading: false,
      isAuthenticated: false,
      error: 'Invalid credentials',
    });

    renderWithRouter();

    // User attempts login with invalid credentials
    const usernameInput = screen.getByLabelText('Username');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByTestId('login-submit-button');

    fireEvent.change(usernameInput, { target: { value: 'wronguser' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(submitButton);

    // Verify error feedback behavior (user-visible outcome)
    await waitFor(() => {
      const authResult = authBehavior.getAuthenticationResult();
      expect(authResult?.success).toBe(false);
      expect(authResult?.message).toBe('Invalid credentials');
      // LoginPage displays errors in Alert component, not notifications
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });

  it('allows form submission when user provides valid input', () => {
    // Configure ready-to-authenticate state
    (useAuthStore as Mock).mockReturnValue({
      login: vi.fn(),
      getUserRole: vi.fn().mockReturnValue('student'),
      user: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,
    });

    renderWithRouter();

    // User fills in form with valid data
    const usernameInput = screen.getByLabelText('Username');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByTestId('login-submit-button');

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    // Form should be ready for submission
    expect(submitButton).toBeEnabled();
  });
});
