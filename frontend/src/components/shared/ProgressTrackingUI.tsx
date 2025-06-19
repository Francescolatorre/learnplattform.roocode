import React from 'react';

import { ICourseStructure } from '@/types/course';

interface ProgressTrackingUIProps {
  courseStructure: ICourseStructure;
  loading: boolean;
  error: Error | null;
}

const ProgressTrackingUI: React.FC<ProgressTrackingUIProps> = ({
  courseStructure,
  loading,
  error,
}) => {
  if (loading) return <p>Loading course structure...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      <h1>Course Structure</h1>
      <pre>{JSON.stringify(courseStructure, null, 2)}</pre>
    </div>
  );
};

export default ProgressTrackingUI;
