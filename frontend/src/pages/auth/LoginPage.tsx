import React, {useEffect, useState} from 'react';
import {Box, TextField, Button, Typography, CircularProgress} from '@mui/material';
import {useForm, SubmitHandler} from 'react-hook-form';

import useNotification from '@/components/Notifications/useNotification';
import {useAuth} from '@context/auth/AuthContext';
import {TUserRole} from '@/types';

interface ILoginFormInputs {
  username: string;
  password: string;
}

interface IApiError {
  response?: {
    data?: {
      detail?: string;
      [key: string]: unknown;
    };
  };
  message?: string;
}

/**
 * Login page component for user authentication
 * Handles login form submission and redirects based on user role
 */
const LoginPage: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: {errors, isSubmitting},
  } = useForm<ILoginFormInputs>();
  const {login, redirectToDashboard, getUserRole, user} = useAuth();
  const notify = useNotification();

  // Track login state to know when to watch for user data
  const [hasLoggedIn, setHasLoggedIn] = useState(false);

  // Watch for user data changes after successful login
  useEffect(() => {
    // Only run this effect after a successful login
    if (hasLoggedIn && user) {
      console.info('LoginPage: User data updated after login:', user);

      // Get the role directly from user object instead of getUserRole
      const role = user.role;
      console.info(`LoginPage: User role from user object: ${role}`);

      // Only redirect if we have a valid role
      if (role && role !== 'guest') {
        console.info(`LoginPage: Valid role detected: ${role}, redirecting`);
        redirectToDashboard();
      } else {
        console.warn('LoginPage: No valid role found in user object, using fallback redirect');
        redirectToDashboard();
      }
    }
  }, [user, hasLoggedIn, redirectToDashboard]);

  const handleLogin = async (data: ILoginFormInputs) => {
    try {
      console.info('LoginPage: handleLogin: Login payload:', data);

      // Login and await the result
      await login(data.username, data.password);
      console.info('LoginPage: handleLogin: Login successful');

      // Set login state to trigger the effect above
      setHasLoggedIn(true);
    } catch (error: unknown) {
      const apiError = error as IApiError;
      console.error(
        'LoginPage: handleLogin: Login error:',
        'response' in apiError
          ? apiError.response?.data
          : apiError instanceof Error
            ? apiError.message
            : 'Unknown error'
      );

      notify({
        title: 'Login Failed',
        message:
          'response' in apiError
            ? apiError.response?.data?.detail || 'An error occurred during login'
            : 'An error occurred during login',
        severity: 'error',
        duration: 5000,
      });
    }
  };

  const onSubmit: SubmitHandler<ILoginFormInputs> = async data => {
    await handleLogin(data);
  };

  // Render form component (unchanged)
  return (
    <Box sx={{maxWidth: 400, mx: 'auto', mt: 8, p: 3, border: '1px solid #ccc', borderRadius: 2}}>
      <Typography variant="h5" gutterBottom>
        Login
      </Typography>
      <form onSubmit={handleSubmit(onSubmit)}>
        <TextField
          label="Username"
          autoComplete="username"
          fullWidth
          margin="normal"
          error={!!errors.username}
          helperText={errors.username?.message}
          InputProps={{inputProps: {'data-testid': 'login-username-input'}}}
          {...register('username', {required: 'Username is required'})}
        />
        <TextField
          label="Password"
          type="password"
          fullWidth
          margin="normal"
          autoComplete="current-password"
          InputProps={{inputProps: {'data-testid': 'login-password-input'}}}
          {...register('password', {required: 'Password is required'})}
          error={!!errors.password}
          helperText={errors.password?.message}
        />
        <Box sx={{mt: 2, textAlign: 'center'}}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isSubmitting}
            data-testid="login-submit-button"
          >
            {isSubmitting ? <CircularProgress size={24} /> : 'Login'}
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default LoginPage;
