# Development Guide

## ⚡ Quick Start (Frontend Only)

For UI/UX development without backend:

### 1. Install Dependencies

```bash
# Global pnpm (one-time)
npm install -g pnpm

# From root directory — installs everything via Turbo monorepo
pnpm install
```

### 2. Start Frontend Dev Server

```bash
# From root directory
pnpm --filter=panelzero-frontend dev
```

✅ Frontend runs at `http://localhost:3000`

**Mock authentication** allows any email/password to login. No Supabase needed.

### 3. (Optional) Start Backend

Backend setup requires Python and is separate:

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file with API keys
cp .env.example .env
# Edit .env with your Supabase, OpenAI, and Gemini keys

# In another terminal, start FastAPI server
python main.py
# API will be at http://localhost:8000/docs

# In a third terminal, start Celery worker
celery -A worker.celery_app worker --loglevel=info
```

---

## Full Development Setup (Frontend + Backend)

## File Structure Walkthrough

### Frontend (`/frontend`)

#### App Router (`/app`)
- `page.tsx` — Landing page (public)
- `login/page.tsx` — Login page (public)
- `dashboard/page.tsx` — Main application (authenticated)
- `layout.tsx` — Root layout with Query Provider
- `globals.css` — Global styles and animations

#### Components (`/components`)
- `header.tsx` — Navigation bar with auth state
- `footer.tsx` — Global footer
- `document-upload.tsx` — File upload with strict .docx validation
- `agent-role-selector.tsx` — Role selection UI (Technical Reader, Statistician, etc.)
- `execution-pipeline.tsx` — Task status and results display
- `document-preview.tsx` — Simulated processed document viewer
- `query-provider.tsx` — TanStack Query setup

#### Utilities (`/lib`)
- `supabase.ts` — Supabase client initialization
- `api-client.ts` — FastAPI communication layer
- `query-hooks.ts` — TanStack Query hooks (MANDATORY for data fetching)

#### Types (`/types`)
- `index.ts` — TypeScript interfaces for agents, documents, analysis tasks

### Backend (`/backend`)

#### Core (`/core`)
- `config.py` — Pydantic BaseSettings for environment variables
- `__init__.py` — Package exports

#### API Routes (`/api`)
- `documents.py` — Upload, list, delete documents with RLS
- `analysis.py` — Start analysis, poll status, download results
- `__init__.py` — Router exports

#### Agents (`/agents`)
- `__init__.py` — Agent role definitions and routing config
- `technical_reader.py` — Pure Python format checker (margins, fonts)
- `llm_executor.py` — LLM routing to Gemini/GPT-4o

#### Document Processing (`/document`)
- `surgical_injector.py` — Non-destructive DOCX editing (THE GOLDEN RULES)
- `parser.py` — Chapter extraction and smart chunking
- `__init__.py` — Package exports

#### Main Files
- `main.py` — FastAPI app with CORS, route registration
- `worker.py` — Celery configuration and task definitions
- `requirements.txt` — Python dependencies

## Key Workflows

### Document Ingestion Flow

```
1. User selects .docx file in frontend
   ↓
2. DocumentUpload component validates extension
   ↓
3. TanStack Query mutation sends to POST /documents/upload
   ↓
4. Backend:
   - Validates file (extension, size, integrity)
   - Uploads to Supabase Storage (RLS: only owner can access)
   - Records metadata in PostgreSQL table
   - Returns file_id
   ↓
5. Frontend stores file_id in local state
```

### Analysis Execution Flow

```
1. User selects Agent Role (e.g., "Statistician")
   ↓
2. ExecutionPipeline component triggers POST /analysis/start
   ↓
3. Backend immediately returns task_id
   ↓
4. Celery worker receives task and updates state
   ↓
5. Frontend polls GET /analysis/status/{task_id} every 1 second
   ↓
6. Worker executes agent:
   - If "tech" → TechnicalReaderAgent (Pure Python)
   - If "grammar" → Gemini 1.5 Flash
   - If "stats" → Gemini 1.5 Pro
   - If "subject" → GPT-4o with RAG
   ↓
7. Worker injects results into DOCX via SurgicalInjector
   ↓
8. Worker uploads processed file to Supabase
   ↓
9. Frontend displays results and download link
   ↓
10. User downloads _REVIEWED.docx
```

### Surgical Injection Process

```python
# The Golden Rules (from AGENTS.md):
1. ALWAYS copy the original DOCX before processing
   injector = SurgicalInjector(input_path)  # Auto-creates backup

2. NEVER extract text, modify, and paste back
   # ❌ BAD: Destroys images, tables, formatting
   
   # ✅ GOOD: Edit XML directly
   run.font.highlight_color = WD_COLOR_INDEX.YELLOW

3. Read margins from doc.sections[0].page_margins
   # ✅ Exact measurement, not visual estimation

4. Apply highlights directly to run objects
   # ✅ Preserves surrounding styles and formatting
```

## TanStack Query Usage (MANDATORY)

```typescript
// ✅ CORRECT
import { useQuery, useMutation } from '@tanstack/react-query';
import { useDocuments, useUploadDocument } from '@/lib/query-hooks';

export function MyComponent() {
  const { data: documents, isLoading } = useDocuments(token);
  const upload = useUploadDocument(token);
  
  return (...)
}

// ❌ INCORRECT (Never do this)
const [docs, setDocs] = useState([]);
useEffect(() => {
  fetch('/api/documents')
    .then(r => r.json())
    .then(d => setDocs(d));
}, []);
```

## Adding New Agent Roles

1. **Define the agent in `/backend/agents/__init__.py`**
   ```python
   class AgentRole(str, Enum):
       MY_AGENT = "my_agent"
   
   AGENTS = {
       AgentRole.MY_AGENT: {
           "name": "My Agent",
           "model": "gpt-4o",
           "use_llm": True,
       },
   }
   ```

2. **Add agent implementation**
   ```python
   # /backend/agents/my_agent.py
   class MyAgent:
       async def run_analysis(self, text: str) -> dict:
           # Implementation
   ```

3. **Update API routes**
   ```python
   # /backend/api/analysis.py
   if agent_role == "my_agent":
       agent = MyAgent()
       results = await agent.run_analysis(text)
   ```

4. **Update frontend type definitions**
   ```typescript
   // /frontend/types/index.ts
   export type AgentRole = '...' | 'my_agent';
   ```

## Testing

### Frontend Type Checking
```bash
# From root directory (uses Turbo for caching)
pnpm type-check

# Or just for frontend
pnpm type-check --filter=panelzero-frontend
```

### Frontend Linting
```bash
# From root directory (uses Turbo for caching)
pnpm lint

# Or just for frontend
pnpm lint --filter=panelzero-frontend
```

### Backend Testing
```bash
cd backend
pytest tests/
```

## Deployment

### Frontend (Vercel)
```bash
# Push to main branch
git push origin main
# Vercel auto-deploys
```

### Backend (Docker + Cloud Run)
```bash
cd backend
docker build -t panelzero .
docker push gcr.io/project/panelzero
# Deploy to Cloud Run with Celery worker sidecar
```

## Troubleshooting

### Issue: "PDF is dead document" error
**Solution**: Ensure you're uploading .docx files only. PDFs break the surgical injection pipeline.

### Issue: Celery tasks not executing
**Solution**: Verify Redis is running (`redis-cli ping`). Check Celery worker logs for task queue connection.

### Issue: Supabase RLS blocking access
**Solution**: Verify user UID matches `owner_id` in PostgreSQL. Check RLS policies in Supabase dashboard.

### Issue: Highlight injection failing
**Solution**: Ensure DOCX file is not corrupted. Use `SurgicalInjector.verify_docx_integrity()` for validation.

## Best Practices

✅ **Always:** Use TanStack Query for server data
✅ **Never:** Modify content without surgical injection
✅ **Always:** Copy files before processing
✅ **Always:** Enforce RLS on Supabase tables
✅ **Never:** Expose API keys in frontend
✅ **Always:** Return task_id immediately from async endpoints
✅ **Always:** Validate file extensions (*.docx only)

