import apiService from '@services/api/apiService';
import {IEnrollment} from '../types/enrollmentTypes';
import {IPaginatedResponse} from '@src/types/paginatedResponse';

class EnrollmentService {
  private static BASE_URL = '/api/v1/course-enrollments/';

  public static async fetchUserEnrollments(): Promise<IPaginatedResponse<IEnrollment>> {
    try {
      const response = await apiService.get<IPaginatedResponse<IEnrollment>>(this.BASE_URL);
      const typedResponse = (await apiService.get<IPaginatedResponse<IEnrollment>>(this.BASE_URL)) as IPaginatedResponse<IEnrollment>;
      const mappedResults = typedResponse.results.map((enrollment: IEnrollment) => ({
        ...enrollment,
        courseDetails: {
          ...enrollment.course_details, // Extract course details
        },
      }));
      return {...typedResponse, results: mappedResults};
    } catch (error) {
      console.error('Failed to fetch user enrollments:', error);
      return Promise.resolve({results: [], count: 0, next: null, previous: null});
    }
  }

  public static async fetchCourseEnrollments(): Promise<IPaginatedResponse<IEnrollment>> {
    const response = await apiService.get<IPaginatedResponse<IEnrollment>>(this.BASE_URL);
    return (await apiService.get<IPaginatedResponse<IEnrollment>>(this.BASE_URL)) as IPaginatedResponse<IEnrollment>;
  }

  public static async enrollInCourse(courseId: string): Promise<void> {
    try {
      await apiService.post(this.BASE_URL, {course: courseId});
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
      params: {course: courseId},
    });
    return response.data;
  }
  public static async fetchEnrollmentDetails(courseId: string): Promise<IEnrollment> {
    try {
      const response = await apiService.get<any>(`${this.BASE_URL}${courseId}/`); // Changed to any to avoid type error
      return response.data as IEnrollment;
    } catch (error) {
      console.error('Failed to fetch enrollment details:', error);
      throw error;
    }
  }
}

export default EnrollmentService;
