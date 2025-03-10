import React, { useState, useEffect, useRef } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css'; // Include the Quill CSS

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
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
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
}

const TaskManagementUI: React.FC<TaskManagementUIProps> = ({ courseId, taskDescription, setTaskDescription }) => {
  // Example usage of courseId, if needed for fetching or other logic
  console.log('Course ID:', courseId);

  return (
    <div>
      <RichTextEditor value={taskDescription} onChange={setTaskDescription} />
    </div>
  );
};

export default TaskManagementUI;
