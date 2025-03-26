import { useState, useEffect } from 'react';
import { courseService } from '@services/apiService';

export const useCourse = (courseId: string) => {
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const data = await courseService.get(`/courses/${courseId}/`);
        console.log('Fetched course data:', data); // Debugging log
        setCourse(data);
      } catch (err: any) {
        console.error('Error fetching course:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  return { course, loading, error };
};
