"""
Flask Routes for Document Management
Handles file upload and storage via Supabase
"""

from flask import Blueprint, request, jsonify, send_file
from typing import Dict, Any
from supabase import create_client
from core.config import settings
import uuid
import os

documents_bp = Blueprint("documents", __name__, url_prefix="/api/v1/documents")

def get_supabase():
    """Get Supabase client connected to the live project"""
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)

@documents_bp.route("/upload", methods=["POST"])
def upload_document():
    """
    Upload a DOCX file with strict validation to Supabase.
    """
    if "file" not in request.files:
        return {"error": "No file provided"}, 400

    file = request.files["file"]
    user_id = request.form.get("user_id", "current_user") 

    if not file.filename:
        return {"error": "No filename"}, 400

    # 1. Dynamic Extension Validation
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in settings.ALLOWED_EXTENSIONS:
        return {
            "error": f"Strict Rule Violation: Invalid file type. Allowed: {', '.join(settings.ALLOWED_EXTENSIONS)}"
        }, 400

    # 2. Check file size
    max_size = settings.MAX_FILE_SIZE_MB * 1024 * 1024
    file_content = file.read()
    if len(file_content) > max_size:
        return {"error": f"File exceeds {settings.MAX_FILE_SIZE_MB}MB limit"}, 413

    try:
        supabase = get_supabase()
        
        # Generate unique file ID and Path
        file_id = str(uuid.uuid4())
        file_path = f"{user_id}/{file_id}/{file.filename}"

        # Upload to Supabase Storage (RLS enforced)
        supabase.storage.from_(settings.STORAGE_BUCKET_NAME).upload(
            file_path,
            file_content,
            {"cacheControl": "3600", "upsert": "false"},
        )

        # Store metadata in PostgreSQL with RLS
        supabase.table("documents").insert({
            "id": file_id,
            "owner_id": user_id,
            "name": file.filename,
            "file_path": file_path,
            "status": "pending",
            "created_at": "now()",
            "expires_at": "now() + interval '1 hour'",
        }).execute()

        return {
            "file_id": file_id,
            "file_path": file_path,
            "message": "Document uploaded successfully to Supabase",
        }, 201

    except Exception as e:
        return {"error": f"Upload failed: {str(e)}"}, 500

@documents_bp.route("/<file_id>", methods=["GET"])
def get_document(file_id):
    """
    Retrieve document metadata.
    RLS ensures user can only access their own documents.
    """
    user_id = request.args.get("user_id", "current_user")
    
    try:
        supabase = get_supabase()
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

        return jsonify(doc.data), 200
    except Exception as e:
        return {"error": str(e)}, 500

@documents_bp.route("", methods=["GET"])
def list_documents():
    """
    List all documents owned by the user.
    """
    user_id = request.args.get("user_id", "current_user")
    
    try:
        supabase = get_supabase()
        docs = (
            supabase.table("documents")
            .select("*")
            .eq("owner_id", user_id)
            .order("created_at", desc=True)
            .execute()
        )
        return jsonify(docs.data or []), 200
    except Exception as e:
        return {"error": str(e)}, 500

@documents_bp.route("/<file_id>", methods=["DELETE"])
def delete_document(file_id):
    """
    Delete a document from storage and database.
    """
    user_id = request.args.get("user_id", "current_user")
    
    try:
        supabase = get_supabase()
        
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
            return {"error": "Document not found"}, 404

        # Delete from storage
        supabase.storage.from_(settings.STORAGE_BUCKET_NAME).remove([doc.data["file_path"]])

        # Delete from database
        supabase.table("documents").delete().eq("id", file_id).execute()

        return {"message": "Document deleted successfully"}, 200

    except Exception as e:
        return {"error": str(e)}, 500