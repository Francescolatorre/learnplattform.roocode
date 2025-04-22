import {IUser} from '@/types/user';

export interface ILoginResponse {
  access: string;
  refresh: string;
  user?: IUser;
}

export interface ITokenRefreshResponse {
  access: string;
  refresh: string;
  user?: IUser;
}

export interface ITokenRefresh {
  refresh: string;
  access?: string;
}

// Auth-bezogene Typen
export interface ICustomTokenObtainPair {
  username: string;
  password: string;
}

export interface IRegister {
  username: string;
  password: string;
  password2: string;
  email: string;
  display_name?: string;
  role?: string;
}
