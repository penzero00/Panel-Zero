# Quick Reference Guide

## 🎯 Golden Rules (From AGENTS.md)

### Document Processing
✅ **ALWAYS** copy the original DOCX before processing
```python
injector = SurgicalInjector(input_path)  # Auto-creates backup
```

✅ **ALWAYS** read margins from doc.sections[0].page_margins
```python
margins = injector.read_page_margins()  # Returns exact measurements
```

✅ **ALWAYS** apply highlights directly to run objects
```python
run.font.highlight_color = WD_COLOR_INDEX.YELLOW  # Preserves styles
```

✅ **NEVER** extract text, modify, and paste back
```python
# ❌ WRONG: Destroys images, tables, floating elements
text = para.text
modified = fix_grammar(text)
para.clear()
para.add_run(modified)

# ✅ CORRECT: Highlight specific text
run.font.highlight_color = WD_COLOR_INDEX.YELLOW
```

✅ **NEVER** parse or edit PDFs
```python
# File upload MUST be .docx only
if not file.endswith('.docx'):
    raise ValueError("Strict Rule Violation")
```

### AI Model Routing
✅ **Gemini 1.5 Flash** → Fast syntax/grammar checks
```python
# Language Critic uses Gemini Flash
model = genai.GenerativeModel("gemini-1.5-flash")
```

✅ **Gemini 1.5 Pro** → Deep statistical analysis
```python
# Statistician uses Gemini Pro
model = genai.GenerativeModel("gemini-1.5-pro")
```

✅ **GPT-4o** → Subject matter expertise & synthesis
```python
# Subject Specialist and Chairman use GPT-4o
response = openai_client.chat.completions.create(model="gpt-4o", ...)
```

### Frontend State Management
✅ **ALWAYS** use TanStack Query for server data
```typescript
import { useQuery, useMutation } from '@tanstack/react-query';
import { useDocuments, useUploadDocument } from '@/lib/query-hooks';

// ✅ CORRECT
const { data: docs } = useDocuments(token);

// ❌ WRONG
useEffect(() => {
  fetch('/api/documents').then(...)
}, []);
```

✅ **NEVER** use useState for async operations
```typescript
// ❌ WRONG
const [loading, setLoading] = useState(false);
useEffect(() => {
  setLoading(true);
  fetch().then(() => setLoading(false));
}, []);

// ✅ CORRECT
const { isLoading } = useQuery({...});
```

### Security & Privacy
✅ **ALWAYS** enforce Row Level Security
```python
# Backend validates: user_id == owner_id in database
doc = supabase.table('documents').select('*').eq('owner_id', user_id)
```

✅ **ALWAYS** keep API keys in backend .env
```
# backend/.env ✅
OPENAI_API_KEY=sk-...

# frontend/.env.local ❌ NEVER HERE
NEXT_PUBLIC_OPENAI_API_KEY=...  # SECURITY RISK!
```

✅ **ALWAYS** implement zero-retention
```python
# Files auto-delete within 1 hour
expires_at = "now() + interval '1 hour'"
```

---

## 🏗️ Architecture Patterns

### Backend API Endpoint Pattern
```python
from fastapi import APIRouter, HTTPException, Depends
from core import settings

router = APIRouter(prefix="/documents", tags=["documents"])

@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    user_id: str = "current_user",
    supabase=Depends(get_supabase),
) -> Dict[str, Any]:
    # 1. Validate input
    if not file.filename.endswith(".docx"):
        raise HTTPException(status_code=400, detail="Invalid file type")
    
    # 2. Process
    # 3. Store with RLS
    # 4. Return result
    return {"file_id": file_id, ...}
```

### Frontend Component Pattern (TanStack Query)
```typescript
'use client';

import { useQuery } from '@tanstack/react-query';
import { useDocuments } from '@/lib/query-hooks';

export function DocumentList({ token }: { token: string }) {
  const { data: documents, isLoading, error } = useDocuments(token);
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      {documents?.map(doc => (
        <div key={doc.id}>{doc.name}</div>
      ))}
    </div>
  );
}
```

### Celery Task Pattern
```python
from worker import celery_app

@celery_app.task(bind=True)
def run_analysis(self, file_id: str, agent_role: str):
    """Long-running analysis task"""
    
    # Update progress
    self.update_state(state="PROGRESS", meta={"current": 25, "total": 100})
    
    # Execute agent
    results = execute_agent(file_id, agent_role)
    
    # Update progress
    self.update_state(state="PROGRESS", meta={"current": 90, "total": 100})
    
    return {"task_id": self.request.id, "results": results}
```

---

## 📝 Common Tasks

### Add a New Agent
1. Define in `/backend/agents/__init__.py`
   ```python
   class AgentRole(str, Enum):
       MY_AGENT = "my_agent"
   ```

2. Implement in `/backend/agents/my_agent.py`
   ```python
   class MyAgent:
       async def run_analysis(self): ...
   ```

3. Update router in `/backend/api/analysis.py`
   ```python
   if agent_role == "my_agent":
       agent = MyAgent()
       results = await agent.run_analysis()
   ```

### Add a New API Endpoint
1. Create route in `/backend/api/new_feature.py`
   ```python
   router = APIRouter(prefix="/new", tags=["new"])
   
   @router.get("")
   async def get_something(user_id: str = "current_user"):
       return {...}
   ```

2. Include in `/backend/main.py`
   ```python
   from api.new_feature import router as new_router
   app.include_router(new_router)
   ```

### Add a New Frontend Page
1. Create file in `/frontend/app/`
   ```bash
   mkdir /frontend/app/new-page
   touch /frontend/app/new-page/page.tsx
   ```

2. Implement component
   ```typescript
   'use client';
   
   import { Header } from '@/components/header';
   
   export default function NewPage() {
       return (...)
   }
   ```

### Fetch Server Data in Component
1. Get data via TanStack Query hook
   ```typescript
   import { useDocuments } from '@/lib/query-hooks';
   
   const { data, isLoading } = useDocuments(token);
   ```

2. Handle states
   ```typescript
   if (isLoading) return <Spinner />;
   if (error) return <ErrorMessage error={error} />;
   return <DocumentList docs={data} />;
   ```

---

## 🔍 Debugging Checklist

| Issue | Solution |
|-------|----------|
| File upload rejected | Verify `.docx` extension, < 50MB |
| Highlight not appearing | Check `run.font.highlight_color = WD_COLOR_INDEX.YELLOW` syntax |
| Celery task not running | Verify Redis: `redis-cli ping` |
| RLS blocking access | Verify `owner_id == auth.uid()` in database |
| TanStack Query not refetching | Check `invalidateQueries()` in mutations |
| API 401 Unauthorized | Verify JWT token passed to API |
| CORS error | Check `allow_origins` in FastAPI CORS middleware |

---

## 📚 File Type Conventions

### Frontend
- Pages: `/app/**/*.tsx`
- Components: `/components/*.tsx` (kebab-case names)
- Utilities: `/lib/*.ts`
- Types: `/types/index.ts`

### Backend
- Routes: `/api/*.py`
- Business logic: `/agents/*.py`, `/document/*.py`
- Config: `/core/*.py`
- Entry point: `main.py`

---

## 🔐 Security Checklist

Before deploying:
- [ ] No API keys in frontend code
- [ ] Supabase RLS policies enabled
- [ ] CORS origins restricted (no `*`)
- [ ] File uploads validated (.docx only)
- [ ] Auth token required for API requests
- [ ] Zero-retention cleanup task scheduled
- [ ] Error messages don't expose internals
- [ ] Rate limiting configured

---

## 📊 Performance Tips

- Use TanStack Query `staleTime` and `gcTime` for caching
- Implement `refetchInterval` only when polling status
- Split large documents via `ChapterExtractor.chunk_for_llm()`
- Use `task.update_state()` for Celery progress tracking
- Enable `task_soft_time_limit` to prevent zombie tasks
- Cache agent configurations globally (don't recreate per request)

---

## 🚨 Common Mistakes to Avoid

1. ❌ Using `useEffect` for data fetching (use TanStack Query)
2. ❌ Calling `.docx` functions on PDFs
3. ❌ Modifying document content via text extraction
4. ❌ Exposing API keys in `.env.local`
5. ❌ Not enforcing ownership checks (RLS)
6. ❌ Returning large objects from API immediately (use task_id + polling)
7. ❌ Not creating file backups before editing
8. ❌ Forgetting to update AGENTS.md when changing architecture

---

**Reference this guide when developing PanelZero features!**
