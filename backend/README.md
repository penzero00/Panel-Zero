# Backend Directory

This directory contains the FastAPI server and Celery workers for PanelZero.

## Structure

```
backend/
├── main.py               # FastAPI app entry point
├── worker.py            # Celery configuration + tasks
├── api/                 # REST API routes
│   ├── documents.py     # File upload/management
│   └── analysis.py      # Analysis task execution
├── agents/              # AI agent implementations
│   ├── __init__.py      # Agent definitions + routing
│   ├── technical_reader.py  # Pure Python format checker
│   └── llm_executor.py  # Gemini/GPT-4o integration
├── document/            # DOCX processing
│   ├── surgical_injector.py    # Non-destructive XML editing ⭐
│   └── parser.py        # Chapter extraction + chunking
├── core/                # Configuration
│   └── config.py        # Pydantic BaseSettings
├── requirements.txt     # Python dependencies
├── .env.example        # Example env vars
├── database_schema.sql # Supabase schema setup
├── Dockerfile          # Docker image
└── README.md           # This file
```

## Key Files

- **main.py**: FastAPI app with CORS, route registration
- **worker.py**: Celery task definitions + scheduling
- **api/**: REST endpoints (documents, analysis)
- **agents/**: AI logic with smart routing
- **document/surgical_injector.py**: The Golden Rules apply here ⭐

## Development

```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Terminal 1: FastAPI server
python main.py

# Terminal 2: Celery worker
celery -A worker.celery_app worker --loglevel=info

# Terminal 3: Celery Beat (scheduler)
celery -A worker.celery_app beat --loglevel=info
```

API will run at `http://localhost:8000`
Docs available at `http://localhost:8000/docs`

## Important Rules

✅ **ALWAYS** copy DOCX before processing
✅ **ALWAYS** use `run.font.highlight_color` for highlights
✅ **NEVER** extract text and rewrite (destroys formatting)
✅ Pure Python for format checking (Technical Reader)
✅ Smart LLM routing: Gemini Flash → Gemini Pro → GPT-4o

## Document Processing Pattern

```python
from document import SurgicalInjector

# 1. Create injector (auto-backs up original)
injector = SurgicalInjector(docx_path)

# 2. Verify integrity
if not injector.verify_docx_integrity():
    raise ValueError("Corrupted file")

# 3. Read exact properties
margins = injector.read_page_margins()

# 4. Inject highlights (non-destructive)
injector.inject_yellow_highlight(para_idx, run_idx, text)

# 5. Save to new file (original untouched)
injector.save_processed_file(output_path)
```

## API Endpoints

### Documents
- `POST /documents/upload` — Upload DOCX
- `GET /documents` — List files (RLS)
- `GET /documents/{id}` — Get metadata
- `DELETE /documents/{id}` — Delete file

### Analysis
- `POST /analysis/start` — Start task (returns task_id)
- `GET /analysis/status/{task_id}` — Poll status
- `GET /analysis/download/{task_id}` — Download file

See `DEVELOPMENT.md` for flow diagrams.
