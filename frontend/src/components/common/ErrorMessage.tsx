import React from 'react';
import { Alert, AlertProps, AlertTitle } from '@mui/material';

interface ErrorMessageProps extends Omit<AlertProps, 'variant'> {
  message: string;
  title?: string;
  severity?: 'error' | 'warning' | 'info';
}

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
