import React, { useEffect, useState } from 'react';
import { fetchCourseVersions } from '../services/courseService';
import { CourseVersion } from '../types/courseTypes';

interface CourseVersionListProps {
  courseId: number;
}

const CourseVersionList: React.FC<CourseVersionListProps> = ({ courseId }) => {
  const [versions, setVersions] = useState<CourseVersion[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadVersions = async () => {
      try {
        const data = await fetchCourseVersions(courseId);
        setVersions(data);
      } catch {
        setError('Failed to load course versions');
      } finally {
        setLoading(false);
      }
    };

    loadVersions();
  }, [courseId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <h2>Course Versions</h2>
      <ul>
        {versions.map((version) => (
          <li key={version.id}>
            Version {version.version_number} - {version.created_at}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CourseVersionList;
