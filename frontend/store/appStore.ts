import create from 'zustand';

interface AppState {
    selectedCourseId: number | null;
    setSelectedCourseId: (id: number) => void;
}

export const useAppStore = create<AppState>((set) => ({
    selectedCourseId: null,
    setSelectedCourseId: (id) => set((state) => (state.selectedCourseId === id ? state : { selectedCourseId: id })),
}));
