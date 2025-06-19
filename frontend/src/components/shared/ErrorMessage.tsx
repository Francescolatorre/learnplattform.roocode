import { Alert, AlertProps, AlertTitle } from '@mui/material';
import React from 'react';

interface ErrorMessageProps extends Omit<AlertProps, 'variant'> {
  message: string;
  title?: string;
  severity?: 'error' | 'warning' | 'info';
}

/**
 * Reusable error message component for displaying error, warning, or info messages
 * with consistent styling throughout the application.
 */
export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  title = 'Error',
  severity = 'error',
  ...alertProps
}) => {
  return (
    <Alert
      variant="filled"
      severity={severity}
      className="error-message"
      {...alertProps}
      sx={{
        width: '100%',
        mt: 2,
        ...alertProps.sx,
      }}
    >
      {title && <AlertTitle>{title}</AlertTitle>}
      {message}
    </Alert>
  );
};

export default ErrorMessage;
