import React, { useEffect, useState } from 'react';
import { fetchCourses } from '../services/courseService';
import { Course } from '../types/apiTypes';

const CourseList: React.FC = () => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadCourses = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await fetchCourses('active'); // Fetch active courses
                setCourses(data);
            } catch (err: any) {
                setError(err.message || 'Failed to load courses.');
            } finally {
                setLoading(false);
            }
        };

        loadCourses();
    }, []);

    if (loading) return <p>Loading courses...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div>
            <h1>Course List</h1>
            <ul>
                {courses.map(course => (
                    <li key={course.id}>
                        {course.title} - {course.description}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default CourseList;
