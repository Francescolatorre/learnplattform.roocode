import { Box, CircularProgress } from '@mui/material';
import React from 'react';

/**
 * Reusable loading indicator component that displays a centered circular progress.
 * Use this component to indicate loading states throughout the application.
 */
const LoadingIndicator: React.FC = () => {
  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
      <CircularProgress />
    </Box>
  );
};

export default LoadingIndicator;
