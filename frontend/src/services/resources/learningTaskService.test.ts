import { describe, it, expect, vi, beforeEach } from 'vitest';

import type { ILearningTask, ITaskCreationData } from '@/types/task';

import { API_CONFIG } from '../api/apiConfig';

import learningTaskService from './learningTaskService';

const mockTask: ILearningTask = {
  id: 1,
  course: 101,
  title: 'Sample Task',
  description: 'A test task',
  order: 1,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-02T00:00:00Z',
  is_published: true,
};

vi.mock('@/services/api/apiService', () => {
  const mockGet = vi.fn();
  const mockPost = vi.fn();
  const mockPut = vi.fn();
  const mockPatch = vi.fn();
  const mockDelete = vi.fn();
  Object.assign(globalThis, { mockGet, mockPost, mockPut, mockPatch, mockDelete });
  /**
   *
   */
  class MockApiService {
    get = mockGet;
    post = mockPost;
    put = mockPut;
    patch = mockPatch;
    delete = mockDelete;
  }
  return {
    ApiService: MockApiService,
    __esModule: true,
  };
});

describe('learningTaskService', () => {
  let mockGet: any, mockPost: any, mockPatch: any, mockDelete: any;
  beforeEach(() => {
    mockGet = (globalThis as any).mockGet;
    mockPost = (globalThis as any).mockPost;
    mockPatch = (globalThis as any).mockPatch;
    mockDelete = (globalThis as any).mockDelete;
    vi.clearAllMocks();
  });

  it('getAll calls apiService.get with correct endpoint', async () => {
    mockGet.mockResolvedValueOnce({ results: [mockTask] });
    const result = await learningTaskService.getAll({ course: '101' });
    expect(mockGet).toHaveBeenCalledWith(API_CONFIG.endpoints.tasks.list + '?course=101');
    expect(result).toEqual([mockTask]);
  });

  it('getById returns the task if found', async () => {
    mockGet.mockResolvedValueOnce(mockTask);
    const result = await learningTaskService.getById('1');
    expect(mockGet).toHaveBeenCalledWith(API_CONFIG.endpoints.tasks.details('1'));
    expect(result).toEqual(mockTask);
  });

  it('getById throws if task not found', async () => {
    mockGet.mockResolvedValueOnce(undefined);
    await expect(learningTaskService.getById('999')).rejects.toThrow('Task not found');
    expect(mockGet).toHaveBeenCalledWith(API_CONFIG.endpoints.tasks.details('999'));
  });

  it('create calls apiService.post and returns created task', async () => {
    mockPost.mockResolvedValueOnce(mockTask);
    const data: ITaskCreationData = {
      id: 2,
      title: 'New Task',
      course: 101,
      description: 'desc',
      order: 2,
      is_published: false,
    };
    const result = await learningTaskService.create(data, true);
    expect(mockPost).toHaveBeenCalled();
    expect(result).toEqual(mockTask);
  });

  it('create throws and logs error on failure', async () => {
    const error = new Error('Network error');
    mockPost.mockRejectedValueOnce(error);
    const data: ITaskCreationData = {
      id: 3,
      title: 'Fail Task',
      course: 101,
      description: 'desc',
      order: 3,
      is_published: false,
    };
    await expect(learningTaskService.create(data)).rejects.toThrow(
      'Failed to create learning task'
    );
    expect(mockPost).toHaveBeenCalled();
  });

  it('update calls apiService.patch and returns updated task', async () => {
    mockPatch.mockResolvedValueOnce(mockTask);
    const result = await learningTaskService.update('1', { title: 'Updated' });
    expect(mockPatch).toHaveBeenCalledWith('/api/v1/tasks/1/', { title: 'Updated' });
    expect(result).toEqual(mockTask);
  });

  it('delete calls apiService.delete', async () => {
    mockDelete.mockResolvedValueOnce(undefined);
    await learningTaskService.delete('1');
    expect(mockDelete).toHaveBeenCalledWith('/api/v1/tasks/1/');
  });

  it('getByStudentId returns tasks if found', async () => {
    mockGet.mockResolvedValueOnce({ results: [mockTask] });
    const result = await learningTaskService.getByStudentId('42');
    expect(mockGet).toHaveBeenCalledWith('/api/v1/tasks/?student=42');
    expect(result).toEqual([mockTask]);
  });

  it('getByStudentId throws if not found', async () => {
    mockGet.mockResolvedValueOnce({ results: [] });
    await expect(learningTaskService.getByStudentId('999')).rejects.toThrow('Tasks not found');
    expect(mockGet).toHaveBeenCalledWith('/api/v1/tasks/?student=999');
  });

  it('getByCourseId returns tasks from results', async () => {
    mockGet.mockResolvedValueOnce({ results: [mockTask] });
    const result = await learningTaskService.getByCourseId('101');
    expect(mockGet).toHaveBeenCalled();
    expect(result).toEqual([mockTask]);
  });

  it('getByCourseId returns empty array if no results', async () => {
    mockGet.mockResolvedValueOnce({ results: [] });
    const result = await learningTaskService.getByCourseId('101');
    expect(mockGet).toHaveBeenCalled();
    expect(result).toEqual([]);
  });
});
