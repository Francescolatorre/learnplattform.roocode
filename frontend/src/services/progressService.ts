import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { z } from 'zod';
import { CourseProgress, QuizHistory, ContentEffectivenessData } from '../types/progressTypes';

// Zod schemas for runtime type validation
const CourseProgressSchema = z.object({
    courseId: z.string(),
    studentId: z.string(),
    completedTasks: z.number().optional().default(0),
    totalTasks: z.number().optional().default(0),
    averageScore: z.number().optional().default(0),
    completionPercentage: z.number().optional().default(0),
    totalTimeSpent: z.number().optional().default(0),
    achievedObjectives: z.number().optional().default(0),
    totalObjectives: z.number().optional().default(0),
    moduleProgress: z.array(z.any()).optional().default([]),
    taskProgress: z.array(z.any()).optional().default([]),
    recentActivity: z.array(z.any()).optional().default([])
});

const QuizHistorySchema = z.array(z.object({
    quizId: z.string(),
    moduleId: z.string(),
    quizTitle: z.string(),
    score: z.number(),
    maxScore: z.number(),
    attempts: z.number(),
    maxAttempts: z.number(),
    date: z.string(),
    timeSpent: z.number(),
    answers: z.array(z.object({
        questionId: z.string(),
        questionText: z.string(),
        userAnswer: z.string(),
        correctAnswer: z.string(),
        isCorrect: z.boolean(),
        points: z.number(),
        maxPoints: z.number()
    })).optional()
}));

// Temporary type definition for CourseStructure
export interface CourseStructure {
    courseId: string;
    courseTitle: string;
    modules: {
        id: string;
        title: string;
        description: string;
        sections: {
            id: string;
            title: string;
            description: string;
            taskIds: string[];
        }[];
    }[];
    learningObjectives: string[];
}

class ProgressService {
    private axiosInstance: AxiosInstance;
    private API_BASE_URL: string;

    constructor() {
        this.API_BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1`;
        this.axiosInstance = axios.create({
            baseURL: this.API_BASE_URL,
            timeout: 10000, // 10 seconds
        });

        // Add request interceptor for authentication
        this.axiosInstance.interceptors.request.use(
            config => {
                const token = localStorage.getItem('access_token');
                if (token) {
                    config.headers['Authorization'] = `Bearer ${token}`;
                }
                return config;
            },
            error => Promise.reject(error)
        );
    }

    private getDefaultProgressObject(courseId: string, studentId?: string): CourseProgress {
        return {
            courseId: courseId,
            studentId: studentId || '',
            completedTasks: 0,
            totalTasks: 0,
            averageScore: 0,
            completionPercentage: 0,
            totalTimeSpent: 0,
            achievedObjectives: 0,
            totalObjectives: 0,
            moduleProgress: [],
            taskProgress: [],
            recentActivity: []
        };
    }

    public async fetchStudentProgress(courseId: string, studentId?: string): Promise<CourseProgress> {
        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                throw new Error('No access token found. Please log in again.');
            }

            const endpoint = studentId
                ? `/students/${studentId}/progress`
                : `/courses/${courseId}/student-progress/`;

            const response = await this.axiosInstance.get(endpoint, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            // Log the full response for debugging
            console.log('Progress Fetch Response:', {
                status: response.status,
                data: response.data,
                headers: response.headers
            });

            // Handle both array and object responses
            let progressData = response.data;

            // If it's an array, take the first item or return default
            if (Array.isArray(progressData)) {
                if (progressData.length === 0) {
                    console.warn('Empty progress array received');
                    return this.getDefaultProgressObject(courseId, studentId);
                }
                console.log('Multiple progress entries received. Using first entry.');
                progressData = progressData[0];
            }

            // Validate response data
            try {
                const parsedProgress = CourseProgressSchema.parse({
                    ...progressData,
                    courseId: courseId,
                    studentId: studentId || progressData.studentId || ''
                });

                console.log('Parsed Progress:', parsedProgress);
                return parsedProgress;
            } catch (validationError) {
                console.warn('Invalid progress data structure:', {
                    error: validationError,
                    rawData: progressData
                });
                return this.getDefaultProgressObject(courseId, studentId);
            }
        } catch (error) {
            console.error('Error fetching student progress:', {
                error,
                errorResponse: error.response?.data,
                errorStatus: error.response?.status
            });
            return this.getDefaultProgressObject(courseId, studentId);
        }
    }

    public fetchCourseStructure(courseId: string): Promise<CourseStructure> {
        try {
            const response = this.axiosInstance.get(`/courses/${courseId}/analytics/`);
            return response.then(res => res.data);
        } catch (error) {
            console.error('Error fetching course structure:', error);
            throw error;
        }
    }

    public async fetchAllStudentsProgress(courseId: string): Promise<CourseProgress[]> {
        try {
            const response = await this.axiosInstance.get(`/courses/${courseId}/student-progress/`);

            // Handle the case where the API returns an object instead of an array
            if (Array.isArray(response.data)) {
                return response.data;
            } else if (response.data && typeof response.data === 'object') {
                // If it's a single object, wrap it in an array
                if (response.data.courseId || response.data.course_id) {
                    return [response.data];
                }

                // If it has a results property that's an array, return that
                if (Array.isArray(response.data.results)) {
                    return response.data.results;
                }

                // Last resort: convert object to array of values
                const possibleArray = Object.values(response.data);
                if (Array.isArray(possibleArray) && possibleArray.length > 0) {
                    return possibleArray;
                }
            }

            // If we couldn't extract an array from the response, return an empty array
            console.warn('Unable to extract student progress data from response:', response.data);
            return [];
        } catch (error) {
            console.error('Error fetching all students progress:', error);
            return [];
        }
    }

    public async getQuizHistory(courseId: string, studentId?: string): Promise<QuizHistory[]> {
        try {
            const endpoint = studentId
                ? `/students/${studentId}/quiz-performance/`
                : `/courses/${courseId}/quiz-performance/`;

            const response = await this.axiosInstance.get(endpoint);

            // Validate response data
            try {
                return QuizHistorySchema.parse(response.data);
            } catch (validationError) {
                console.warn('Invalid quiz history data structure:', validationError);
                return [];
            }
        } catch (error) {
            console.error('Error fetching quiz history:', error);
            throw error;
        }
    }

    public async getContentEffectivenessData(courseId: string): Promise<ContentEffectivenessData> {
        try {
            const response = await this.axiosInstance.get(
                `/courses/${courseId}/content-effectiveness`
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching content effectiveness data:', error);
            throw error;
        }
    }

    public async updateTaskProgress(
        courseId: string,
        taskId: string,
        progressData: {
            status?: string;
            timeSpent?: number;
            score?: number;
            attempts?: number;
        }
    ): Promise<any> {
        try {
            const response = await this.axiosInstance.patch(
                `/courses/${courseId}/tasks/${taskId}/progress`,
                progressData
            );
            return response.data;
        } catch (error) {
            console.error('Error updating task progress:', error);
            throw error;
        }
    }

    public async submitTask(
        courseId: string,
        taskId: string,
        submissionData: any
    ): Promise<any> {
        try {
            const response = await this.axiosInstance.post(
                `/courses/${courseId}/tasks/${taskId}/submit`,
                submissionData
            );
            return response.data;
        } catch (error) {
            console.error('Error submitting task:', error);
            throw error;
        }
    }

    public async gradeSubmission(
        courseId: string,
        taskId: string,
        studentId: string,
        gradingData: {
            score: number;
            feedback?: string;
            rubricScores?: Record<string, number>;
        }
    ): Promise<any> {
        try {
            const response = await this.axiosInstance.post(
                `/courses/${courseId}/tasks/${taskId}/students/${studentId}/grade`,
                gradingData
            );
            return response.data;
        } catch (error) {
            console.error('Error grading submission:', error);
            throw error;
        }
    }
}

// Create a singleton instance
export const progressService = new ProgressService();

// Export all methods for backward compatibility
export const fetchStudentProgress = async (courseId: string, studentId?: string): Promise<CourseProgress> => {
    const token = getAuthToken();
    const endpoint = studentId
        ? `/students/${studentId}/progress`
        : `/courses/${courseId}/student-progress/`;

    try {
        const response = await axios.get(`${API_URL}${endpoint}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return CourseProgressSchema.parse(response.data);
    } catch (error) {
        console.error('Error fetching student progress:', error);
        throw new Error('Failed to fetch student progress.');
    }
};

export const updateCourseProgress = async (
    courseId: string,
    progress: number
): Promise<{ success: boolean; error: CourseError | null }> => {
    const token = getAuthToken();
    try {
        await axios.post(
            `${API_URL}/courses/${courseId}/progress/`,
            { progress },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            }
        );
        return { success: true, error: null };
    } catch (error) {
        console.error('Error updating course progress:', error);
        return { success: false, error: { message: 'Failed to update course progress.', code: 500 } };
    }
};

export const fetchCourseStructure = progressService.fetchCourseStructure.bind(progressService);
export const fetchAllStudentsProgress = progressService.fetchAllStudentsProgress.bind(progressService);
export const getQuizHistory = progressService.getQuizHistory.bind(progressService);
export const getContentEffectivenessData = progressService.getContentEffectivenessData.bind(progressService);
export const updateTaskProgress = progressService.updateTaskProgress.bind(progressService);
import axios from 'axios';

// Fetch instructor-specific dashboard data
export const fetchInstructorDashboardData = async () => {
    const token = localStorage.getItem('access_token'); // Ensure token is retrieved
    if (!token) {
        throw new Error('No access token found. Please log in again.');
    }

    try {
        const response = await axios.get('/api/v1/instructor/dashboard/', {
            headers: {
                Authorization: `Bearer ${token}`, // Ensure the token is included
            },
        });
        return response.data;
    } catch (error: any) {
        console.error('Error fetching instructor dashboard data:', error);
        throw new Error(
            error.response?.data?.error || 'An unexpected error occurred while fetching courses.'
        );
    }
};

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_URL = `${API_BASE_URL}/api/v1`;

const getAuthToken = () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
        console.error('No access token found in localStorage.');
        throw new Error('Authentication token is missing. Please log in again.');
    }
    return token;
};
