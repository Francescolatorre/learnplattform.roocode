import {IPaginatedResponse} from '@/types';
import {ILearningTask, ITaskCreationData} from '@/types/task';
import {ApiService} from 'src/services/api/apiService';
import {logger} from 'src/utils/logger';
import {withManagedExceptions} from 'src/utils/errorHandling';

import {API_CONFIG} from '../api/apiConfig';
/**
 * Service for managing learning tasks, including CRUD operations and relationship queries.
 * Provides methods to interact with the backend API for learning tasks. All methods are asynchronous and strictly typed.
 */
class LearningTaskService {
  private apiTask = new ApiService<ILearningTask>();
  private apiTasks = new ApiService<ILearningTask[]>();
  private apiVoid = new ApiService<void>();
  private apiTasksResults = new ApiService<IPaginatedResponse<ILearningTask>>();

  // Main CRUD operations
  /**
   * Fetch all learning tasks with optional query parameters.
   * @param params Query parameters as key-value pairs.
   * @returns Promise resolving to an array of LearningTask objects.
   */
  async getAll(params: Record<string, string> = {}): Promise<ILearningTask[]> {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString
      ? `${API_CONFIG.endpoints.tasks.list}?${queryString}`
      : API_CONFIG.endpoints.tasks.list;

    logger.debug('Fetching all tasks with params:', params);
    logger.debug('Constructed endpoint:', endpoint);

    const response = await this.apiTasksResults.get(endpoint);
    return response.results;
  }

  /**
   * Fetch a learning task by its ID.
   * @param taskId The ID of the learning task.
   * @returns Promise resolving to the LearningTask object.
   * @throws Error if the task is not found.
   */
  getById = withManagedExceptions(
    async (taskId: string): Promise<ILearningTask> => {
      const response = await this.apiTask.get(API_CONFIG.endpoints.tasks.details(taskId));
      if (!response) {
        throw new Error(`Task not found for ID: ${taskId}`);
      }
      return response;
    },
    {
      serviceName: 'LearningTaskService',
      methodName: 'getById',
    }
  );

  /**
   * Create a new learning task.
   * @param taskData The data for the new task.
   * @param notifyUsers Whether to notify users about the new task.
   * @returns Promise resolving to the created LearningTask object.
   */
  create = withManagedExceptions(
    async (taskData: ITaskCreationData, notifyUsers = false): Promise<ILearningTask> => {
      try {
        const formData = this.prepareFormData(taskData);
        formData.append('notifyUsers', String(notifyUsers));
        const response = await this.apiTask.post(API_CONFIG.endpoints.tasks.create, formData);
        return response;
      } catch (err) {
        throw new Error('Failed to create learning task');
      }
    },
    {
      serviceName: 'LearningTaskService',
      methodName: 'create',
    }
  );

  /**
   * Update an existing learning task.
   * @param taskId The ID of the task to update.
   * @param updatedData Partial data to update the task.
   * @returns Promise resolving to the updated LearningTask object.
   */
  update = withManagedExceptions(
    async (taskId: string, updatedData: Partial<ILearningTask>): Promise<ILearningTask> => {
      return this.apiTask.patch(API_CONFIG.endpoints.tasks.update(taskId), updatedData);
    },
    {
      serviceName: 'LearningTaskService',
      methodName: 'update',
    }
  );

  /**
   * Delete a learning task by its ID.
   * @param taskId The ID of the task to delete.
   * @returns Promise resolving when the task is deleted.
   */
  delete = withManagedExceptions(
    async (taskId: string): Promise<void> => {
      await this.apiVoid.delete(API_CONFIG.endpoints.tasks.delete(taskId));
    },
    {
      serviceName: 'LearningTaskService',
      methodName: 'delete',
    }
  );

  // Relationship-specific methods
  /**
   * Fetch all learning tasks assigned to a specific student.
   * Note: Based on the API spec, there's no direct endpoint for this.
   * @param studentId The ID of the student.
   * @returns Promise resolving to an array of LearningTask objects.
   * @throws Error if no tasks are found.
   */
  getByStudentId = withManagedExceptions(
    async (studentId: string): Promise<ILearningTask[]> => {
      const params = {student: studentId};
      const response = await this.apiTasksResults.get(
        `${API_CONFIG.endpoints.tasks.list}?${new URLSearchParams(params).toString()}`
      );
      if (!response || !Array.isArray(response.results) || response.results.length === 0) {
        throw new Error('Tasks not found');
      }
      return response.results;
    },
    {
      serviceName: 'LearningTaskService',
      methodName: 'getByStudentId',
    }
  );

  /**
   * Fetch all learning tasks for a specific course.
   * @param courseId The ID of the course.
   * @returns Promise resolving to an array of LearningTask objects.
   */
  getByCourseId = withManagedExceptions(
    async (courseId: string): Promise<ILearningTask[]> => {
      const response = await this.apiTasksResults.get(
        API_CONFIG.endpoints.tasks.byCourse(courseId)
      );

      // Check if response is directly an array
      if (Array.isArray(response)) {
        return response;
      }

      // Or check if it has a results property
      if (response && response.results && Array.isArray(response.results)) {
        return response.results;
      }

      // If neither is true
      throw new Error(`Invalid API response format for course ID: ${courseId}`);
    },
    {
      serviceName: 'LearningTaskService',
      methodName: 'getByCourseId',
    }
  );

  /**
   * Fetch all learning tasks for a specific course with a large page size to get all results.
   * @param courseId The ID of the course.
   * @returns Promise resolving to an array of all LearningTask objects for the course.
   */
  getAllTasksByCourseId = withManagedExceptions(
    async (courseId: string): Promise<ILearningTask[]> => {
      // Set parameters for large result set
      const params = {
        course: courseId,
        page_size: '999', // High value for maximum results per page
        page: '1', // Query first page
      };

      const queryString = new URLSearchParams(params).toString();
      const endpoint = `${API_CONFIG.endpoints.tasks.list}?${queryString}`;

      logger.debug('Fetching all tasks for course with params:', params);

      const response = await this.apiTasksResults.get(endpoint);

      // Handle both arrays and paginated responses
      if (Array.isArray(response)) {
        return response;
      } else if (response && response.results && Array.isArray(response.results)) {
        return response.results;
      }

      throw new Error(`Invalid API response format for course ID: ${courseId}`);
    },
    {
      serviceName: 'LearningTaskService',
      methodName: 'getAllTasksByCourseId',
    }
  );

  /**
   * Alternative fallback approach: Iterative retrieval of all pages if large page_size doesn't work
   */
  getAllTasksByCourseIdPaginated = withManagedExceptions(
    async (courseId: string, pageSize: number = 50): Promise<ILearningTask[]> => {
      let allTasks: ILearningTask[] = [];
      let currentPage = 1;
      let hasMorePages = true;

      while (hasMorePages) {
        const params = {
          course: courseId,
          page_size: pageSize.toString(),
          page: currentPage.toString(),
        };

        const queryString = new URLSearchParams(params).toString();
        const endpoint = `${API_CONFIG.endpoints.tasks.list}?${queryString}`;

        logger.debug(`Fetching page ${currentPage} of tasks for course ${courseId}`);

        const response = await this.apiTasksResults.get(endpoint);

        let pageTasks: ILearningTask[] = [];
        if (Array.isArray(response)) {
          pageTasks = response;
          hasMorePages = false; // If a direct array is returned, there is no next page
        } else if (response && response.results && Array.isArray(response.results)) {
          pageTasks = response.results;
          hasMorePages = !!response.next; // Check if there is a next page
        } else {
          throw new Error(`Invalid API response format for course ID: ${courseId}, page: ${currentPage}`);
        }

        allTasks = [...allTasks, ...pageTasks];

        // If no or empty results are returned, end the loop
        if (pageTasks.length === 0) {
          hasMorePages = false;
        }

        currentPage++;
      }

      return allTasks;
    },
    {
      serviceName: 'LearningTaskService',
      methodName: 'getAllTasksByCourseIdPaginated',
    }
  );

  // Helper methods
  /**
   * Prepares form data for API requests.
   * @param data The data to prepare.
   * @returns A FormData object.
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

  /**
   * Set the Authorization token for all ApiService instances.
   * @param token The JWT access token.
   */
  public setAuthToken(token: string): void {
    this.apiTask.setAuthToken(token);
    this.apiTasks.setAuthToken(token);
    this.apiVoid.setAuthToken(token);
    this.apiTasksResults.setAuthToken(token);
  }
}

// Export singleton instance
const learningTaskService = new LearningTaskService();
export default learningTaskService;

// For backward compatibility, export the old function names as references to methods
export const fetchCourseTasks = async (courseId: string): Promise<ILearningTask[]> =>
  learningTaskService.getByCourseId(courseId);
export const createTask = async (
  taskData: ITaskCreationData,
  notifyUsers = false
): Promise<ILearningTask> => learningTaskService.create(taskData, notifyUsers);
export const updateTask = async (
  taskId: string,
  updatedData: Partial<ILearningTask>
): Promise<ILearningTask> => learningTaskService.update(taskId, updatedData);
export const deleteTask = async (taskId: string): Promise<void> =>
  learningTaskService.delete(taskId);
