import { useEffect } from 'react';
import { useAuthStore } from '@/store/modernAuthStore';

/**
 * Hook to initialize authentication state on app startup
 * This hook ensures that the auth state is restored from localStorage
 * when the application loads
 */
export const useAuthInitialization = () => {
  const { restoreAuthState } = useAuthStore();

  useEffect(() => {
    console.log('useAuthInitialization: Starting auth state restoration...');
    restoreAuthState().catch((error) => {
      console.error('useAuthInitialization: Failed to restore auth state:', error);
    });
  }, [restoreAuthState]);
};