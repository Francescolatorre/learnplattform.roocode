import { zodResolver } from '@hookform/resolvers/zod';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';

import useNotification from '@/components/Notifications/useNotification';
import authService from '@/services/auth/authService';
import { type PasswordStrength, getPasswordStrengthLabel, validatePassword } from '@/utils/passwordValidation';
import { resetPasswordSchema, type ResetPasswordSchema } from '@/validation/schemas';

const ResetPasswordForm: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    isValid: false,
    score: 0,
    feedback: [],
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const notify = useNotification();

  const {
    control,
    handleSubmit,
    watch: _watch,
    formState: { errors },
  } = useForm<ResetPasswordSchema>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onChange',
  });

  useEffect(() => {
    if (!token) {
      notify({
        message: 'Invalid or missing reset token',
        title: 'Error',
        severity: 'error',
      });
      navigate('/login');
    }
  }, [token, navigate, notify]);

  const onSubmit = async (data: ResetPasswordSchema) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await authService.resetPassword(token!, data.password);
      setSuccess(true);
      notify({
        message: 'Password has been reset successfully',
        title: 'Success',
        severity: 'success',
      });
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: unknown) {
      const errMessage =
        err instanceof Error ? err.message : 'Failed to reset password - An unknown error occurred';
      setError(errMessage);
      notify({
        message: errMessage,
        title: 'Password Reset Error',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        maxWidth: 400,
        mx: 'auto',
        mt: 4,
        p: 3,
        border: '1px solid #ccc',
        borderRadius: 1,
        boxShadow: 1,
      }}
    >
      <Typography variant="h5" component="h2" align="center" mb={2}>
        Reset Password
      </Typography>
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          <AlertTitle>Password Reset Successful</AlertTitle>
          You will be redirected to login in 3 seconds...
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          <AlertTitle>Error</AlertTitle>
          {error}
        </Alert>
      )}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Controller
          name="password"
          control={control}
          defaultValue=""
          render={({ field }) => (
            <TextField
              {...field}
              disabled={loading}
              label="Password"
              type="password"
              fullWidth
              margin="normal"
              error={!!errors.password}
              helperText={errors.password?.message}
              onChange={e => {
                field.onChange(e);
                setPasswordStrength(validatePassword(e.target.value));
              }}
            />
          )}
        />
        <Typography
          component="span"
          variant="body2"
          color={
            passwordStrength.score < 2
              ? 'error'
              : passwordStrength.score < 4
                ? 'warning'
                : 'success'
          }
          sx={{ mb: 1, display: 'block' }}
        >
          Password Strength: {getPasswordStrengthLabel(passwordStrength.score)}
        </Typography>
        {passwordStrength.feedback.length > 0 && (
          <Box sx={{ mt: 1, mb: 2 }}>
            {passwordStrength.feedback.map((item, index) => (
              <Typography key={index} variant="caption" color="error" component="div">
                • {item}
              </Typography>
            ))}
          </Box>
        )}
        <Controller
          name="password_confirm"
          control={control}
          defaultValue=""
          render={({ field }) => (
            <TextField
              {...field}
              label="Confirm Password"
              type="password"
              fullWidth
              margin="normal"
              error={!!errors.password_confirm}
              helperText={errors.password_confirm?.message}
            />
          )}
        />

        <Button variant="contained" color="primary" fullWidth type="submit" disabled={loading}>
          {loading ? <CircularProgress size={24} /> : 'Reset Password'}
        </Button>
      </form>
    </Box>
  );
};

export default ResetPasswordForm;
