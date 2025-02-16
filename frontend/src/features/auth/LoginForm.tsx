import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Container, 
  Paper,
  Link,
  Alert,
  CircularProgress
} from '@mui/material';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import { AxiosError } from 'axios';
import { useAuth } from './AuthContext';

interface LocationState {
  message?: string;
}

interface LoginFormProps {
  onLoginSuccess?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login: authLogin } = useAuth();

  // Get success message from navigation state (e.g., after password reset)
  const state = location.state as LocationState;
  const [successMessage, setSuccessMessage] = useState(state?.message || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    setSuccessMessage('');

    try {
      await authLogin(username, password);
      
      // Optional callback for parent component
      onLoginSuccess?.();
      
      // Navigate to dashboard or home
      navigate('/dashboard');
    } catch (err: unknown) {
      if (err instanceof Error) {
        const axiosError = err as AxiosError;
        const errorMessage = axiosError.response?.data 
          ? (axiosError.response.data as { detail?: string }).detail || 'Login failed'
          : 'Login failed. Please try again.';
        setError(errorMessage);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="xs">
      <Paper elevation={3} sx={{ padding: 3, marginTop: 8 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Login
        </Typography>
        <Box component="form" onSubmit={handleSubmit}>
          {successMessage && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {successMessage}
            </Alert>
          )}
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            label="Username or Email"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            error={!!error}
            disabled={isLoading}
            autoFocus
            autoComplete="username"
            inputProps={{
              'aria-label': 'Username or Email'
            }}
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={!!error}
            disabled={isLoading}
            helperText={error}
            autoComplete="current-password"
            inputProps={{
              'aria-label': 'Password'
            }}
          />
          <Box sx={{ mt: 2, mb: 2, textAlign: 'right' }}>
            <Link
              component={RouterLink}
              to="/forgot-password"
              variant="body2"
              underline="hover"
            >
              Forgot password?
            </Link>
          </Box>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            disabled={isLoading}
            sx={{ 
              height: 36,
              position: 'relative'
            }}
          >
            {isLoading ? (
              <CircularProgress
                size={24}
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  marginTop: '-12px',
                  marginLeft: '-12px'
                }}
              />
            ) : (
              'Sign In'
            )}
          </Button>
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="textSecondary">
              Don't have an account?{' '}
              <Link
                component={RouterLink}
                to="/register"
                variant="body2"
                underline="hover"
              >
                Sign up
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default LoginForm;