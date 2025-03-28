import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from '@theme/theme';
import { AuthProvider } from '@features/auth/AuthContext';
import ErrorBoundary from '@components/ErrorBoundary';
import AppRoutes from './app/routes';
import NavigationBar from './components/common/NavigationBar'; // Import NavigationBar

const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <Router>
      <div>
        <ErrorBoundary>
          <QueryClientProvider client={queryClient}>
            <ThemeProvider theme={theme}>
              <CssBaseline />
              <AuthProvider>
                <NavigationBar /> {/* Add NavigationBar */}
                <AppRoutes />
              </AuthProvider>
            </ThemeProvider>
          </QueryClientProvider>
        </ErrorBoundary>
      </div>
    </Router>
  );
};

export default App;
