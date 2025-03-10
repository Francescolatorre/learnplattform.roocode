import { create } from 'zustand';

interface Task {
  id: string;
  title: string;
  completed: boolean;
}

interface TaskState {
  tasks: Task[];
  addTask: (task: Task) => void;
  removeTask: (taskId: string) => void;
  toggleTaskCompletion: (taskId: string) => void;
}

const useTaskStore = create<TaskState>((set) => ({
  tasks: [],
  addTask: (task: Task) => set((state) => ({ ...state, tasks: [...state.tasks, task] })),
  removeTask: (taskId: string) => set((state) => ({ ...state, tasks: state.tasks.filter(task => task.id !== taskId) })),
  toggleTaskCompletion: (taskId: string) => set((state) => ({
    ...state,
    tasks: state.tasks.map(task => task.id === taskId ? { ...task, completed: !task.completed } : task)
  })),
}));

export default useTaskStore;
