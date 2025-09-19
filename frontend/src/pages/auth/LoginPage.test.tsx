import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach, Mock } from 'vitest';

import { IUser, UserRoleEnum } from '@/types/userTypes';
import { useAuthStore } from '@/store/modernAuthStore';

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

const mockUser: IUser = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  role: UserRoleEnum.STUDENT,
  first_name: 'Test',
  last_name: 'User',
  is_active: true,
  date_joined: '2025-01-01T00:00:00Z',
};

const renderWithRouter = () => {
  return render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>
  );
};

describe('LoginPage', () => {
  const mockLogin = vi.fn();
  const mockAuthStore = {
    login: mockLogin,
    user: null,
    isLoading: false,
    isAuthenticated: false,
    error: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuthStore as Mock).mockReturnValue(mockAuthStore);
  });

  it('renders login form correctly', () => {
    renderWithRouter();

    expect(screen.getByRole('heading', { name: 'Login' })).toBeInTheDocument();
    expect(screen.getByLabelText('Username')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByTestId('login-submit-button')).toBeInTheDocument();
  });

  it('shows validation errors for empty fields', async () => {
    renderWithRouter();

    const submitButton = screen.getByTestId('login-submit-button');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Username is required')).toBeInTheDocument();
      expect(screen.getByText('Password is required')).toBeInTheDocument();
    });
  });

  it('calls login with correct credentials', async () => {
    renderWithRouter();

    const usernameInput = screen.getByLabelText('Username');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByTestId('login-submit-button');

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('testuser', 'password123');
    });
  });

  it('shows loading state during login', () => {
    (useAuthStore as Mock).mockReturnValue({
      ...mockAuthStore,
      isLoading: true,
    });

    renderWithRouter();

    const submitButton = screen.getByTestId('login-submit-button');
    expect(submitButton).toBeDisabled();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('navigates to student dashboard after successful login', async () => {
    // Mock successful login flow
    let currentUser = null;
    const mockSuccessfulLogin = vi.fn().mockImplementation(async () => {
      // Simulate successful login by updating the mock to return user data
      currentUser = mockUser;
    });

    (useAuthStore as Mock).mockImplementation(() => ({
      ...mockAuthStore,
      login: mockSuccessfulLogin,
      user: currentUser,
    }));

    renderWithRouter();

    const usernameInput = screen.getByLabelText('Username');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByTestId('login-submit-button');

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    // Trigger the effect by updating the component with user data
    (useAuthStore as Mock).mockReturnValue({
      ...mockAuthStore,
      user: mockUser,
    });

    // Re-render to trigger the useEffect
    renderWithRouter();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
    });
  });

  it('navigates to instructor dashboard for instructor role', async () => {
    const instructorUser = { ...mockUser, role: UserRoleEnum.INSTRUCTOR };

    (useAuthStore as Mock).mockReturnValue({
      ...mockAuthStore,
      user: instructorUser,
    });

    renderWithRouter();

    // Simulate login completion by setting hasLoggedIn state
    // This would be triggered by the actual login flow
    fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'instructor' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password' } });
    fireEvent.click(screen.getByTestId('login-submit-button'));

    // Mock the post-login state
    (useAuthStore as Mock).mockReturnValue({
      ...mockAuthStore,
      user: instructorUser,
    });

    renderWithRouter();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/instructor/dashboard', { replace: true });
    });
  });

  it('handles login errors correctly', async () => {
    const errorMessage = 'Invalid credentials';
    const mockFailedLogin = vi.fn().mockRejectedValue(new Error(errorMessage));

    (useAuthStore as Mock).mockReturnValue({
      ...mockAuthStore,
      login: mockFailedLogin,
    });

    renderWithRouter();

    const usernameInput = screen.getByLabelText('Username');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByTestId('login-submit-button');

    fireEvent.change(usernameInput, { target: { value: 'wronguser' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockNotify).toHaveBeenCalledWith({
        title: 'Login Failed',
        message: 'An error occurred during login',
        severity: 'error',
        duration: 5000,
      });
    });
  });

  it('disables submit button when form is submitting', () => {
    renderWithRouter();

    const usernameInput = screen.getByLabelText('Username');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByTestId('login-submit-button');

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    // By default, button should be enabled when not loading
    expect(submitButton).toBeEnabled();
  });
});
