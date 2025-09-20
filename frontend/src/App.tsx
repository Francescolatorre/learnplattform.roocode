import { Box } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

import NavigationBar from '@components/navigation/NavigationBar';
import { NotificationProvider } from '@components/Notifications/NotificationProvider';
import { ErrorBoundary } from '@components/shared';
import VersionFooter from '@components/shared/VersionFooter';
import { useAuthInitialization } from '@hooks/useAuthInitialization';
import AppRoutes from '@routes/AppRoutes.tsx';
import { theme } from '@styles/theme.ts';

const queryClient = new QueryClient();

const App: React.FC = () => {
  // Initialize authentication state on app startup
  useAuthInitialization();

  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <NotificationProvider>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
              <NavigationBar />
              <main role="main" style={{ flex: 1 }}>
                <AppRoutes />
              </main>
              <VersionFooter />
            </Box>
          </ThemeProvider>
        </NotificationProvider>
      </ErrorBoundary>
    </QueryClientProvider>
  );
};

export default App;
