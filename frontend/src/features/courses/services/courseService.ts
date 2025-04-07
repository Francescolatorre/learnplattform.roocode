import apiService from '@services/api/apiService';
import {Course, IPaginatedResponse} from '@typedefs/common';

class CourseService {
  private static BASE_URL = '/api/v1/courses/';

  public static async fetchCourses(filter?: string): Promise<IPaginatedResponse<Course>> {
    let url = this.BASE_URL;
    if (filter) {
      url += `?filter=${filter}`; // Assuming the backend supports a 'filter' query parameter
    }
    const response = (await apiService.get<IPaginatedResponse<Course>>(
      url
    )) as IPaginatedResponse<Course>;
    return response;
  }

  public static async fetchCourseById(courseId: number): Promise<Course> {
    const response = (await apiService.get<Course>(`${this.BASE_URL}${courseId}/`)) as Course;
    return response;
  }

  public static async createCourse(course: Partial<Course>): Promise<Course> {
    const response = await apiService.post<Course>(this.BASE_URL, course);
    return response;
  }

  public static async updateCourse(courseId: number, course: Partial<Course>): Promise<Course> {
    const response = await apiService.put<Course>(`${this.BASE_URL}${courseId}/`, course);
    return response;
  }

  public static async deleteCourse(courseId: number): Promise<void> {
    await apiService.delete(`${this.BASE_URL}${courseId}/`);
  }
}

export default CourseService;
