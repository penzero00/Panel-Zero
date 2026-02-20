"""
Celery Worker Configuration
Handles async task processing for long-running document analysis
Per AGENTS.md: Celery with Redis broker for task queuing
"""

import os
import tempfile
import asyncio
from celery import Celery
from core.config import settings
from supabase import create_client

# Import all of our specialized modules
from agents.technical_reader import TechnicalReaderAgent
from document.parser import ChapterExtractor
from document.surgical_injector import process_docx_with_highlights

# Initialize Celery app
celery_app = Celery(
    "panelzero",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=30 * 60,  # 30 minute timeout (AI analysis can take time)
    task_soft_time_limit=25 * 60,  # 25 minute soft timeout
)

@celery_app.task(bind=True)
def run_analysis(self, file_id: str, agent_role: str) -> dict:
    """
    Main analysis task executed by Celery worker.
    Ties together Supabase, the Parser, the AI Agent, and the Injector.
    """
    try:
        # Initialize Supabase Client
        supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
        
        self.update_state(
            state="PROGRESS",
            meta={"current": 10, "total": 100, "status": "Fetching document metadata..."}
        )

        # Step 1: Get file metadata from database
        doc_res = supabase.table("documents").select("*").eq("id", file_id).single().execute()
        if not doc_res.data:
            raise ValueError(f"Document {file_id} not found in database.")
            
        file_path = doc_res.data["file_path"]

        self.update_state(
            state="PROGRESS",
            meta={"current": 20, "total": 100, "status": "Downloading file from Supabase..."}
        )

        # Step 2: Download the DOCX file
        file_data = supabase.storage.from_(settings.STORAGE_BUCKET_NAME).download(file_path)
        
        # Save to a temporary cross-platform directory
        temp_dir = tempfile.gettempdir()
        local_input_path = os.path.join(temp_dir, f"{file_id}.docx")
        local_output_path = os.path.join(temp_dir, f"{file_id}_REVIEWED.docx")
        
        with open(local_input_path, "wb") as f:
            f.write(file_data)

        self.update_state(
            state="PROGRESS",
            meta={"current": 35, "total": 100, "status": "Parsing document structure..."}
        )

        # Step 3: Parse the DOCX and extract text for the LLM
        extractor = ChapterExtractor(local_input_path)
        document_text = extractor.extract_full_text()

        self.update_state(
            state="PROGRESS",
            meta={"current": 50, "total": 100, "status": f"Running {agent_role} AI analysis..."}
        )

        # Step 4: Execute the appropriate AI Agent
        if agent_role in ["tech", "technical_reader"]:
            agent = TechnicalReaderAgent(docx_path=local_input_path, rubric={})
            
            # CRITICAL: run_analysis is an async function (because of Bytez). 
            # Since Celery tasks are strictly synchronous, we use asyncio.run to execute it safely.
            results = asyncio.run(agent.run_analysis(document_content=document_text))
            
            # In a fully fleshed out app, the AI would return JSON coordinates for errors.
            # For now, we will pass an empty list of highlights to verify the pipeline works.
            highlights_to_apply = [] 
        else:
            results = {"agent": agent_role, "status": "Agent not fully implemented yet."}
            highlights_to_apply = []

        self.update_state(
            state="PROGRESS",
            meta={"current": 75, "total": 100, "status": "Injecting feedback and generating reviewed file..."}
        )

        # Step 5: Inject Highlights into a new DOCX file
        process_docx_with_highlights(local_input_path, local_output_path, highlights_to_apply)

        self.update_state(
            state="PROGRESS",
            meta={"current": 90, "total": 100, "status": "Uploading reviewed file back to Supabase..."}
        )

        # Step 6: Upload processed file back to Supabase
        processed_file_path = file_path.replace(".docx", "_REVIEWED.docx")
        with open(local_output_path, "rb") as f:
            supabase.storage.from_(settings.STORAGE_BUCKET_NAME).upload(
                processed_file_path,
                f.read(),
                {"cacheControl": "3600", "upsert": "true"}
            )
            
        # Mark task as complete in the database
        supabase.table("documents").update({"status": "complete"}).eq("id", file_id).execute()

        # Clean up the temporary local files to prevent server bloat
        if os.path.exists(local_input_path): os.remove(local_input_path)
        if os.path.exists(local_output_path): os.remove(local_output_path)

        return {
            "task_id": self.request.id,
            "status": "complete",
            "file_id": file_id,
            "agent_role": agent_role,
            "processed_file_path": processed_file_path,
            "results": results,
        }

    except Exception as e:
        self.update_state(
            state="FAILURE",
            meta={"error": str(e)},
        )
        raise


@celery_app.task
def cleanup_expired_files():
    """
    Scheduled task to delete expired files from Supabase.
    Per AGENTS.md: Zero-retention policy - delete files hourly.
    """
    try:
        supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
        
        # Get all documents where expires_at has passed
        expired = supabase.table('documents').select('id, file_path').lt('expires_at', 'now()').execute()
        
        for doc in expired.data or []:
            # Remove original and reviewed version from Storage
            reviewed_path = doc['file_path'].replace(".docx", "_REVIEWED.docx")
            supabase.storage.from_(settings.STORAGE_BUCKET_NAME).remove([doc['file_path'], reviewed_path])
            
            # Delete record from Database
            supabase.table('documents').delete().eq('id', doc['id']).execute()
            
        return {"status": "cleanup_complete", "files_removed": len(expired.data or [])}
    except Exception as e:
        print(f"Cleanup Error: {str(e)}")
        return {"status": "cleanup_failed", "error": str(e)}


# Celery beat schedule
celery_app.conf.beat_schedule = {
    "cleanup-expired-files": {
        "task": "worker.cleanup_expired_files",
        "schedule": 3600,  # Run every hour (3600 seconds)
    },
}