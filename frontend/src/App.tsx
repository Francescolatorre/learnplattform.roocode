import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

import NavigationBar from '@components/navigation/NavigationBar.tsx';
import { NotificationProvider } from '@components/Notifications/NotificationProvider';
import { ErrorBoundary } from '@components/shared';
import AppRoutes from '@routes/AppRoutes.tsx';
import { theme } from '@styles/theme.ts';

const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <NotificationProvider>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <NavigationBar />
            <AppRoutes />
          </ThemeProvider>
        </NotificationProvider>
      </ErrorBoundary>
    </QueryClientProvider>
  );
};

export default App;
