import React, { useEffect, useState } from 'react';

import { fetchCourseStructure } from '../services/resources/progressService';

const ProgressTrackingUI: React.FC = () => {
  const [courseStructure, setCourseStructure] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCourseStructure = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchCourseStructure();
        setCourseStructure(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load course structure.');
      } finally {
        setLoading(false);
      }
    };

    loadCourseStructure();
  }, []);

  if (loading) return <p>Loading course structure...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h1>Course Structure</h1>
      <pre>{JSON.stringify(courseStructure, null, 2)}</pre>
    </div>
  );
};

export default ProgressTrackingUI;
