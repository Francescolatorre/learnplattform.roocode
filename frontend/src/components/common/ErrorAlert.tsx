import { Alert } from '@mui/material';
import React from 'react';

interface ErrorAlertProps {
  error: Error | null;
}

const ErrorAlert: React.FC<ErrorAlertProps> = ({ error }) =>
  error ? (
    <Alert severity="error" sx={{ mb: 3 }}>
      {error.message || 'An error occurred while fetching your courses. Please try again.'}
    </Alert>
  ) : null;

export default ErrorAlert;
