import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach, Mock } from 'vitest';

import { IUser, UserRoleEnum } from '@/types/userTypes';
import { useAuthStore } from '@/store/modernAuthStore';
import { IRegistrationData } from '@/services/auth/modernAuthService';

import RegisterFormPage from './RegisterFormPage';

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

// Mock PasswordStrengthIndicator
vi.mock('@components/shared/PasswordStrengthIndicator', () => ({
  default: ({ score, feedback }: { score: number; feedback: string[] }) => (
    <div data-testid="password-strength-indicator">
      Score: {score}, Feedback: {feedback.join(', ')}
    </div>
  ),
}));

// Mock password validation
vi.mock('../utils/passwordValidation', () => ({
  validatePassword: vi.fn((password: string) => ({
    isValid: password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /\d/.test(password),
    score: password.length >= 8 ? 4 : 2,
    feedback: password.length < 8 ? ['Password must be at least 8 characters long'] : [],
  })),
}));

const mockUser: IUser = {
  id: 1,
  username: 'newuser',
  email: 'newuser@example.com',
  role: UserRoleEnum.STUDENT,
  first_name: 'New',
  last_name: 'User',
  is_active: true,
  date_joined: '2025-01-01T00:00:00Z',
};

const renderWithRouter = () => {
  return render(
    <MemoryRouter>
      <RegisterFormPage />
    </MemoryRouter>
  );
};

describe('RegisterFormPage', () => {
  const mockRegister = vi.fn();
  const mockAuthStore = {
    register: mockRegister,
    user: null,
    isLoading: false,
    isAuthenticated: false,
    error: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuthStore as Mock).mockReturnValue(mockAuthStore);
  });

  it('renders registration form correctly', () => {
    renderWithRouter();

    expect(screen.getByRole('heading', { name: 'Register' })).toBeInTheDocument();
    expect(screen.getByTestId('register-username-input')).toBeInTheDocument();
    expect(screen.getByTestId('register-email-input')).toBeInTheDocument();
    expect(screen.getByTestId('register-password-input')).toBeInTheDocument();
    expect(screen.getByTestId('register-confirm-password-input')).toBeInTheDocument();
    expect(screen.getByTestId('register-submit-button')).toBeInTheDocument();
  });

  it('shows password strength indicator when password is entered', async () => {
    renderWithRouter();

    const passwordInput = screen.getByTestId('register-password-input');
    fireEvent.change(passwordInput, { target: { value: 'TestPass123' } });

    await waitFor(() => {
      expect(screen.getByTestId('password-strength-indicator')).toBeInTheDocument();
    });
  });

  it('shows error when passwords do not match', async () => {
    renderWithRouter();

    const usernameInput = screen.getByTestId('register-username-input');
    const emailInput = screen.getByTestId('register-email-input');
    const passwordInput = screen.getByTestId('register-password-input');
    const confirmPasswordInput = screen.getByTestId('register-confirm-password-input');
    const submitButton = screen.getByTestId('register-submit-button');

    // Fill form with mismatched passwords
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'StrongPass123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'DifferentPass123' } });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    });

    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('calls register with correct data for student role', async () => {
    renderWithRouter();

    const usernameInput = screen.getByTestId('register-username-input');
    const emailInput = screen.getByTestId('register-email-input');
    const passwordInput = screen.getByTestId('register-password-input');
    const confirmPasswordInput = screen.getByTestId('register-confirm-password-input');
    const submitButton = screen.getByTestId('register-submit-button');

    // Fill form completely
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'StrongPass123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'StrongPass123' } });

    fireEvent.click(submitButton);

    const expectedData: IRegistrationData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'StrongPass123',
      password2: 'StrongPass123',
      role: 'student',
    };

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith(expectedData);
    });
  });

  it('shows loading state during registration', () => {
    (useAuthStore as Mock).mockReturnValue({
      ...mockAuthStore,
      isLoading: true,
    });

    renderWithRouter();

    const submitButton = screen.getByTestId('register-submit-button');
    expect(submitButton).toBeDisabled();
    expect(screen.getByText('Registering...')).toBeInTheDocument();
  });

  it('handles registration errors correctly', async () => {
    const errorMessage = 'Username already exists';
    const mockFailedRegister = vi.fn().mockRejectedValue(new Error(errorMessage));

    (useAuthStore as Mock).mockReturnValue({
      ...mockAuthStore,
      register: mockFailedRegister,
    });

    renderWithRouter();

    const usernameInput = screen.getByTestId('register-username-input');
    const emailInput = screen.getByTestId('register-email-input');
    const passwordInput = screen.getByTestId('register-password-input');
    const confirmPasswordInput = screen.getByTestId('register-confirm-password-input');
    const submitButton = screen.getByTestId('register-submit-button');

    // Fill and submit form
    fireEvent.change(usernameInput, { target: { value: 'existinguser' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'StrongPass123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'StrongPass123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    expect(mockNavigate).not.toHaveBeenCalled();
  });
});