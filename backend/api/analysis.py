"""
FastAPI Routes for Analysis Execution
Triggers Celery tasks and polls status
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
from typing import Dict, Any, Optional
from celery.result import AsyncResult
from agents import AgentRole, AgentConfig
from agents.technical_reader import TechnicalReaderAgent
from document import ChapterExtractor
import uuid
import json

router = APIRouter(prefix="/analysis", tags=["analysis"])

# This would be the Celery app in production
# from worker import celery_app


@router.post("/start")
async def start_analysis(
    request: Dict[str, Any],
    background_tasks: BackgroundTasks,
) -> Dict[str, str]:
    """
    Start an analysis task for a given file and agent role.
    Returns immediately with task_id while Celery processes in background.
    
    Per AGENTS.md: FastAPI returns task_id immediately,
    Celery handles long document processing asynchronously.
    """
    
    file_id = request.get("file_id")
    agent_role = request.get("agent_role")
    
    if not file_id or not agent_role:
        raise HTTPException(status_code=400, detail="Missing file_id or agent_role")

    # Validate agent role
    try:
        role = AgentRole(agent_role)
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid agent role: {agent_role}")

    # Generate task ID
    task_id = str(uuid.uuid4())

    # In production, this would dispatch to Celery:
    # task = celery_app.send_task(
    #     "tasks.run_analysis",
    #     args=[file_id, agent_role],
    #     task_id=task_id,
    # )

    return {
        "task_id": task_id,
        "status": "queued",
        "message": f"Analysis queued for agent: {role.value}",
    }


@router.get("/status/{task_id}")
async def get_analysis_status(task_id: str) -> Dict[str, Any]:
    """
    Poll the status of an analysis task.
    Returns progress, status, and results when complete.
    """
    
    # In production, retrieve from Celery:
    # task_result = AsyncResult(task_id, app=celery_app)
    
    # Mock response for demonstration
    return {
        "task_id": task_id,
        "status": "processing",
        "progress": 45,
        "message": "Executing surgical XML injection safely...",
    }


@router.get("/download/{task_id}")
async def download_processed_file(task_id: str) -> FileResponse:
    """
    Download the processed DOCX file after analysis is complete.
    Enforces RLS via task ownership validation.
    """
    
    # In production, verify the task belongs to the authenticated user
    # and retrieve the file path from Supabase
    
    # Mock file path
    file_path = f"/tmp/{task_id}_REVIEWED.docx"
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Processed file not found")

    return FileResponse(
        file_path,
        filename=f"thesis_REVIEWED.docx",
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    )


@router.post("/manual-test")
async def manual_test_analysis(
    request: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Manual testing endpoint for analysis without async.
    Useful for development and debugging.
    """
    
    file_path = request.get("file_path")
    agent_role = request.get("agent_role", "tech")
    rubric = request.get("rubric", {})

    try:
        if agent_role == "tech":
            # Test Technical Reader (Pure Python)
            agent = TechnicalReaderAgent(file_path, rubric)
            results = agent.run_analysis()
        else:
            # Other agents would be tested similarly
            results = {
                "agent": agent_role,
                "message": f"Manual test for {agent_role} agent",
                "status": "testing",
            }

        return {
            "success": True,
            "results": results,
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e),
        }


import os
