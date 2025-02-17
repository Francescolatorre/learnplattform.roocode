#!/bin/bash

# Determine project root directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/../../.." && pwd )"

# Backend setup
cd "$PROJECT_ROOT/backend"

# Activate virtual environment (if using one)
# source venv/bin/activate  # Uncomment if using a virtual environment

# Run migrations
python manage.py migrate

# Generate test data
python manage.py shell < backend/learning/tests/user_acceptance/test_data_generator.py

# Run backend tests
python -m pytest backend/learning/tests/user_acceptance/test_user_acceptance.py

# Frontend setup
cd "$PROJECT_ROOT/frontend"

# Install frontend dependencies
npm install

# Start backend server
cd "$PROJECT_ROOT/backend"
python manage.py runserver 8000 &
BACKEND_PID=$!

# Start frontend development server
cd "$PROJECT_ROOT/frontend"
npm run dev &
FRONTEND_PID=$!

# Print server details
echo "Test Environment Started:"
echo "- Backend Server: http://localhost:8000"
echo "- Frontend Server: http://localhost:5173"
echo ""
echo "Test Users:"
echo "- Lead Instructor: lead_instructor / testpass123"
echo "- Assistant Instructor: assistant_instructor / testpass123"
echo "- Guest Instructor: guest_instructor / testpass123"
echo ""
echo "To stop servers, use: kill $BACKEND_PID $FRONTEND_PID"