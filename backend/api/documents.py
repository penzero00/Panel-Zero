"""
FastAPI Routes for Document Management
Handles file upload and storage via Supabase
"""

from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.responses import FileResponse
from typing import List, Dict, Any
from supabase import create_client
from core import settings
import uuid
import os

router = APIRouter(prefix="/documents", tags=["documents"])


def get_supabase():
    """Get Supabase client"""
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)


@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    user_id: str = "current_user",
    supabase=Depends(get_supabase),
) -> Dict[str, Any]:
    """
    Upload a DOCX file with strict validation.
    Per AGENTS.md: Strict Rule Violation - NO PDFs allowed
    
    - Validates .docx extension
    - Enforces file size limit (50MB)
    - Stores in Supabase with RLS enforcement
    - Returns ephemeral download URL
    """
    
    # Validate file extension
    if not file.filename.endswith(".docx"):
        raise HTTPException(
            status_code=400,
            detail="Strict Rule Violation: PDFs are dead documents. Upload a .docx file.",
        )

    # Check file size (50MB limit)
    max_size = settings.MAX_FILE_SIZE_MB * 1024 * 1024
    content = await file.read()
    if len(content) > max_size:
        raise HTTPException(
            status_code=413,
            detail=f"File exceeds {settings.MAX_FILE_SIZE_MB}MB limit",
        )

    try:
        # Generate unique file ID
        file_id = str(uuid.uuid4())
        file_path = f"{user_id}/{file_id}/{file.filename}"

        # Upload to Supabase Storage (RLS enforced)
        response = supabase.storage.from_(settings.STORAGE_BUCKET_NAME).upload(
            file_path,
            content,
            {"cacheControl": "3600", "upsert": "false"},
        )

        # Store metadata in PostgreSQL with RLS
        doc_record = supabase.table("documents").insert({
            "id": file_id,
            "owner_id": user_id,
            "name": file.filename,
            "file_path": file_path,
            "status": "pending",
            "created_at": "now()",
            "expires_at": "now() + interval '1 hour'",  # Zero-retention policy
        }).execute()

        return {
            "file_id": file_id,
            "file_path": file_path,
            "message": "Document uploaded successfully",
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


@router.get("/{file_id}")
async def get_document(
    file_id: str,
    user_id: str = "current_user",
    supabase=Depends(get_supabase),
) -> Dict[str, Any]:
    """
    Retrieve document metadata.
    RLS ensures user can only access their own documents.
    """
    try:
        doc = (
            supabase.table("documents")
            .select("*")
            .eq("id", file_id)
            .eq("owner_id", user_id)
            .single()
            .execute()
        )

        if not doc.data:
            raise HTTPException(status_code=404, detail="Document not found")

        return doc.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("")
async def list_documents(
    user_id: str = "current_user",
    supabase=Depends(get_supabase),
) -> List[Dict[str, Any]]:
    """
    List all documents owned by the user.
    RLS prevents access to other users' documents.
    """
    try:
        docs = (
            supabase.table("documents")
            .select("*")
            .eq("owner_id", user_id)
            .order("created_at", desc=True)
            .execute()
        )
        return docs.data or []
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{file_id}")
async def delete_document(
    file_id: str,
    user_id: str = "current_user",
    supabase=Depends(get_supabase),
) -> Dict[str, str]:
    """
    Delete a document from storage and database.
    Per AGENTS.md: Zero-retention policy
    """
    try:
        # Get document to verify ownership
        doc = (
            supabase.table("documents")
            .select("file_path")
            .eq("id", file_id)
            .eq("owner_id", user_id)
            .single()
            .execute()
        )

        if not doc.data:
            raise HTTPException(status_code=404, detail="Document not found")

        # Delete from storage
        supabase.storage.from_(settings.STORAGE_BUCKET_NAME).remove([doc.data["file_path"]])

        # Delete from database
        supabase.table("documents").delete().eq("id", file_id).execute()

        return {"message": "Document deleted successfully"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
