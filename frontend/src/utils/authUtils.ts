import { useAuth } from '@features/auth/context/AuthContext';
export const getUserRole = (): string => {
  const { getUserRole } = useAuth();
  return getUserRole();
};
