export interface AuthUser {
    id: string;
    username: string;
    role?: string; // user role, e.g. 'student', 'instructor', 'admin'
    // weitere Benutzerfelder
}

export interface AuthContextProps {
    user: AuthUser | null;
    isAuthenticated: boolean;
    isRestoring: boolean; // true while authentication state is being restored
    login: (username: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    getUserRole: () => string;
    redirectToDashboard: () => void;
    setError: (error: string) => void;
    // weitere Methoden
}

export interface AuthInterceptorProps {
    onAuthFailure: () => void;
    onRefreshToken: () => Promise<string>;
    // weitere Props
}

export enum AuthEventType {
    LOGIN = 'login',
    LOGOUT = 'logout',
    TOKEN_REFRESH = 'token_refresh',
    AUTH_ERROR = 'auth_error',
}

export interface AuthEvent {
    type: AuthEventType;
    payload?: any;
}
