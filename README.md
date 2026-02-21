# PanelZero 🎓

PanelZero is a role-based, multi-agent AI grading system designed specifically for academic thesis defenses.

We built this because the traditional formatting and grammar check process is incredibly tedious for both students and panelists. Most AI wrappers try to read PDFs, which usually ends in disaster because PDFs are just visual instructions. PanelZero strictly uses a 100% DOCX pipeline. It reads the underlying XML to preserve the original formatting, analyzes the text based on strict academic rubrics, and surgically injects highlights and comments directly into the file.

## ## Core Philosophy

We have three strict rules for this architecture.

- **Non-Destructive Editing**: We never alter the user's original file. The system creates a working copy and uses python-docx to inject highlights without breaking floating images or complex tables.
- **Role-Based Execution**: A thesis panel is divided by expertise. PanelZero mimics this. A user selects their specific role (e.g., Statistician) and the system only runs the AI agent tied to that role. This saves a massive amount of API tokens through targeted chunking.
- **Zero Tolerance Formatting**: Academic margins and fonts are binary. We do not use AI for formatting checks. We use pure Python logic to measure exact document properties.

## The Agent Roster

The system uses a Supervisor-Worker architecture via LangGraph, but agents are triggered manually based on the user's selected role.

- **The Technical Reader**: A pure Python script that strictly checks page margins, fonts, and spacing against the selected rubric. It flags major and minor errors.
- **The Language Critic**: Powered by Gemini 1.5 Flash. It checks for tense consistency (like ensuring Chapter 3 is in past passive voice) and syntax errors.
- **The Statistician**: Powered by Gemini 1.5 Pro. It extracts tables and verifies if the data logic matches the statistical method claimed in the text.
- **The Subject Specialist**: Powered by GPT-4o with RAG. It checks coherence between the Statement of the Problem and the final findings.
- **The Chairman**: Synthesizes the reports from all other agents into a single, consolidated analysis page.

## Custom Agent Profiles

Each agent follows **configurable preferences** known as Agent Profiles. While the system provides sensible defaults for each role, users can create custom profiles to adapt analysis to their specific requirements.

### Profile Customization Options

- **Font Preferences**: Font family (Times New Roman, Arial, Calibri, etc.), size (8-72pt), and style
- **Margin Requirements**: All four margins (0.1-2.5 inches, DOCX-compatible)
- **Paragraph Formatting**: Line spacing, paragraph alignment, first-line indentation, spacing before/after
- **Image Settings**: Minimum DPI (default 300), maximum width, format preference (embedded/inline/floating)
- **Grammar Rules**: Options to check passive voice, tense consistency, subject-verb agreement, sentence fragments
- **Citation Style**: APA 7th, IEEE, Chicago, or custom preference

### Using Custom Profiles

1. Navigate to **Settings** → **Agent Profiles** in the dashboard
2. Create a new profile for your agent role
3. Configure all formatting and analysis preferences
4. Set the profile as **Active** to use it for document analysis
5. Upload a thesis and select the agent role—the active profile preferences will automatically apply

Custom profiles are user-specific and stored securely in Supabase. Multiple profiles per role are supported; simply activate the one you want to use.

## Tech Stack

I'm not entirely sure how we will scale the queue system yet, but this is the current production stack.

- **Backend**: FastAPI (Python) for async agent handling.
- **Frontend**: Next.js (React) for the role-selection dashboard.
- **Database & Auth**: Supabase (PostgreSQL). This handles user roles, rubric configurations, and temporary secure file storage.
- **Document Processing**: python-docx and lxml.
- **Task Queue**: Redis and Celery to handle long document processing times.

## Getting Started

### ⚡ Quick Start (Frontend Only - 2 Minutes)

For UI/UX development without backend:

```bash
# Install pnpm globally (one-time)
npm install -g pnpm

# From root directory
pnpm install
pnpm --filter=panelzero-frontend dev
```

✅ Frontend at `http://localhost:3000`

**Note**: You'll need to set up Supabase for authentication. See [SUPABASE_SETUP.md](SUPABASE_SETUP.md) for detailed instructions.

### 🏗️ Full Setup (Frontend + Backend)

If you want to run the entire system with real API processing:

#### Prerequisites
- Python 3.10+
- Node.js 18+
- Supabase project (for authentication and database)
- OpenAI and Google Gemini API keys

#### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/penzero00/Panel-Zero.git
   cd Panel-Zero
   ```

2. **Set Up Supabase**
   - Follow the comprehensive guide in [SUPABASE_SETUP.md](SUPABASE_SETUP.md)
   - This includes database schema, email verification, and RLS policies

3. **Install pnpm Globally** (if not already installed)
   ```bash
   npm install -g pnpm
   ```

4. **Install Frontend Dependencies** (from root)
   ```bash
   pnpm install
   ```

5. **Setup Backend**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

6. **Configure Backend Environment** (create `backend/.env` from `.env.example`)
   ```bash
   SUPABASE_URL=your_project_url
   SUPABASE_SERVICE_KEY=your_service_key
   SUPABASE_ANON_KEY=your_anon_key
   OPENAI_API_KEY=your_key_here
   GEMINI_API_KEY=your_key_here
   ```

7. **Configure Frontend Environment** (create `frontend/.env.local` from `.env.example`)
   ```bash
7. **Configure Frontend Environment** (create `frontend/.env.local` from `.env.example`)
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   NEXT_PUBLIC_API_URL=http://localhost:5000
   ```

8. **Start Services** (from root, in 2 terminals)
   ```bash
   # Terminal 1: Frontend (using Turbo monorepo)
   pnpm --filter=panelzero-frontend dev
   
   # Terminal 2: Backend API
   cd backend && python main.py
   ```

   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

### 🔐 User Authentication Flow

1. **Sign Up**: Navigate to `/signup` and create an account
2. **Email Verification**: Check your email and click the verification link
3. **Dashboard Access**: After verification, you'll be redirected to the dashboard
4. **Upload Documents**: Upload your thesis draft and select your panel role

All user data is protected by Supabase Row Level Security (RLS), ensuring users can only access their own documents and saved files.


## Security and Privacy

Thesis intellectual property is highly sensitive. We enforce strict data privacy protocols.

All DOCX files are stored in a private Supabase Storage bucket locked behind Row Level Security (RLS). A user can only access files tied to their specific authentication UID. We also enforce a zero-retention policy where uploaded files are deleted from the server shortly after the analysis report is generated. We only use enterprise API endpoints that contractually prohibit using user data for model training.

## Roadmap

- **Phase 1: The Format Guardian**. Establish the Supabase connection and build the non-destructive Python pipeline for margins and fonts.
- **Phase 2: The Grammar Highlighter**. Connect the LLM agents and build the fuzzy text-matching algorithm to inject yellow highlights.
- **Phase 3: The Comment Injector**. Utilize lxml to insert actual Microsoft Word comment bubbles into the XML tree.

---
