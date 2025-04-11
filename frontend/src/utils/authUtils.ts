import {useAuth} from '@context/auth/AuthContext';
export const getUserRole = (): string => {
  const {getUserRole} = useAuth();
  return getUserRole();
};
