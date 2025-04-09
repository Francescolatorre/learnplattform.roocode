import { User } from '@types/common/entities';

export interface LoginResponse {
  access: string;
  refresh: string;
  user?: User;
}

export interface TokenRefreshResponse {
  access: string;
  refresh: string;
  user?: User;
}
