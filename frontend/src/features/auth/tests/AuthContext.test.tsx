import React from 'react';
import { render, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { AuthProvider, useAuth } from '../context/AuthContext';
import authService from '../../../services/api/apiService';

const TestAuthComponent: React.FC = () => {
  const { user, isAuthenticated, login, logout, refreshToken } = useAuth();

  return (
    <div>
      <p>User: {user ? user.username : 'None'}</p>
      <p>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
      <button onClick={() => login('testuser', 'password')}>Login</button>
      <button onClick={logout}>Logout</button>
      <button onClick={refreshToken}>Refresh Token</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should initialize as unauthenticated', () => {
    const { getByText } = render(
      <AuthProvider>
        <TestAuthComponent />
      </AuthProvider>
    );

    expect(getByText('User: None')).toBeInTheDocument();
    expect(getByText('Authenticated: No')).toBeInTheDocument();
  });

  it('should log in successfully', async () => {
    (authService.login as vi.Mock).mockResolvedValue({
      access: 'mockAccessToken',
      refresh: 'mockRefreshToken',
    });

    (authService.get as vi.Mock).mockResolvedValue({
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      role: 'user',
    });

    const { getByText, getByRole } = render(
      <AuthProvider>
        <TestAuthComponent />
      </AuthProvider>
    );

    await act(async () => {
      getByRole('button', { name: /login/i }).click();
    });

    expect(localStorage.getItem('authToken')).toBe('mockAccessToken');
    expect(localStorage.getItem('refreshToken')).toBe('mockRefreshToken');
    expect(getByText('User: testuser')).toBeInTheDocument();
    expect(getByText('Authenticated: Yes')).toBeInTheDocument();
  });

  it('should handle login failure', async () => {
    (authService.login as vi.Mock).mockRejectedValue(new Error('Invalid credentials'));

    const { getByRole } = render(
      <AuthProvider>
        <TestAuthComponent />
      </AuthProvider>
    );

    await act(async () => {
      getByRole('button', { name: /login/i }).click();
    });

    expect(localStorage.getItem('authToken')).toBeNull();
    expect(localStorage.getItem('refreshToken')).toBeNull();
  });

  it('should log out successfully', async () => {
    const { getByText, getByRole } = render(
      <AuthProvider>
        <TestAuthComponent />
      </AuthProvider>
    );

    await act(async () => {
      getByRole('button', { name: /logout/i }).click();
    });

    expect(localStorage.getItem('authToken')).toBeNull();
    expect(localStorage.getItem('refreshToken')).toBeNull();
    expect(getByText('User: None')).toBeInTheDocument();
    expect(getByText('Authenticated: No')).toBeInTheDocument();
  });

  it('should refresh token successfully', async () => {
    localStorage.setItem('refreshToken', 'mockRefreshToken');

    (authService.refreshAccessToken as vi.Mock).mockResolvedValue({
      access: 'newMockAccessToken',
    });

    (authService.get as vi.Mock).mockResolvedValue({
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      role: 'user',
    });

    const { getByText, getByRole } = render(
      <AuthProvider>
        <TestAuthComponent />
      </AuthProvider>
    );

    await act(async () => {
      getByRole('button', { name: /refresh token/i }).click();
    });

    expect(localStorage.getItem('authToken')).toBe('newMockAccessToken');
    expect(getByText('User: testuser')).toBeInTheDocument();
    expect(getByText('Authenticated: Yes')).toBeInTheDocument();
  });
});
