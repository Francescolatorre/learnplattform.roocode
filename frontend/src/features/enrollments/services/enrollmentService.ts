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
