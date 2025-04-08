import apiService from '../../../services/api/apiService';
import CourseService from '@features/courses/services/courseService';
import {Course} from '../../../types/common/entities';

export interface Enrollment {
    id: number;
    course: number;
    user: number;
    status: string;
}

export interface EnrollmentServiceType {
    getAll: (params?: {}) => Promise<Enrollment[]>;
    getById: (id: string | number, params?: {}) => Promise<Enrollment>;
    create: (data?: {}) => Promise<Enrollment>;
    update: (id: string | number, data?: {}) => Promise<Enrollment>;
    delete: (id: string | number) => Promise<void>;
    enrollments?: Enrollment[];
    fetchAllEnrollments: () => Promise<IEnrollmentWithDetails[]>;
    fetchUserEnrollments: () => Promise<any>;
    fetchCourseEnrollments: () => Promise<any>;
    enrollInCourse: (courseId: string) => Promise<void>;
    unenrollFromCourse: (enrollmentId: string) => Promise<void>;
    fetchEnrolledStudents: (courseId: string) => Promise<any>;
}

export interface IEnrollmentWithDetails {
    id: number;
    course: number;
    course_details: Course;
}

const EnrollmentService = apiService.createResourceService<Enrollment>('/api/v1/enrollments') as EnrollmentServiceType;

EnrollmentService.fetchAllEnrollments = async () => {
    try {
        const response = await EnrollmentService.getAll();
        EnrollmentService.enrollments = response;
        // Fetch course details for each enrollment
        const enrollmentsWithDetails = await Promise.all(
            response.map(async (enrollment) => {
                const courseDetails = await CourseService.fetchCourseById(enrollment.course);
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
    console.log('fetchUserEnrollments function called');
    try {
        console.log('Fetching user enrollments...');
        const response = await apiService.get<any>('/api/v1/course-enrollments/');
        console.log('User enrollments response:', response);
        const mappedResults = response.results.map((enrollment: any) => ({
            ...enrollment,
            courseDetails: {
                ...enrollment.course_details, // Extract course details
            },
        }));
        return {...response, results: mappedResults};
    } catch (error) {
        console.error('Failed to fetch user enrollments:', error);
        throw error;
    }
};

EnrollmentService.fetchCourseEnrollments = async () => {
    const response = await apiService.get<any>('/api/v1/course-enrollments/');
    return response;
};

EnrollmentService.enrollInCourse = async (courseId: string) => {
    try {
        await apiService.post('/api/v1/course-enrollments/', {course: courseId});
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
        await apiService.delete(`/api/v1/course-enrollments/${enrollmentId}/`);
    } catch (error) {
        console.error('Failed to unenroll from course:', error);
        throw error;
    }
};

EnrollmentService.fetchEnrolledStudents = async (
    courseId: string
) => {
    const response = await apiService.get<any>('/api/v1/course-enrollments/', {
        params: {course: courseId},
    });
    return response.data;
};

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
