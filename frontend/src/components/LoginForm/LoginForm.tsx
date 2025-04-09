import { TextField, Button, Typography, Box } from '@mui/material';
import React, { useState } from 'react';

import authService from '@services/auth/authService';

export const redirectToDashboard = () => {
  window.location.href = '/dashboard'; // Extracted for easier mocking in tests
};

const LoginForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false); // Add loading state

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true); // Set loading state to true
    try {
      await authService.login(username, password); // Ensure this is called
      redirectToDashboard();
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Login failed. Please try again.';
      setError(errorMessage);
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 500); // 500ms delay
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 400, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Login
      </Typography>
      {error && (
        <Typography color="error" gutterBottom>
          {error}
        </Typography>
      )}
      <TextField
        label="Username or Email"
        value={username}
        onChange={e => setUsername(e.target.value)}
        fullWidth
        margin="normal"
        required
        inputProps={{ 'data-testid': 'login-username-input' }}
        disabled={isLoading} // Disable input while loading
      />
      <TextField
        label="Password"
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        fullWidth
        margin="normal"
        required
        inputProps={{ 'data-testid': 'login-password-input' }}
        disabled={isLoading} // Disable input while loading
      />
      <Button
        type="submit"
        variant="contained"
        color="primary"
        fullWidth
        sx={{ mt: 2 }}
        data-testid="login-submit-button"
        disabled={isLoading} // Disable button while loading
      >
        {isLoading ? 'Logging in...' : 'Login'}
      </Button>
    </Box>
  );
};

export default LoginForm;
