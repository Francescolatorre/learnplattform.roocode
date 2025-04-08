import apiService from '../api/apiService';
import {API_CONFIG} from '../api/apiConfig';
import {Course, CourseStatus} from 'src/types/common/entities';
import {IPaginatedResponse} from 'src/types/common';

export interface CourseFilterOptions {
    page?: number;
    page_size?: number;
    search?: string;
    status?: CourseStatus;
    creator?: number;
}

class CourseService {
    /**
     * Fetches a paginated list of courses with optional filtering
     */
    async fetchCourses(options: CourseFilterOptions = {}): Promise<IPaginatedResponse<Course>> {
        const queryParams = new URLSearchParams();

        if (options.page) queryParams.append('page', options.page.toString());
        if (options.page_size) queryParams.append('page_size', options.page_size.toString());
        if (options.search) queryParams.append('search', options.search);
        if (options.status) queryParams.append('status', options.status);
        if (options.creator) queryParams.append('creator', options.creator.toString());

        const url = `${API_CONFIG.endpoints.courses.list}?${queryParams.toString()}`;

        try {
            const response = await apiService.get<IPaginatedResponse<Course>>(url);
            return response.data;
        } catch (error) {
            console.error('Error fetching courses:', error);
            throw error;
        }
    }

    /**
     * Creates a new course
     */
    async createCourse(courseData: Partial<Course>): Promise<Course> {
        try {
            const response = await apiService.post<Course>(
                API_CONFIG.endpoints.courses.create,
                courseData
            );
            return response.data;
        } catch (error) {
            console.error('Error creating course:', error);
            throw error;
        }
    }

    /**
     * Retrieves detailed information for a specific course
     */
    async getCourseDetails(courseId: string): Promise<Course> {
        try {
            const response = await apiService.get<Course>(
                API_CONFIG.endpoints.courses.details(courseId)
            );
            if (!response.data) {
                throw new Error('Course not found');
            }
            return response.data;
        } catch (error) {
            console.error(`Error fetching course details for ID ${courseId}:`, error);
            throw error;
        }
    }

    /**
     * Updates an existing course
     */
    async updateCourse(courseId: string, courseData: Partial<Course>): Promise<Course> {
        try {
            const response = await apiService.patch<Course>(
                API_CONFIG.endpoints.courses.update(courseId),
                courseData
            );
            return response.data;
        } catch (error) {
            console.error(`Error updating course ${courseId}:`, error);
            throw error;
        }
    }

    /**
     * Deletes a course
     */
    async deleteCourse(courseId: string): Promise<void> {
        try {
            await apiService.delete(API_CONFIG.endpoints.courses.delete(courseId));
        } catch (error) {
            console.error(`Error deleting course ${courseId}:`, error);
            throw error;
        }
    }

    /**
     * Enrolls the current user in a course
     */
    async enrollInCourse(courseId: string): Promise<void> {
        try {
            await apiService.post(
                API_CONFIG.endpoints.courses.enroll(courseId),
                {course_id: courseId}
            );
        } catch (error) {
            console.error(`Error enrolling in course ${courseId}:`, error);
            throw error;
        }
    }

    /**
     * Unenrolls the current user from a course
     */
    async unenrollFromCourse(courseId: string): Promise<void> {
        try {
            await apiService.delete(API_CONFIG.endpoints.courses.unenroll(courseId));
        } catch (error) {
            console.error(`Error unenrolling from course ${courseId}:`, error);
            throw error;
        }
    }

    /**
     * Fetches courses where the current user is an instructor
     */
    async fetchInstructorCourses(): Promise<IPaginatedResponse<Course>> {
        try {
            const response = await apiService.get<IPaginatedResponse<Course>>(
                API_CONFIG.endpoints.courses.instructorCourses
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching instructor courses:', error);
            throw error;
        }
    }

    /**
     * Changes the status of a course
     */
    async updateCourseStatus(courseId: string, status: CourseStatus): Promise<Course> {
        try {
            const response = await apiService.patch<Course>(
                API_CONFIG.endpoints.courses.updateStatus(courseId),
                {status}
            );
            return response.data;
        } catch (error) {
            console.error(`Error updating course ${courseId} status:`, error);
            throw error;
        }
    }

    /**
     * Archives a course
     */
    async archiveCourse(courseId: string): Promise<Course> {
        return this.updateCourseStatus(courseId, 'archived');
    }

    /**
     * Publishes a course
     */
    async publishCourse(courseId: string): Promise<Course> {
        return this.updateCourseStatus(courseId, 'published');
    }

    /**
     * Fetches course progress for the current user
     */
    async fetchCourseProgress(courseId: string): Promise<any> {
        try {
            const response = await apiService.get(
                API_CONFIG.endpoints.courses.progress(courseId)
            );
            return response.data;
        } catch (error) {
            console.error(`Error fetching progress for course ${courseId}:`, error);
            throw error;
        }
    }

    /**
     * Fetches tasks for a specific course
     */
    async getCourseTasks(courseId: string): Promise<any> {
        try {
            const response = await apiService.get(
                API_CONFIG.endpoints.courses.tasks(courseId)
            );
            return response.data;
        } catch (error) {
            console.error(`Error fetching tasks for course ${courseId}:`, error);
            throw error;
        }
    }
}

export const courseService = new CourseService();
export default courseService;
