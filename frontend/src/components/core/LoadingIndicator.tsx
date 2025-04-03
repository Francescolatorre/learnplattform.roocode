import React from 'react';
import {Box, CircularProgress} from '@mui/material';

const LoadingIndicator: React.FC = () => {
  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
      <CircularProgress />
    </Box>
  );
};

export default LoadingIndicator;
