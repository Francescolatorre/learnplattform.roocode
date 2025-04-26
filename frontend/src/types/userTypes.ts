/**
 * User role type definition for role-based access control
 * Used throughout the application for menu filtering, component rendering,
 * and access control to routes and features
 */
export type TUserRole = 'admin' | 'instructor' | 'student' | 'guest';

/**
 * User data interface
 */
export interface IUser {
    id: string;
    username: string;
    email?: string;
    display_name?: string;
    role: TUserRole;
    created_at?: string;
    updated_at?: string;
}

/**
 * Authentication state interface
 */
export interface IAuthState {
    user: IUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

/**
 * Register request payload
 */
export interface IRegisterRequest {
    username: string;
    email: string;
    password: string;
    password_confirm: string;
    role?: TUserRole;
}
