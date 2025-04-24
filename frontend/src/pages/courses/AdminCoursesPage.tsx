import {Button} from '@mui/material';
import {DataGrid, GridColDef, GridRenderCellParams} from '@mui/x-data-grid';
import React, {useState, useEffect} from 'react';
import {Link} from 'react-router-dom';

import {useErrorNotifier} from '@/components/ErrorNotifier/useErrorNotifier';
import CourseService from '@/services/resources/courseService';
import {ICourse} from '@/types/course';

const AdminCoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<ICourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const notify = useErrorNotifier();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await CourseService.fetchCourses();
        setCourses(data.results);
      } catch (err: unknown) {
        setError((err as Error).message || 'Failed to load courses.');
        // Use the centralized error notification system
        notify({
          message: (err as Error).message || 'Failed to load courses.',
          title: 'Course Loading Error',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [notify]);

  const columns: GridColDef[] = [
    {field: 'id', headerName: 'ID', width: 90},
    {field: 'title', headerName: 'Title', width: 200},
    {field: 'description', headerName: 'Description', width: 300},
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: (params: GridRenderCellParams<ICourse>) => (
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
    <div style={{height: 400, width: '100%'}}>
      <DataGrid rows={courses || []} columns={columns} getRowId={(row: ICourse) => row.id} />
    </div>
  );
};

export default AdminCoursesPage;
