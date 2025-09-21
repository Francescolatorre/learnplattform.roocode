#!/bin/bash

# Setup GitHub Labels for Learning Platform Project
# Run this script to create all necessary labels for project management

REPO="Francescolatorre/learnplattform.roocode"

echo "Setting up GitHub labels for Learning Platform project..."

# Priority Labels
gh label create "priority/critical" --color "d73a4a" --description "Critical priority - blocks other work" --repo $REPO || true
gh label create "priority/high" --color "ff6b6b" --description "High priority - next sprint" --repo $REPO || true
gh label create "priority/medium" --color "ffa726" --description "Medium priority - current backlog" --repo $REPO || true
gh label create "priority/low" --color "66bb6a" --description "Low priority - future consideration" --repo $REPO || true

# Type Labels
gh label create "type/feature" --color "1976d2" --description "New feature implementation" --repo $REPO || true
gh label create "type/enhancement" --color "2196f3" --description "Enhancement to existing feature" --repo $REPO || true
gh label create "type/bug" --color "d32f2f" --description "Bug fix required" --repo $REPO || true
gh label create "type/refactor" --color "7b1fa2" --description "Code refactoring/modernization" --repo $REPO || true
gh label create "type/documentation" --color "795548" --description "Documentation updates" --repo $REPO || true

# Component Labels
gh label create "component/frontend" --color "4caf50" --description "Frontend React/TypeScript changes" --repo $REPO || true
gh label create "component/backend" --color "ff9800" --description "Backend Django/Python changes" --repo $REPO || true
gh label create "component/database" --color "795548" --description "Database schema/migration changes" --repo $REPO || true
gh label create "component/infrastructure" --color "607d8b" --description "DevOps/Infrastructure changes" --repo $REPO || true
gh label create "component/testing" --color "9c27b0" --description "Testing framework/test changes" --repo $REPO || true

# Phase Labels (Service Modernization)
gh label create "modernization/phase-1" --color "e1bee7" --description "Phase 1: Parallel Implementation (Complete)" --repo $REPO || true
gh label create "modernization/phase-2" --color "ce93d8" --description "Phase 2: Gradual Adoption (Active)" --repo $REPO || true
gh label create "modernization/phase-3" --color "ba68c8" --description "Phase 3: Legacy Cleanup (Planned)" --repo $REPO || true

# Agent Labels
gh label create "agent/requirements-engineer" --color "ffcdd2" --description "Assigned to requirements engineer" --repo $REPO || true
gh label create "agent/learning-platform-architect" --color "f8bbd9" --description "Assigned to learning platform architect" --repo $REPO || true
gh label create "agent/devops-test-environment" --color "e1bee7" --description "Assigned to devops test environment" --repo $REPO || true
gh label create "agent/github-project-manager" --color "c5cae9" --description "Assigned to github project manager" --repo $REPO || true

# Status Labels
gh label create "status/blocked" --color "d32f2f" --description "Blocked by dependencies" --repo $REPO || true
gh label create "status/in-review" --color "ff9800" --description "Under code review" --repo $REPO || true
gh label create "status/testing" --color "ffc107" --description "In testing phase" --repo $REPO || true
gh label create "status/ready" --color "4caf50" --description "Ready for development" --repo $REPO || true

# Learning Platform Specific Labels
gh label create "area/course-management" --color "3f51b5" --description "Course creation, editing, management" --repo $REPO || true
gh label create "area/user-management" --color "009688" --description "User authentication, profiles, roles" --repo $REPO || true
gh label create "area/enrollment" --color "8bc34a" --description "Course enrollment and progress tracking" --repo $REPO || true
gh label create "area/assessment" --color "ff5722" --description "Quizzes, assignments, grading" --repo $REPO || true
gh label create "area/analytics" --color "673ab7" --description "Learning analytics and reporting" --repo $REPO || true
gh label create "area/admin" --color "e91e63" --description "Administrative features and dashboards" --repo $REPO || true

# Standard Labels
gh label create "task" --color "0052cc" --description "Development task from backlog" --repo $REPO || true
gh label create "backlog" --color "fbca04" --description "Item in backlog" --repo $REPO || true
gh label create "sprint" --color "1d76db" --description "Current sprint item" --repo $REPO || true
gh label create "epic" --color "5319e7" --description "Large feature or initiative" --repo $REPO || true

echo "✅ GitHub labels setup complete!"
echo "🔗 View your project board: https://github.com/users/Francescolatorre/projects/7/"
echo "📋 All labels are now available for issue assignment"