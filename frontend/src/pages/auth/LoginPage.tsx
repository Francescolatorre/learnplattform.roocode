import {Box, TextField, Button, Typography, CircularProgress} from '@mui/material';
import React from 'react';
import {useForm, SubmitHandler} from 'react-hook-form';

import {useNotification} from '@components/ErrorNotifier/useErrorNotifier';
import {useAuth} from '@context/auth/AuthContext';

interface ILoginFormInputs {
  username: string;
  password: string;
}

// Define a specific interface for API errors instead of using any
interface IApiError {
  response?: {
    data?: {
      detail?: string;
      [key: string]: unknown;
    };
  };
  message?: string;
}

const LoginPage: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: {errors, isSubmitting},
  } = useForm<ILoginFormInputs>();
  const {login, redirectToDashboard} = useAuth();
  const notify = useNotification();

  const handleLogin = async (data: ILoginFormInputs) => {
    try {
      console.info('LoginPage: handleLogin: Login payload:', data); // Log the payload for debugging
      await login(data.username, data.password);
      console.info('LoginPage: handleLogin: Login successful, redirecting to dashboard');
      redirectToDashboard();
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

      // Use centralized error notification system instead of setError
      notify({
        title: 'Login Failed',
        message: 'response' in apiError
          ? apiError.response?.data?.detail || 'An error occurred during login'
          : 'An error occurred during login',
        severity: 'error',
        duration: 5000 // Auto-dismiss after 5 seconds
      });
    }
  };

  const onSubmit: SubmitHandler<ILoginFormInputs> = async data => {
    await handleLogin(data);
  };

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
