# ---- Stage 1: Build React Frontend ----
FROM node:20-alpine AS build-stage
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# ---- Stage 2: Build Python Backend ----
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy backend application code
COPY . .

# Copy built frontend from Stage 1 into the backend directory
COPY --from=build-stage /app/frontend/dist /app/frontend/dist

# Expose the port the app runs on
EXPOSE 8000

# Command to run the application using Render's PORT environment variable
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
