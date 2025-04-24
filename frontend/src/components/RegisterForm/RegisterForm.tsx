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
import React, {useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';

import {useAuth} from '@context/auth/AuthContext';
import PasswordStrengthIndicator from 'src/components/PasswordStrengthIndicator/PasswordStrengthIndicator';

import {validatePassword, type PasswordStrength} from '../../utils/passwordValidation';


const RegisterForm: React.FC = () => {
  const {login} = useAuth(); // Use login after successful registration
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    isValid: false,
    score: 0,
    feedback: [],
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (password) {
      setPasswordStrength(validatePassword(password));
    } else {
      setPasswordStrength({isValid: false, score: 0, feedback: []});
    }
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validation checks
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
      // Call register API and log in the user automatically
      await login(username, password);
      // Navigate to dashboard or home
      navigate('/dashboard');
    } catch (errorObj) { // Rename 'err' to 'errorObj' and use it
      console.error('Registration failed:', errorObj);
      setError('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = (event: SelectChangeEvent) => {
    setRole(event.target.value);
  };

  return (
    <Container maxWidth="xs">
      <Paper elevation={3} sx={{padding: 3, marginTop: 8}}>
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
            inputProps={{'data-test-id': 'register-username-input'}}
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
            inputProps={{'data-test-id': 'register-email-input'}}
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
            inputProps={{'data-test-id': 'register-password-input'}}
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
            inputProps={{'data-test-id': 'register-confirm-password-input'}}
          />
          <FormControl fullWidth margin="normal" data-test-id="register-role-select">
            <InputLabel>Role</InputLabel>
            <Select
              value={role}
              label="Role"
              onChange={handleRoleChange}
              disabled={isLoading}
              inputProps={{'data-test-id': 'register-role-select-input'}}
            >
              <MenuItem value="user" data-test-id="register-role-user-option">
                User
              </MenuItem>
              <MenuItem value="admin" data-test-id="register-role-admin-option">
                Admin
              </MenuItem>
            </Select>
          </FormControl>
          {error && (
            <Alert severity="error" sx={{mt: 2}}>
              {error}
            </Alert>
          )}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            sx={{marginTop: 2}}
            disabled={isLoading || !passwordStrength.isValid}
            data-test-id="register-submit-button"
          >
            {isLoading ? 'Registering...' : 'Register'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default RegisterForm;
