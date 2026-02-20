# PanelZero Vercel Deployment Guide

## Overview

PanelZero has been converted from a FastAPI + Celery architecture to a **Flask-based serverless setup** optimized for Vercel deployment.

### Key Changes

- ✅ **Flask** replaces FastAPI
- ✅ **Synchronous processing** replaces Celery task queue (no Redis needed)
- ✅ **Windows-only** scripts (no Linux/Mac support)
- ✅ **Vercel-ready** with serverless functions

## Prerequisites

- Node.js 18+
- Python 3.10+
- pnpm 8.15.0+
- Vercel account (for deployment)
- Supabase project (for database & storage)

## Local Development

### 1. Install Dependencies

From root directory:
```bash
pnpm install
```

### 2. Setup Backend Environment

```bash
cd backend
py -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

Create `.env` file in `/backend`:
```
DEBUG=True
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key
SUPABASE_ANON_KEY=your_anon_key
OPENAI_API_KEY=your_openai_key
GEMINI_API_KEY=your_gemini_key
BYTEZ_API_KEY=your_bytez_api_key
```

### 3. Setup Frontend Environment

Create `frontend/.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 4. Run Development Server

From root directory:
```bash
pnpm dev
```

This starts:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:8000

## Vercel Deployment

### 1. Push to GitHub

```bash
git add .
git commit -m "feat: migrate to Flask and serverless architecture"
git push origin main
```

### 2. Deploy to Vercel

Option A: Via Vercel CLI
```bash
npm i -g vercel
vercel deploy
```

Option B: Via Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Configure project settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./`
   - **Build Command**: `pnpm build`

### 3. Configure Environment Variables

In Vercel Project Settings → Environment Variables:

```
SUPABASE_URL=your_value
SUPABASE_SERVICE_KEY=your_value
OPENAI_API_KEY=your_value
GEMINI_API_KEY=your_value
BYTEZ_API_KEY=your_value
DEBUG=False
```

### 4. Set Python Runtime

Update `vercel.json` if needed:
```json
{
  "functions": {
    "backend/**/*.py": {
      "runtime": "python3.11"
    }
  }
}
```

## Project Structure

```
panel-zero/
├── api/
│   └── index.py              # Vercel serverless function entry
├── backend/
│   ├── main.py              # Flask app (replaces FastAPI)
│   ├── api/
│   │   ├── documents.py      # Document upload/management
│   │   └── analysis.py       # Analysis execution (sync)
│   ├── agents/
│   │   ├── llm_executor.py
│   │   └── technical_reader.py
│   ├── document/
│   │   ├── parser.py
│   │   └── surgical_injector.py
│   ├── core/
│   │   └── config.py
│   └── requirements.txt       # Flask dependencies
├── frontend/
│   ├── app/
│   ├── components/
│   └── lib/
├── vercel.json              # Vercel configuration
├── package.json             # Windows-only scripts
└── .vercelignore            # Vercel deployment excludes
```

## API Endpoints

### Health Check
```
GET /api/health
```

### Document Management
```
POST   /api/v1/documents/upload          # Upload DOCX
GET    /api/v1/documents                 # List documents
GET    /api/v1/documents/{file_id}       # Get document
DELETE /api/v1/documents/{file_id}       # Delete document
```

### Analysis
```
POST   /api/v1/analysis/start             # Start analysis
GET    /api/v1/analysis/status/{task_id}  # Get status
GET    /api/v1/analysis/download/{task_id} # Download result
```

## Processing Model

### Before (Celery-based)
```
Request → Queue Task → Celery Worker → Background Processing
```

### Now (Synchronous)
```
Request → Flask Handler → Direct Processing → Response
```

**Note**: Long document processing may timeout on Vercel's free tier (30 seconds for serverless). For production, consider:
- Implementing streaming responses
- Using Vercel Pro for extended timeouts
- Breaking analysis into smaller chunks

## Troubleshooting

### Flask not found
```bash
cd backend
venv\Scripts\pip install flask flask-cors
```

### Supabase connection error
- Verify `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` in `.env`
- Check RLS policies in Supabase dashboard

### Vercel deployment fails
- Check `vercel.json` configuration
- Ensure Python runtime is set to 3.11
- Verify all environment variables are set

## Database Setup

Run the SQL schema from `backend/database_schema.sql` in Supabase SQL Editor:
1. Navigate to Supabase dashboard
2. Open SQL Editor
3. Copy content from `backend/database_schema.sql`
4. Execute

## Removing Celery (Archive)

If you need reference to the old Celery setup, it's archived in the git history. Key changes:

**Deleted:**
- `backend/worker.py` (Celery)
- `backend/Dockerfile` (Docker)
- `docker-compose.yml` (Docker Compose)
- `quickstart.sh` (Unix)
- Celery/Redis from `requirements.txt`

**Modified:**
- `main.py`: FastAPI → Flask
- `api/documents.py`: AsyncAPI → Flask routes
- `api/analysis.py`: Celery tasks → Sync/request-based
- `core/config.py`: Removed Redis/Celery vars

## Performance Considerations

- **Synchronous processing** means response times are longer but simpler
- **No task queue** means no background processing (good for serverless)
- **Vercel timeout limit** (30-300 seconds depending on plan)
- For very large documents, implement **chunking** in document parser

## Next Steps

1. Test locally: `pnpm dev`
2. Build production: `pnpm start`
3. Deploy: `vercel deploy`
4. Monitor: Vercel Analytics
