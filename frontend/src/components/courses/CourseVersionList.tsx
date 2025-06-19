import React from 'react';

import { ICourseVersion } from '@/types/course';

interface CourseVersionListProps {
  versions: ICourseVersion[];
}

const CourseVersionList: React.FC<CourseVersionListProps> = ({ versions }) => {
  return (
    <div>
      <h2>Course Versions</h2>
      <ul>
        {versions.map(version => (
          <li key={version.id}>Version ID: {version.id}</li>
        ))}
      </ul>
    </div>
  );
};

export default CourseVersionList;
