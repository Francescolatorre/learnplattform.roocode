import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { theme } from './theme/theme';
import { MainLayout } from './components/layout/MainLayout';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Placeholder components - will be replaced with actual implementations
const CoursesPage = () => <div>Courses Page</div>;
const SubmissionsPage = () => <div>Submissions Page</div>;
const ProfilePage = () => <div>Profile Page</div>;
const LoginPage = () => <div>Login Page</div>;

function App() {
  // Simple auth check - will be replaced with proper auth logic
  const isAuthenticated = !!localStorage.getItem('token');

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          {isAuthenticated ? (
            <MainLayout>
              <Routes>
                <Route path="/courses" element={<CoursesPage />} />
                <Route path="/submissions" element={<SubmissionsPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/" element={<Navigate to="/courses" replace />} />
                <Route path="*" element={<Navigate to="/courses" replace />} />
              </Routes>
            </MainLayout>
          ) : (
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          )}
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
