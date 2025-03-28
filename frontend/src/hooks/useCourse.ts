import { useQuery } from 'react-query';
import apiService from '@services/apiService'; // Use default export
import { useAuth } from '@features/auth/AuthContext';

export const useCourse = (courseId: string | undefined) => {
  const { isAuthenticated, isAuthChecked } = useAuth();

  return useQuery(
    ['course', courseId],
    () => apiService.get(`/courses/${courseId}`).then(res => res.data),
    {
      enabled: isAuthChecked && isAuthenticated && !!courseId, // Ensure auth is checked
      retry: false,
      refetchOnWindowFocus: false,
    }
  );
};
