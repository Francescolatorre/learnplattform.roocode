import apiService from '../../../services/api/apiService';
import { ICourse, IPaginatedResponse } from '../types/courseTypes';

class CourseService {
  private static BASE_URL = '/api/v1/courses/';

  public static async fetchCourses(): Promise<IPaginatedResponse<ICourse>> {
    const response = await apiService.get<IPaginatedResponse<ICourse>>(this.BASE_URL);
    return response.data;
  }

  public static async fetchCourseById(courseId: number): Promise<ICourse> {
    const response = await apiService.get<ICourse>(`${this.BASE_URL}${courseId}/`);
    return response.data;
  }

  public static async createCourse(course: Partial<ICourse>): Promise<ICourse> {
    const response = await apiService.post<ICourse>(this.BASE_URL, course);
    return response.data;
  }

  public static async updateCourse(courseId: number, course: Partial<ICourse>): Promise<ICourse> {
    const response = await apiService.put<ICourse>(`${this.BASE_URL}${courseId}/`, course);
    return response.data;
  }

  public static async deleteCourse(courseId: number): Promise<void> {
    await apiService.delete(`${this.BASE_URL}${courseId}/`);
  }
}

export default CourseService;
