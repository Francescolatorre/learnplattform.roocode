import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Alert,
} from '@mui/material';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import PasswordStrengthIndicator from '@components/shared/PasswordStrengthIndicator';
import { ROUTE_CONFIG } from '@/config/appConfig';
import { useAuthStore } from '@/store/modernAuthStore';
import { IRegistrationData } from '@/services/auth/modernAuthService';

import { validatePassword, type PasswordStrength } from '../utils/passwordValidation';

const RegisterFormPage: React.FC = () => {
  const { register, user, isLoading } = useAuthStore();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    isValid: false,
    score: 0,
    feedback: [],
  });
  const [hasRegistered, setHasRegistered] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (password) {
      setPasswordStrength(validatePassword(password));
    } else {
      setPasswordStrength({ isValid: false, score: 0, feedback: [] });
    }
  }, [password]);

  // Handle navigation after successful registration
  useEffect(() => {
    if (hasRegistered && user) {
      console.info('RegisterFormPage: User registered successfully:', user);

      // Navigate to appropriate dashboard based on role
      const dashboardPath = ROUTE_CONFIG.dashboardPaths[user.role] || ROUTE_CONFIG.defaultRedirect;
      console.info(`RegisterFormPage: Redirecting to: ${dashboardPath}`);
      navigate(dashboardPath, { replace: true });
    }
  }, [user, hasRegistered, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation checks
    if (!passwordStrength.isValid) {
      setError('Please address all password requirements');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!username.trim()) {
      setError('Username is required');
      return;
    }

    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    try {
      const registrationData: IRegistrationData = {
        username: username.trim(),
        email: email.trim(),
        password,
        password2: confirmPassword,
        role,
      };

      console.info('RegisterFormPage: Registration payload:', {
        ...registrationData,
        password: '[REDACTED]',
        password2: '[REDACTED]',
      });

      // Call register API
      await register(registrationData);
      console.info('RegisterFormPage: Registration successful');

      // Set registration state to trigger navigation
      setHasRegistered(true);
    } catch (errorObj) {
      console.error('Registration failed:', errorObj);
      const errorMessage =
        errorObj instanceof Error ? errorObj.message : 'Registration failed. Please try again.';
      setError(errorMessage);
    }
  };

  const handleRoleChange = (event: SelectChangeEvent) => {
    setRole(event.target.value);
  };

  return (
    <Container maxWidth="xs">
      <Paper elevation={3} sx={{ padding: 3, marginTop: 8 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Register
        </Typography>
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            label="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            error={!!error}
            disabled={isLoading}
            inputProps={{ 'data-testid': 'register-username-input' }}
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            error={!!error}
            disabled={isLoading}
            inputProps={{ 'data-testid': 'register-email-input' }}
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            error={!!error}
            disabled={isLoading}
            inputProps={{ 'data-testid': 'register-password-input' }}
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
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            error={!!error}
            disabled={isLoading}
            inputProps={{ 'data-testid': 'register-confirm-password-input' }}
          />
          <FormControl fullWidth margin="normal" data-testid="register-role-select">
            <InputLabel>Role</InputLabel>
            <Select
              value={role}
              label="Role"
              onChange={handleRoleChange}
              disabled={isLoading}
              inputProps={{ 'data-testid': 'register-role-select-input' }}
            >
              <MenuItem value="student" data-test-id="register-role-student-option">
                Student
              </MenuItem>
              <MenuItem value="instructor" data-test-id="register-role-instructor-option">
                Instructor
              </MenuItem>
            </Select>
          </FormControl>
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
            sx={{ marginTop: 2 }}
            disabled={isLoading || !passwordStrength.isValid}
            data-testid="register-submit-button"
          >
            {isLoading ? 'Registering...' : 'Register'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default RegisterFormPage;
