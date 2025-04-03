import React, { useState, useEffect } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { ICourse } from '@features/courses/types/courseTypes';
import { Link } from 'react-router-dom';
import { Button } from '@mui/material';

import CourseService from '@features/courses/services/courseService';

const AdminCoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<ICourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await CourseService.fetchCourses();
        setCourses(data.results);
      } catch (err: any) {
        setError((err as Error).message || 'Failed to load courses.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'title', headerName: 'Title', width: 200 },
    { field: 'description', headerName: 'Description', width: 300 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: (params: any) => (
        <Link to={`/admin/courses/${params.row.id}/edit`}>
          <Button size="small">Edit</Button>
        </Link>
      ),
    },
  ];

  if (loading) {
    return <div>Loading courses...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div style={{ height: 400, width: '100%' }}>
      <DataGrid rows={courses || []} columns={columns} getRowId={(row: any) => row.id} />
    </div>
  );
};

export default AdminCoursesPage;
