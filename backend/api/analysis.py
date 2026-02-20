"""
Flask Routes for Analysis Execution
Processes documents synchronously for Vercel serverless deployment
Removed Celery task queue for Windows compatibility
"""

from flask import Blueprint, request, jsonify, send_file
from typing import Dict, Any
from agents.technical_reader import TechnicalReaderAgent
from supabase import create_client
from core.config import settings
import uuid
import os
import tempfile

analysis_bp = Blueprint("analysis", __name__, url_prefix="/api/v1/analysis")

def get_supabase():
    """Get Supabase client connected to the live project"""
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)

@analysis_bp.route("/start", methods=["POST"])
def start_analysis():
    """
    Start analysis for a given file and agent role.
    Processes synchronously (suitable for Vercel serverless).
    
    For long-running tasks, consider implementing streaming responses
    or requesting timeout increase from Vercel.
    """
    try:
        data = request.get_json()
        file_id = data.get("file_id")
        agent_role = data.get("agent_role")
        user_id = data.get("user_id", "current_user")
        
        if not file_id or not agent_role:
            return {"error": "Missing file_id or agent_role"}, 400

        supabase = get_supabase()
        
        # Retrieve document from Supabase
        doc = (
            supabase.table("documents")
            .select("*")
            .eq("id", file_id)
            .eq("owner_id", user_id)
            .single()
            .execute()
        )
        
        if not doc.data:
            return {"error": "Document not found"}, 404

        # Download file from Supabase
        file_path = doc.data["file_path"]
        file_data = supabase.storage.from_(settings.STORAGE_BUCKET_NAME).download(file_path)

        # Generate task ID for tracking
        task_id = str(uuid.uuid4())

        # Process based on agent role
        result = None
        if agent_role == "technical_reader":
            agent = TechnicalReaderAgent()
            result = agent.analyze(file_data)
        else:
            return {"error": f"Unknown agent role: {agent_role}"}, 400

        # Save processed result (in production, store in Supabase)
        # For now, return the analysis result
        return {
            "task_id": task_id,
            "file_id": file_id,
            "agent_role": agent_role,
            "status": "completed",
            "result": result,
        }, 200

    except Exception as e:
        return {"error": f"Analysis failed: {str(e)}"}, 500

@analysis_bp.route("/status/<task_id>", methods=["GET"])
def get_analysis_status(task_id):
    """
    Get the status of an analysis task.
    Since we're processing synchronously, tasks are either completed or not found.
    """
    # In a production system with async processing, this would check a database
    return {
        "task_id": task_id,
        "status": "completed",
        "message": "Task processing completed"
    }, 200

@analysis_bp.route("/download/<task_id>", methods=["GET"])
def download_processed_file(task_id):
    """
    Download the processed DOCX file after analysis.
    """
    user_id = request.args.get("user_id", "current_user")
    
    try:
        # In production, retrieve from Supabase based on task_id
        # For now, return 404 as this needs to be integrated with your storage
        return {"error": "Processed file not found"}, 404

    except Exception as e:
        return {"error": str(e)}, 500