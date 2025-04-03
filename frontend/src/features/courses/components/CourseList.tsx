import React, {useEffect, useState} from 'react';

import CourseService from '@features/courses/services/courseService';

// Ensure courses have a proper type
interface ICourse {
  id: number;
  title: string;
  // ...other properties...
}


export interface CourseListProps {
  courses: ICourse[];
}

const CourseList: React.FC<CourseListProps> = ({courses}) => {
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
