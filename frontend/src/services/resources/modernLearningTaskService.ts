/* eslint-disable import/order */
/**
 * Modern Learning Task Service (2025 Best Practices)
 * 
 * Key improvements over the original implementation:
 * - Single API client using composition
 * - Cleaner method signatures with better type inference
 * - Functional approach with minimal state
 * - Better error handling patterns
 * - Simplified FormData handling
 */

import { ILearningTask, ITaskCreationData } from '@/types/Task';
import { withManagedExceptions } from '@/utils/errorHandling';
import { logger } from '@/utils/logger';
import { BaseService, ServiceConfig } from '../factory/serviceFactory';

/**
 * Task query parameters interface
 */
export interface TaskQueryParams {
  student?: string;
  course?: string;
  page?: number;
  page_size?: number;
  status?: string;
  [key: string]: unknown;
}

/**
 * Modern Learning Task Service implementation
 */
export class ModernLearningTaskService extends BaseService {
  constructor(config?: ServiceConfig) {
    super(config);
  }

  /**
   * Get all learning tasks with optional query parameters
   */
  async getAllTasks(params: TaskQueryParams = {}): Promise<ILearningTask[]> {
    return withManagedExceptions(
      async () => {
        const url = this.buildUrl(this.endpoints.tasks.list, params);
        logger.debug('Fetching all tasks with params:', params);
        logger.debug('Constructed endpoint:', url);

        const response = await this.apiClient.get(url);
        return this.normalizeArrayResponse<ILearningTask>(response);
      },
      {
        serviceName: 'ModernLearningTaskService',
        methodName: 'getAllTasks',
      }
    )();
  }

  /**
   * Get learning task by ID
   */
  async getTaskById(taskId: string): Promise<ILearningTask> {
    return withManagedExceptions(
      async () => {
        const response = await this.apiClient.get<ILearningTask>(
          this.endpoints.tasks.details(taskId)
        );
        
        if (!response) {
          throw new Error(`Task not found for ID: ${taskId}`);
        }
        
        return response;
      },
      {
        serviceName: 'ModernLearningTaskService',
        methodName: 'getTaskById',
      }
    )();
  }

  /**
   * Create a new learning task
   */
  async createTask(taskData: ITaskCreationData, notifyUsers = false): Promise<ILearningTask> {
    return withManagedExceptions(
      async () => {
        const formData = this.prepareFormData(taskData);
        formData.append('notifyUsers', String(notifyUsers));
        
        return this.apiClient.post<ILearningTask>(
          this.endpoints.tasks.create,
          formData
        );
      },
      {
        serviceName: 'ModernLearningTaskService',
        methodName: 'createTask',
      }
    )();
  }

  /**
   * Update an existing learning task
   */
  async updateTask(taskId: string, updatedData: Partial<ILearningTask>): Promise<ILearningTask> {
    return withManagedExceptions(
      async () => {
        return this.apiClient.patch<ILearningTask>(
          this.endpoints.tasks.update(taskId),
          updatedData
        );
      },
      {
        serviceName: 'ModernLearningTaskService',
        methodName: 'updateTask',
      }
    )();
  }

  /**
   * Delete a learning task
   */
  async deleteTask(taskId: string): Promise<void> {
    return withManagedExceptions(
      async () => {
        await this.apiClient.delete<void>(
          this.endpoints.tasks.delete(taskId)
        );
      },
      {
        serviceName: 'ModernLearningTaskService',
        methodName: 'deleteTask',
      }
    )();
  }

  /**
   * Get learning tasks for a specific student
   */
  async getTasksByStudentId(studentId: string): Promise<ILearningTask[]> {
    return withManagedExceptions(
      async () => {
        const params = { student: studentId };
        const response = await this.apiClient.get(
          this.buildUrl(this.endpoints.tasks.list, params)
        );
        
        const tasks = this.normalizeArrayResponse<ILearningTask>(response);
        
        if (tasks.length === 0) {
          throw new Error('Tasks not found');
        }
        
        return tasks;
      },
      {
        serviceName: 'ModernLearningTaskService',
        methodName: 'getTasksByStudentId',
      }
    )();
  }

  /**
   * Get learning tasks for a specific course
   */
  async getTasksByCourseId(courseId: string): Promise<ILearningTask[]> {
    return withManagedExceptions(
      async () => {
        const response = await this.apiClient.get(
          this.endpoints.tasks.byCourse(courseId)
        );
        
        const tasks = this.normalizeArrayResponse<ILearningTask>(response);
        
        if (tasks.length === 0) {
          logger.debug(`No tasks found for course ${courseId}`);
        }
        
        return tasks;
      },
      {
        serviceName: 'ModernLearningTaskService',
        methodName: 'getTasksByCourseId',
      }
    )();
  }

  /**
   * Get all tasks for a course with large page size
   */
  async getAllTasksByCourseId(courseId: string): Promise<ILearningTask[]> {
    return withManagedExceptions(
      async () => {
        const params = {
          course: courseId,
          page_size: '999',
          page: '1',
        };

        const url = this.buildUrl(this.endpoints.tasks.list, params);
        logger.debug('Fetching all tasks for course with params:', params);

        const response = await this.apiClient.get(url);
        return this.normalizeArrayResponse<ILearningTask>(response);
      },
      {
        serviceName: 'ModernLearningTaskService',
        methodName: 'getAllTasksByCourseId',
      }
    )();
  }

  /**
   * Get all tasks for a course using paginated approach
   */
  async getAllTasksByCourseIdPaginated(courseId: string, pageSize = 50): Promise<ILearningTask[]> {
    return withManagedExceptions(
      async () => {
        let allTasks: ILearningTask[] = [];
        let currentPage = 1;
        let hasMorePages = true;

        while (hasMorePages) {
          const params = {
            course: courseId,
            page_size: pageSize.toString(),
            page: currentPage.toString(),
          };

          const url = this.buildUrl(this.endpoints.tasks.list, params);
          logger.debug(`Fetching page ${currentPage} of tasks for course ${courseId}`);

          const response = await this.apiClient.get(url);
          const normalizedResponse = this.normalizePaginatedResponse<ILearningTask>(response);
          
          allTasks = [...allTasks, ...normalizedResponse.results];
          hasMorePages = !!normalizedResponse.next && normalizedResponse.results.length > 0;
          currentPage++;
        }

        return allTasks;
      },
      {
        serviceName: 'ModernLearningTaskService',
        methodName: 'getAllTasksByCourseIdPaginated',
      }
    )();
  }

  /**
   * Get task progress counts for deletion authorization
   */
  async getTaskProgressCounts(taskIds: string[]): Promise<Record<string, { inProgress: number; completed: number }>> {
    return withManagedExceptions(
      async () => {
        if (taskIds.length === 0) return {};

        const requestBody = { 
          task_ids: taskIds.map(id => parseInt(id)) 
        };

        const response = await this.apiClient.post<Record<string, { in_progress: number; completed: number }>>(
          `${this.endpoints.tasks.list}progress-counts/`,
          requestBody
        );

        // Convert API response to expected format
        const result: Record<string, { inProgress: number; completed: number }> = {};
        Object.entries(response || {}).forEach(([taskId, counts]) => {
          result[taskId] = {
            inProgress: counts.in_progress || 0,
            completed: counts.completed || 0,
          };
        });

        return result;
      },
      {
        serviceName: 'ModernLearningTaskService',
        methodName: 'getTaskProgressCounts',
      }
    )();
  }

  /**
   * Prepare FormData for API requests
   * Private helper method following composition principles
   */
  private prepareFormData(data: ITaskCreationData): FormData {
    const formData = new FormData();
    
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value instanceof File ? value : String(value));
      }
    });
    
    return formData;
  }
}

// Create singleton instance using the factory
import { ServiceFactory } from '../factory/serviceFactory';
const serviceFactory = ServiceFactory.getInstance();
export const modernLearningTaskService = serviceFactory.getService(ModernLearningTaskService);

// Backward compatibility exports (to be deprecated)
export const fetchCourseTasks = (courseId: string): Promise<ILearningTask[]> =>
  modernLearningTaskService.getTasksByCourseId(courseId);

export const createTask = (taskData: ITaskCreationData, notifyUsers = false): Promise<ILearningTask> =>
  modernLearningTaskService.createTask(taskData, notifyUsers);

export const updateTask = (taskId: string, updatedData: Partial<ILearningTask>): Promise<ILearningTask> =>
  modernLearningTaskService.updateTask(taskId, updatedData);

export const deleteTask = (taskId: string): Promise<void> =>
  modernLearningTaskService.deleteTask(taskId);

export const getTaskProgressCounts = (taskIds: string[]) =>
  modernLearningTaskService.getTaskProgressCounts(taskIds);

// Export the service class for testing and direct usage
export default modernLearningTaskService;