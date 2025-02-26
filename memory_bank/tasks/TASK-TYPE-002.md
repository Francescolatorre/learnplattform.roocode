# Task: Implement File Upload Task Type

## Task Metadata
- **Task-ID:** TASK-TYPE-002
- **Status:** TODO
- **Priority:** Medium
- **Dependencies:** TASK-SUBMISSION-001
- **Assigned To:** Architect
- **Started At:** 2025-02-26 21:23:39
- **Estimated Completion:** 2025-04-25
- **Story Points:** 6

## Description
Implement a comprehensive file upload task type that allows students to submit assignments by uploading one or more files. This task type will support multiple file formats, size restrictions, and file preview functionality.

## Business Context
File uploads are essential for assignments that require students to submit documents, presentations, images, code files, or other digital artifacts. This task type enables instructors to collect and evaluate student work that cannot be adequately represented through text submissions alone, such as design projects, programming assignments, research papers, and multimedia presentations.

## Technical Context
- **System Architecture:** Django backend with React frontend
- **Related Components:** 
  - LearningTask model (from TASK-MODEL-001)
  - Submission system (from TASK-SUBMISSION-001)
  - Task type registry system
  - File storage service
- **Technical Constraints:**
  - Must use the task type interface defined in the task types implementation guide
  - Must support secure file storage
  - Must implement virus scanning for uploaded files
  - Must handle large file uploads efficiently

## Requirements

### Inputs
- Task settings from instructor (allowed file types, size limits, number of files)
- Student file uploads
- Optional file descriptions

### Outputs
- Validated and stored file submissions
- Submission confirmation and receipt
- File preview (when possible)
- Validation feedback

### Functional Requirements
1. File Upload Interface
   - Drag-and-drop file upload area
   - Multiple file selection support
   - Upload progress indicators
   - File type and size validation
   - File preview functionality

2. File Management
   - Add/remove files before submission
   - Edit file descriptions
   - Replace uploaded files
   - View upload history

3. Instructor Configuration
   - Configurable allowed file types
   - Maximum file size settings
   - Maximum number of files setting
   - Option to require file descriptions
   - File naming requirements

### Technical Requirements
- Implement `FileUploadTaskType` class extending `BaseTaskType`
- Create React components for file upload interface
- Implement secure file storage with proper access controls
- Support virus scanning for uploaded files
- Implement file type and size validation

## Implementation Details

### Required Libraries and Versions
- Frontend:
  - React 18.0+
  - react-dropzone 14.0.0+ for drag-and-drop uploads
  - axios 1.0.0+ for file upload handling
- Backend:
  - Django 4.2+
  - django-storages 1.12.0+ for file storage
  - django-virus-scan 0.4.0+ for virus scanning
  - Pillow 9.0.0+ for image processing

### Code Examples

#### Task Type Implementation
```python
from tasks.models import BaseTaskType
from django.core.exceptions import ValidationError
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
import os
import magic
import uuid

class FileUploadTaskType(BaseTaskType):
    def validate_settings(self, settings):
        """Validate file upload task settings"""
        required_fields = ['allowedFileTypes', 'maxFileSize', 'maxFiles']
        for field in required_fields:
            if field not in settings:
                raise ValidationError(f"Missing required field: {field}")
        
        # Validate file types
        if not isinstance(settings['allowedFileTypes'], list):
            raise ValidationError("allowedFileTypes must be a list")
        
        # Validate max file size (in bytes)
        try:
            max_size = int(settings['maxFileSize'])
            if max_size <= 0:
                raise ValidationError("maxFileSize must be a positive integer")
        except (ValueError, TypeError):
            raise ValidationError("maxFileSize must be a valid integer")
        
        # Validate max files
        try:
            max_files = int(settings['maxFiles'])
            if max_files <= 0:
                raise ValidationError("maxFiles must be a positive integer")
        except (ValueError, TypeError):
            raise ValidationError("maxFiles must be a valid integer")
        
        return True
        
    def get_submission_form(self, task):
        """Return the form configuration for file upload"""
        return {
            'type': 'file_upload',
            'allowedFileTypes': task.settings.get('allowedFileTypes', ['.pdf', '.docx', '.jpg', '.png']),
            'maxFileSize': task.settings.get('maxFileSize', 10485760),  # 10MB default
            'maxFiles': task.settings.get('maxFiles', 1),
            'requireDescription': task.settings.get('requireDescription', False),
            'submissionInstructions': task.settings.get('submissionInstructions', '')
        }
        
    def process_submission(self, task, submission_data):
        """Process a file upload submission"""
        files = submission_data.get('files', [])
        
        # Validate number of files
        max_files = task.settings.get('maxFiles', 1)
        if len(files) > max_files:
            raise ValidationError(f"Maximum {max_files} files allowed")
        
        if len(files) == 0:
            raise ValidationError("At least one file must be uploaded")
        
        processed_files = []
        allowed_types = task.settings.get('allowedFileTypes', ['.pdf', '.docx', '.jpg', '.png'])
        max_size = task.settings.get('maxFileSize', 10485760)
        
        for file_data in files:
            file_obj = file_data.get('file')
            description = file_data.get('description', '')
            
            # Validate file size
            if file_obj.size > max_size:
                raise ValidationError(f"File '{file_obj.name}' exceeds maximum size of {max_size} bytes")
            
            # Validate file type
            file_ext = os.path.splitext(file_obj.name)[1].lower()
            if file_ext not in allowed_types:
                raise ValidationError(f"File type '{file_ext}' is not allowed. Allowed types: {', '.join(allowed_types)}")
            
            # Check file content type using python-magic
            mime = magic.Magic(mime=True)
            file_type = mime.from_buffer(file_obj.read())
            file_obj.seek(0)  # Reset file pointer after reading
            
            # Map common mime types to extensions for validation
            mime_to_ext = {
                'application/pdf': '.pdf',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
                'image/jpeg': '.jpg',
                'image/png': '.png'
            }
            
            # Additional validation based on actual content
            if file_type in mime_to_ext and mime_to_ext[file_type] != file_ext:
                raise ValidationError(f"File '{file_obj.name}' has incorrect extension for its content type")
            
            # Generate unique filename
            unique_filename = f"{uuid.uuid4()}{file_ext}"
            
            # Save file to storage
            file_path = f"submissions/{task.id}/{unique_filename}"
            saved_path = default_storage.save(file_path, ContentFile(file_obj.read()))
            
            # Add to processed files
            processed_files.append({
                'original_name': file_obj.name,
                'stored_name': unique_filename,
                'path': saved_path,
                'size': file_obj.size,
                'type': file_type,
                'description': description,
                'uploaded_at': timezone.now().isoformat()
            })
            
        return {
            'files': processed_files
        }
        
    def get_grading_form(self, task, submission):
        """Return the form for grading this submission"""
        return {
            'type': 'file_upload_grading',
            'files': submission.data['files'],
            'rubric': task.settings.get('rubric', [])
        }
```

#### Frontend Component
```jsx
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

const FileUploadForm = ({ task, onSubmit }) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [errors, setErrors] = useState([]);
  
  const {
    allowedFileTypes,
    maxFileSize,
    maxFiles,
    requireDescription
  } = task.settings;
  
  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    // Handle rejected files
    if (rejectedFiles && rejectedFiles.length > 0) {
      const newErrors = rejectedFiles.map(rejected => {
        const error = rejected.errors[0];
        return `${rejected.file.name}: ${error.message}`;
      });
      setErrors(prev => [...prev, ...newErrors]);
      return;
    }
    
    // Check if adding these files would exceed maxFiles
    if (files.length + acceptedFiles.length > maxFiles) {
      setErrors(prev => [...prev, `Maximum ${maxFiles} files allowed`]);
      return;
    }
    
    // Add new files with description field
    const newFiles = acceptedFiles.map(file => ({
      file,
      description: '',
      preview: URL.createObjectURL(file)
    }));
    
    setFiles(prev => [...prev, ...newFiles]);
  }, [files, maxFiles]);
  
  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: allowedFileTypes.reduce((acc, type) => {
      // Convert file extensions to mime types
      const mimeMap = {
        '.pdf': { 'application/pdf': [] },
        '.docx': { 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [] },
        '.jpg': { 'image/jpeg': [] },
        '.png': { 'image/png': [] }
      };
      return { ...acc, ...(mimeMap[type] || {}) };
    }, {}),
    maxSize: maxFileSize,
    multiple: maxFiles > 1
  });
  
  const removeFile = (index) => {
    setFiles(prev => {
      const newFiles = [...prev];
      // Release object URL to prevent memory leaks
      URL.revokeObjectURL(newFiles[index].preview);
      newFiles.splice(index, 1);
      return newFiles;
    });
  };
  
  const updateFileDescription = (index, description) => {
    setFiles(prev => {
      const newFiles = [...prev];
      newFiles[index].description = description;
      return newFiles;
    });
  };
  
  const handleSubmit = async () => {
    // Validate descriptions if required
    if (requireDescription) {
      const missingDescriptions = files.some(file => !file.description.trim());
      if (missingDescriptions) {
        setErrors(prev => [...prev, 'All files require a description']);
        return;
      }
    }
    
    setUploading(true);
    setErrors([]);
    
    try {
      // Prepare form data for submission
      const formData = new FormData();
      formData.append('task_id', task.id);
      
      // Add files and their descriptions
      files.forEach((fileData, index) => {
        formData.append(`files[${index}]`, fileData.file);
        formData.append(`descriptions[${index}]`, fileData.description);
      });
      
      // Upload files with progress tracking
      const response = await axios.post('/api/submissions/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress({ percent: percentCompleted });
        }
      });
      
      // Call the onSubmit callback with the response data
      onSubmit(response.data);
      
      // Clear files after successful submission
      setFiles([]);
      
    } catch (error) {
      console.error('Upload error:', error);
      setErrors(prev => [
        ...prev, 
        error.response?.data?.message || 'Error uploading files'
      ]);
    } finally {
      setUploading(false);
      setUploadProgress({});
    }
  };
  
  // Render file previews based on file type
  const renderPreview = (file) => {
    const fileType = file.file.type;
    
    if (fileType.startsWith('image/')) {
      return (
        <img 
          src={file.preview} 
          alt={file.file.name}
          className="file-preview-image" 
        />
      );
    }
    
    // For non-image files, show an icon based on type
    const iconMap = {
      'application/pdf': 'pdf-icon.svg',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx-icon.svg',
      // Add more mappings as needed
    };
    
    const iconSrc = iconMap[fileType] || 'generic-file-icon.svg';
    
    return (
      <div className="file-preview-icon">
        <img src={iconSrc} alt={fileType} />
        <span>{file.file.name}</span>
      </div>
    );
  };
  
  return (
    <div className="file-upload-form">
      <div {...getRootProps({ className: 'dropzone' })}>
        <input {...getInputProps()} />
        <p>Drag & drop files here, or click to select files</p>
        <div className="dropzone-info">
          <p>Allowed file types: {allowedFileTypes.join(', ')}</p>
          <p>Maximum file size: {(maxFileSize / (1024 * 1024)).toFixed(1)} MB</p>
          <p>Maximum files: {maxFiles}</p>
        </div>
      </div>
      
      {errors.length > 0 && (
        <div className="upload-errors">
          {errors.map((error, index) => (
            <div key={index} className="error-message">{error}</div>
          ))}
        </div>
      )}
      
      {files.length > 0 && (
        <div className="file-list">
          <h3>Selected Files</h3>
          {files.map((file, index) => (
            <div key={index} className="file-item">
              <div className="file-preview">
                {renderPreview(file)}
              </div>
              
              <div className="file-details">
                <div className="file-name">{file.file.name}</div>
                <div className="file-size">
                  {(file.file.size / 1024).toFixed(1)} KB
                </div>
                
                <textarea
                  className="file-description"
                  placeholder="File description"
                  value={file.description}
                  onChange={(e) => updateFileDescription(index, e.target.value)}
                  required={requireDescription}
                />
              </div>
              
              <button 
                className="remove-file-btn"
                onClick={() => removeFile(index)}
                type="button"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
      
      {uploading && (
        <div className="upload-progress">
          <div 
            className="progress-bar"
            style={{ width: `${uploadProgress.percent || 0}%` }}
          />
          <div className="progress-text">
            Uploading: {uploadProgress.percent || 0}%
          </div>
        </div>
      )}
      
      <div className="submission-actions">
        <button
          className="submit-btn"
          onClick={handleSubmit}
          disabled={files.length === 0 || uploading}
        >
          {uploading ? 'Uploading...' : 'Submit Files'}
        </button>
      </div>
    </div>
  );
};

export default FileUploadForm;
```

## Edge Cases and Challenges

### Edge Cases
1. **Large File Uploads**: Handle timeouts and connection issues during large file uploads
2. **Unsupported File Types**: Provide clear feedback when students attempt to upload unsupported files
3. **Corrupted Files**: Detect and handle corrupted files that pass extension validation
4. **Malicious Files**: Implement virus scanning to prevent security threats
5. **Filename Collisions**: Ensure unique filenames to prevent overwriting

### Challenges
1. **Storage Scalability**: Managing storage growth as file submissions accumulate
2. **File Type Verification**: Accurately detecting file types beyond extension checking
3. **Preview Generation**: Creating previews for various file types
4. **Upload Performance**: Optimizing upload experience for users with slow connections
5. **Access Control**: Ensuring files are only accessible to authorized users

## Performance Considerations
- Implement chunked uploads for large files
- Use client-side compression when appropriate
- Optimize file storage with appropriate caching headers
- Consider CDN integration for file delivery
- Implement background processing for virus scanning and preview generation

## Security Considerations
- Implement server-side validation of file types and sizes
- Scan all uploads for viruses and malware
- Store files with appropriate access controls
- Sanitize filenames to prevent path traversal attacks
- Implement rate limiting to prevent abuse

## Testing Requirements
- Unit tests for file validation logic
- Integration tests for upload workflow
- Security tests for file access controls
- Performance tests with large files and concurrent uploads
- Compatibility tests across different browsers

## Validation Criteria
- [x] File upload interface supports drag-and-drop
- [x] File type and size validation works correctly
- [x] Multiple file uploads are properly handled
- [x] File previews are generated when possible
- [x] Virus scanning is implemented for all uploads

## Acceptance Criteria
1. Students can upload files of allowed types and sizes
2. File validation prevents invalid uploads with clear error messages
3. File previews are available for supported file types
4. Instructors can download and view submitted files
5. File descriptions are properly stored and displayed

## Learning Resources
- [File Upload Best Practices](https://developer.mozilla.org/en-US/docs/Web/API/File/Using_files_from_web_applications)
- [React Dropzone Documentation](https://react-dropzone.js.org/)
- [Django File Storage](https://docs.djangoproject.com/en/4.2/topics/files/)
- [OWASP File Upload Security](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html)

## Expert Contacts
- **File Storage**: David Chen (david.chen@example.com)
- **Security**: Lisa Rodriguez (lisa.rodriguez@example.com)
- **Frontend Upload UX**: Thomas Wright (thomas.wright@example.com)

## Related Design Patterns
- **Decorator Pattern**: For adding functionality to file objects (like scanning, preview generation)
- **Chain of Responsibility**: For file validation pipeline
- **Factory Method**: For creating appropriate file handlers based on type
- **Proxy Pattern**: For controlling access to stored files

## Sample Data Structures

### Task Settings Schema
```json
{
  "allowedFileTypes": [".pdf", ".docx", ".jpg", ".png"],
  "maxFileSize": 10485760,  // 10MB in bytes
  "maxFiles": 3,
  "requireDescription": true,
  "submissionInstructions": "Upload your completed assignment as a PDF or Word document. You may include up to 2 supporting images if needed.",
  "rubric": [
    {
      "criterion": "Completeness",
      "description": "All required elements are included",
      "maxPoints": 10
    },
    {
      "criterion": "Quality",
      "description": "Work demonstrates understanding and effort",
      "maxPoints": 10
    }
  ]
}
```

### Submission Data Schema
```json
{
  "files": [
    {
      "original_name": "assignment1.pdf",
      "stored_name": "5f8e7d6c-9b4a-4e3c-8d2f-1a2b3c4d5e6f.pdf",
      "path": "submissions/task-123/5f8e7d6c-9b4a-4e3c-8d2f-1a2b3c4d5e6f.pdf",
      "size": 2457891,
      "type": "application/pdf",
      "description": "My completed assignment with all required sections",
      "uploaded_at": "2025-04-19T15:32:45Z"
    },
    {
      "original_name": "supporting_diagram.jpg",
      "stored_name": "7a8b9c0d-1e2f-3g4h-5i6j-7k8l9m0n1o2p.jpg",
      "path": "submissions/task-123/7a8b9c0d-1e2f-3g4h-5i6j-7k8l9m0n1o2p.jpg",
      "size": 1245678,
      "type": "image/jpeg",
      "description": "Diagram illustrating the concept discussed in section 3",
      "uploaded_at": "2025-04-19T15:33:12Z"
    }
  ],
  "submitted_at": "2025-04-19T15:33:30Z"
}
```

## Estimated Effort
- Frontend Implementation: 2 story points
- Backend Implementation: 3 story points
- Testing and Security: 1 story point
- Total: 6 story points

## Potential Risks
- Security vulnerabilities in file handling
- Performance issues with large files
- Storage capacity management
- Browser compatibility issues with file upload interface
