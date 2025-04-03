import React, { useEffect, useState } from 'react';

import { fetchCourseStructure } from '@services/resources/progressService';

interface ProgressTrackingUIProps {
  courseStructure: any;
  loading: boolean;
  error: string | null;
}

const ProgressTrackingUI: React.FC<ProgressTrackingUIProps> = ({
  courseStructure,
  loading,
  error,
}) => {
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
