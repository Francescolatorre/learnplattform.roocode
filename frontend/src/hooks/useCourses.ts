import { useState, useEffect } from 'react';
import { fetchCourses } from '../services/courseService';
import { Course, CourseError } from '../types/courseTypes';
import { useAuth } from '../features/auth/AuthContext';

export const useCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<CourseError | null>(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const loadCourses = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const { courses: fetchedCourses, error } = await fetchCourses();

        if (error) {
          setError(error);
          setCourses([]);
        } else {
          setCourses(fetchedCourses);
        }
      } catch (err) {
        setError({
          message: 'Failed to load courses',
          code: 500
        });
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, [isAuthenticated]);

  return {
    courses,
    loading,
    error,
    getCourseById: (courseId: number) =>
      courses.find(course => course.id === courseId)
  };
};
