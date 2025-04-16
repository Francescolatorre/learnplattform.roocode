import {User} from 'src/types/common/entities';

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
