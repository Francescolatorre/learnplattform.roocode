import axios, { AxiosInstance } from 'axios';
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

    public async fetchStudentProgressByUser(studentId: BigInteger | null): Promise<CourseProgress[]> {
        if (!studentId) {
            throw new Error('studentId is required to fetch progress for a user.');
        }

        try {
            const response = await this.axiosInstance.get(`/students/${studentId}/progress/`);
            return Array.isArray(response.data) ? response.data.map(item => CourseProgressSchema.parse(item)) : [];
        } catch (error: any) {
            console.error('Error fetching progress for user:', error.response?.data || error.message);

            // Handle specific server errors
            if (error.response?.status === 500) {
                throw new Error('Internal Server Error: Please contact the administrator.');
            }

            throw new Error('Failed to fetch progress for the user.');
        }
    }

    public async fetchStudentProgressByCourse(courseId: string, studentId: string): Promise<CourseProgress> {
        if (!courseId || !studentId) {
            throw new Error('Both courseId and studentId are required to fetch progress for a specific course.');
        }

        try {
            const response = await this.axiosInstance.get(`/courses/${courseId}/student-progress/${studentId}/`);
            return CourseProgressSchema.parse(response.data);
        } catch (error: any) {
            console.error('Error fetching progress for course:', error.response?.data || error.message);
            if (error.response?.status === 404) {
                throw new Error('The requested progress data could not be found.');
            }
            throw new Error('Failed to fetch progress for the course.');
        }
    }

    public async fetchAllStudentsProgress(courseId: string): Promise<CourseProgress[]> {
        try {
            const response = await this.axiosInstance.get(`/courses/${courseId}/student-progress/`);
            return Array.isArray(response.data) ? response.data : [];
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
            return QuizHistorySchema.parse(response.data);
        } catch (error) {
            console.error('Error fetching quiz history:', error);
            throw error;
        }
    }

    public async getContentEffectivenessData(courseId: string): Promise<ContentEffectivenessData> {
        try {
            const response = await this.axiosInstance.get(`/courses/${courseId}/content-effectiveness`);
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

    public async fetchCourseDetails(courseId: string): Promise<any> {
        try {
            const response = await this.axiosInstance.get(`/courses/${courseId}/details/`);
            return response.data;
        } catch (error: any) {
            console.error('Error fetching course details:', error.response?.data || error.message);
            throw new Error('Failed to fetch course details.');
        }
    }
}

// Create a singleton instance
export const progressService = new ProgressService();

// Export all methods for backward compatibility
export const fetchStudentProgressByUser = progressService.fetchStudentProgressByUser.bind(progressService);
export const fetchStudentProgressByCourse = progressService.fetchStudentProgressByCourse.bind(progressService); // Keep this export
export const fetchAllStudentsProgress = progressService.fetchAllStudentsProgress.bind(progressService);
export const getQuizHistory = progressService.getQuizHistory.bind(progressService);
export const getContentEffectivenessData = progressService.getContentEffectivenessData.bind(progressService);
export const updateTaskProgress = progressService.updateTaskProgress.bind(progressService);
export const submitTask = progressService.submitTask.bind(progressService);
export const gradeSubmission = progressService.gradeSubmission.bind(progressService);
export const fetchCourseDetails = progressService.fetchCourseDetails.bind(progressService);

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

export const fetchCourseStructure = async (courseId: string): Promise<CourseStructure> => {
    const token = localStorage.getItem('access_token'); // Ensure token is retrieved
    if (!token) {
        throw new Error('No access token found. Please log in again.');
    }

    try {
        const response = await axios.get(`/api/v1/courses/${courseId}/analytics/`, {
            headers: {
                Authorization: `Bearer ${token}`, // Ensure the token is included
            },
        });
        return response.data;
    } catch (error: any) {
        console.error('Error fetching course structure:', error);
        throw new Error(
            error.response?.data?.error || 'An unexpected error occurred while fetching the course structure.'
        );
    }
};
