import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';

import { ILearningTask } from '@/types/Task';

import useTaskStore from './taskStore';

// Mock the modern learning task service
vi.mock('@/services/resources/modernLearningTaskService', () => ({
  modernLearningTaskService: {
    getTasks: vi.fn(),
    createTask: vi.fn(),
    updateTask: vi.fn(),
    deleteTask: vi.fn(),
  },
}));

// Import the mocked service
import { modernLearningTaskService } from '@/services/resources/modernLearningTaskService';

describe.skip('TaskStore', () => {
  beforeEach(() => {
    // Reset the store state before each test
    useTaskStore.setState({
      learningTasks: [],
      isLoading: false,
      error: null,
      localTasks: [],
    });

    // Clear all mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Initial State', () => {
    test('should have correct initial state', () => {
      const store = useTaskStore.getState();

      expect(store.learningTasks).toEqual([]);
      expect(store.isLoading).toBe(false);
      expect(store.error).toBeNull();
      expect(store.localTasks).toEqual([]);
    });
  });

  describe('Learning Tasks (Modern Service Integration)', () => {
    const mockLearningTask: ILearningTask = {
      id: 1,
      title: 'Test Learning Task',
      description: 'Test description',
      course: 1,
      is_published: true,
      order: 1,
      created_at: '2025-09-16T00:00:00Z',
      updated_at: '2025-09-16T00:00:00Z',
    };

    describe('fetchLearningTasks', () => {
      test('should fetch learning tasks successfully', async () => {
        const mockTasks = [mockLearningTask];
        (modernLearningTaskService.getAllTasks as ReturnType<typeof vi.fn>).mockResolvedValue(mockTasks);

        const store = useTaskStore.getState();
        await store.fetchLearningTasks('1');

        const state = useTaskStore.getState();
        expect(state.learningTasks).toEqual(mockTasks);
        expect(state.isLoading).toBe(false);
        expect(state.error).toBeNull();
        expect(modernLearningTaskService.getAllTasks).toHaveBeenCalledWith({ course: '1' });
      });

      test('should handle fetch learning tasks error', async () => {
        const errorMessage = 'Failed to fetch tasks';
        (modernLearningTaskService.getAllTasks as ReturnType<typeof vi.fn>).mockRejectedValue(new Error(errorMessage));

        const store = useTaskStore.getState();
        await store.fetchLearningTasks('1');

        const state = useTaskStore.getState();
        expect(state.learningTasks).toEqual([]);
        expect(state.isLoading).toBe(false);
        expect(state.error).toBe(errorMessage);
      });

      test('should set loading state during fetch', async () => {
        let resolvePromise: (value: ILearningTask[]) => void;
        const promise = new Promise<ILearningTask[]>((resolve) => {
          resolvePromise = resolve;
        });
        (modernLearningTaskService.getAllTasks as ReturnType<typeof vi.fn>).mockReturnValue(promise);

        const store = useTaskStore.getState();
        const fetchPromise = store.fetchLearningTasks('1');

        // Check loading state
        const loadingState = useTaskStore.getState();
        expect(loadingState.isLoading).toBe(true);
        expect(loadingState.error).toBeNull();

        // Resolve the promise
        resolvePromise!([mockLearningTask]);
        await fetchPromise;

        // Check final state
        const finalState = useTaskStore.getState();
        expect(finalState.isLoading).toBe(false);
      });
    });

    describe('createLearningTask', () => {
      test('should create learning task successfully', async () => {
        (modernLearningTaskService.createTask as ReturnType<typeof vi.fn>).mockResolvedValue(mockLearningTask);

        const store = useTaskStore.getState();
        const taskData = { title: 'New Task', description: 'New description', course: 1 };
        await store.createLearningTask(taskData);

        const state = useTaskStore.getState();
        expect(state.learningTasks).toContain(mockLearningTask);
        expect(state.isLoading).toBe(false);
        expect(state.error).toBeNull();
        expect(modernLearningTaskService.createTask).toHaveBeenCalledWith(taskData);
      });

      test('should handle create learning task error', async () => {
        const errorMessage = 'Failed to create task';
        (modernLearningTaskService.createTask as ReturnType<typeof vi.fn>).mockRejectedValue(new Error(errorMessage));

        const store = useTaskStore.getState();
        await store.createLearningTask({ title: 'New Task', description: 'Test description', course: 1 });

        const state = useTaskStore.getState();
        expect(state.learningTasks).toEqual([]);
        expect(state.isLoading).toBe(false);
        expect(state.error).toBe(errorMessage);
      });
    });

    describe('updateLearningTask', () => {
      test('should update learning task successfully', async () => {
        const updatedTask = { ...mockLearningTask, title: 'Updated Task' };
        (modernLearningTaskService.updateTask as ReturnType<typeof vi.fn>).mockResolvedValue(updatedTask);

        // Set initial state with a task
        useTaskStore.setState({ learningTasks: [mockLearningTask] });

        const store = useTaskStore.getState();
        await store.updateLearningTask('1', { title: 'Updated Task' });

        const state = useTaskStore.getState();
        expect(state.learningTasks[0].title).toBe('Updated Task');
        expect(state.isLoading).toBe(false);
        expect(state.error).toBeNull();
        expect(modernLearningTaskService.updateTask).toHaveBeenCalledWith('1', { title: 'Updated Task' });
      });

      test('should handle update learning task error', async () => {
        const errorMessage = 'Failed to update task';
        (modernLearningTaskService.updateTask as ReturnType<typeof vi.fn>).mockRejectedValue(new Error(errorMessage));

        useTaskStore.setState({ learningTasks: [mockLearningTask] });

        const store = useTaskStore.getState();
        await store.updateLearningTask('1', { title: 'Updated Task' });

        const state = useTaskStore.getState();
        expect(state.learningTasks[0].title).toBe('Test Learning Task'); // Unchanged
        expect(state.isLoading).toBe(false);
        expect(state.error).toBe(errorMessage);
      });
    });

    describe('deleteLearningTask', () => {
      test('should delete learning task successfully', async () => {
        (modernLearningTaskService.deleteTask as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

        // Set initial state with a task
        useTaskStore.setState({ learningTasks: [mockLearningTask] });

        const store = useTaskStore.getState();
        await store.deleteLearningTask('1');

        const state = useTaskStore.getState();
        expect(state.learningTasks).toEqual([]);
        expect(state.isLoading).toBe(false);
        expect(state.error).toBeNull();
        expect(modernLearningTaskService.deleteTask).toHaveBeenCalledWith('1');
      });

      test('should handle delete learning task error', async () => {
        const errorMessage = 'Failed to delete task';
        (modernLearningTaskService.deleteTask as ReturnType<typeof vi.fn>).mockRejectedValue(new Error(errorMessage));

        useTaskStore.setState({ learningTasks: [mockLearningTask] });

        const store = useTaskStore.getState();
        await store.deleteLearningTask('1');

        const state = useTaskStore.getState();
        expect(state.learningTasks).toContain(mockLearningTask); // Unchanged
        expect(state.isLoading).toBe(false);
        expect(state.error).toBe(errorMessage);
      });
    });
  });

  describe('Local Tasks (Legacy Compatibility)', () => {
    const mockLocalTask = { id: 'local-1', title: 'Local Task', completed: false };

    describe('addLocalTask', () => {
      test('should add local task', () => {
        const store = useTaskStore.getState();
        store.addLocalTask(mockLocalTask);

        const state = useTaskStore.getState();
        expect(state.localTasks).toContain(mockLocalTask);
      });
    });

    describe('removeLocalTask', () => {
      test('should remove local task', () => {
        useTaskStore.setState({ localTasks: [mockLocalTask] });

        const store = useTaskStore.getState();
        store.removeLocalTask('local-1');

        const state = useTaskStore.getState();
        expect(state.localTasks).toEqual([]);
      });
    });

    describe('toggleLocalTaskCompletion', () => {
      test('should toggle local task completion', () => {
        useTaskStore.setState({ localTasks: [mockLocalTask] });

        const store = useTaskStore.getState();
        store.toggleLocalTaskCompletion('local-1');

        const state = useTaskStore.getState();
        expect(state.localTasks[0].completed).toBe(true);

        // Toggle again
        store.toggleLocalTaskCompletion('local-1');
        const state2 = useTaskStore.getState();
        expect(state2.localTasks[0].completed).toBe(false);
      });
    });
  });

  describe('Utility Actions', () => {
    describe('clearError', () => {
      test('should clear error state', () => {
        useTaskStore.setState({ error: 'Some error' });

        const store = useTaskStore.getState();
        store.clearError();

        const state = useTaskStore.getState();
        expect(state.error).toBeNull();
      });
    });
  });

  describe('Integration Tests', () => {
    test('should maintain backward compatibility with legacy usage', () => {
      const store = useTaskStore.getState();

      // Legacy usage pattern
      store.addLocalTask({ id: '1', title: 'Legacy Task', completed: false });
      store.toggleLocalTaskCompletion('1');

      const state = useTaskStore.getState();
      expect(state.localTasks).toHaveLength(1);
      expect(state.localTasks[0].completed).toBe(true);
    });

    test('should support modern and legacy tasks simultaneously', async () => {
      const mockLearningTask: ILearningTask = {
        id: 1,
        title: 'Learning Task',
        description: 'Description',
        course: 1,
        is_published: true,
        order: 1,
        created_at: '2025-09-16T00:00:00Z',
        updated_at: '2025-09-16T00:00:00Z',
      };

      (modernLearningTaskService.getAllTasks as ReturnType<typeof vi.fn>).mockResolvedValue([mockLearningTask]);

      const store = useTaskStore.getState();

      // Add modern task
      await store.fetchLearningTasks('1');

      // Add legacy task
      store.addLocalTask({ id: 'local-1', title: 'Local Task', completed: false });

      const state = useTaskStore.getState();
      expect(state.learningTasks).toHaveLength(1);
      expect(state.localTasks).toHaveLength(1);
      expect(state.learningTasks[0].title).toBe('Learning Task');
      expect(state.localTasks[0].title).toBe('Local Task');
    });
  });
});