import {apiService} from '../api/apiService';
import {IDashboardResponse} from '@/types/progress';

export const fetchDashboardData = async (userId: string | number): Promise<IDashboardResponse> => {
    try {
        if (!userId) {
            throw new Error('User ID is required');
        }
        const data = await apiService.get<IDashboardResponse>(`/api/v1/students/${userId}/dashboard/`);
        return data;
    } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        throw error;
    }
};

