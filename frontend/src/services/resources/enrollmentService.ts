import apiService from '../api/apiService';
import { IEnrollment, IPaginatedResponse } from '../../types/enrollmentTypes';

class EnrollmentService {
  private static BASE_URL = '/api/v1/course-enrollments/';

  public static async fetchUserEnrollments(): Promise<IPaginatedResponse<IEnrollment>> {
    try {
      const response = await apiService.get<IPaginatedResponse<IEnrollment>>(this.BASE_URL);
      const mappedResults = response.data.results.map(enrollment => ({
        ...enrollment,
        courseDetails: {
          ...enrollment.course_details, // Extract course details
        },
      }));
      return { ...response.data, results: mappedResults };
    } catch (error) {
      console.error('Failed to fetch user enrollments:', error);
      throw error;
    }
  }

  public static async fetchCourseEnrollments(): Promise<IPaginatedResponse<IEnrollment>> {
    const response = await apiService.get<IPaginatedResponse<IEnrollment>>(this.BASE_URL);
    return response.data;
  }

  public static async enrollInCourse(courseId: string): Promise<void> {
    try {
      await apiService.post(this.BASE_URL, { course: courseId });
    } catch (error: any) {
      console.error('API Error:', error);
      console.error('Response status:', error.response?.status);
      console.error('Response data:', error.response?.data);

      if (
        error.response?.status === 400 &&
        error.response?.data?.detail === 'You are already enrolled in this course.'
      ) {
        throw new Error('You are already enrolled in this course.');
      }

      throw error;
    }
  }

  public static async unenrollFromCourse(enrollmentId: string): Promise<void> {
    try {
      await apiService.delete(`${this.BASE_URL}${enrollmentId}/`);
    } catch (error) {
      console.error('Failed to unenroll from course:', error);
      throw error;
    }
  }

  public static async fetchEnrolledStudents(
    courseId: string
  ): Promise<IPaginatedResponse<IEnrollment>> {
    const response = await apiService.get<IPaginatedResponse<IEnrollment>>(this.BASE_URL, {
      params: { course: courseId },
    });
    return response.data;
  }
}

export default EnrollmentService;
