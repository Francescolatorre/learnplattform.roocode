import { IUser } from 'src/types/userTypes';

export type TUserRole = 'guest' | 'student' | 'instructor' | 'admin';

export interface AuthContextProps {
  user: IUser | null;
  isAuthenticated: boolean;
  isRestoring: boolean; // true while authentication state is being restored
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  getUserRole: () => string;
  redirectToDashboard: (options?: { path?: string; replace?: boolean }) => void;
  setError: (errorMessage: string) => void;
  // weitere Methoden
}

export enum AuthEventType {
  LOGIN = 'login',
  LOGOUT = 'logout',
  TOKEN_REFRESH = 'token_refresh',
  AUTH_ERROR = 'auth_error',
  AUTH_SUCCESS = 'auth_success',
  ENROLLMENT_SUCCESS = 'enrollment_success',
  ENROLLMENT_FAILURE = 'enrollment_failure',
  NAVIGATION = 'navigation',
  SESSION_EXPIRED = 'session_expired',
}

export interface IAuthEvent {
  type: AuthEventType;
  payload?: IAuthEventPayload;
}

// Define specific payload interface
export interface IAuthEventPayload {
  user?: IUser;
  error?: IAuthContextError;
  token?: string;
  message?: string;
  [key: string]: unknown; // Allow for additional properties while maintaining type safety
}

export interface IAuthContextError {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}
