import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { z } from 'zod';
import { CourseProgress, QuizHistory, ContentEffectivenessData } from '../types/progressTypes';

// Zod schemas for runtime type validation
const CourseProgressSchema = z.object({
    courseId: z.string(),
    studentId: z.string(),
    completedTasks: z.number(),
    totalTasks: z.number(),
    averageScore: z.number(),
    completionPercentage: z.number(),
    totalTimeSpent: z.number(),
    achievedObjectives: z.number(),
    totalObjectives: z.number(),
    moduleProgress: z.array(z.any()),
    taskProgress: z.array(z.any()),
    recentActivity: z.array(z.any())
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

    // Exported methods to maintain backward compatibility
    public async fetchStudentProgress(courseId: string, studentId?: string): Promise<CourseProgress> {
        try {
            const endpoint = studentId
                ? `/students/${studentId}/progress`
                : `/courses/${courseId}/student-progress/`;

            const response = await this.axiosInstance.get(endpoint);

            // Validate response data
            try {
                return CourseProgressSchema.parse(response.data);
            } catch (validationError) {
                console.warn('Invalid progress data structure:', validationError);
                return this.getDefaultProgressObject(courseId, studentId);
            }
        } catch (error) {
            console.error('Error fetching student progress:', error);
            return this.getDefaultProgressObject(courseId, studentId);
        }
    }

    public async fetchCourseStructure(courseId: string): Promise<CourseStructure> {
        try {
            const response = await this.axiosInstance.get(`/courses/${courseId}/analytics/`);
            return response.data;
        } catch (error) {
            console.error('Error fetching course structure:', error);
            throw error;
        }
    }

    async fetchAllStudentsProgress(courseId: string): Promise<CourseProgress[]> {
        try {
            const response = await this.axiosInstance.get(`/courses/${courseId}/student-progress/`);
            return response.data;
        } catch (error) {
            console.error('Error fetching all students progress:', error);
            throw error;
        }
    }

    async getQuizHistory(courseId: string, studentId?: string): Promise<QuizHistory[]> {
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

    async updateTaskProgress(
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

    async submitTask(
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

    async gradeSubmission(
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

    async getContentEffectivenessData(courseId: string): Promise<ContentEffectivenessData> {
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
}

export const progressService = new ProgressService();

// Exported methods for backward compatibility
export const {
    fetchStudentProgress,
    fetchCourseStructure
} = progressService;
