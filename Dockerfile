# Use Python 3.11 slim image
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PORT=8000

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements and install Python dependencies
COPY backend/requirements.txt /app/backend/
RUN cd backend && pip install --no-cache-dir -r requirements.txt

# Copy project
COPY . /app/

# Collect static files, run migrations, and start server
CMD cd backend && \
    python manage.py collectstatic --noinput && \
    python manage.py migrate && \
    gunicorn config.wsgi:application --bind 0.0.0.0:$PORT