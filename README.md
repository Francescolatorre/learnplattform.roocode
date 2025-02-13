# Learning Platform MVP

## Project Overview
A learning platform with LLM-powered assessment, built using Django REST Framework and React.

## Technology Stack
- **Backend**: Django, Django REST Framework
- **Frontend**: React, Material UI
- **Database**: PostgreSQL
- **Authentication**: JWT
- **LLM Integration**: OpenAI GPT

## Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL 15+

## Backend Setup

### Virtual Environment
```bash
python -m venv venv
source venv/bin/activate  # On Windows use `venv\Scripts\activate`
```

### Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### Environment Configuration
1. Copy `.env.example` to `.env`
2. Update database and OpenAI credentials

### Database Setup
```bash
python manage.py migrate
```

### Run Development Server
```bash
python manage.py runserver
```

## API Endpoints

### Health Check
- **URL**: `/api/core/health/`
- **Method**: GET
- **Description**: Returns system and application health status
- **Response**: 
  ```json
  {
    "status": "healthy",
    "system": {
      "python_version": "3.10.0",
      "django_version": "4.2.x",
      "platform": "Windows-10",
      "cpu_usage": 10.5,
      "memory_usage": 45.2
    },
    "database": {
      "status": "connected"
    }
  }
  ```

## Frontend Setup

### Install Dependencies
```bash
cd frontend
npm install
```

### Run Development Server
```bash
npm run dev
```

## Development Workflow
- Feature branch development
- Pytest for backend testing
- Jest for frontend testing
- Linting with flake8 and ESLint

## MVP Features
- Free tutorials
- LLM-powered assessment
- Basic user management
- Course submissions

## YAGNI Considerations
- No premium features
- No complex deployment
- No microservices
- No advanced caching

## License
MIT License