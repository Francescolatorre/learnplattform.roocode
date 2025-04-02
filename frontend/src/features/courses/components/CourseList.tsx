import React, { useEffect, useState } from 'react';

import CourseService from '@services/resources/courseService';

// Ensure courses have a proper type
interface ICourse {
  id: number;
  title: string;
  // ...other properties...
}

const CourseList: React.FC = () => {
  const [courses, setCourses] = useState<ICourse[]>([]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await CourseService.fetchCourses();
        setCourses(response.results);
      } catch (error) {
        console.error('Failed to fetch courses:', error);
      }
    };

    fetchCourses();
  }, []);

  return (
    <div>
      <h1>Courses</h1>
      <ul>
        {courses.map(course => (
          <li key={course.id}>{course.title}</li>
        ))}
      </ul>
    </div>
  );
};

export default CourseList;
