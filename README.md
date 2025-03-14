# Flinsight

A full-stack application with Next.js frontend and Python Flask backend.

## Prerequisites

- Node.js (v18 or later)
- Python 3.8 or later
- pnpm (recommended) or npm

## Setup

1. Install frontend dependencies:
```bash
pnpm install
```

2. Install backend dependencies:
```bash
cd backend
pip install -r requirements.txt
cd ..
```

3. Create a `.env.local` file in the root directory with your environment variables:
```
GEMINI_API_KEY=your_gemini_api_key
```

## Running the Application

### Development Mode
To run both frontend and backend in development mode:
```bash
pnpm dev
```
This will start:
- Frontend on http://localhost:3000
- Backend on http://localhost:5000

### Production Mode
To run both frontend and backend in production mode:
```bash
pnpm build
pnpm start
```

## API Endpoints

The backend API is available at http://localhost:5000 with the following endpoints:
- `/api/health` - Health check endpoint
- `/api/aircraft` - Get aircraft information
- `/api/analyze-flight` - Analyze flight details
- `/api/regulations` - Get FAA regulations
- `/api/fetch-faa-updates` - Fetch FAA updates
- `/api/generate-action-items` - Generate action items

## Development

- Frontend code is in the root directory
- Backend code is in the `backend` directory
- The application uses Next.js for the frontend and Flask for the backend

# Flinsight - Aviation Compliance Platform

Flinsight is an AI-powered aviation compliance platform that analyzes flight plans against FAA regulations, with special optimizations for Gulfstream 550 aircraft operations.

## Features

- AI-powered rule engine to scan FAA updates
- Real-time compliance analysis for flight plans
- Automatic generation of action items, checklists, and risk analyses
- Gulfstream 550 optimized compliance checks
- Modern aviation-style UI

## Project Structure

The project combines a Next.js frontend with a Flask backend:

