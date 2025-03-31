import apiService from '@services/api/apiService';
import {ILearningTask} from '../types/learningTaskTypes';
import {IPaginatedResponse} from '../../types/paginatedResponse';

class LearningTaskService {
  private static BASE_URL = '/api/v1/learning-tasks/';

  public static async fetchLearningTasks(): Promise<IPaginatedResponse<ILearningTask>> {
    const response = (await apiService.get<IPaginatedResponse<ILearningTask>>(this.BASE_URL)) as IPaginatedResponse<ILearningTask>;
    return response;
  }

  public static async fetchLearningTaskById(taskId: number): Promise<ILearningTask> {
    const response = await apiService.get<ILearningTask>(`${this.BASE_URL}${taskId}/`);
    return response.data;
  }

  public static async createLearningTask(task: Partial<ILearningTask>): Promise<ILearningTask> {
    const response = await apiService.post<ILearningTask>(this.BASE_URL, task);
    return response.data;
  }

  public static async updateLearningTask(
    taskId: number,
    task: Partial<ILearningTask>
  ): Promise<ILearningTask> {
    const response = await apiService.put<ILearningTask>(`${this.BASE_URL}${taskId}/`, task);
    return response.data;
  }

  public static async deleteLearningTask(taskId: number): Promise<void> {
    await apiService.delete(`${this.BASE_URL}${taskId}/`);
  }
}

export default LearningTaskService;
