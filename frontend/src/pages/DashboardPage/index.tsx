import React from 'react';
import DashboardPage from 'src/components/DashboardPage/index';

interface DashboardPageProps {
  courseProgress: any;
}

const DashboardPageComp: React.FC<DashboardPageProps> = ({ courseProgress }) => {
  return <DashboardPage courseProgress={courseProgress} />;
};

export default DashboardPageComp;
