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
    borderRadius: '8px',
    width: '80%',
    maxWidth: '600px',
    maxHeight: '80%',
    overflow: 'auto'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
    borderBottom: '2px solid #007bff',
    paddingBottom: '10px'
  },
  modalTitle: {
    fontSize: '24px',
    color: '#333',
    margin: 0
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#666'
  },
  modalFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: '15px',
    paddingTop: '15px',
    borderTop: '1px solid #eee'
  },
  button: {
    padding: '10px 16px',
    margin: '0 5px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
    border: 'none',
    transition: 'background-color 0.3s'
  },
  saveButton: {
    backgroundColor: '#28a745',
    color: 'white'
  },
  cancelButton: {
    backgroundColor: '#dc3545',
    color: 'white'
  },
  inputField: {
    width: '100%',
    padding: '12px',
    marginBottom: '20px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '16px',
    boxSizing: 'border-box'
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: 'bold',
    color: '#555'
  },
  taskList: {
    marginTop: '20px'
  },
  taskItem: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '15px',
    marginBottom: '15px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
    border: '1px solid #eee'
  },
  taskTitle: {
    fontSize: '20px',
    color: '#333',
    marginBottom: '10px',
    fontWeight: 'bold'
  },
  taskDescription: {
    fontSize: '16px',
    color: '#555',
    marginBottom: '15px',
    lineHeight: '1.5'
  },
  taskActions: {
    display: 'flex',
    justifyContent: 'flex-end'
  },
  actionButton: {
    padding: '8px 12px',
    margin: '0 5px',
    borderRadius: '4px',
    cursor: 'pointer',
    border: 'none',
    fontWeight: 'bold',
    transition: 'background-color 0.3s'
  },
  editButton: {
    backgroundColor: '#007bff',
    color: 'white'
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    color: 'white'
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
              <h2 style={modalStyles.modalTitle as React.CSSProperties}>Edit Task</h2>
              <button
                style={modalStyles.closeButton as React.CSSProperties}
                onClick={() => setIsModalOpen(false)}
              >
                ×
              </button>
            </div>
            <div>
              <label style={modalStyles.label as React.CSSProperties} htmlFor="taskTitle">Task Title:</label>
              <input
                id="taskTitle"
                type="text"
                value={editingTitle}
                onChange={(e) => setEditingTitle(e.target.value)}
                style={modalStyles.inputField as React.CSSProperties}
              />
            </div>
            <div>
              <label style={modalStyles.label as React.CSSProperties} htmlFor="taskDescription">Task Description:</label>
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
      <div style={modalStyles.taskList as React.CSSProperties}>
        {tasks.map(task => (
          <div key={task.id} style={modalStyles.taskItem as React.CSSProperties}>
            <h3 style={modalStyles.taskTitle as React.CSSProperties}>{task.title}</h3>
            <p style={modalStyles.taskDescription as React.CSSProperties}>{task.description}</p>
            {userRole === 'instructor' || userRole === 'admin' ? (
              <div style={modalStyles.taskActions as React.CSSProperties}>
                <button
                  style={{...modalStyles.actionButton, ...modalStyles.editButton} as React.CSSProperties}
                  onClick={() => openModal(task.id, task.description, task.title)}
                >
                  Edit Task
                </button>
                <button
                  style={{...modalStyles.actionButton, ...modalStyles.deleteButton} as React.CSSProperties}
                  onClick={() => handleDeleteTask(task.id)}
                >
                  Delete Task
                </button>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskManagementUI;
