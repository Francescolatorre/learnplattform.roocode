import React from 'react';
import { useParams } from 'react-router-dom';
import { useCourse } from '../hooks/useCourse';

const CourseDetailsPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  if (!courseId) return <div>Course ID not provided</div>;

  const { course, loading, error } = useCourse(courseId);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  if (!course) return <div>Course not found</div>;

  return (
    <div>
      <h1>{course.title}</h1>
      <p>{course.description}</p>
      <p>Instructor: {course.instructor}</p>
      <p>Start Date: {course.startDate}</p>
      <p>End Date: {course.endDate}</p>
      <p>Modules: {course.modules.length}</p>
      <p>Duration: {course.duration} weeks</p>
      <p>Enrollment: {course.enrollment} students</p>
    </div>
  );
};

export default CourseDetailsPage;
