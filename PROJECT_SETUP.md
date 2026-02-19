# PanelZero - Role-Based AI Grading System

![PanelZero Logo](https://via.placeholder.com/200)

**PanelZero** is a sophisticated, multi-agent AI grading system purpose-built for academic thesis defenses. We solve the formatting and feedback problem by reading DOCX files non-destructively, analyzing them with role-based AI agents, and surgically injecting highlights and comments without breaking original formatting.

## 🎯 Core Philosophy

We operate under three inviolable principles:

1. **Non-Destructive Editing** — We edit the underlying XML, never rewrite content. Your tables and floating images are 100% safe.
2. **Role-Based Execution** — A thesis panel divides by expertise. PanelZero mimics this: select a specific role (Statistician, Language Critic) and only that agent runs, saving massive API costs.
3. **Zero-Tolerance Formatting** — Academic margins and fonts are binary. Pure Python logic measures exact document properties. No guessing.

## 🤖 Agent Roster

- **Technical Reader** (Pure Python) — Strict format, margins, and font checking
- **Language Critic** (Gemini 1.5 Flash) — Tense consistency and syntax errors
- **Statistician** (Gemini 1.5 Pro) — Data logic and table format verification
- **Subject Specialist** (GPT-4o with RAG) — Content coherence and logical flow
- **Chairman** (GPT-4o) — Synthesizes all panel reports into actionable summary

## 🏗️ Project Structure

```
panel-zero/
├── frontend/                 # Next.js 15 React 19 web app
│   ├── app/                  # Next.js App Router (pages, layouts)
│   ├── components/           # Reusable React components
│   ├── lib/                  # Utilities (API client, query hooks, Supabase)
│   ├── types/                # TypeScript interfaces
│   ├── tailwind.config.ts    # Tailwind CSS configuration
│   └── package.json          # Frontend dependencies
│
├── backend/                  # FastAPI Python server
│   ├── api/                  # Route handlers (documents, analysis)
│   ├── core/                 # Config and shared logic
│   ├── agents/               # AI logic (Technical Reader, LLM Executor)
│   ├── document/             # DOCX processing (Surgical Injector, Parser)
│   ├── main.py               # FastAPI app entry point
│   ├── worker.py             # Celery task definitions
│   ├── requirements.txt       # Python dependencies
│   └── .env                  # Environment variables
│
├── .github/workflows/        # CI/CD pipelines
├── package.json              # Root scripts and metadata
├── AGENTS.md                 # Agent specifications and routing rules
├── README.md                 # This file
└── .gitignore                # Git ignore patterns
```

## 🔧 Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **UI**: React 19 with Tailwind CSS 3.4
- **State**: TanStack Query v5 (MANDATORY for all API calls)
- **Auth**: Supabase Auth
- **Icons**: Lucide React

### Backend
- **Framework**: FastAPI (Python 3.10+)
- **Document Processing**: python-docx, lxml
- **AI APIs**: OpenAI (GPT-4o), Google GenAI (Gemini)
- **Task Queue**: Celery + Redis
- **Database**: Supabase PostgreSQL with Row Level Security
- **Storage**: Supabase Object Storage (ephemeral)

## 🚀 Getting Started

### Prerequisites

**Required:**
- **Node.js** 18+
- **pnpm** 8.15.0+ ([install globally](https://pnpm.io/installation))

**Optional (for backend only):**
- **Python** 3.10+
- **Redis** (for Celery task queue)
- **Supabase** project (PostgreSQL + Storage)
- **OpenAI API Key**
- **Google Gemini API Key**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/penzero00/Panel-Zero.git
   cd Panel-Zero
   ```

2. **Install pnpm globally** (if not already installed)
   ```bash
   npm install -g pnpm
   pnpm --version  # Verify
   ```

3. **Install Frontend Dependencies** (from project root)
   ```bash
   pnpm install
   ```
   
   ℹ️ This uses Turbo monorepo to install frontend dependencies.

4. **Start Frontend Dev Server**
   ```bash
   # From root directory
   pnpm --filter=panelzero-frontend dev
   ```
   
   ✅ Frontend runs at `http://localhost:3000` with **mock authentication** (no Supabase needed)

5. **Backend Setup** (optional for now)

   Backend requires Python setup:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

6. **Configure Backend Environment Variables** (optional)
   ```bash
   # backend/.env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   OPENAI_API_KEY=sk-proj-...
   GEMINI_API_KEY=AIzaSyD...
   ```

7. **Start Backend Services** (if configured)
   ```bash
   # Terminal 1: Backend API
   cd backend && python main.py

   # Terminal 2: Celery Worker
   cd backend && celery -A worker.celery_app worker --loglevel=info
   ```
   
   Backend runs at `http://localhost:8000`

### Quick Reference

| Service | Command | Port | Status |
|---------|---------|------|--------|
| Frontend | `pnpm --filter=panelzero-frontend dev` | 3000 | ✅ Ready now |
| Celery Worker | `cd backend && celery -A worker.celery_app worker` | — | ⏳ Optional |
| Backend API | `cd backend && python main.py` | 8000 | ⏳ Optional |

### Frontend-Only Development

The frontend is **fully functional with mock authentication**:
- No Supabase credentials needed
- Any email/password combination works to login
- Perfect for UI/UX development before backend integration

## 🔒 Data Privacy & Security

- **RLS Enforcement** — Supabase Row Level Security ensures users can only access their own files
- **Zero Retention** — DOCX files are auto-deleted within 1 hour via scheduled Celery tasks
- **No Training Data** — Enterprise API endpoints contractually prohibit using user data for model training
- **Encrypted Transport** — All connections use HTTPS in production

## 📝 Key Features

✅ **Surgical DOCX Injection** — Yellow highlights, inline comments without breaking formatting
✅ **Smart Chunking** — Large documents split by chapter to manage token limits
✅ **Real-Time Progress** — WebSocket polling with task status updates
✅ **Role-Based Billing** — Run individual agents to reduce API costs
✅ **Async Processing** — Celery queues handle long document analysis
✅ **Strict Validation** — No PDFs allowed. Pure Python margin/font checking.

## 🛠️ Development Guidelines

### Frontend
- **Always** use TanStack Query for server data (NO useState for async)
- Components use `.tsx` extension and kebab-case filenames
- Tailwind CSS 3.4 for styling
- TypeScript strict mode enabled

### Backend
- **NEVER** parse or edit PDFs. DOCX only.
- Document processing uses the **Surgical Injection** method
- Pure Python for format checking (Technical Reader)
- Smart LLM routing: Gemini Flash for fast checks, GPT-4o for deep analysis
- Always copy files before processing, apply highlights directly to run objects

### Commit Messages
Follow [Conventional Commits](https://www.conventionalcommits.org/):
```
feat(backend): implement surgical injection for yellow highlights
fix(frontend): resolve Supabase auth state mismatch
docs: update LLM routing rules in AGENTS.md
```

## 📋 API Endpoints

### Documents
- `POST /documents/upload` — Upload a DOCX file
- `GET /documents` — List user's documents (RLS enforced)
- `GET /documents/{file_id}` — Get document metadata
- `DELETE /documents/{file_id}` — Delete a document

### Analysis
- `POST /analysis/start` — Start an analysis task (returns task_id)
- `GET /analysis/status/{task_id}` — Poll task status
- `GET /analysis/download/{task_id}` — Download processed file

## 🗺️ Project Roadmap

- **Phase 1** ✅ Format Guardian — Supabase + non-destructive pipeline
- **Phase 2** 🔄 Grammar Highlighter — LLM integration + fuzzy text matching
- **Phase 3** 📋 Comment Injector — Microsoft Word comment bubbles via lxml

## 📄 License

MIT

## 🤝 Contributing

See [AGENTS.md](./AGENTS.md) for agent specifications and development guidelines.

---

Built with ❤️ for academic rigor.
