// Context
export { AuthProvider, useAuth } from './AuthContext';

// Components
export { default as LoginForm } from './LoginForm';
export { default as RegisterForm } from './RegisterForm';
export { default as ForgotPasswordForm } from './ForgotPasswordForm';
export { default as ResetPasswordForm } from './ResetPasswordForm';
export { default as PasswordStrengthIndicator } from './components/PasswordStrengthIndicator';

// Routes
export { default as AuthRoutes } from './routes/AuthRoutes';
export { ProtectedRoute, PublicRoute } from './routes/AuthRoutes';
export { default as RoleBasedRoute, withRoleBasedAccess } from './routes/RoleBasedRoute';

// Utils
export {
  validatePassword,
  getPasswordStrengthColor,
  getPasswordStrengthLabel,
  type PasswordStrength
} from './utils/passwordValidation';

// Types
export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  display_name?: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (usernameOrEmail: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
}