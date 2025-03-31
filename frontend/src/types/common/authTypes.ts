export interface LoginResponse {
  access: string;
  refresh: string;
  user?: User;
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  display_name: string;
}

export interface TokenRefreshResponse {
  access: string;
  refresh: string;
  user?: User;
}
