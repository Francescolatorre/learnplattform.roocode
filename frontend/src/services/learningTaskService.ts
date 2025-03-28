import apiService from './apiService';

export const fetchLearningTasks = async (page: number = 1) => {
    try {
        const response = await apiService.get('/api/v1/learning-tasks/', { params: { page } }); // Ensure /api/v1 prefix
        return response;
    } catch (error) {
        console.error('Failed to fetch learning tasks:', error);
        throw error;
    }
};

export const fetchTasksByCourse = async (courseId: string, page: number = 1) => {
    try {
        const response = await apiService.get(`/api/v1/learning-tasks/course/${courseId}/`, { params: { page } }); // Fetch tasks for a specific course
        return response;
    } catch (error) {
        console.error(`Failed to fetch tasks for courseId: ${courseId}`, error);
        throw error;
    }
};
