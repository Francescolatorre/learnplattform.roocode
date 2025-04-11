# Learning Platform Product Context

## Vision Statement

Democratize personalized learning through AI-powered adaptive assessment and intelligent course progression.

## Problem Space

### Current Learning Challenges

- One-size-fits-all educational approaches
- Limited personalized feedback
- Inefficient learning path determination
- Lack of adaptive assessment techniques

## Target User Personas

1. **Self-Directed Learner**
   - Age: 25-45
   - Goals: Skill enhancement, career development
   - Challenges: Limited time, need for flexible learning

2. **Professional Upskiller**
   - Age: 30-50
   - Goals: Technical skill acquisition
   - Challenges: Precise skill mapping, practical application

3. **Educational Institution**
   - Type: Online learning platforms, corporate training
   - Goals: Scalable, data-driven learning experiences
   - Challenges: Individual learner tracking, performance optimization

## Core Value Propositions

- **Adaptive Learning Paths**
  - AI-driven curriculum customization
  - Real-time skill gap identification
  - Personalized learning recommendations

- **Intelligent Assessment**
  - Beyond multiple-choice evaluations
  - Contextual understanding of learner responses
  - Nuanced performance feedback

- **Progress Tracking**
  - Granular skill progression metrics
  - Comparative learning analytics
  - Motivational progress visualization

## Minimum Viable Product (MVP) Features

1. User Registration and Profile
2. Course Catalog
3. Task-based Learning Units
4. AI-Powered Submission Evaluation
5. User Progress Tracking
6. Basic Recommendation Engine

## Frontend Error Toast/Message Mechanism (DRAFT, 2025-04-11)

### Overview

A centralized, accessible error notification system is required for the React/TypeScript frontend. This mechanism must provide consistent, user-friendly error toasts/messages, leveraging Material UI and the React Context API, and must comply with accessibility standards (including ARIA and keyboard navigation). The solution is governed by ADR-012: Centralized Frontend Error Notification System.

### Requirements

- The error notification system must be implemented as a centralized provider using the React Context API.
- Error toasts/messages must use Material UI components (e.g., Snackbar, Alert) for visual consistency and accessibility.
- All error notifications must be accessible to users with disabilities, including:
  - Proper ARIA roles and attributes (e.g., role="alert", aria-live="assertive").
  - Keyboard navigation support (e.g., focus management, dismiss via keyboard).
- The system must expose a simple API (custom hook) for triggering error notifications from any component.
- Only one error toast/message should be visible at a time; new errors replace or queue previous ones.
- Error messages must be clear, concise, and actionable for end users.
- The system must be extensible for future notification types (success, warning, info) and custom actions.
- The provider must be integrated at the application root to ensure global availability.
- The implementation must be covered by unit and integration tests.
- The solution must not introduce significant performance overhead (avoid excessive re-renders).
- All requirements and implementation must align with ADR-012 and be referenced in technical documentation.

### User Stories

- **US-ERR-001:** As a user, I want to see a clear, accessible error message whenever an error occurs, so I understand what went wrong and what to do next.
- **US-ERR-002:** As a user relying on assistive technology, I want error notifications to be announced and navigable via keyboard, so I am not excluded from critical feedback.
- **US-ERR-003:** As a developer, I want a simple, reusable API to trigger error toasts from any component, so I can provide consistent error feedback without duplicating logic.
- **US-ERR-004:** As a user, I want to be able to dismiss error messages using the keyboard or mouse, so I can control my experience.

### Acceptance Criteria

- [ ] Error toasts/messages are displayed using Material UI components and match the platform's visual style.
- [ ] Error notifications are announced to screen readers (e.g., via role="alert" and aria-live attributes).
- [ ] Users can dismiss error toasts/messages using both mouse and keyboard (e.g., Escape key, close button).
- [ ] Only one error toast/message is visible at a time; new errors replace or queue previous ones.
- [ ] The error notification system is accessible from any component via a custom hook (e.g., useErrorNotifier).
- [ ] The provider is integrated at the application root and covers the entire app.
- [ ] The system is covered by unit and integration tests, including accessibility tests.
- [ ] The implementation is documented and references ADR-012.
- [ ] No significant performance regressions are introduced (verified by profiling if needed).
- [ ] The system is extensible for future notification types and custom actions.

## Success Metrics

- User Engagement Rate
- Learning Completion Percentage
- Skill Acquisition Speed
- User Satisfaction Score
- Recommendation Accuracy

## Competitive Differentiation

- More granular assessment
- Real-time adaptive learning
- Lower cognitive load for learners
- Privacy-focused AI implementation

## Ethical Considerations

- Transparent AI decision-making
- User data privacy
- Bias mitigation in assessment algorithms
- Accessibility for diverse learner backgrounds

## Future Roadmap

### Short-Term (3-6 Months)

- Enhanced AI evaluation models
- More diverse course content
- Improved recommendation algorithms

### Mid-Term (6-12 Months)

- Multi-language support
- Advanced skill mapping
- Enterprise learning solutions

### Long-Term Vision

- Global learning ecosystem
- Predictive career path guidance
- Lifelong learning platform

## API Authentication Test Requirements (2025-04-11)

- The platform requires robust API authentication using JWT (Simple JWT, Django REST Framework).
- Playwright API/authentication tests must:
  - Target the backend at <http://localhost:8000>
  - Use valid test credentials (admin/adminpassword, instructor/instructor123, student/student123)
  - Obtain a JWT token via the login endpoint and use it for all protected API requests
- Test failures are most likely due to:
  - Backend not running or not accessible at the expected URL
  - Test users not present in the backend database
  - Authentication endpoints not fully implemented or not matching test expectations
  - JWT/token handling issues in the test code
- API implementation is IN_PROGRESS; test reliability depends on backend readiness and user data setup.

**Action:**

- Ensure backend is running and test users exist before running Playwright API/auth tests.
- Align test logic with backend authentication flow and update as backend implementation evolves.

## Technical North Star

Create an intelligent, adaptive learning platform that understands and nurtures individual learning potential through technology.
