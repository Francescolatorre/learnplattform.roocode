# Task: Implement Text Submission Task Type

## Task Metadata
- **Task-ID:** TASK-TYPE-001
- **Status:** IN_PROGRESS
- **Priority:** Medium
- **Dependencies:** 
  - TASK-SUBMISSION-001
  - TASK-MODEL-CONSOLIDATION-002
- **Assigned To:** Architect and Code Team
- **Started At:** 2025-02-26 21:22:32
- **Estimated Completion:** 2025-04-20
- **Story Points:** 5

## Notes on Model Consolidation Impact
- Update task type implementation to align with consolidated task model
- Verify compatibility with new model structure
- Ensure all model references are updated

## Description
Implement a comprehensive text submission task type that allows students to submit written responses to assignments. This task type will support rich text formatting, word count limits, and draft saving functionality.

## Business Context
Text submissions are one of the most common assignment types in educational settings. They allow instructors to assess students' understanding, critical thinking, and communication skills through written responses. This task type is essential for essay assignments, short answer questions, reflections, and other text-based assessments.

## Technical Context
- **System Architecture:** Django backend with React frontend
- **Related Components:** 
  - LearningTask model (from TASK-MODEL-001)
  - Submission system (from TASK-SUBMISSION-001)
  - Task type registry system
- **Technical Constraints:**
  - Must use the task type interface defined in the task types implementation guide
  - Must support markdown or rich text formatting
  - Must implement client-side and server-side validation

## Requirements

### Inputs
- Task settings from instructor (word limits, formatting options, submission instructions)
- Student text submission content
- Optional attachments (if enabled in settings)

### Outputs
- Validated and stored text submission
- Submission confirmation and receipt
- Word count and validation feedback

### Functional Requirements
1. Text Editor Interface
   - Rich text editor with formatting options
   - Markdown support with preview
   - Word count display with min/max validation
   - Draft auto-saving functionality
   - Submission preview before final submission

2. Submission Validation
   - Word count limits (minimum and maximum)
   - Required sections or elements
   - Plagiarism detection integration (optional)
   - File attachment validation (if enabled)

3. Instructor Configuration
   - Configurable word limits
   - Toggle for allowing formatting
   - Toggle for allowing attachments
   - Custom submission instructions
   - Rubric association

### Technical Requirements
- Implement `TextSubmissionTaskType` class extending `BaseTaskType`
- Create React components for text submission interface
- Implement real-time validation and feedback
- Support secure storage of submission content
- Implement draft auto-saving with local storage fallback

## Implementation Details

### Required Libraries and Versions
- Frontend:
  - React 18.0+
  - Draft.js 0.11.7+ or TinyMCE 6.0+ for rich text editing
  - react-markdown 8.0.0+ for markdown preview
- Backend:
  - Django 4.2+
  - django-bleach 1.0.0+ for HTML sanitization
  - django-storages 1.12.0+ for attachment storage

### Code Examples

#### Task Type Implementation
```python
from tasks.models import BaseTaskType
from django.core.validators import MinValueValidator, MaxValueValidator
from django.core.exceptions import ValidationError
import bleach

class TextSubmissionTaskType(BaseTaskType):
    def validate_settings(self, settings):
        """Validate text submission task settings"""
        required_fields = ['wordLimit', 'minWords', 'allowFormatting']
        for field in required_fields:
            if field not in settings:
                raise ValidationError(f"Missing required field: {field}")
        
        # Validate word limits
        if settings.get('minWords', 0) > settings.get('wordLimit', 0):
            raise ValidationError("Minimum word count cannot exceed maximum word limit")
        
        return True
        
    def get_submission_form(self, task):
        """Return the form configuration for text submission"""
        return {
            'type': 'text_submission',
            'wordLimit': task.settings.get('wordLimit', 500),
            'minWords': task.settings.get('minWords', 0),
            'allowFormatting': task.settings.get('allowFormatting', True),
            'allowAttachments': task.settings.get('allowAttachments', False),
            'submissionInstructions': task.settings.get('submissionInstructions', '')
        }
        
    def process_submission(self, task, submission_data):
        """Process a text submission"""
        # Validate word count
        word_count = len(submission_data.get('content', '').split())
        min_words = task.settings.get('minWords', 0)
        max_words = task.settings.get('wordLimit', 500)
        
        if word_count < min_words:
            raise ValidationError(f"Submission must contain at least {min_words} words")
        
        if word_count > max_words:
            raise ValidationError(f"Submission cannot exceed {max_words} words")
        
        # Sanitize HTML content if formatting is allowed
        if task.settings.get('allowFormatting', True):
            submission_data['content'] = bleach.clean(
                submission_data['content'],
                tags=bleach.sanitizer.ALLOWED_TAGS + ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
                attributes=bleach.sanitizer.ALLOWED_ATTRIBUTES
            )
        else:
            # Strip all HTML if formatting is not allowed
            submission_data['content'] = bleach.clean(submission_data['content'], tags=[], strip=True)
        
        # Process attachments if allowed
        if task.settings.get('allowAttachments', False) and 'attachments' in submission_data:
            # Attachment processing logic here
            pass
            
        return {
            'content': submission_data['content'],
            'word_count': word_count,
            'attachments': submission_data.get('attachments', [])
        }
        
    def get_grading_form(self, task, submission):
        """Return the form for grading this submission"""
        return {
            'type': 'text_submission_grading',
            'submission_content': submission.data['content'],
            'word_count': submission.data['word_count'],
            'rubric': task.settings.get('rubric', [])
        }
```

#### Frontend Component
```jsx
import React, { useState, useEffect } from 'react';
import { Editor } from 'react-draft-wysiwyg';
import { EditorState, convertToRaw, ContentState } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';

const TextSubmissionForm = ({ task, onSubmit, onSaveDraft }) => {
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [wordCount, setWordCount] = useState(0);
  const [isDraftSaved, setIsDraftSaved] = useState(false);
  
  // Load draft from local storage on component mount
  useEffect(() => {
    const savedDraft = localStorage.getItem(`draft_${task.id}`);
    if (savedDraft) {
      const contentBlock = htmlToDraft(savedDraft);
      if (contentBlock) {
        const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks);
        setEditorState(EditorState.createWithContent(contentState));
      }
    }
  }, [task.id]);
  
  // Auto-save draft every 30 seconds
  useEffect(() => {
    const intervalId = setInterval(() => {
      saveDraft();
    }, 30000);
    
    return () => clearInterval(intervalId);
  }, [editorState]);
  
  // Update word count when editor content changes
  useEffect(() => {
    const contentText = editorState.getCurrentContent().getPlainText('');
    const words = contentText.trim() ? contentText.trim().split(/\s+/) : [];
    setWordCount(words.length);
  }, [editorState]);
  
  const saveDraft = () => {
    const htmlContent = draftToHtml(convertToRaw(editorState.getCurrentContent()));
    localStorage.setItem(`draft_${task.id}`, htmlContent);
    setIsDraftSaved(true);
    
    if (onSaveDraft) {
      onSaveDraft(htmlContent, wordCount);
    }
    
    // Reset saved indicator after 3 seconds
    setTimeout(() => setIsDraftSaved(false), 3000);
  };
  
  const handleSubmit = () => {
    const htmlContent = draftToHtml(convertToRaw(editorState.getCurrentContent()));
    
    onSubmit({
      content: htmlContent,
      word_count: wordCount
    });
    
    // Clear draft after submission
    localStorage.removeItem(`draft_${task.id}`);
  };
  
  return (
    <div className="text-submission-form">
      <div className="editor-container">
        <Editor
          editorState={editorState}
          onEditorStateChange={setEditorState}
          wrapperClassName="editor-wrapper"
          editorClassName="editor-content"
          toolbar={{
            options: ['inline', 'blockType', 'list', 'textAlign', 'link', 'history'],
            inline: { inDropdown: false },
            list: { inDropdown: true },
            textAlign: { inDropdown: true },
          }}
          readOnly={!task.settings.allowFormatting}
        />
      </div>
      
      <div className="submission-controls">
        <div className="word-count">
          Words: {wordCount} / {task.settings.wordLimit}
          {wordCount < task.settings.minWords && (
            <span className="validation-error">
              Minimum {task.settings.minWords} words required
            </span>
          )}
          {wordCount > task.settings.wordLimit && (
            <span className="validation-error">
              Maximum {task.settings.wordLimit} words exceeded
            </span>
          )}
        </div>
        
        <div className="action-buttons">
          <button 
            className="save-draft-btn" 
            onClick={saveDraft}
          >
            {isDraftSaved ? 'Draft Saved!' : 'Save Draft'}
          </button>
          
          <button 
            className="submit-btn" 
            onClick={handleSubmit}
            disabled={
              wordCount < task.settings.minWords || 
              wordCount > task.settings.wordLimit
            }
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default TextSubmissionForm;
```

## Edge Cases and Challenges

### Edge Cases
1. **Browser Crashes**: Implement local storage backup to prevent data loss
2. **Network Failures**: Support offline editing with submission queuing
3. **Large Text Submissions**: Handle performance issues with large documents
4. **Copy-Pasted Content**: Strip unwanted formatting and scripts
5. **International Characters**: Ensure proper handling of non-ASCII characters

### Challenges
1. **Word Count Accuracy**: Different definitions of what constitutes a word
2. **Rich Text Sanitization**: Balancing formatting flexibility with security
3. **Draft Synchronization**: Handling conflicts between local and server drafts
4. **Performance Optimization**: Ensuring editor responsiveness with large documents
5. **Accessibility**: Making rich text editing accessible to all users

## Performance Considerations
- Implement debouncing for word count calculation
- Optimize rich text editor initialization
- Consider lazy loading for editor components
- Implement efficient draft saving strategy
- Use pagination or virtualization for displaying large documents

## Security Considerations
- Sanitize HTML input to prevent XSS attacks
- Validate all user inputs server-side
- Implement CSRF protection for submissions
- Ensure proper access control for draft access
- Scan attachments for malware if attachments are enabled

## Testing Requirements
- Unit tests for validation logic
- Integration tests for submission workflow
- Accessibility testing for editor components
- Performance testing with large documents
- Cross-browser compatibility testing

## Validation Criteria
- [x] Text editor supports required formatting options
- [x] Word count limits are properly enforced
- [x] Draft saving works reliably
- [x] Submissions are properly validated and stored
- [x] Rich text content is properly sanitized

## Acceptance Criteria
1. Students can create, edit, and submit text responses
2. Word count limits are enforced with clear feedback
3. Drafts are automatically saved and can be recovered
4. Formatting options work as expected (when enabled)
5. Submissions are properly stored and accessible for grading

## Learning Resources
- [Draft.js Documentation](https://draftjs.org/docs/getting-started)
- [React Rich Text Editors Comparison](https://blog.logrocket.com/best-react-rich-text-editors/)
- [HTML Sanitization Best Practices](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [Accessibility in Rich Text Editors](https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/)

## Expert Contacts
- **Rich Text Editing**: Alex Johnson (alex.johnson@example.com)
- **Content Validation**: Maria Garcia (maria.garcia@example.com)
- **Accessibility**: James Wilson (james.wilson@example.com)

## Related Design Patterns
- **Command Pattern**: For implementing undo/redo functionality
- **Memento Pattern**: For saving and restoring editor state
- **Strategy Pattern**: For different validation strategies
- **Observer Pattern**: For real-time word count updates

## Sample Data Structures

### Task Settings Schema
```json
{
  "wordLimit": 500,
  "minWords": 100,
  "allowFormatting": true,
  "allowAttachments": false,
  "submissionInstructions": "Write a 500-word essay analyzing the main themes in the assigned reading.",
  "rubric": [
    {
      "criterion": "Content",
      "description": "Addresses all aspects of the prompt",
      "maxPoints": 10
    },
    {
      "criterion": "Organization",
      "description": "Well-structured with clear introduction and conclusion",
      "maxPoints": 5
    },
    {
      "criterion": "Language",
      "description": "Uses appropriate academic language and terminology",
      "maxPoints": 5
    }
  ]
}
```

### Submission Data Schema
```json
{
  "content": "<p>This is the submitted text content with <strong>formatting</strong>...</p>",
  "word_count": 487,
  "attachments": [
    {
      "id": "att-123",
      "filename": "supporting_document.pdf",
      "size": 1024567,
      "url": "/media/submissions/task-456/user-789/supporting_document.pdf"
    }
  ],
  "draft_saved_at": "2025-04-18T14:32:45Z",
  "submitted_at": "2025-04-19T09:15:22Z"
}
```

## Estimated Effort
- Frontend Implementation: 2 story points
- Backend Implementation: 2 story points
- Testing and Validation: 1 story point
- Total: 5 story points

## Potential Risks
- Rich text editor compatibility issues across browsers
- Performance issues with large text submissions
- Security vulnerabilities in HTML sanitization
- Accessibility challenges with complex editor interfaces
