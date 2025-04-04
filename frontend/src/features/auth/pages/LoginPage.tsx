import React from 'react';
import {Box, TextField, Button, Typography, CircularProgress} from '@mui/material';
import {useForm, SubmitHandler} from 'react-hook-form';
import {useAuth} from '@features/auth/context/AuthContext';
import authService from '@services/auth/authService';

interface ILoginFormInputs {
  username: string;
  password: string;
}

const LoginPage: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: {errors, isSubmitting},
  } = useForm<ILoginFormInputs>();
  const {setAuthTokens, redirectToDashboard, setError} = useAuth();

  const handleLogin = async (data: ILoginFormInputs) => {
    try {
      console.log('LoginPage: handleLogin: Login payload:', data); // Log the payload for debugging
      const response = await authService.login(data.username, data.password); // Send username and password
      console.log('LoginPage: handleLogin: authService.login response:', response);
      if (response?.access) {
        console.log('LoginPage: handleLogin: Login successful, setting auth tokens');
        setAuthTokens(response); // Save tokens in context or localStorage
        console.log('LoginPage: handleLogin: Redirecting to dashboard');
        redirectToDashboard(); // Navigate to the dashboard
      } else {
        console.log('LoginPage: handleLogin: Invalid credentials');
        setError('Invalid credentials'); // Handle invalid responses
      }
    } catch (error: any) {
      console.error('LoginPage: handleLogin: Login error:', error.response?.data || error.message); // Log detailed error
      setError(error.response?.data?.detail || 'An error occurred during login'); // Display error to the user
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
          {...register('username', {required: 'Username is required'})}
          error={!!errors.username}
          helperText={errors.username?.message}
        />
        <TextField
          label="Password"
          type="password"
          fullWidth
          margin="normal"
          autoComplete="current-password"
          {...register('password', {required: 'Password is required'})}
          error={!!errors.password}
          helperText={errors.password?.message}
        />
        <Box sx={{mt: 2, textAlign: 'center'}}>
          <Button type="submit" variant="contained" color="primary" disabled={isSubmitting}>
            {isSubmitting ? <CircularProgress size={24} /> : 'Login'}
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default LoginPage;
