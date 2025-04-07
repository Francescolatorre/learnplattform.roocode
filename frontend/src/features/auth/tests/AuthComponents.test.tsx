import {vi} from 'vitest';

// Mock `authService` before importing any dependent modules
vi.mock('@services/auth/authService', () => {
  const mockLogin = vi.fn();
  return {
    ...vi.importActual('@services/auth/authService'),
    login: mockLogin,
  };
});


import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom';
import LoginForm from '../components/LoginForm';
import {AuthProvider} from '../context/AuthContext'; // Use AuthProvider

const renderWithProviders = () => {
  render(
    <AuthProvider>
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>
    </AuthProvider>
  );
};

describe('LoginForm', () => {
  let mockLogin: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockLogin = vi.mocked(require('@services/auth/authService').login);
  });

  it('renders the login form fields correctly', () => {
    renderWithProviders();

    expect(screen.getByTestId('login-username-input')).toBeInTheDocument();
    expect(screen.getByTestId('login-password-input')).toBeInTheDocument();
    expect(screen.getByTestId('login-submit-button')).toBeInTheDocument();
  });

  it('displays an error if login fails', async () => {
    mockLogin.mockRejectedValueOnce(new Error('Invalid credentials'));
    renderWithProviders();

    fireEvent.change(screen.getByTestId('login-username-input'), {target: {value: 'testuser'}});
    fireEvent.change(screen.getByTestId('login-password-input'), {
      target: {value: 'wrongpassword'},
    });
    fireEvent.click(screen.getByTestId('login-submit-button'));

    await waitFor(() =>
      expect(
        screen.getByText(
          (content, element) =>
            content.includes('Login failed. Please try again.') && element?.tagName === 'P'
        )
      ).toBeInTheDocument()
    );
  });

  it('calls login with correct credentials', async () => {
    mockLogin.mockResolvedValueOnce({});
    renderWithProviders();

    fireEvent.change(screen.getByTestId('login-username-input'), {target: {value: 'testuser'}});
    fireEvent.change(screen.getByTestId('login-password-input'), {
      target: {value: 'correctpassword'},
    });
    fireEvent.click(screen.getByTestId('login-submit-button'));

    await waitFor(() => expect(mockLogin).toHaveBeenCalledWith('testuser', 'correctpassword'));
  });

  it('disables the submit button while logging in', async () => {
    renderWithProviders();

    fireEvent.change(screen.getByTestId('login-username-input'), {target: {value: 'testuser'}});
    fireEvent.change(screen.getByTestId('login-password-input'), {
      target: {value: 'correctpassword'},
    });
    fireEvent.click(screen.getByTestId('login-submit-button'));

    expect(screen.getByTestId('login-submit-button')).toBeDisabled();

    await waitFor(() => expect(screen.getByTestId('login-submit-button')).not.toBeDisabled());
  });

  it('navigates to the dashboard on successful login', async () => {
    mockLogin.mockResolvedValueOnce({});
    renderWithProviders();

    fireEvent.change(screen.getByTestId('login-username-input'), {target: {value: 'testuser'}});
    fireEvent.change(screen.getByTestId('login-password-input'), {
      target: {value: 'correctpassword'},
    });
    fireEvent.click(screen.getByTestId('login-submit-button'));

    await waitFor(() => expect(window.location.href).toContain('/dashboard'));
  });
});
