import {LearningTask, TaskCreationData} from 'src/types/common/entities';
import {apiService} from 'src/services/api/apiService';
import {API_CONFIG} from '../api/apiConfig';

// Einheitliche Klasse mit allen Funktionen
class LearningTaskService {
  // Hauptmethoden für CRUD-Operationen
  async getAll(params: Record<string, string> = {}): Promise<LearningTask[]> {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `tasks?${queryString}` : 'tasks';
    return apiService<LearningTask[]>().get(endpoint);
  }

  async getById(taskId: string): Promise<LearningTask> {
    const response = await apiService<LearningTask>().get(`tasks/${taskId}`);
    if (!response) {
      throw new Error('Task not found');
    }
    return response;
  }

  async create(
    taskData: TaskCreationData,
    notifyUsers = false
  ): Promise<LearningTask> {
    const formData = this.prepareFormData(taskData);
    formData.append('notifyUsers', String(notifyUsers));
    return apiService<LearningTask>().post('tasks/', formData);
  }

  async update(
    taskId: string,
    updatedData: Partial<LearningTask>
  ): Promise<LearningTask> {
    return apiService<LearningTask>().patch(`tasks/${taskId}/`, updatedData);
  }

  async delete(taskId: string): Promise<void> {
    await apiService<void>().delete(`tasks/${taskId}/`);
  }

  // Beziehungsspezifische Methoden
  async getByStudentId(studentId: string): Promise<LearningTask[]> {
    const response = await apiService<LearningTask[]>().get(`students/${studentId}/tasks`);
    if (!response) {
      throw new Error('Tasks not found');
    }
    return response;
  }

  async getByCourseId(courseId: string): Promise<LearningTask[]> {
    // Einheitlicher Endpunkt aus Konfiguration verwenden
    return apiService<{results: LearningTask[]}>().get(
      API_CONFIG.endpoints.courses.tasks(courseId)
    ).then(response => response?.results || []);
  }

  // Hilfsmethoden
  private prepareFormData(data: Record<string, any>): FormData {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value instanceof File ? value : String(value));
      }
    });
    return formData;
  }

  // React Hooks
  useTaskCreation() {
    const handleTaskCreation = async (taskData: Omit<TaskCreationData, 'course'>) => {
      // TODO: Replace with actual course selection logic
      const courseId = 1;

      return this.create({
        ...taskData,
        course: courseId,
        is_published: taskData.is_published || false,
      });
    };

    return {createTask: handleTaskCreation};
  }
}

// Singleton-Instanz exportieren
export const learningTaskService = new LearningTaskService();

// Für Backward-Kompatibilität die alten Funktionsnamen als Referenzen auf Methoden exportieren
export const fetchCourseTasks = (courseId: string) =>
  learningTaskService.getByCourseId(courseId);
export const createTask = (taskData: TaskCreationData, notifyUsers = false) =>
  learningTaskService.create(taskData, notifyUsers);
export const updateTask = (taskId: string, updatedData: Partial<LearningTask>) =>
  learningTaskService.update(taskId, updatedData);
export const deleteTask = (taskId: string) =>
  learningTaskService.delete(taskId);
export const useTaskCreation = () =>
  learningTaskService.useTaskCreation();

// Default-Export für Einfachheit
export default learningTaskService;
