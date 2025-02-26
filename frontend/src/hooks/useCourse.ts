import { useState, useEffect } from 'react';
import { fetchCourseDetails, updateCourseProgress } from '../services/courseService';
import { CourseDetails, CourseError } from '../types/courseTypes';

export const useCourse = (courseId: string) => {
  const [course, setCourse] = useState<CourseDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<CourseError | null>(null);
  const [progress, setProgress] = useState<number>(0);

  const updateProgress = async (newProgress: number) => {
    try {
      const result = await updateCourseProgress(courseId, newProgress);
      if (result.success) {
        setProgress(newProgress);
      } else if (result.error) {
        setError(result.error || { message: 'An error occurred', code: 0 });
      }
    } catch (err) {
      setError({ 
        message: err instanceof Error ? err.message : 'An unexpected error occurred', 
        code: 0 
      });
    }
  };

  useEffect(() => {
    const getCourseDetails = async () => {
      try {
        const data = await fetchCourseDetails(courseId);
        
        // Type guard to check if the result is an error
        if ('error' in data) {
          setError(data.error || { message: 'An error occurred', code: 0 });
        } else {
          setCourse(data);
          setProgress(data.progress);
        }
      } catch (err) {
        setError({ 
          message: err instanceof Error ? err.message : 'An unexpected error occurred', 
          code: 0 
        });
      } finally {
        setLoading(false);
      }
    };

    getCourseDetails();
  }, [courseId]);

  return { course, loading, error, progress, updateProgress };
};
