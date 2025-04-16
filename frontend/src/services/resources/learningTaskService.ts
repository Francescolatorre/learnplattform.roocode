import {ApiService} from 'src/services/api/apiService';
import {LearningTask, TaskCreationData} from 'src/types/common/entities';

import {API_CONFIG} from '../api/apiConfig';

// Einheitliche Klasse mit allen Funktionen
/**
 * Service for managing learning tasks, including CRUD operations and relationship queries.
 * Provides methods to interact with the backend API for learning tasks.
 */
class LearningTaskService {
  private apiTask = new ApiService<LearningTask>();
  private apiTasks = new ApiService<LearningTask[]>();
  private apiVoid = new ApiService<void>();
  private apiTasksResults = new ApiService<{results: LearningTask[]}>();

  // Hauptmethoden für CRUD-Operationen
  /**
   * Fetch all learning tasks with optional query parameters.
   * @param params Query parameters as key-value pairs.
   * @returns Promise resolving to an array of LearningTask objects.
   */
  async getAll(params: Record<string, string> = {}): Promise<LearningTask[]> {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/api/v1/tasks/?${queryString}` : '/api/v1/tasks/';
    console.debug('Fetching all tasks with params:', params);
    console.debug('Constructed endpoint:', endpoint);
    console.debug('Query string:', queryString);
    return this.apiTasks.get(endpoint);
  }

  /**
   * Fetch a learning task by its ID.
   * @param taskId The ID of the learning task.
   * @returns Promise resolving to the LearningTask object.
   * @throws Error if the task is not found.
   */
  async getById(taskId: string): Promise<LearningTask> {
    const response = await this.apiTask.get(`/api/v1/tasks/${taskId}/`);
    if (!response) {
      throw new Error('Task not found');
    }
    return response;
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
    const formData = this.prepareFormData(taskData as Record<string, unknown>);
    formData.append('notifyUsers', String(notifyUsers));
    return this.apiTask.post('/api/v1/tasks/', formData);
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
    return this.apiTask.patch(`/api/v1/tasks/${taskId}/`, updatedData);
  }

  /**
   * Delete a learning task by its ID.
   * @param taskId The ID of the task to delete.
   * @returns Promise resolving when the task is deleted.
   */
  async delete(taskId: string): Promise<void> {
    await this.apiVoid.delete(`/api/v1/tasks/${taskId}/`);
  }

  // Beziehungsspezifische Methoden
  /**
   * Fetch all learning tasks assigned to a specific student.
   * @param studentId The ID of the student.
   * @returns Promise resolving to an array of LearningTask objects.
   * @throws Error if no tasks are found.
   */
  async getByStudentId(studentId: string): Promise<LearningTask[]> {
    const response = await this.apiTasks.get(`students/${studentId}/tasks`);
    if (!response) {
      throw new Error('Tasks not found');
    }
    return response;
  }

  /**
   * Fetch all learning tasks for a specific course.
   * @param courseId The ID of the course.
   * @returns Promise resolving to an array of LearningTask objects.
   */
  async getByCourseId(courseId: string): Promise<LearningTask[]> {
    // Einheitlicher Endpunkt aus Konfiguration verwenden
    return this.apiTasksResults.get(
      API_CONFIG.endpoints.courses.tasks(courseId)
    ).then(response => {
      if (!response || !Array.isArray(response.results)) {
        throw new Error('No tasks found or invalid response structure');
      }
      return response.results;
    });
  }

  // Hilfsmethoden
  /**
   *
   * @param data
   */
  private prepareFormData(data: Record<string, unknown>): FormData {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value instanceof File ? value : String(value));
      }
    });
    return formData;
  }

  /**
   * [Moved] The useTaskCreation React hook has been extracted to
   * 'frontend/src/services/resources/learningTaskHooks.ts' for separation of concerns.
   * Please import { useTaskCreation } from './learningTaskHooks' in React components.
   */
  /**
   * Set the Authorization token for all ApiService instances.
   * @param token The JWT access token.
   */
  public setAuthToken(token: string) {
    this.apiTask.setAuthToken(token);
    this.apiTasks.setAuthToken(token);
    this.apiVoid.setAuthToken(token);
    this.apiTasksResults.setAuthToken(token);
  }
}

// Singleton-Instanz exportieren
export const learningTaskService = new LearningTaskService();

// Für Backward-Kompatibilität die alten Funktionsnamen als Referenzen auf Methoden exportieren
export const fetchCourseTasks = async (courseId: string) =>
  learningTaskService.getByCourseId(courseId);
export const createTask = async (taskData: TaskCreationData, notifyUsers = false) =>
  learningTaskService.create(taskData, notifyUsers);
export const updateTask = async (taskId: string, updatedData: Partial<LearningTask>) =>
  learningTaskService.update(taskId, updatedData);
export const deleteTask = async (taskId: string) =>
  learningTaskService.delete(taskId);
/**
 * @deprecated useTaskCreation is now exported from './learningTaskHooks'.
 * Please update your imports to: import { useTaskCreation } from './learningTaskHooks'
 */
export {useTaskCreation} from './learningTaskHooks';

// Default-Export für Einfachheit
export default learningTaskService;
