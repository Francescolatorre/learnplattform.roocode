import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { fetchStudentProgressByCourse } from '../../services/progressService';

const CourseDetailsPage: React.FC<{ courseId: string; studentId: string }> = ({ courseId, studentId }) => {
    const { data: progressData, isLoading, error } = useQuery(
        ['studentProgressByCourse', courseId, studentId],
        () => {
            if (!courseId) {
                throw new Error('Missing required parameter: courseId');
            }
            if (!studentId) {
                throw new Error('Missing required parameter: studentId');
            }
            return fetchStudentProgressByCourse(courseId, studentId);
        },
        {
            staleTime: 5 * 60 * 1000, // 5 minutes
        }
    );

    useEffect(() => {
        if (error) {
            console.error('Error fetching student progress:', error);
        }
    }, [error]);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (!progressData) {
        return <div>No progress data available.</div>;
    }

    return (
        <div>
            <h1>Course Details</h1>
            <p>Course ID: {courseId}</p>
            <p>Student ID: {studentId}</p>
            <p>Completion Percentage: {progressData.completionPercentage}%</p>
        </div>
    );
};

export default CourseDetailsPage;
