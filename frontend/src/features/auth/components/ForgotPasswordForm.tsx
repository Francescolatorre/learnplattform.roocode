import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Paper,
  Alert,
  Snackbar,
} from '@mui/material';
import { requestPasswordReset } from '@services/api';
import { AxiosError } from 'axios';

const ForgotPasswordForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      await requestPasswordReset(email);
      setSuccessMessage('Password reset instructions have been sent to your email.');
      setEmail(''); // Clear the form
    } catch (err: unknown) {
      if (err instanceof Error) {
        const axiosError = err as AxiosError;
        const errorMessage = axiosError.response?.data
          ? (axiosError.response.data as { detail?: string }).detail || 'Failed to send reset email'
          : 'An error occurred while requesting password reset.';
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
          Forgot Password
        </Typography>
        <Typography variant="body1" align="center" color="textSecondary" sx={{ mb: 3 }}>
          Enter your email address and we'll send you instructions to reset your password.
        </Typography>
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            label="Email Address"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            error={!!error}
            disabled={isLoading}
            autoFocus
          />
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 3, mb: 2 }}
            disabled={isLoading || !email}
          >
            {isLoading ? 'Sending...' : 'Reset Password'}
          </Button>
        </Box>
      </Paper>
      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={() => setSuccessMessage('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSuccessMessage('')} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ForgotPasswordForm;
