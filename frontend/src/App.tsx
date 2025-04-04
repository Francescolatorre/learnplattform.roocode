import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import { theme } from './theme/theme';
import ErrorBoundary from './components/core/ErrorBoundary';
import AppRoutes from './routes/routes.tsx';
import NavigationBar from '@components/layout/NavigationBar';

const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <NavigationBar />
          <AppRoutes />
        </ThemeProvider>
      </ErrorBoundary>
    </QueryClientProvider>
  );
};

export default App;
