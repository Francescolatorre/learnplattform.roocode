import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, Container, Paper, Alert } from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { resetPassword } from '../../../services/api';
import { validatePassword, type PasswordStrength } from '../utils/passwordValidation';
import PasswordStrengthIndicator from './PasswordStrengthIndicator';
import { AxiosError } from 'axios';

const ResetPasswordForm: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    isValid: false,
    score: 0,
    feedback: [],
  });

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing reset token');
    }
  }, [token]);

  useEffect(() => {
    if (password) {
      setPasswordStrength(validatePassword(password));
    } else {
      setPasswordStrength({ isValid: false, score: 0, feedback: [] });
    }
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!token) {
      setError('Invalid or missing reset token');
      setIsLoading(false);
      return;
    }

    if (!passwordStrength.isValid) {
      setError('Please address all password requirements');
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      await resetPassword(token, password);
      // Show success message and redirect to login
      navigate('/login', {
        state: {
          message: 'Password has been reset successfully. Please login with your new password.',
        },
      });
    } catch (err: unknown) {
      if (err instanceof Error) {
        const axiosError = err as AxiosError;
        const errorMessage = axiosError.response?.data
          ? (axiosError.response.data as { detail?: string }).detail || 'Password reset failed'
          : 'An error occurred while resetting your password.';
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
          Reset Password
        </Typography>
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            label="New Password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            error={!!error}
            disabled={isLoading || !token}
          />
          {password && (
            <PasswordStrengthIndicator
              score={passwordStrength.score}
              feedback={passwordStrength.feedback}
            />
          )}
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            label="Confirm New Password"
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            error={!!error}
            disabled={isLoading || !token}
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
            disabled={isLoading || !token || !passwordStrength.isValid}
          >
            {isLoading ? 'Resetting Password...' : 'Reset Password'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default ResetPasswordForm;
