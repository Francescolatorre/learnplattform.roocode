import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { AuthProvider, useAuth } from '../context/AuthContext';

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

  it('should log in successfully', async () => {});
});
