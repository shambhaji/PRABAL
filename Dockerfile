# ─────────────────────────────────────────────
# Stage 1: Build the React frontend
# ─────────────────────────────────────────────
FROM node:20-slim AS frontend-build

WORKDIR /build
COPY frontend/package*.json ./
RUN npm ci --silent
COPY frontend/ ./
RUN npm run build
# Output: /build/dist

# ─────────────────────────────────────────────
# Stage 2: Python backend + serve frontend
# ─────────────────────────────────────────────
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app

WORKDIR /app

# System deps
RUN apt-get update && apt-get install -y --no-install-recommends gcc \
    && rm -rf /var/lib/apt/lists/*

# Python deps
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# App code
COPY . .

# Copy built frontend assets from Stage 1
COPY --from=frontend-build /build/dist /app/frontend/dist

EXPOSE 8000

# Render injects $PORT — fallback to 8000 for local testing
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}

