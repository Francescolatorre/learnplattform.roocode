import { Box, CircularProgress } from '@mui/material';
import React from 'react';

const LoadingIndicator: React.FC = () => {
  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
      <CircularProgress />
    </Box>
  );
};

export default LoadingIndicator;
