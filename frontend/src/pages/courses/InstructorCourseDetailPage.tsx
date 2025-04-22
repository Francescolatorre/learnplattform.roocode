import {LinearProgress, Typography, Box} from '@mui/material';
import React, {useState, useEffect} from 'react';
import {useParams} from 'react-router-dom';

import {ILearningTask} from '@/types/entities';
import {fetchCourseTasks} from '@services/resources/learningTaskService'; // Updated import
import {fetchStudentProgressByCourse} from '@services/resources/progressService';

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
  if (!courseId) return <div style={styles.errorContainer}>Course ID not provided</div>;

  const [tasks, setTasks] = useState<LearningTask[]>([]);
  const [courseProgress, setCourseProgress] = useState<CourseProgress | null>(null);

  const {user, getUserRole} = useAuth();
  const userRole = getUserRole();

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const fetchedTasks = await fetchCourseTasks(courseId);
        setTasks(fetchedTasks);
      } catch (error) {
        console.error('Failed to fetch tasks:', error);
      }
    };

    loadTasks();
  }, [courseId]);

  useEffect(() => {
    const loadProgress = async () => {
      if (!courseId || !user?.id) {
        console.error('Error: courseId or user ID is undefined. Cannot fetch student progress.');
        return;
      }

      try {
        const progress = await fetchStudentProgressByCourse(courseId, user.id.toString());
        setCourseProgress(progress);
      } catch (error: any) {
        console.error('Failed to fetch course progress:', error.message);
      }
    };

    loadProgress();
  }, [courseId, user?.id]);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        {/* <h1 style={styles.title}>{course.title}</h1> */} {/* Commented out due to missing variable */}
        {/* <p style={styles.description}>{course.description}</p> */} {/* Commented out due to missing variable */}
      </div>

      {courseProgress ? (
        <CourseProgressSection progress={courseProgress} />
      ) : (
        <div style={styles.loadingContainer}>Loading progress...</div>
      )}

      <div style={styles.infoSection}>
        <InfoCard title="Instructor">
          {/* {course.creator_details
            ? course.creator_details.display_name || course.creator_details.username
            : 'Not assigned'} */}
        </InfoCard>

        {/* <InfoCard title="Status">{course.status || 'Not specified'}</InfoCard> */} {/* Commented out due to missing variable */}

        <InfoCard title="Prerequisites">
          {/* {Array.isArray(course.prerequisites)
            ? course.prerequisites.join(', ')
            : course.prerequisites || 'None'} */}
        </InfoCard>
      </div>

      <InfoCard title="Learning Objectives">
        {/* {Array.isArray(course.learning_objectives)
          ? course.learning_objectives.join(', ')
          : course.learning_objectives || 'No learning objectives specified'} */}
      </InfoCard>

      <div style={styles.tasksSection}>
        <h2 style={styles.tasksTitle}>Course Tasks</h2>
        {/* TaskManagementUI component removed as per user instruction */}
        <p>Task management UI is currently unavailable.</p>
      </div>
    </div>
  );
};

interface CourseProgressSectionProps {
  progress: CourseProgress;
}

const CourseProgressSection: React.FC<CourseProgressSectionProps> = ({progress}) => (
  <div style={styles.progressSection}>
    <Typography variant="h6" style={{marginBottom: 10, color: '#007bff'}}>
      Course Progress
    </Typography>
    <Box sx={{display: 'flex', alignItems: 'center', mb: 1}}>
      <Box sx={{width: '100%', mr: 1}}>
        <LinearProgress variant="determinate" value={(progress.completedTasks / progress.totalTasks) * 100} color="primary" />
      </Box>
      <Box sx={{minWidth: 35}}>
        <Typography variant="body2" color="text.secondary">
          {`${Math.round((progress.completedTasks / progress.totalTasks) * 100)}%`}
        </Typography>
      </Box>
    </Box>
    <Box sx={{display: 'flex', justifyContent: 'space-between', mt: 1}}>
      <Typography variant="body2">
        Completed Tasks: {progress.completedTasks} / {progress.totalTasks}
      </Typography>
      <Typography variant="body2">Average Score: {progress.averageScore.toFixed(2)}</Typography>
    </Box>
  </div>
);

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
