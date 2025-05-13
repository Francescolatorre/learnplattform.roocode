/**
 * User role enum for role-based access control
 * Used throughout the application for menu filtering, component rendering,
 * and access control to routes and features
 */
export enum UserRole {
    ADMIN = 'admin',
    INSTRUCTOR = 'instructor',
    STUDENT = 'student',
    GUEST = 'guest'
}

/**
 * User data interface that matches backend API constraints
 * All properties align with Django model validation rules
 */
export interface IUser {
    readonly id: string;
    username: string; // Backend constraint: 3-150 chars
    email: string; // Backend constraint: valid email format, max 254 chars
    display_name?: string; // Optional, max 150 chars
    role: UserRole;
    readonly created_at: string;
    readonly updated_at: string;
    is_active?: boolean;
}

/**
 * Authentication state interface for global state management
 */
export interface IAuthState {
    user: IUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

/**
 * Register request payload with validation constraints
 */
export interface IRegisterRequest {
    username: string; // 3-150 chars
    email: string; // Valid email format
    password: string; // Min 8 chars, alphanumeric + special
    password_confirm: string;
    role?: UserRole;
    display_name?: string;
}

/**
 * User update request payload
 */
export interface IUserUpdateRequest {
    email?: string;
    display_name?: string;
    role?: UserRole;
}
