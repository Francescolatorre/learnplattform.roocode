import { create } from 'zustand';

interface User {
  id: string;
  name: string;
  isAuthenticated: boolean;
}

interface AuthState {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
}

const useAuthStore = create<AuthState>((set) => ({
  user: null,
  login: (user: User) => set((state) => ({ ...state, user })),
  logout: () => set((state) => ({ ...state, user: null })),
}));

export default useAuthStore;
