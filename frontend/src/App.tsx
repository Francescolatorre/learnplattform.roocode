import React, { useState } from 'react';
import TaskManagementUI from './components/TaskManagementUI';
import Dashboard from './components/Dashboard'; // Import the Dashboard component

const App = () => {
  const [taskDescription, setTaskDescription] = useState<string>('Initial task description');

  return (
    <div>
      <Dashboard /> {/* Include the Dashboard component */}
      <TaskManagementUI
        courseId="12345"
        taskDescription={taskDescription}
        setTaskDescription={setTaskDescription}
      />
    </div>
  );
};

export default App;
