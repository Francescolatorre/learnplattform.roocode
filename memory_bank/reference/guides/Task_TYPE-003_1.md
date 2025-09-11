# Task: Implement Multiple Choice Quiz Task Type

## Task Metadata
- **Task-ID:** TASK-TYPE-003
- **Status:** TODO
- **Priority:** Medium
- **Dependencies:** TASK-SUBMISSION-001
- **Assigned To:** Architect
- **Started At:** 2025-02-26 21:25:06
- **Estimated Completion:** 2025-05-01
- **Story Points:** 7

## Description
Implement a comprehensive multiple choice quiz task type that allows instructors to create quizzes with various question formats and automatic grading. This task type will support question randomization, timed assessments, and immediate feedback options.

## Business Context
Multiple choice quizzes are fundamental assessment tools in educational settings, allowing for efficient evaluation of student knowledge across various subjects. They provide objective assessment with automatic grading, reducing instructor workload while providing students with immediate feedback. This task type is essential for knowledge checks, practice assessments, and formal examinations.

## Technical Context
- **System Architecture:** Django backend with React frontend
- **Related Components:** 
  - LearningTask model (from TASK-MODEL-001)
  - Submission system (from TASK-SUBMISSION-001)
  - Task type registry system
  - Grading service
- **Technical Constraints:**
  - Must use the task type interface defined in the task types implementation guide
  - Must support secure quiz delivery to prevent cheating
  - Must implement efficient grading algorithms
  - Must handle various question formats within a unified framework

## Requirements

### Inputs
- Task settings from instructor (questions, options, correct answers, scoring rules)
- Student quiz responses
- Quiz configuration (time limits, randomization, feedback options)

### Outputs
- Rendered quiz interface for students
- Automatic grading results
- Detailed feedback (if enabled)
- Performance analytics

### Functional Requirements
1. Quiz Creation Interface
   - Question editor with support for text and media
   - Answer option configuration
   - Correct answer designation
   - Point value assignment
   - Question grouping and organization

2. Quiz Taking Experience
   - Clear question and option display
   - Progress tracking
   - Timer for timed quizzes
   - Navigation between questions
   - Answer saving and submission

3. Quiz Configuration
   - Question randomization options
   - Answer option randomization
   - Time limits
   - Attempt limits
   - Feedback settings (immediate, delayed, or none)
   - Pass/fail thresholds

4. Grading and Feedback
   - Automatic scoring based on correct answers
   - Partial credit options
   - Detailed feedback for incorrect answers
   - Performance statistics

### Technical Requirements
- Implement `MultipleChoiceQuizTaskType` class extending `BaseTaskType`
- Create React components for quiz creation and taking
- Implement secure quiz delivery to prevent answer extraction
- Support various question formats (single answer, multiple answer, true/false)
- Implement efficient grading algorithms

## Implementation Details

### Required Libraries and Versions
- Frontend:
  - React 18.0+
  - Redux 4.2.0+ for state management
  - react-hook-form 7.0.0+ for form handling
  - react-dnd 16.0.0+ for drag-and-drop question ordering
- Backend:
  - Django 4.2+
  - django-rest-framework 3.14.0+ for API
  - celery 5.2.0+ for background processing (optional for analytics)

### Code Examples

#### Task Type Implementation
```python
from tasks.models import BaseTaskType
from django.core.exceptions import ValidationError
import random
import json

class MultipleChoiceQuizTaskType(BaseTaskType):
    def validate_settings(self, settings):
        """Validate quiz settings"""
        if 'questions' not in settings or not isinstance(settings['questions'], list):
            raise ValidationError("Quiz must contain a list of questions")
            
        if len(settings['questions']) == 0:
            raise ValidationError("Quiz must contain at least one question")
            
        for i, question in enumerate(settings['questions']):
            # Validate each question
            if 'text' not in question:
                raise ValidationError(f"Question {i+1} is missing text")
                
            if 'options' not in question or not isinstance(question['options'], list):
                raise ValidationError(f"Question {i+1} must have a list of options")
                
            if len(question['options']) < 2:
                raise ValidationError(f"Question {i+1} must have at least 2 options")
                
            if 'correctAnswer' not in question:
                raise ValidationError(f"Question {i+1} is missing correctAnswer")
                
            # For single answer questions
            if not isinstance(question['correctAnswer'], list):
                if question['correctAnswer'] not in [opt['id'] for opt in question['options']]:
                    raise ValidationError(f"Question {i+1} has invalid correctAnswer")
            # For multiple answer questions
            else:
                for answer in question['correctAnswer']:
                    if answer not in [opt['id'] for opt in question['options']]:
                        raise ValidationError(f"Question {i+1} has invalid correctAnswer: {answer}")
        
        return True
        
    def get_submission_form(self, task):
        """Return the form configuration for quiz taking"""
        settings = task.settings
        
        # Create a copy of questions to avoid modifying the original
        questions = json.loads(json.dumps(settings.get('questions', [])))
        
        # Apply randomization if enabled
        if settings.get('shuffleQuestions', False):
            random.shuffle(questions)
            
        # Shuffle options for each question if enabled
        if settings.get('shuffleOptions', False):
            for question in questions:
                random.shuffle(question['options'])
                
        # Remove correct answers from the questions sent to students
        for question in questions:
            question.pop('correctAnswer', None)
            question.pop('explanation', None)
            
        return {
            'type': 'multiple_choice_quiz',
            'questions': questions,
            'timeLimit': settings.get('timeLimit', None),  # in minutes
            'allowMultipleAttempts': settings.get('allowMultipleAttempts', False),
            'showProgressBar': settings.get('showProgressBar', True),
            'requireAllQuestions': settings.get('requireAllQuestions', True)
        }
        
    def process_submission(self, task, submission_data):
        """Process a quiz submission and grade it"""
        student_answers = submission_data.get('answers', {})
        quiz_settings = task.settings
        questions = quiz_settings.get('questions', [])
        
        # Initialize grading data
        total_points = 0
        earned_points = 0
        question_results = []
        
        # Grade each question
        for question in questions:
            question_id = question['id']
            points = question.get('points', 1)
            total_points += points
            
            student_answer = student_answers.get(question_id)
            correct_answer = question['correctAnswer']
            
            # Skip if student didn't answer
            if student_answer is None:
                question_results.append({
                    'questionId': question_id,
                    'correct': False,
                    'points': 0,
                    'possiblePoints': points,
                    'studentAnswer': None,
                    'correctAnswer': correct_answer
                })
                continue
                
            # Check if answer is correct
            is_correct = False
            
            # For single answer questions
            if not isinstance(correct_answer, list):
                is_correct = student_answer == correct_answer
            # For multiple answer questions
            else:
                # Convert to sets for comparison
                if isinstance(student_answer, list):
                    student_answer_set = set(student_answer)
                    correct_answer_set = set(correct_answer)
                    is_correct = student_answer_set == correct_answer_set
            
            # Award points if correct
            question_points = points if is_correct else 0
            earned_points += question_points
            
            # Record result
            question_results.append({
                'questionId': question_id,
                'correct': is_correct,
                'points': question_points,
                'possiblePoints': points,
                'studentAnswer': student_answer,
                'correctAnswer': correct_answer if quiz_settings.get('showCorrectAnswers', False) else None,
                'explanation': question.get('explanation') if is_correct or quiz_settings.get('showExplanations', False) else None
            })
        
        # Calculate score percentage
        score_percentage = (earned_points / total_points * 100) if total_points > 0 else 0
        
        # Determine if passed based on threshold
        passing_threshold = quiz_settings.get('passingThreshold', 70)
        passed = score_percentage >= passing_threshold
        
        return {
            'score': earned_points,
            'totalPoints': total_points,
            'percentage': score_percentage,
            'passed': passed,
            'questionResults': question_results,
            'timeSpent': submission_data.get('timeSpent'),  # in seconds
            'completed': submission_data.get('completed', True)
        }
        
    def get_grading_form(self, task, submission):
        """Return the form for reviewing quiz results"""
        return {
            'type': 'multiple_choice_quiz_review',
            'submission': submission.data,
            'questions': task.settings.get('questions', []),
            'allowManualScoreAdjustment': task.settings.get('allowManualScoreAdjustment', False)
        }
```

#### Frontend Component
```jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import QuizTimer from './QuizTimer';
import QuestionNavigation from './QuestionNavigation';

const MultipleChoiceQuiz = ({ task, onSubmit }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeSpent, setTimeSpent] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [timeExpired, setTimeExpired] = useState(false);
  
  const { questions, timeLimit, requireAllQuestions, showProgressBar } = task.settings;
  
  // Start quiz timer when quiz starts
  useEffect(() => {
    if (quizStarted && !quizCompleted) {
      const timer = setInterval(() => {
        setTimeSpent(prev => prev + 1);
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [quizStarted, quizCompleted]);
  
  // Auto-submit when time expires
  useEffect(() => {
    if (timeExpired && !quizCompleted) {
      handleSubmit();
    }
  }, [timeExpired]);
  
  const handleStartQuiz = () => {
    setQuizStarted(true);
  };
  
  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };
  
  const handleMultiAnswerChange = (questionId, optionId, checked) => {
    setAnswers(prev => {
      const currentAnswers = prev[questionId] || [];
      
      if (checked) {
        return {
          ...prev,
          [questionId]: [...currentAnswers, optionId]
        };
      } else {
        return {
          ...prev,
          [questionId]: currentAnswers.filter(id => id !== optionId)
        };
      }
    });
  };
  
  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };
  
  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };
  
  const handleJumpToQuestion = (index) => {
    if (index >= 0 && index < questions.length) {
      setCurrentQuestionIndex(index);
    }
  };
  
  const canSubmit = () => {
    if (requireAllQuestions) {
      return Object.keys(answers).length === questions.length;
    }
    return true;
  };
  
  const handleSubmit = () => {
    setQuizCompleted(true);
    
    onSubmit({
      answers,
      timeSpent,
      completed: !timeExpired
    });
  };
  
  // If quiz hasn't started yet, show start screen
  if (!quizStarted) {
    return (
      <div className="quiz-start-screen">
        <h2>{task.title}</h2>
        <div className="quiz-instructions">
          <p>{task.description}</p>
          <ul className="quiz-details">
            <li>Number of questions: {questions.length}</li>
            {timeLimit && <li>Time limit: {timeLimit} minutes</li>}
            <li>Passing score: {task.settings.passingThreshold || 70}%</li>
          </ul>
        </div>
        <button 
          className="start-quiz-btn"
          onClick={handleStartQuiz}
        >
          Start Quiz
        </button>
      </div>
    );
  }
  
  // If quiz is completed, show completion screen
  if (quizCompleted) {
    return (
      <div className="quiz-completion-screen">
        <h2>Quiz Submitted</h2>
        <p>Your answers have been submitted successfully.</p>
        {task.settings.showResultsImmediately && (
          <div className="quiz-results">
            {/* Results would be displayed here if immediate feedback is enabled */}
          </div>
        )}
      </div>
    );
  }
  
  // Get current question
  const currentQuestion = questions[currentQuestionIndex];
  const isMultipleAnswer = Array.isArray(currentQuestion.correctAnswer);
  
  return (
    <div className="quiz-container">
      {/* Quiz header with timer and progress */}
      <div className="quiz-header">
        {timeLimit && (
          <QuizTimer 
            timeLimit={timeLimit * 60} // Convert to seconds
            timeSpent={timeSpent}
            onTimeExpired={() => setTimeExpired(true)}
          />
        )}
        
        {showProgressBar && (
          <div className="quiz-progress">
            <div 
              className="progress-bar"
              style={{ width: `${(Object.keys(answers).length / questions.length) * 100}%` }}
            />
            <span>{Object.keys(answers).length} of {questions.length} answered</span>
          </div>
        )}
      </div>
      
      {/* Question display */}
      <div className="question-container">
        <div className="question-number">
          Question {currentQuestionIndex + 1} of {questions.length}
        </div>
        
        <div className="question-text">
          {currentQuestion.text}
        </div>
        
        {/* Question media if present */}
        {currentQuestion.media && (
          <div className="question-media">
            {currentQuestion.media.type === 'image' && (
              <img 
                src={currentQuestion.media.url} 
                alt={currentQuestion.media.alt || 'Question image'} 
              />
            )}
          </div>
        )}
        
        {/* Answer options */}
        <div className="answer-options">
          {isMultipleAnswer ? (
            // Multiple answer (checkboxes)
            currentQuestion.options.map(option => (
              <div key={option.id} className="answer-option checkbox">
                <input
                  type="checkbox"
                  id={`option-${option.id}`}
                  checked={(answers[currentQuestion.id] || []).includes(option.id)}
                  onChange={(e) => handleMultiAnswerChange(
                    currentQuestion.id,
                    option.id,
                    e.target.checked
                  )}
                />
                <label htmlFor={`option-${option.id}`}>{option.text}</label>
              </div>
            ))
          ) : (
            // Single answer (radio buttons)
            currentQuestion.options.map(option => (
              <div key={option.id} className="answer-option radio">
                <input
                  type="radio"
                  id={`option-${option.id}`}
                  name={`question-${currentQuestion.id}`}
                  value={option.id}
                  checked={answers[currentQuestion.id] === option.id}
                  onChange={() => handleAnswerChange(currentQuestion.id, option.id)}
                />
                <label htmlFor={`option-${option.id}`}>{option.text}</label>
              </div>
            ))
          )}
        </div>
      </div>
      
      {/* Navigation controls */}
      <div className="quiz-navigation">
        <button
          className="prev-question-btn"
          onClick={handlePreviousQuestion}
          disabled={currentQuestionIndex === 0}
        >
          Previous
        </button>
        
        <QuestionNavigation
          questionCount={questions.length}
          currentIndex={currentQuestionIndex}
          answeredQuestions={Object.keys(answers).map(Number)}
          onSelectQuestion={handleJumpToQuestion}
        />
        
        <button
          className="next-question-btn"
          onClick={handleNextQuestion}
          disabled={currentQuestionIndex === questions.length - 1}
        >
          Next
        </button>
      </div>
      
      {/* Submit button */}
      <div className="quiz-actions">
        <button
          className="submit-quiz-btn"
          onClick={handleSubmit}
          disabled={!canSubmit()}
        >
          Submit Quiz
        </button>
        
        {requireAllQuestions && !canSubmit() && (
          <div className="submission-warning">
            Please answer all questions before submitting.
          </div>
        )}
      </div>
    </div>
  );
};

// Timer component
const QuizTimer = ({ timeLimit, timeSpent, onTimeExpired }) => {
  const [timeRemaining, setTimeRemaining] = useState(timeLimit - timeSpent);
  
  useEffect(() => {
    setTimeRemaining(timeLimit - timeSpent);
    
    if (timeSpent >= timeLimit) {
      onTimeExpired();
    }
  }, [timeLimit, timeSpent, onTimeExpired]);
  
  // Format time as mm:ss
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  // Calculate percentage of time remaining
  const timePercentage = (timeRemaining / timeLimit) * 100;
  
  return (
    <div className="quiz-timer">
      <div 
        className={`timer-bar ${timePercentage < 20 ? 'timer-warning' : ''}`}
        style={{ width: `${timePercentage}%` }}
      />
      <div className="timer-text">
        Time Remaining: {formatTime(timeRemaining)}
      </div>
    </div>
  );
};

// Question navigation component
const QuestionNavigation = ({ 
  questionCount, 
  currentIndex, 
  answeredQuestions, 
  onSelectQuestion 
}) => {
  return (
    <div className="question-navigation">
      {Array.from({ length: questionCount }).map((_, index) => (
        <button
          key={index}
          className={`
            question-nav-btn
            ${index === currentIndex ? 'current' : ''}
            ${answeredQuestions.includes(index) ? 'answered' : ''}
          `}
          onClick={() => onSelectQuestion(index)}
        >
          {index + 1}
        </button>
      ))}
    </div>
  );
};

export default MultipleChoiceQuiz;
```

## Edge Cases and Challenges

### Edge Cases
1. **Browser Refresh/Navigation**: Preserve quiz state if student refreshes or navigates away
2. **Time Expiration**: Handle graceful submission when time expires
3. **Partial Completion**: Support saving and resuming quizzes
4. **Network Issues**: Handle offline mode and reconnection
5. **Multiple Devices**: Prevent taking quiz on multiple devices simultaneously

### Challenges
1. **Question Randomization**: Ensuring fair distribution when randomizing
2. **Answer Security**: Preventing extraction of correct answers from frontend
3. **Timed Assessments**: Accurate time tracking across devices and network issues
4. **Accessibility**: Making quiz interface accessible for all users
5. **Performance**: Handling quizzes with many questions efficiently

## Performance Considerations
- Optimize question loading for large quizzes (pagination or virtualization)
- Implement efficient answer saving (debouncing, local storage)
- Minimize network requests during quiz taking
- Optimize grading algorithm for large question sets
- Consider caching strategies for quiz content

## Security Considerations
- Store correct answers only on the server
- Implement secure quiz session management
- Prevent answer extraction through browser tools
- Validate all submissions server-side
- Implement measures to prevent cheating (e.g., browser lockdown options)

## Testing Requirements
- Unit tests for grading logic
- Integration tests for quiz workflow
- Performance tests with large question sets
- Security tests for answer protection
- Accessibility testing for quiz interface

## Validation Criteria
- [x] Quiz creation interface supports all required question types
- [x] Randomization options work correctly
- [x] Timed quizzes enforce time limits
- [x] Automatic grading produces correct results
- [x] Quiz state is preserved during interruptions

## Acceptance Criteria
1. Instructors can create quizzes with various question types
2. Students can take quizzes with clear navigation and feedback
3. Timed quizzes enforce time limits with appropriate warnings
4. Automatic grading works correctly for all question types
5. Quiz results are properly stored and accessible for review

## Learning Resources
- [React Form Handling Best Practices](https://reactjs.org/docs/forms.html)
- [Quiz UX Design Patterns](https://uxdesign.cc/quiz-design-best-practices-7cba31d1dde7)
- [Secure Quiz Implementation](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [Accessibility in Quiz Applications](https://www.w3.org/WAI/tutorials/forms/)

## Expert Contacts
- **Quiz Design**: Emily Thompson (emily.thompson@example.com)
- **Assessment Security**: Robert Kim (robert.kim@example.com)
- **Educational UX**: Sophia Martinez (sophia.martinez@example.com)

## Related Design Patterns
- **State Pattern**: For managing quiz states (not started, in progress, completed)
- **Strategy Pattern**: For different question types and grading strategies
- **Observer Pattern**: For timer and progress tracking
- **Memento Pattern**: For saving and restoring quiz state

## Sample Data Structures

### Task Settings Schema
```json
{
  "questions": [
    {
      "id": "q1",
      "text": "What is the capital of France?",
      "options": [
        {"id": "a", "text": "London"},
        {"id": "b", "text": "Paris"},
        {"id": "c", "text": "Berlin"},
        {"id": "d", "text": "Madrid"}
      ],
      "correctAnswer": "b",
      "explanation": "Paris is the capital and most populous city of France.",
      "points": 1
    },
    {
      "id": "q2",
      "text": "Which of the following are primary colors? (Select all that apply)",
      "options": [
        {"id": "a", "text": "Red"},
        {"id": "b", "text": "Green"},
        {"id": "c", "text": "Blue"},
        {"id": "d", "text": "Yellow"}
      ],
      "correctAnswer": ["a", "c", "d"],
      "explanation": "The primary colors are red, blue, and yellow.",
      "points": 2
    }
  ],
  "shuffleQuestions": true,
  "shuffleOptions": true,
  "timeLimit": 30,
  "passingThreshold": 70,
  "allowMultipleAttempts": false,
  "showCorrectAnswers": false,
  "showExplanations": true,
  "showProgressBar": true,
  "requireAllQuestions": true,
  "showResultsImmediately": false
}
```

### Submission Data Schema
```json
{
  "answers": {
    "q1": "b",
    "q2": ["a", "c", "d"]
  },
  "score": 3,
  "totalPoints": 3,
  "percentage": 100,
  "passed": true,
  "questionResults": [
    {
      "questionId": "q1",
      "correct": true,
      "points": 1,
      "possiblePoints": 1,
      "studentAnswer": "b",
      "correctAnswer": "b",
      "explanation": "Paris is the capital and most populous city of France."
    },
    {
      "questionId": "q2",
      "correct": true,
      "points": 2,
      "possiblePoints": 2,
      "studentAnswer": ["a", "c", "d"],
      "correctAnswer": ["a", "c", "d"],
      "explanation": "The primary colors are red, blue, and yellow."
    }
  ],
  "timeSpent": 450,
  "completed": true
}
```

## Estimated Effort
- Frontend Implementation: 3 story points
- Backend Implementation: 2 story points
- Testing and Security: 2 story points
- Total: 7 story points

## Potential Risks
- Security vulnerabilities in quiz delivery
- Performance issues with large question sets
- Browser compatibility issues
- Accessibility challenges
- Time synchronization issues
