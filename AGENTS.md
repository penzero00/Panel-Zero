# 🤖 Agent Instructions: PanelZero

## 📑 Table of Contents

- [📝 Documentation Maintenance](#-documentation-maintenance)
- [🎓 PanelZero Project Overview](#-panelzero-project-overview)
- [⭐ Core Features](#-core-features)
- [🛠️ Technical Overview](#-technical-overview)
- [🏗️ Project Stack](#-project-stack)
- [📂 Monorepo Structure](#-monorepo-structure)
- [📝 Version Control & Release Management](#-version-control--release-management)
- [✅ Best Practices and Coding Style](#-best-practices-and-coding-style)
- [🔒 Data Privacy & Supabase Rules](#-data-privacy--supabase-rules)

## 📝 Documentation Maintenance

⚠️ **CRITICAL**: Keep AGENTS.md files synchronized with code changes at all times.

### Documentation Update Requirements

#### When to Update AGENTS.md Files:

✅ **ALWAYS** update this file when you:

- Change folder structure or organization patterns.
- Add, remove, or modify code patterns or conventions.
- Update the DOCX injection logic.
- Modify the Supabase Row Level Security (RLS) rules.
- Change the AI model routing (e.g., swapping Gemini for Claude).

#### What to Document:

- The "Surgical Injection" method for DOCX editing.
- File naming conventions.
- Prompts and system instructions for the LLM agents.
- API endpoint documentation and request/response models.

## 🎓 PanelZero Project Overview

PanelZero is a role-based, multi-agent AI grading system designed specifically for academic thesis defenses. The platform enables users (students and panelists) to upload thesis drafts in DOCX format, select a specific grading role, and receive a non-destructively edited document with injected highlights and academic feedback.

## ⭐ Core Features

- **Role-Based Execution**: Users select their specific role (Statistician, Language Critic) to run targeted AI agents.
- **Non-Destructive Editing**: The system strictly uses DOCX XML manipulation to inject highlights without breaking the original formatting.
- **Zero-Tolerance Format Checking**: Pure Python logic measures exact margins and font sizes.
- **Smart Chunking**: Large documents are split by chapters to manage LLM token limits and costs.
- **Secure File Processing**: Supabase Storage with ephemeral retention policies protects student intellectual property.

## 🛠️ Technical Overview

This project is structured as a standard monorepo containing a frontend application and a backend processing engine.

- **Frontend (/frontend)**: Next.js 15 web application with React 19.
- **Backend (/backend)**: Flask server (serverless-ready) handling the AI agents and document parsing.
- **Database & Auth**: Supabase (PostgreSQL).
- **Processing**: Synchronous request-based processing (no task queue).

## 🏗️ Project Stack

### Frontend Application (/frontend)

- **Framework**: Next.js 15 (App Router).
- **UI Library**: React 19.
- **Styling**: Tailwind CSS 3.4.
- **State Management**: TanStack Query (MANDATORY for all API calls).
- **Authentication**: Supabase Auth.
- **Icons**: Lucide React.
- **Type Safety**: TypeScript.

### Backend Application (/backend)

- **Framework**: Flask (Python 3.10+) with Blueprint-based routing.
- **Document Processing**: python-docx and lxml.
- **AI Integration**: OpenAI SDK (GPT-4o) and Google GenAI SDK (Gemini 1.5 Flash/Pro).
- **Processing Model**: Synchronous request-based (serverless-ready for Vercel).
- **Storage Client**: Supabase Python Client.

## 📂 Monorepo Structure

```
panel-zero/
├── frontend/                 # Next.js web application
│   ├── app/                  # Next.js App Router
│   ├── components/           # Shared React components
│   ├── lib/                  # Frontend utilities and Supabase client
│   └── types/                # TypeScript interfaces
│
├── backend/                  # Flask server
│   ├── api/                  # Blueprint routes (documents, analysis)
│   ├── core/                 # Config and shared backend logic
│   ├── agents/               # AI logic (Statistician, Grammar, etc.)
│   └── document/             # DOCX parsing and surgical injection logic
│
├── api/                      # Vercel serverless function entry point
│   └── index.py             # Flask app export
│
├── .github/                  # GitHub Actions and workflows
└── package.json              # Root configurations
```


## 📝 Version Control & Release Management

The project uses Conventional Commits specification for commit messages.

### Supported Commit Types:

- `feat`: A new feature.
- `fix`: A bug fix.
- `docs`: Documentation only changes.
- `refactor`: Code change that neither fixes a bug nor adds a feature.

### Commit Message Examples:

```
feat(backend): implement surgical injection for yellow highlights
fix(frontend): resolve Supabase auth state mismatch
docs: update LLM routing rules in agents.md
```


## ✅ Best Practices and Coding Style

### Document Processing (The Golden Rules)

🚨 **CRITICAL RULE**: NEVER attempt to parse or edit PDFs. We are a 100% DOCX platform.

#### Surgical Injection Method:

- ✅ **ALWAYS** copy the original DOCX file before processing.
- ✅ **ALWAYS** read margins from `doc.sections[0].page_margins`, not by estimating visual space.
- ✅ **ALWAYS** apply highlights directly to the run object to preserve surrounding styles (`run.font.highlight_color = WD_COLOR_INDEX.YELLOW`).
- ❌ **NEVER** extract text, send it to an LLM to rewrite, and paste it back. This destroys floating images and tables.

#### Smart LLM Routing:

- ✅ Route syntax and grammar checks to Gemini 1.5 Flash for speed and cost efficiency.
- ✅ Route deep logical checks (Methodology vs Results) to GPT-4o or Gemini 1.5 Pro.

### Frontend State Management

🔒 **CRITICAL RULE**: ALL server requests MUST use TanStack Query.

#### TanStack Query Protocol:

- ✅ **ALWAYS** use TanStack Query for all backend Flask calls and Supabase data fetching.
- ❌ **NEVER** use useState or useEffect to manage loading states or fetch server data.

#### Component Conventions:

- Use `.tsx` extension for components.
- Use kebab-case for file names (`document-uploader.tsx`).
- Use PascalCase for component names in code (`export default function DocumentUploader`).

### Backend API Guidelines

#### Synchronous Processing Model:

- ✅ Use `def` (not `async def`) for Flask routes since processing is now synchronous.
- ✅ Process documents directly within the request/response cycle.
- ✅ Return results immediately after analysis completes (suitable for Vercel serverless).
- ⚠️ Be aware of Vercel timeout limits (30-300 seconds depending on plan).
- For very long processing, consider implementing:
  - Document chunking to reduce per-request time
  - Streaming responses
  - Progress endpoints for client-side polling

#### Error Handling:

- Always catch XML parsing errors. If python-docx fails to read a corrupted file, return a clean 400 HTTP error to the frontend, not a 500 server crash.
- Return proper HTTP status codes for different failure scenarios.

#### Flask Route Pattern:

```python
@blueprint_name.route("/endpoint", methods=["POST"])
def route_handler():
    """Handler description"""
    try:
        # Extract request data
        data = request.get_json()
        
        # Process synchronously
        result = process_document(data)
        
        # Return result
        return result, 200
    except Exception as e:
        return {"error": str(e)}, 500
```

## 🔒 Data Privacy & Supabase Rules

🛡️ **IP PROTECTION**: Student thesis data is highly sensitive. We must treat every file like a classified document.

### Row Level Security (RLS):

- ✅ **ALWAYS** enforce RLS on Supabase database tables and storage buckets.
- A user's `auth.uid()` must explicitly match the `owner_id` column to read or download a document.

### Zero-Retention:

- Do not store files indefinitely.
- Uploaded and processed DOCX files must be scheduled for deletion within 1 hour of processing.

### API Keys:

- Keep OpenAI and Gemini keys strictly in the backend `.env` file. Never expose them to the Next.js frontend.