# Backend Directory

This directory contains the Flask server for PanelZero. Serverless-ready, synchronous processing.

## Structure

```
backend/
├── main.py               # Flask app entry point (Vercel-ready)
├── api/                  # Flask Blueprint routes
│   ├── documents.py      # File upload/management
│   └── analysis.py       # Analysis execution (synchronous)
├── agents/               # AI agent implementations
│   ├── __init__.py       # Agent definitions + routing
│   ├── technical_reader.py   # Pure Python format checker
│   └── llm_executor.py   # Gemini/GPT-4o integration
├── document/             # DOCX processing
│   ├── surgical_injector.py   # Non-destructive XML editing ⭐
│   └── parser.py         # Chapter extraction + chunking
├── core/                 # Configuration
│   └── config.py         # Pydantic BaseSettings
├── requirements.txt      # Python dependencies (Flask only)
├── .env.example          # Example env vars
├── database_schema.sql   # Supabase schema setup
└── README.md             # This file
```

## Key Files

- **main.py**: Flask app with CORS, blueprint registration
- **api/**: REST endpoints (documents, analysis) - synchronous processing
- **agents/**: AI logic with smart routing
- **document/surgical_injector.py**: The Golden Rules apply here ⭐

## Development

```bash
python -m venv venv
venv\Scripts\activate  # Windows only
pip install -r requirements.txt

# Start Flask server
python main.py
```

API will run at `http://localhost:8000`

## Processing Model

- **Synchronous**: All requests are processed directly (no background queue)
- **Serverless-Ready**: Suitable for Vercel deployment
- **Timeout Aware**: Be mindful of Vercel timeout limits (30-900 seconds based on plan)

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
- `POST /api/v1/documents/upload` — Upload DOCX
- `GET /api/v1/documents` — List files (RLS)
- `GET /api/v1/documents/{id}` — Get metadata
- `DELETE /api/v1/documents/{id}` — Delete file

### Analysis
- `POST /api/v1/analysis/start` — Start analysis (processes synchronously)
- `GET /api/v1/analysis/status/{task_id}` — Get status
- `GET /api/v1/analysis/download/{task_id}` — Download file

## Deployment

For Vercel deployment, see `DEPLOYMENT.md` in the root directory.
