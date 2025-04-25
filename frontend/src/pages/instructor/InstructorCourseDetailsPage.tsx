import {LinearProgress, Typography, Box, Alert, CircularProgress, Pagination} from '@mui/material';
import React, {useState, useEffect} from 'react';
import {useParams} from 'react-router-dom';

import {IStudentProgressSummary} from '@/types'; // Update to include student progress type
import {ILearningTask} from '@/types/task';
import {ICourse} from '@/types/course'; // Add course type import
import {courseService} from '@services/resources/courseService'; // Ensure fetchCourseById is a named export
import learningTaskService from '@services/resources/learningTaskService';
import progressService from '@services/resources/progressService'; // Replace with appropriate method

// Define styles
const styles: {[key: string]: React.CSSProperties} = {
  errorContainer: {color: 'red'},
  container: {padding: '20px'},
  header: {fontSize: '24px', fontWeight: 'bold'},
  loadingContainer: {textAlign: 'center'},
  infoSection: {marginTop: '20px'},
  tasksSection: {marginTop: '30px'},
  tasksTitle: {fontSize: '20px', fontWeight: 'bold'},
  progressSection: {marginTop: '20px'},
  infoCard: {border: '1px solid #ccc', borderRadius: '5px', padding: '10px', marginBottom: '10px'},
  infoTitle: {fontSize: '18px', fontWeight: 'bold'},
  infoContent: {fontSize: '14px'},
};

const InstructorCourseDetailPage: React.FC = () => {
  const {courseId} = useParams<{courseId: string}>();
  const [course, setCourse] = useState<ICourse | null>(null); // Add course state
  const [tasks, setTasks] = useState<ILearningTask[]>([]);
  const [studentsProgress, setStudentsProgress] = useState<IStudentProgressSummary[]>([]); // Replace with students progress
  const [isLoading, setIsLoading] = useState<boolean>(true); // Add loading state
  const [error, setError] = useState<string | null>(null); // Add error state
  const [isLoadingProgress, setIsLoadingProgress] = useState<boolean>(false); // Add loading state for progress
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    pageSize: 100
  }); // Add pagination state

  // Load course data
  useEffect(() => {
    const loadCourseData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const courseData = await courseService.getCourseDetails(courseId);
        setCourse(courseData);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch course';
        setError(errorMessage);
        console.error('Failed to fetch course:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCourseData();
  }, [courseId]);

  // Load tasks separately
  useEffect(() => {
    const loadTasks = async () => {
      if (!courseId) return;

      try {
        const fetchedTasks = await learningTaskService.getByCourseId(courseId);
        setTasks(fetchedTasks);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch tasks';
        setError(prev => prev || errorMessage); // Don't override existing errors
        console.error('Failed to fetch tasks:', error);
      }
    };

    loadTasks();
  }, [courseId]);

  // Alternative: Load ALL pages of student progress data
  useEffect(() => {
    const loadAllStudentsProgress = async () => {
      if (!courseId) {
        console.error('Error: courseId is undefined. Cannot fetch student progress.');
        return;
      }

      setIsLoadingProgress(true);

      try {
        // Start with first page
        const firstPageResponse = await progressService.fetchAllStudentsProgress(courseId, {
          page: 1,
          pageSize: 100 // Use larger page size to reduce number of requests
        });

        // Calculate total pages
        const totalPages = Math.ceil(firstPageResponse.count / 100);

        // Add first page results to our collection
        let allProgress = [...firstPageResponse.results];

        // If more pages exist, fetch them
        if (totalPages > 1) {
          const otherPagePromises = [];

          // Create promises for all other pages
          for (let page = 2; page <= totalPages; page++) {
            otherPagePromises.push(
              progressService.fetchAllStudentsProgress(courseId, {page, pageSize: 100})
            );
          }

          // Wait for all promises to resolve
          const otherPagesResponses = await Promise.all(otherPagePromises);

          // Add all results to our collection
          otherPagesResponses.forEach(response => {
            allProgress = [...allProgress, ...response.results];
          });
        }

        // Update state with all progress data
        setStudentsProgress(allProgress);

        // Update pagination metadata for informational purposes
        setPagination({
          currentPage: 1, // Set to 1 since we're showing all data
          totalPages: 1,
          totalItems: firstPageResponse.count,
          pageSize: firstPageResponse.count
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch progress';
        setError(prev => prev || errorMessage);
        console.error('Failed to fetch student progress:', error);
      } finally {
        setIsLoadingProgress(false);
      }
    };

    loadAllStudentsProgress();
  }, [courseId]);

  // Handle page change for pagination
  const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
    setPagination(prev => ({...prev, currentPage: page}));
    // Here you would typically fetch the specific page of data
    // But since we're loading all data at once, we don't need to re-fetch
  };

  // Handle loading state
  if (isLoading || isLoadingProgress) {
    return (
      <div style={styles.loadingContainer}>
        <CircularProgress />
        <Typography variant="h6" sx={{mt: 2}}>Loading course information...</Typography>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div style={styles.container}>
        <Alert severity="error" sx={{mb: 2}}>
          {error}
        </Alert>
        <Typography variant="body1">
          Please try refreshing the page or contact support if the problem persists.
        </Typography>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {course && (
        <div style={styles.header}>
          <h1 style={styles.title}>{course.title}</h1>
          <p style={styles.description}>{course.description}</p>
        </div>
      )}

      {/* Display students progress summary with pagination */}
      <div style={styles.progressSection}>
        <Typography variant="h6" style={{marginBottom: 10, color: '#007bff'}}>
          Students Progress Overview
        </Typography>
        {studentsProgress.length > 0 ? (
          <>
            <StudentsProgressSummary studentsProgress={studentsProgress} />
            {/* Pagination controls */}
            <Box sx={{display: 'flex', justifyContent: 'center', mt: 3}}>
              <Pagination
                count={pagination.totalPages}
                page={pagination.currentPage}
                onChange={handlePageChange}
              />
            </Box>
            <Typography variant="body2" sx={{display: 'block', textAlign: 'center', mt: 1}}>
              Showing {studentsProgress.length} of {pagination.totalItems} students
            </Typography>
          </>
        ) : (
          <Typography variant="body1">No student progress data available</Typography>
        )}
      </div>

      {course && (
        <div style={styles.infoSection}>
          <InfoCard title="Instructor">
            {course.creator_details
              ? course.creator_details.display_name || course.creator_details.username
              : 'Not assigned'}
          </InfoCard>

          <InfoCard title="Status">{course.status || 'Not specified'}</InfoCard>

          <InfoCard title="Prerequisites">
            {Array.isArray(course.prerequisites)
              ? course.prerequisites.join(', ')
              : course.prerequisites || 'None'}
          </InfoCard>

          <InfoCard title="Learning Objectives">
            {Array.isArray(course.learning_objectives)
              ? course.learning_objectives.join(', ')
              : course.learning_objectives || 'No learning objectives specified'}
          </InfoCard>
        </div>
      )}

      <div style={styles.tasksSection}>
        <h2 style={styles.tasksTitle}>Course Tasks</h2>
        {tasks.length > 0 ? (
          <TasksList tasks={tasks} />
        ) : (
          <Typography variant="body1">No tasks available for this course.</Typography>
        )}
      </div>
    </div>
  );
};

// Move component definitions outside of the main component
interface IStudentsProgressSummaryProps {
  studentsProgress: IStudentProgressSummary[]; // Use the existing interface
}

const StudentsProgressSummary: React.FC<IStudentsProgressSummaryProps> = ({studentsProgress}) => {
  const totalStudents = studentsProgress.length;
  // Calculate completion rate using proper properties from the IStudentProgressSummary interface
  const completionRate = studentsProgress.reduce(
    (acc, student) => acc + (student.overall_progress / 100), 0
  ) / (totalStudents || 1); // Avoid division by zero

  // Use average score from the progress summary or default to 0
  const averageScore = studentsProgress.reduce(
    (acc, student) => {
      // Get average score from all courses or use 0
      const courseScores = student.courses?.reduce((sum, course) =>
        sum + (course.progress_percentage || 0), 0) || 0;
      return acc + (courseScores / (student.courses?.length || 1));
    }, 0
  ) / (totalStudents || 1);

  return (
    <>
      <Typography variant="body1" sx={{mb: 1}}>
        Total Students: {totalStudents}
      </Typography>
      <Box sx={{display: 'flex', alignItems: 'center', mb: 1}}>
        <Box sx={{width: '100%', mr: 1}}>
          <LinearProgress variant="determinate" value={completionRate * 100} color="primary" />
        </Box>
        <Box sx={{minWidth: 35}}>
          <Typography variant="body2" color="text.secondary">
            {`${Math.round(completionRate * 100)}%`}
          </Typography>
        </Box>
      </Box>
      <Box sx={{display: 'flex', justifyContent: 'space-between', mt: 1}}>
        <Typography variant="body2">
          Average Completion Rate: {(completionRate * 100).toFixed(1)}%
        </Typography>
        <Typography variant="body2">
          Average Score: {averageScore.toFixed(2)}
        </Typography>
      </Box>
    </>
  );
};

interface TasksListProps {
  tasks: ILearningTask[];
}

const TasksList: React.FC<TasksListProps> = ({tasks}) => {
  return (
    <div>
      {tasks.map(task => (
        <Box key={task.id} sx={{mb: 2, p: 2, border: '1px solid #eee', borderRadius: 1}}>
          <Typography variant="h6">{task.title}</Typography>
          <Typography variant="body2">{task.description}</Typography>
          <Typography variant="caption">
            Type: {task.type} | Points: {task.points} | Due date: {task.due_date || 'None'}
          </Typography>
        </Box>
      ))}
    </div>
  );
};

interface InfoCardProps {
  title: string;
  children: React.ReactNode;
}

const InfoCard: React.FC<InfoCardProps> = ({title, children}) => (
  <div style={styles.infoCard}>
    <h3 style={styles.infoTitle}>{title}</h3>
    <p style={styles.infoContent}>{children}</p>
  </div>
);

export default InstructorCourseDetailPage;
