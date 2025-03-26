import React, { useEffect, useState } from 'react';
import { fetchStudentProgressByUser, fetchInstructorDashboardData } from '../services/progressService';
import { CourseProgress } from '../types/apiTypes';

const Dashboard: React.FC = () => {
    const [progressData, setProgressData] = useState<CourseProgress[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadProgress = async () => {
            setLoading(true);
            setError(null);
            try {
                const userId = localStorage.getItem('user_id'); // Assuming user ID is stored in localStorage
                if (!userId) throw new Error('User ID is missing.');
                const data = await fetchStudentProgressByUser(userId);
                setProgressData(data);
            } catch (err: any) {
                setError(err.message || 'Failed to load progress data.');
            } finally {
                setLoading(false);
            }
        };

        loadProgress();
    }, []);

    if (loading) return <p>Loading progress data...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div>
            <h1>Dashboard</h1>
            <ul>
                {progressData.map(progress => (
                    <li key={progress.courseId}>
                        Course ID: {progress.courseId}, Completion: {progress.completionPercentage}%
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Dashboard;
