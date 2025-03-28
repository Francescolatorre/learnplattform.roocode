import React, { useState, useEffect } from 'react';
import { TextField, Button, Container, Typography, Box, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import ErrorMessage from '@components/ErrorMessage';

const LoginForm: React.FC = () => {
  const { login } = useAuth();
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Clear error when username or password changes
  useEffect(() => {
    if (error) {
      setError(null);
    }
  }, [usernameOrEmail, password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login(usernameOrEmail, password);
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError('Login failed. Please check your credentials and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5">
          Sign in
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Username or Email"
            name="username_or_email"
            autoComplete="username"
            autoFocus
            value={usernameOrEmail}
            onChange={e => setUsernameOrEmail(e.target.value)}
            error={!!error}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            error={!!error}
          />
          {error && (
            <ErrorMessage
              message={error}
              title="Login Failed"
              severity="error"
              onClose={() => setError(null)}
            />
          )}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress size={24} /> : 'Sign In'}
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default LoginForm;
