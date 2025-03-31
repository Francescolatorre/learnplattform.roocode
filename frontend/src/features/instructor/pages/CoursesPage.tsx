import React, { useEffect, useState } from 'react';
import { fetchCourses } from '@services/courseService'; // Use fetchCourses for API requests

import { Course } from '../../types/apiTypes'; // Reuse the existing Course interface

const CoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCourses = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetchCourses('active');
        const coursesData = Array.isArray(response) ? response : [];
        console.log('response from fetchCourses:', response);
        setCourses(coursesData);
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch courses.');
      } finally {
        setIsLoading(false);
      }
    };

    loadCourses();
  }, []);

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Something went wrong: {error}</p>;

  return (
    <div>
      <h1>Instructor Courses</h1>
      {courses.length > 0 ? (
        <ul>
          {courses.map(course => {
            console.log('courses before map:', courses);
            console.log('courses:', courses);
            return (
              <li key={course.id}>
                <h2>{course.title}</h2>
                {course.description && <p>{course.description}</p>}
              </li>
            );
          })}
        </ul>
      ) : (
        <p>No courses available.</p>
      )}
    </div>
  );
};

export default CoursesPage;
