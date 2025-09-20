import { Box, TextField, Button, Typography, CircularProgress, Alert } from '@mui/material';
import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { ROUTE_CONFIG } from '@/config/appConfig';
import { useAuthStore } from '@/store/modernAuthStore';

interface ILoginFormInputs {
  username: string;
  password: string;
}

/**
 * Modern Login Page Component (2025 Architecture)
 *
 * Features:
 * - Modern useAuthStore integration
 * - Direct navigation after login
 * - Clean error handling
 * - Simplified state management
 */
const LoginPage: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ILoginFormInputs>();

  const { login, getUserRole, isLoading, error } = useAuthStore();
  const navigate = useNavigate();

  const handleLogin: SubmitHandler<ILoginFormInputs> = async (data) => {
    try {
      // Login through modern auth store
      await login(data.username, data.password);

      // Get user role and redirect immediately
      const role = getUserRole();
      const dashboardPath = ROUTE_CONFIG.dashboardPaths[role] || ROUTE_CONFIG.defaultRedirect;

      console.info(`Login successful for role: ${role}, redirecting to: ${dashboardPath}`);
      navigate(dashboardPath, { replace: true });
    } catch (loginError) {
      // Error handling is managed by the auth store
      console.error('Login failed:', loginError);
    }
  };

  const isFormLoading = isSubmitting || isLoading;

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', mt: 8, p: 3, border: '1px solid #ccc', borderRadius: 2 }}>
      <Typography variant="h5" gutterBottom>
        Login
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit(handleLogin)}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Username"
            variant="outlined"
            fullWidth
            disabled={isFormLoading}
            inputProps={{ 'data-testid': 'login-username-input' }}
            {...register('username', { required: 'Username is required' })}
            error={!!errors.username}
            helperText={errors.username?.message}
          />

          <TextField
            label="Password"
            type="password"
            variant="outlined"
            fullWidth
            disabled={isFormLoading}
            inputProps={{ 'data-testid': 'login-password-input' }}
            {...register('password', { required: 'Password is required' })}
            error={!!errors.password}
            helperText={errors.password?.message}
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isFormLoading}
            data-testid="login-submit-button"
            sx={{ mt: 2 }}
          >
            {isFormLoading ? <CircularProgress size={24} /> : 'Login'}
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default LoginPage;