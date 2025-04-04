import React from 'react';
import { Course } from '@/types/common/entities';

interface CourseCardProps {
  course: Course;
}

const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  return (
    <div className="course-card">
      <h2>{course.title}</h2>
      <p>{course.description}</p>
    </div>
  );
};

export default CourseCard;
