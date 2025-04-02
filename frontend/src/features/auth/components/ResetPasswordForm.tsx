import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { validatePassword, type PasswordStrength } from '../utils/passwordValidation';

const passwordSchema = z
  .string()
  .min(8, { message: 'Password must be at least 8 characters' })
  .refine(validatePassword, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
  });

const resetPasswordFormSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ResetPasswordFormValues = z.infer<typeof resetPasswordFormSchema>;

const ResetPasswordForm: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>('Too weak');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordFormSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const password = watch('password');

  const onSubmit = async (data: ResetPasswordFormValues) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password');
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
          color={passwordStrength === 'Too weak' ? 'error' : 'success'}
          sx={{ mb: 1 }}
        >
          Password Strength: {passwordStrength}
        </Typography>
        <Controller
          name="confirmPassword"
          control={control}
          defaultValue=""
          render={({ field }) => (
            <TextField
              {...field}
              label="Confirm Password"
              type="password"
              fullWidth
              margin="normal"
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword?.message}
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
