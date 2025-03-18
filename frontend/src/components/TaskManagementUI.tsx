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
  }
};

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange }) => {
  const editorRef = useRef<HTMLDivElement>(null);

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

      return () => {
        editor.off('text-change');
      };
    }
  }, [onChange]);

  useEffect(() => {
    if (editorRef.current) {
      const editor = new Quill(editorRef.current);
      editor.root.innerHTML = value;
    }
  }, [value]);

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

  const handleEditTask = async () => {
    if (currentTaskId) {
      try {
        await updateTask(currentTaskId, editingDescription);

        // Update the task in the local state
        setTasks(tasks.map(task =>
          task.id === currentTaskId
            ? { ...task, description: editingDescription }
            : task
        ));

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

  const openModal = (taskId: string, description: string) => {
    setCurrentTaskId(taskId);
    setEditingDescription(description);
    setIsModalOpen(true);
    console.log('Opening modal for task:', taskId, 'with description:', description);
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
            <RichTextEditor value={editingDescription} onChange={setEditingDescription} />
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
          <p>{task.description}</p>
          {userRole === 'instructor' || userRole === 'admin' ? (
            <>
              <button onClick={() => openModal(task.id, task.description)}>Edit Task</button>
              <button onClick={() => handleDeleteTask(task.id)}>Delete Task</button>
            </>
          ) : null}
        </div>
      ))}
    </div>
  );
};

export default TaskManagementUI;
