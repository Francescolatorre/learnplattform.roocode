import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useCourse } from '@hooks/useCourse';

const CourseDetailsPage: React.FC = () => {
    const { courseId } = useParams<{ courseId: string }>();
    const { data: course, isLoading, error, refetch } = useCourse(courseId);

    useEffect(() => {
        if (courseId) {
            refetch(); // Ensure data is fetched when courseId changes
        }
    }, [courseId, refetch]);

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error loading course details</div>;

    return (
        <div>
            <h1>{course?.title}</h1>
            <p>{course?.description}</p>
        </div>
    );
};

export default CourseDetailsPage;
