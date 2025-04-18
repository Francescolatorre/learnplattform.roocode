import {ApiService} from 'src/services/api/apiService';
import {LearningTask, TaskCreationData} from 'src/types/common/entities';

import {API_CONFIG} from '../api/apiConfig';
import {logger} from 'src/utils/logger';

class LearningTaskServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LearningTaskServiceError';
  }
}
/**
 * Service for managing learning tasks, including CRUD operations and relationship queries.
 * Provides methods to interact with the backend API for learning tasks. All methods are asynchronous and strictly typed.
 */
class LearningTaskService {
  private apiTask = new ApiService<LearningTask>();
  private apiTasks = new ApiService<LearningTask[]>();
  private apiVoid = new ApiService<void>();
  private apiTasksResults = new ApiService<{
    count: number;
    next: string | null;
    previous: string | null;
    results: LearningTask[];
  }>();

  // Main CRUD operations
  /**
   * Fetch all learning tasks with optional query parameters.
   * @param params Query parameters as key-value pairs.
   * @returns Promise resolving to an array of LearningTask objects.
   */
  async getAll(params: Record<string, string> = {}): Promise<LearningTask[]> {
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
  async getById(taskId: string): Promise<LearningTask> {
    try {
      const response = await this.apiTask.get(API_CONFIG.endpoints.tasks.details(taskId));
      if (!response) {
        throw new LearningTaskServiceError('Task not found');
      }
      return response;
    } catch (error) {
      logger.error('Error fetching task by ID:', error);
      throw error;
    }
  }

  /**
   * Create a new learning task.
   * @param taskData The data for the new task.
   * @param notifyUsers Whether to notify users about the new task.
   * @returns Promise resolving to the created LearningTask object.
   */
  async create(
    taskData: TaskCreationData,
    notifyUsers = false
  ): Promise<LearningTask> {
    try {
      const formData = this.prepareFormData(taskData);
      formData.append('notifyUsers', String(notifyUsers));
      const response = await this.apiTask.post(API_CONFIG.endpoints.tasks.create, formData);
      return response;
    } catch (error) {
      logger.error('Error creating learning task:', error);
      throw new LearningTaskServiceError('Failed to create learning task');
    }
  }

  /**
   * Update an existing learning task.
   * @param taskId The ID of the task to update.
   * @param updatedData Partial data to update the task.
   * @returns Promise resolving to the updated LearningTask object.
   */
  async update(
    taskId: string,
    updatedData: Partial<LearningTask>
  ): Promise<LearningTask> {
    return this.apiTask.patch(API_CONFIG.endpoints.tasks.update(taskId), updatedData);
  }

  /**
   * Delete a learning task by its ID.
   * @param taskId The ID of the task to delete.
   * @returns Promise resolving when the task is deleted.
   */
  async delete(taskId: string): Promise<void> {
    await this.apiVoid.delete(API_CONFIG.endpoints.tasks.delete(taskId));
  }

  // Relationship-specific methods
  /**
   * Fetch all learning tasks assigned to a specific student.
   * Note: Based on the API spec, there's no direct endpoint for this.
   * @param studentId The ID of the student.
   * @returns Promise resolving to an array of LearningTask objects.
   * @throws Error if no tasks are found.
   */
  async getByStudentId(studentId: string): Promise<LearningTask[]> {
    try {
      const params = {student: studentId};
      const response = await this.apiTasksResults.get(`${API_CONFIG.endpoints.tasks.list}?${new URLSearchParams(params).toString()}`);
      if (!response || !Array.isArray(response.results) || response.results.length === 0) {
        throw new LearningTaskServiceError('Tasks not found');
      }
      return response.results;
    } catch (error) {
      logger.error('Error fetching tasks by student ID:', error);
      throw error;
    }
  }

  /**
   * Fetch all learning tasks for a specific course.
   * @param courseId The ID of the course.
   * @returns Promise resolving to an array of LearningTask objects.
   */
  async getByCourseId(courseId: string): Promise<LearningTask[]> {
    try {
      const response = await this.apiTasksResults.get(API_CONFIG.endpoints.tasks.byCourse(courseId));
      if (!response || !Array.isArray(response.results)) {
        throw new LearningTaskServiceError('No tasks found or invalid response structure');
      }
      return response.results;
    } catch (error) {
      logger.error('Error fetching tasks by course ID:', error);
      throw error;
    }
  }

  // Helper methods
  /**
   * Prepares form data for API requests.
   * @param data The data to prepare.
   * @returns A FormData object.
   */
  private prepareFormData(data: TaskCreationData): FormData {
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
export const fetchCourseTasks = async (courseId: string): Promise<LearningTask[]> =>
  learningTaskService.getByCourseId(courseId);
export const createTask = async (taskData: TaskCreationData, notifyUsers = false): Promise<LearningTask> =>
  learningTaskService.create(taskData, notifyUsers);
export const updateTask = async (taskId: string, updatedData: Partial<LearningTask>): Promise<LearningTask> =>
  learningTaskService.update(taskId, updatedData);
export const deleteTask = async (taskId: string): Promise<void> =>
  learningTaskService.delete(taskId);
