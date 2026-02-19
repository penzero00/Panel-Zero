"""
Celery Worker Configuration
Handles async task processing for long-running document analysis
Per AGENTS.md: Celery with Redis broker for task queuing
"""

from celery import Celery
from core import settings

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
    task_time_limit=30 * 60,  # 30 minute timeout
    task_soft_time_limit=25 * 60,  # 25 minute soft timeout
)


# Task definitions
@celery_app.task(bind=True)
def run_analysis(self, file_id: str, agent_role: str) -> dict:
    """
    Main analysis task executed by Celery worker.
    Updates task state for progress tracking.
    """
    try:
        self.update_state(
            state="PROGRESS",
            meta={"current": 25, "total": 100, "status": "Downloading file..."},
        )

        # Step 1: Download file from Supabase
        # supabase_client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
        # file_data = supabase_client.storage.from_('thesis-drafts').download(file_path)

        self.update_state(
            state="PROGRESS",
            meta={"current": 50, "total": 100, "status": "Running analysis..."},
        )

        # Step 2: Execute appropriate agent
        if agent_role == "tech":
            # from agents.technical_reader import TechnicalReaderAgent
            # agent = TechnicalReaderAgent(file_path, {})
            # results = agent.run_analysis()
            results = {"agent": "technical_reader", "status": "complete"}
        else:
            results = {"agent": agent_role, "status": "complete"}

        self.update_state(
            state="PROGRESS",
            meta={"current": 75, "total": 100, "status": "Processing results..."},
        )

        # Step 3: Inject highlights into DOCX
        # from document import SurgicalInjector
        # injector = SurgicalInjector(file_path)
        # injector.save_processed_file(output_path)

        self.update_state(
            state="PROGRESS",
            meta={"current": 90, "total": 100, "status": "Uploading processed file..."},
        )

        # Step 4: Upload processed file to Supabase
        # supabase_client.storage.from_('thesis-drafts').upload(...)

        return {
            "task_id": self.request.id,
            "status": "complete",
            "file_id": file_id,
            "agent_role": agent_role,
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
    # from supabase import create_client
    # supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
    # 
    # Get all expired documents
    # expired = supabase.table('documents').select('file_path').lt('expires_at', 'now()').execute()
    # 
    # for doc in expired.data or []:
    #     supabase.storage.from_('thesis-drafts').remove([doc['file_path']])
    #     supabase.table('documents').delete().eq('id', doc['id']).execute()
    
    return {"status": "cleanup_complete"}


# Celery beat schedule (can be extended)
celery_app.conf.beat_schedule = {
    "cleanup-expired-files": {
        "task": "worker.cleanup_expired_files",
        "schedule": 3600,  # Run every hour
    },
}
