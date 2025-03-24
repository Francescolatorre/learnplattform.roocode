import { create } from 'zustand'; // Use named import for create

interface User {
    id: string;
    role: string;
}

interface Course {
    id: string;
    title: string;
    description: string;
}

interface AppState {
    user: User | null;
    courses: Course[];
    setUser: (user: User) => void;
    setCourses: (courses: Course[]) => void;
}

export const useAppStore = create<AppState>((set) => ({
    user: null,
    courses: [],
    setUser: (user) => set({ user }),
    setCourses: (courses) => set({ courses }),
}));
