"""
Flask Routes for Document Management
Handles file upload and storage via Supabase
"""

from flask import Blueprint, request, jsonify, send_file
from typing import Dict, Any
from supabase import create_client
from core.config import settings
from document.parser import ChapterExtractor
import uuid
import os
import tempfile
from datetime import datetime, timedelta

documents_bp = Blueprint("documents", __name__, url_prefix="/api/v1/documents")

def get_supabase():
    """Get Supabase client connected to the live project"""
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)


def get_user_id_from_token(token: str) -> str:
    """Extract user ID from JWT token via Supabase"""
    try:
        supabase = get_supabase()
        user = supabase.auth.get_user(token)
        return user.user.id if user and user.user else None
    except Exception as e:
        print(f"Token validation error: {e}")
        return None


@documents_bp.route("/upload", methods=["POST"])
def upload_document():
    """
    Upload a DOCX file with strict validation to Supabase.
    Requires JWT token in Authorization header.
    """
    # Get user from JWT token
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return {"error": "Unauthorized - missing Authorization header"}, 401

    token = auth_header.replace("Bearer ", "")
    user_id = get_user_id_from_token(token)

    if not user_id:
        return {"error": "Invalid token"}, 401

    if "file" not in request.files:
        return {"error": "No file provided"}, 400

    file = request.files["file"]

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

    # 3. Quick validation: Check document isn't excessively large (200 pages max)
    try:
        # Save to temp file for validation
        temp_file = tempfile.NamedTemporaryFile(suffix=".docx", delete=False)
        temp_file.write(file_content)
        temp_file.close()
        
        # Extract structure to check page count
        parser = ChapterExtractor(temp_file.name)
        doc_structure = parser.extract_full_structure(max_paragraphs=100)  # Quick check on first 100 paragraphs
        estimated_pages = doc_structure.get('estimated_pages', 0)
        
        # Clean up temp file
        os.unlink(temp_file.name)
        
        if estimated_pages > 200:
            return {
                "error": f"Document too large: approximately {estimated_pages} pages (maximum: 200 pages)"
            }, 413
            
    except Exception as e:
        # If validation fails, continue with upload but log the error
        print(f"Warning: Could not validate document size: {e}")

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
        result = supabase.table("documents").insert({
            "id": file_id,
            "owner_id": user_id,
            "name": file.filename,
            "file_path": file_path,
            "status": "pending",
            "created_at": datetime.utcnow().isoformat(),
            "expired_at": (datetime.utcnow() + timedelta(hours=1)).isoformat(),
        }).execute()

        return {
            "file_id": file_id,
            "file_path": file_path,
            "message": "Document uploaded successfully",
            "document": result.data[0] if result.data else None,
        }, 201

    except Exception as e:
        return {"error": f"Upload failed: {str(e)}"}, 500


@documents_bp.route("/<file_id>", methods=["GET"])
def get_document(file_id):
    """
    Retrieve document metadata.
    Requires JWT token and RLS ensures user can only access their own documents.
    """
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return {"error": "Unauthorized"}, 401

    token = auth_header.replace("Bearer ", "")
    user_id = get_user_id_from_token(token)

    if not user_id:
        return {"error": "Invalid token"}, 401
    
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
    Requires JWT token.
    """
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return {"error": "Unauthorized"}, 401

    token = auth_header.replace("Bearer ", "")
    user_id = get_user_id_from_token(token)

    if not user_id:
        return {"error": "Invalid token"}, 401
    
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
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return {"error": "Unauthorized"}, 401

    token = auth_header.replace("Bearer ", "")
    user_id = get_user_id_from_token(token)

    if not user_id:
        return {"error": "Invalid token"}, 401
    
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
