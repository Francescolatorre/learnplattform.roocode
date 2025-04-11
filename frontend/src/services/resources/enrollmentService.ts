import {courseService} from 'src/services/resources/courseService';

import {apiService} from 'src/services/api/apiService';
import {Course, CourseEnrollment as Enrollment, User} from 'src/types/common/entities';
import {EnrollmentServiceType} from 'src/types/common/entities';

export interface IEnrollmentWithDetails {
  id: number;
  course: number;
  course_details: Course;
}

interface UserEnrollment {
  id: number;
  user: number;
  course: number;
  status: string;
  course_details: Course;
}

interface UserEnrollmentsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: UserEnrollment[];
}

const EnrollmentService = {
  getAll: async (params?: {}) => {
    try {
      const response = await (apiService<any>() as any).get(`/api/v1/enrollments`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching enrollments:', error);
      throw error;
    }
  },
  getById: async (id: string | number, params?: {}) => {
    try {
      const response = await (apiService<any>() as any).get(`/api/v1/enrollments/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching enrollment by ID:', error);
      throw error;
    }
  },
  create: async (data?: {}) => {
    try {
      const response = await (apiService<any>() as any).post('/api/v1/enrollments', data);
      return response.data;
    } catch (error: any) {
      console.error('Error creating enrollment:', error);
      throw error;
    }
  },
  update: async (id: string | number, data?: {}) => {
    try {
      const response = await (apiService<any>() as any).put(`/api/v1/enrollments/${id}`, data);
      return response.data;
    } catch (error: any) {
      console.error('Error updating enrollment:', error);
      throw error;
    }
  },
  delete: async (id: string | number) => {
    try {
      await (apiService<any>() as any).delete(`/api/v1/enrollments/${id}`);
    } catch (error: any) {
      console.error('Error deleting enrollment:', error);
      throw error;
    }
  },
} as EnrollmentServiceType;

EnrollmentService.fetchAllEnrollments = async () => {
  try {
    const response = await EnrollmentService.getAll();
    EnrollmentService.enrollments = response;
    // Fetch course details for each enrollment
    const enrollmentsWithDetails = await Promise.all(
      response.map(async enrollment => {
        const courseDetails = await courseService.getCourseDetails(enrollment.course.toString());
        return {
          id: enrollment.id,
          course: enrollment.course,
          course_details: courseDetails,
        };
      })
    );
    return enrollmentsWithDetails;
  } catch (error: any) {
    console.error('Error fetching all enrollments:', error);
    throw error;
  }
};

EnrollmentService.fetchUserEnrollments = async () => {
  console.info('fetchUserEnrollments function called');
  try {
    console.info('Fetching user enrollments...');
    const response = await (apiService<any>() as any).get('/api/v1/course-enrollments/');
    console.info('User enrollments response:', response);
    const mappedResults = response.results.map((enrollment: UserEnrollment) => ({
      ...enrollment,
      courseDetails: {
        ...enrollment.course_details, // Extract course details
      },
    }));
    return {...response, results: mappedResults as any};
  } catch (error) {
    console.error('Failed to fetch user enrollments:', error);
    throw error;
  }
};

EnrollmentService.fetchCourseEnrollments = async () => {
  const response = await (apiService<any>() as any).get('/api/v1/course-enrollments/');
  return response;
};

EnrollmentService.enrollInCourse = async (courseId: string) => {
  try {
    await (apiService<any>() as any).post('/api/v1/course-enrollments/', {course: courseId});
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
};

EnrollmentService.unenrollFromCourse = async (enrollmentId: string) => {
  try {
    await (apiService<any>() as any).delete(`/api/v1/course-enrollments/${enrollmentId}/`);
  } catch (error) {
    console.error('Failed to unenroll from course:', error);
    throw error;
  }
};

EnrollmentService.fetchEnrolledStudents = async (courseId: string) => {
  const response = await (apiService<any>() as any).get(`/api/v1/course-enrollments/?course=${courseId}`);
  return response.data;
} as EnrollmentServiceType;

export default EnrollmentService;
interface EnrollmentFilter {
  [key: string]: any;
}

export const findByFilter = async (filter: EnrollmentFilter): Promise<Enrollment[]> => {
  try {
    const response = await EnrollmentService.getAll({params: filter});
    return response;
  } catch (error: any) {
    console.error('Error fetching enrollments by filter:', error);
    throw error;
  }
};
