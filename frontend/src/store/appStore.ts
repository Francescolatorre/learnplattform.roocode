import {create} from 'zustand'; // Use named import for create

import {Course} from 'src/types/common/entities';
interface User {
  id: string;
  role: string;
}

interface AppState {
  user: User | null;
  courses: Course[]; // Use Course from apiTypes
  setUser: (user: User) => void;
  setCourses: (courses: Course[]) => void;
}

export const useAppStore = create<AppState>(set => ({
  user: null,
  courses: [],
  setUser: user => set({user}),
  setCourses: courses => set({courses}),
}));
