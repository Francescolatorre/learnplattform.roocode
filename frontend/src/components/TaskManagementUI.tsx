import React, { useState, useEffect, useRef, Dispatch, SetStateAction } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css'; // Include the Quill CSS
import { updateTask, deleteTask } from '../services/taskService'; // Import the API functions

// Add CSS for modal styling
const modalStyles = {
  modal: {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: '1000'
  },
  modalContent: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '5px',
    width: '80%',
    maxWidth: '600px',
    maxHeight: '80%',
    overflow: 'auto'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px'
  },
  modalFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: '15px'
  },
  button: {
    padding: '8px 16px',
    margin: '0 5px',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none'
  },
  cancelButton: {
    backgroundColor: '#f44336',
    color: 'white',
    border: 'none'
  },
  inputField: {
    width: '100%',
    padding: '10px',
    marginBottom: '15px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '16px'
  }
};

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [editorInstance, setEditorInstance] = useState<any>(null);

  useEffect(() => {
    if (editorRef.current) {
      const editor = new Quill(editorRef.current, {
        theme: 'snow',
        modules: {
          toolbar: [
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['link', 'image']
          ]
        }
      });

      editor.on('text-change', () => {
        onChange(editor.root.innerHTML);
      });

      setEditorInstance(editor);

      return () => {
        editor.off('text-change');
      };
    }
  }, [onChange]);

  useEffect(() => {
    if (editorInstance && value !== editorInstance.root.innerHTML) {
      editorInstance.root.innerHTML = value;
    }
  }, [value, editorInstance]);

  return <div ref={editorRef} />;
};

interface TaskManagementUIProps {
  courseId: string;
  taskDescription: string;
  setTaskDescription: (description: string) => void;
  tasks: any[]; // Assuming tasks is an array of task objects
  setTasks: Dispatch<SetStateAction<any[]>>; // Correct type for setTasks
  userRole: string; // New prop to determine the user's role
}

const TaskManagementUI: React.FC<TaskManagementUIProps> = ({ courseId, taskDescription, setTaskDescription, tasks, setTasks, userRole }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [editingDescription, setEditingDescription] = useState('');
  const [editingTitle, setEditingTitle] = useState('');

  const handleEditTask = async () => {
    console.log('handleEditTask called');
    console.log('currentTaskId:', currentTaskId);
    console.log('editingTitle:', editingTitle);
    console.log('editingDescription:', editingDescription);

    if (currentTaskId) {
      try {
        console.log('Calling updateTask with:', currentTaskId, editingDescription, editingTitle);
        const updatedTask = await updateTask(currentTaskId, editingDescription, editingTitle);
        console.log('updateTask response:', updatedTask);

        // Update the task in the local state
        setTasks(prevTasks => {
          console.log('Previous tasks:', prevTasks);
          const updatedTasks = prevTasks.map(task =>
            task.id === currentTaskId
              ? { ...task, description: editingDescription, title: editingTitle }
              : task
          );
          console.log('Updated tasks:', updatedTasks);
          return updatedTasks;
        });

        // Close modal after successful update
        setIsModalOpen(false);
      } catch (error) {
        console.error('Error updating task:', error);
      }
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId);
      // Update the tasks state to remove the deleted task
      setTasks(tasks.filter(task => task.id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const openModal = (taskId: string, description: string, title: string) => {
    setCurrentTaskId(taskId);
    setEditingDescription(description);
    setEditingTitle(title);
    setIsModalOpen(true);
    console.log('Opening modal for task:', taskId, 'with description:', description, 'and title:', title);
  };

  return (
    <div>
      {isModalOpen && (
        <div style={modalStyles.modal as React.CSSProperties}>
          <div style={modalStyles.modalContent as React.CSSProperties}>
            <div style={modalStyles.modalHeader as React.CSSProperties}>
              <h2>Edit Task</h2>
              <button onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            <div>
              <label htmlFor="taskTitle">Task Title:</label>
              <input
                id="taskTitle"
                type="text"
                value={editingTitle}
                onChange={(e) => setEditingTitle(e.target.value)}
                style={modalStyles.inputField as React.CSSProperties}
              />
            </div>
            <div>
              <label htmlFor="taskDescription">Task Description:</label>
              <textarea
                id="taskDescription"
                value={editingDescription}
                onChange={(e) => setEditingDescription(e.target.value)}
                style={{...modalStyles.inputField, height: '150px'} as React.CSSProperties}
              />
            </div>
            <div style={modalStyles.modalFooter as React.CSSProperties}>
              <button
                style={{...modalStyles.button, ...modalStyles.cancelButton} as React.CSSProperties}
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
              <button
                style={{...modalStyles.button, ...modalStyles.saveButton} as React.CSSProperties}
                onClick={handleEditTask}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
      {tasks.map(task => (
        <div key={task.id}>
          <h3>{task.title}</h3>
          <p>{task.description}</p>
          {userRole === 'instructor' || userRole === 'admin' ? (
            <>
              <button onClick={() => openModal(task.id, task.description, task.title)}>Edit Task</button>
              <button onClick={() => handleDeleteTask(task.id)}>Delete Task</button>
            </>
          ) : null}
        </div>
      ))}
    </div>
  );
};

export default TaskManagementUI;
