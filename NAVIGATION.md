# 📋 Complete Project Inventory & Navigation Guide

This document provides a complete inventory of all files created and how to navigate PanelZero codebase.

---

## 📁 Frontend Files (`/frontend`)

### Configuration Files
| File | Purpose |
|------|---------|
| `package.json` | Node.js dependencies (Next.js, React, Tailwind, TanStack Query) |
| `tsconfig.json` | TypeScript configuration with path aliases |
| `next.config.js` | Next.js configuration (React strict mode, etc.) |
| `tailwind.config.ts` | Tailwind CSS theme and extensions |
| `.env.local` | Environment variables (Supabase URL, API URL) |

### Pages (App Router)
| File | Route | Purpose |
|------|-------|---------|
| `app/page.tsx` | `/` | Public landing page with hero section |
| `app/login/page.tsx` | `/login` | Supabase authentication form |
| `app/dashboard/page.tsx` | `/dashboard` | Main authenticated app (3 tabs) |
| `app/layout.tsx` | (root) | Root layout with QueryProvider |
| `app/globals.css` | (global) | Tailwind + custom animations |

### Components (Reusable)
| File | Purpose |
|------|---------|
| `components/header.tsx` | Navigation bar, auth-aware |
| `components/footer.tsx` | Global footer with links |
| `components/query-provider.tsx` | TanStack Query wrapper |
| `components/document-upload.tsx` | File upload with .docx validation |
| `components/agent-role-selector.tsx` | 5 agent role cards |
| `components/execution-pipeline.tsx` | Task status & results display |
| `components/document-preview.tsx` | Simulated processed document |

### Libraries (Utilities)
| File | Purpose |
|------|---------|
| `lib/supabase.ts` | Supabase browser client initialization |
| `lib/api-client.ts` | FastAPI HTTP client (fetch wrapper) |
| `lib/query-hooks.ts` | TanStack Query hooks (MANDATORY) |

### Types
| File | Purpose |
|------|---------|
| `types/index.ts` | TypeScript interfaces (AgentRole, Document, AnalysisTask, etc.) |

---

## 📁 Backend Files (`/backend`)

### Entry Points
| File | Purpose |
|------|---------|
| `main.py` | FastAPI app, CORS, route registration |
| `worker.py` | Celery configuration, task definitions |

### API Routes
| File | Endpoints |
|------|-----------|
| `api/documents.py` | POST /documents/upload, GET /documents, DELETE |
| `api/analysis.py` | POST /analysis/start, GET /analysis/status, GET /analysis/download |
| `api/__init__.py` | Router exports |

### Core Configuration
| File | Purpose |
|------|---------|
| `core/config.py` | Pydantic BaseSettings (env vars) |
| `core/__init__.py` | Package exports |

### Agents (AI Logic)
| File | Purpose |
|------|---------|
| `agents/__init__.py` | Agent role definitions, routing config |
| `agents/technical_reader.py` | Pure Python format checker (margins, fonts) |
| `agents/llm_executor.py` | Gemini/GPT-4o router, async execution |

### Document Processing
| File | Purpose |
|------|---------|
| `document/surgical_injector.py` | Non-destructive DOCX XML editing ⭐ KEY FILE |
| `document/parser.py` | Chapter extraction, smart chunking |
| `document/__init__.py` | Package exports |

### Configuration
| File | Purpose |
|------|---------|
| `requirements.txt` | Python dependencies |
| `.env` | Environment variables (API keys) |

---

## 📁 Documentation Files

| File | Purpose |
|------|---------|
| `AGENTS.md` | Agent specifications (FROM USER) |
| `README.md` | Original project description (FROM USER) |
| `PROJECT_SETUP.md` | Tech stack & setup instructions |
| `DEVELOPMENT.md` | Developer guide & workflows |
| `IMPLEMENTATION_SUMMARY.md` | Complete implementation overview |
| `QUICK_REFERENCE.md` | Golden rules & common tasks |
| `NAVIGATION.md` | THIS FILE |

---

## 📁 CI/CD & Git

| File | Purpose |
|------|---------|
| `.github/workflows/frontend-tests.yml` | Frontend CI/CD pipeline |
| `.github/workflows/backend-tests.yml` | Backend CI/CD pipeline |
| `.gitignore` | Git ignore patterns |

---

## 📁 Root Configuration

| File | Purpose |
|------|---------|
| `package.json` | Root workspace scripts |

---

## 🎯 Quick Navigation by Task

### "I want to add a new page"
1. Create file in `/frontend/app/newpage/page.tsx`
2. See example: `app/dashboard/page.tsx`
3. Use components from `/components/`

### "I want to add a new API endpoint"
1. Add route to `/backend/api/something.py`
2. Include in `/backend/main.py` via `app.include_router()`
3. Call from frontend using `/lib/api-client.ts`

### "I want to add a new agent"
1. Define in `/backend/agents/__init__.py` (add to AgentRole enum)
2. Implement in `/backend/agents/new_agent.py`
3. Update `/backend/api/analysis.py` to handle the new role

### "I want to modify document processing"
1. Edit `/backend/document/surgical_injector.py` (THE GOLDEN RULES apply!)
2. Review `/backend/document/parser.py` for chunking logic
3. Update AGENTS.md with any changes

### "I want to fetch data in a component"
1. Use hooks from `/frontend/lib/query-hooks.ts`
2. See examples: `components/execution-pipeline.tsx`
3. Never use `useEffect` + `fetch`

### "I want to understand the architecture"
1. Read `IMPLEMENTATION_SUMMARY.md` (visual overview)
2. Read `DEVELOPMENT.md` (workflow examples)
3. See `QUICK_REFERENCE.md` (Golden Rules)

### "I want to deploy"
1. Frontend: Push to main → Vercel auto-deploys
2. Backend: Docker + Cloud Run with Celery worker sidecar
3. See `PROJECT_SETUP.md` for details

---

## 🔑 Key Files by Importance

### 🌟 Critical (Must Understand)
1. `/backend/document/surgical_injector.py` — Non-destructive DOCX editing
2. `/frontend/lib/query-hooks.ts` — TanStack Query integration
3. `/backend/agents/__init__.py` — Agent routing logic
4. `/backend/main.py` — API organization

### ⭐ Important
1. `/frontend/app/dashboard/page.tsx` — Main UI flows
2. `/backend/api/documents.py` — File upload with RLS
3. `/backend/api/analysis.py` — Task execution
4. `/backend/worker.py` — Async processing

### 📖 Reference
1. `AGENTS.md` — Specifications & rules
2. `DEVELOPMENT.md` — Workflows & examples
3. `QUICK_REFERENCE.md` — Golden rules
4. `IMPLEMENTATION_SUMMARY.md` — Architecture overview

---

## 🔍 Finding Code by Functionality

### **File Upload & Storage**
- Frontend: `components/document-upload.tsx`
- Backend: `api/documents.py` → `POST /documents/upload`
- Storage: Supabase bucket configured in `core/config.py`

### **Analysis Execution**
- Frontend: `components/execution-pipeline.tsx`
- Backend: `api/analysis.py` → `POST /analysis/start`
- Queue: `worker.py` → `run_analysis()` task
- Agents: `agents/technical_reader.py`, `agents/llm_executor.py`

### **Authentication**
- Frontend: `app/login/page.tsx`
- Library: `lib/supabase.ts` (client init)
- Backend: Supabase handles auth, token validation in routes

### **Progress Polling**
- Frontend: `components/execution-pipeline.tsx` (useAnalysisStatus hook)
- Backend: `api/analysis.py` → `GET /analysis/status/{task_id}`
- Queue: `worker.py` → `self.update_state()` calls

### **Document Processing**
- Parsing: `document/parser.py` (ChapterExtractor)
- Injection: `document/surgical_injector.py` (SurgicalInjector) ⭐
- Format checking: `agents/technical_reader.py` (TechnicalReaderAgent)

### **LLM Integration**
- Routing: `agents/__init__.py` (AgentConfig)
- Execution: `agents/llm_executor.py` (LLMAgentExecutor)
- Models: Gemini Flash/Pro (fast), GPT-4o (deep analysis)

---

## 📊 Code Statistics

| Layer | Files | Purpose |
|-------|-------|---------|
| Frontend Pages | 4 | Core app pages |
| Frontend Components | 7 | Reusable UI |
| Frontend Libraries | 3 | Utilities |
| Backend API Routes | 2 | REST endpoints |
| Backend Agents | 3 | AI logic |
| Backend Document | 2 | DOCX processing |
| Backend Core | 2 | Configuration |
| Documentation | 6 | Guides & reference |
| Configuration | 8 | Build & deploy |
| **TOTAL** | **~40** | **Production-ready** |

---

## 🚀 Getting Started with the Code

### Step 1: Understand the Architecture (5 min)
- Read `IMPLEMENTATION_SUMMARY.md`
- Skim `AGENTS.md` for agent definitions

### Step 2: Set Up Locally (15 min)
- Follow `PROJECT_SETUP.md` → Getting Started section
- Run: `cd backend && python main.py` (Terminal 1)
- In root dir, run: `pnpm dev` (Terminal 2, uses Turbo)
- Or run with separate commands: `cd backend && celery -A worker.celery_app worker --loglevel=info` (Terminal 3)

### Step 3: Explore the Code (30 min)
- **Frontend**: Start with `app/page.tsx` → `app/dashboard/page.tsx`
- **Backend**: Start with `main.py` → `api/documents.py`
- **Agents**: Understand `agents/__init__.py` routing

### Step 4: Modify & Test (ongoing)
- Use `QUICK_REFERENCE.md` for common tasks
- Check `DEVELOPMENT.md` for workflows
- Remember: Golden Rules in `AGENTS.md`

---

## 🎓 Learning Paths

### Frontend Developer
1. `frontend/types/index.ts` — Understand data types
2. `frontend/lib/query-hooks.ts` — Learn TanStack Query pattern
3. `frontend/components/document-upload.tsx` — See concrete example
4. `frontend/app/dashboard/page.tsx` — Understand page composition

### Backend Developer
1. `backend/core/config.py` — Understand configuration
2. `backend/api/documents.py` — Learn API pattern
3. `backend/agents/__init__.py` — Understand agent routing
4. `backend/document/surgical_injector.py` — Learn DOCX processing ⭐

### Full Stack Developer
1. Follow Frontend path above
2. Follow Backend path above
3. Read `DEVELOPMENT.md` → "Analysis Execution Flow"
4. Trace a request: frontend → TanStack Query → backend → Celery → frontend

---

## ✅ Pre-Deployment Checklist

- [ ] Read `AGENTS.md` compliance section in `IMPLEMENTATION_SUMMARY.md`
- [ ] Verify all `.env` variables are set (both frontend & backend)
- [ ] Run type check: `pnpm type-check` (uses Turbo caching)
- [ ] Verify Supabase RLS policies are enabled
- [ ] Test file upload with .docx file
- [ ] Test analysis task polling
- [ ] Verify production API keys are used
- [ ] Review security in `QUICK_REFERENCE.md` section

---

## 📞 Quick Help

**"Where do I..."**

| Question | Answer |
|----------|--------|
| Add TanStack Query hook? | `/frontend/lib/query-hooks.ts` |
| Add API endpoint? | `/backend/api/something.py` |
| Add agent? | `/backend/agents/__init__.py` + implement |
| Modify DOCX injection? | `/backend/document/surgical_injector.py` |
| Change styling? | `/frontend/app/globals.css` or component |
| Configure env vars? | `.env` (backend) or `.env.local` (frontend) |
| Schedule task? | `/backend/worker.py` (Celery Beat) |
| Enforce RLS? | Supabase dashboard or `/backend/api/documents.py` |

---

**Happy coding! 🚀 Remember the Golden Rules from AGENTS.md!**
