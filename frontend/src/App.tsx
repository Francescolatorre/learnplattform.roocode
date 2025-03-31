import React from 'react';
import {BrowserRouter} from 'react-router-dom';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {ThemeProvider} from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import {theme} from './theme/theme';
import {AuthProvider} from './features/auth/context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import AppRoutes from './routes';
import NavigationBar from './components/common/NavigationBar'; // Import NavigationBar

const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter future={{v7_startTransition: true, v7_relativeSplatPath: true}}>
        <div>
          <ErrorBoundary>
            <ThemeProvider theme={theme}>
              <CssBaseline />
              <AuthProvider>
                <NavigationBar />
                <AppRoutes />
              </AuthProvider>
            </ThemeProvider>
          </ErrorBoundary>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
