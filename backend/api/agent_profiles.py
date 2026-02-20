"""
Flask Routes for Agent Profile Management
Handles CRUD operations for agent-specific preferences
Each user can create custom profiles per agent role
"""

from flask import Blueprint, request, jsonify
from typing import Dict, Any, List
from supabase import create_client
from core.config import settings
import uuid
from datetime import datetime

agent_profiles_bp = Blueprint("agent_profiles", __name__, url_prefix="/api/v1/agent-profiles")

# Default preset profiles (DOCX-compatible, one per agent role)
DEFAULT_PROFILES = [
    {
        "agent_role": "tech",
        "name": "Technical Reader Default",
        "description": "Standard technical analysis profile with strict formatting",
        "font_family": "Times New Roman",
        "font_size": 12,
        "margin_left_inches": 1.5,
        "margin_right_inches": 1.0,
        "margin_top_inches": 1.0,
        "margin_bottom_inches": 1.0,
        "line_spacing": 2.0,
        "first_line_indent": 0.5,
        "check_passive_voice": True,
        "check_tense_consistency": True,
        "preferred_citation_style": "IEEE",
    },
    {
        "agent_role": "grammar",
        "name": "Grammar Critic Default",
        "description": "Comprehensive grammar and language checking profile",
        "font_family": "Times New Roman",
        "font_size": 12,
        "margin_left_inches": 1.0,
        "margin_right_inches": 1.0,
        "margin_top_inches": 1.0,
        "margin_bottom_inches": 1.0,
        "line_spacing": 2.0,
        "check_passive_voice": True,
        "check_tense_consistency": True,
        "check_subject_verb_agreement": True,
        "check_sentence_fragments": True,
        "preferred_citation_style": "APA 7th",
    },
    {
        "agent_role": "stats",
        "name": "Statistician Default",
        "description": "Statistical methods and data analysis profile",
        "font_family": "Arial",
        "font_size": 11,
        "margin_left_inches": 1.0,
        "margin_right_inches": 1.0,
        "margin_top_inches": 1.0,
        "margin_bottom_inches": 1.0,
        "line_spacing": 1.5,
        "image_min_dpi": 300,
        "preferred_citation_style": "APA 7th",
    },
    {
        "agent_role": "subject",
        "name": "Subject Expert Default",
        "description": "Subject matter expertise and content analysis profile",
        "font_family": "Times New Roman",
        "font_size": 12,
        "margin_left_inches": 1.0,
        "margin_right_inches": 1.0,
        "margin_top_inches": 1.0,
        "margin_bottom_inches": 1.0,
        "line_spacing": 2.0,
        "preferred_citation_style": "APA 7th",
    },
    {
        "agent_role": "chairman",
        "name": "Panel Chairman Default",
        "description": "Overall thesis quality and defense preparation profile",
        "font_family": "Times New Roman",
        "font_size": 12,
        "margin_left_inches": 1.0,
        "margin_right_inches": 1.0,
        "margin_top_inches": 1.0,
        "margin_bottom_inches": 1.0,
        "line_spacing": 2.0,
        "paragraph_alignment": "justify",
        "preferred_citation_style": "APA 7th",
    },
]


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


@agent_profiles_bp.route("", methods=["GET"])
def list_agent_profiles():
    """
    List all agent profiles for the authenticated user.
    Includes both user-created profiles and system default profiles.
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
        
        # Fetch user's profiles and default profiles
        profiles = (
            supabase.table("agent_profiles")
            .select("*")
            .or_(f"owner_id.eq.{user_id},owner_id.is.null")
            .order("agent_role", desc=False)
            .order("is_active", desc=True)
            .execute()
        )
        
        return jsonify(profiles.data), 200

    except Exception as e:
        return {"error": f"Failed to fetch profiles: {str(e)}"}, 500


@agent_profiles_bp.route("/role/<agent_role>", methods=["GET"])
def list_profiles_by_role(agent_role: str):
    """
    List agent profiles filtered by agent role.
    Returns user profiles + default profiles for specified agent.
    """
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return {"error": "Unauthorized"}, 401
    
    token = auth_header.replace("Bearer ", "")
    user_id = get_user_id_from_token(token)
    
    if not user_id:
        return {"error": "Invalid token"}, 401
    
    # Validate agent role
    valid_roles = ["tech", "grammar", "stats", "subject", "chairman"]
    if agent_role not in valid_roles:
        return {"error": f"Invalid agent role. Must be one of: {', '.join(valid_roles)}"}, 400
    
    try:
        supabase = get_supabase()
        profiles = (
            supabase.table("agent_profiles")
            .select("*")
            .eq("agent_role", agent_role)
            .or_(f"owner_id.eq.{user_id},owner_id.is.null")
            .order("is_active", desc=True)
            .execute()
        )
        
        return jsonify(profiles.data), 200

    except Exception as e:
        return {"error": f"Failed to fetch profiles: {str(e)}"}, 500


@agent_profiles_bp.route("", methods=["POST"])
def create_agent_profile():
    """
    Create a new agent profile for the authenticated user.
    Validates DOCX-compatible settings.
    """
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return {"error": "Unauthorized"}, 401
    
    token = auth_header.replace("Bearer ", "")
    user_id = get_user_id_from_token(token)
    
    if not user_id:
        return {"error": "Invalid token"}, 401
    
    data = request.get_json()
    
    # Required fields
    required_fields = ["agent_role", "name"]
    for field in required_fields:
        if field not in data:
            return {"error": f"Missing required field: {field}"}, 400
    
    # Validate agent_role
    valid_roles = ["tech", "grammar", "stats", "subject", "chairman"]
    if data["agent_role"] not in valid_roles:
        return {"error": f"Invalid agent_role. Must be one of: {', '.join(valid_roles)}"}, 400
    
    # Validate DOCX-compatible font sizes (8-72 pt in Word)
    if "font_size" in data and (data["font_size"] < 8 or data["font_size"] > 72):
        return {"error": "Font size must be between 8 and 72 points (DOCX limit)"}, 400
    
    # Validate margins (0.1-2.5 inches typical for DOCX)
    margin_fields = ["margin_left_inches", "margin_right_inches", "margin_top_inches", "margin_bottom_inches"]
    for field in margin_fields:
        if field in data and (data[field] < 0.1 or data[field] > 2.5):
            return {"error": f"{field} must be between 0.1 and 2.5 inches (DOCX compatible)"}, 400
    
    # Validate line spacing (DOCX supports 0.5-3.0)
    if "line_spacing" in data and (data["line_spacing"] < 0.5 or data["line_spacing"] > 3.0):
        return {"error": "Line spacing must be between 0.5 and 3.0 (DOCX compatible)"}, 400
    
    # Validate font family (DOCX-compatible fonts)
    valid_fonts = ["Times New Roman", "Arial", "Calibri", "Georgia", "Cambria", "Courier New"]
    if "font_family" in data and data["font_family"] not in valid_fonts:
        return {"error": f"Font family must be one of: {', '.join(valid_fonts)}"}, 400
    
    try:
        supabase = get_supabase()
        
        profile_id = str(uuid.uuid4())
        
        # Prepare profile data with DOCX-compatible defaults
        profile_data = {
            "id": profile_id,
            "owner_id": user_id,
            "agent_role": data["agent_role"],
            "name": data["name"],
            "description": data.get("description", ""),
            
            # Font preferences (DOCX-compatible)
            "font_family": data.get("font_family", "Times New Roman"),
            "font_size": data.get("font_size", 12),
            "font_style": data.get("font_style", "normal"),
            
            # Margin preferences (in inches, DOCX-compatible)
            "margin_left_inches": data.get("margin_left_inches", 1.0),
            "margin_right_inches": data.get("margin_right_inches", 1.0),
            "margin_top_inches": data.get("margin_top_inches", 1.0),
            "margin_bottom_inches": data.get("margin_bottom_inches", 1.0),
            
            # Paragraph preferences (DOCX-compatible)
            "line_spacing": data.get("line_spacing", 2.0),
            "paragraph_spacing_before": data.get("paragraph_spacing_before", 0),
            "paragraph_spacing_after": data.get("paragraph_spacing_after", 0),
            "first_line_indent": data.get("first_line_indent", 0.5),
            "paragraph_alignment": data.get("paragraph_alignment", "justify"),
            
            # Image preferences (DOCX-compatible)
            "image_format": data.get("image_format", "embedded"),
            "image_min_dpi": data.get("image_min_dpi", 300),
            "image_max_width_inches": data.get("image_max_width_inches", 6.5),
            
            # Grammar preferences
            "check_passive_voice": data.get("check_passive_voice", True),
            "check_tense_consistency": data.get("check_tense_consistency", True),
            "check_subject_verb_agreement": data.get("check_subject_verb_agreement", True),
            "check_sentence_fragments": data.get("check_sentence_fragments", True),
            "preferred_citation_style": data.get("preferred_citation_style", "APA 7th"),
            
            # Spacing preferences
            "add_space_after_period": data.get("add_space_after_period", True),
            "add_space_after_comma": data.get("add_space_after_comma", True),
            "check_double_spaces": data.get("check_double_spaces", True),
            
            # Metadata
            "is_active": False,
            "is_default": False,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        
        result = supabase.table("agent_profiles").insert(profile_data).execute()
        
        return jsonify(result.data[0]), 201

    except Exception as e:
        return {"error": f"Failed to create profile: {str(e)}"}, 500


@agent_profiles_bp.route("/<profile_id>", methods=["PUT"])
def update_agent_profile(profile_id: str):
    """
    Update an existing agent profile.
    User can only update their own profiles (not defaults).
    """
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return {"error": "Unauthorized"}, 401
    
    token = auth_header.replace("Bearer ", "")
    user_id = get_user_id_from_token(token)
    
    if not user_id:
        return {"error": "Invalid token"}, 401
    
    data = request.get_json()
    
    # Validate DOCX-compatible settings if provided
    if "font_size" in data and (data["font_size"] < 8 or data["font_size"] > 72):
        return {"error": "Font size must be between 8 and 72 points"}, 400
    
    margin_fields = ["margin_left_inches", "margin_right_inches", "margin_top_inches", "margin_bottom_inches"]
    for field in margin_fields:
        if field in data and (data[field] < 0.1 or data[field] > 2.5):
            return {"error": f"{field} must be between 0.1 and 2.5 inches"}, 400
    
    if "line_spacing" in data and (data["line_spacing"] < 0.5 or data["line_spacing"] > 3.0):
        return {"error": "Line spacing must be between 0.5 and 3.0"}, 400
    
    try:
        supabase = get_supabase()
        
        # Verify ownership (RLS will also enforce this)
        existing = (
            supabase.table("agent_profiles")
            .select("*")
            .eq("id", profile_id)
            .eq("owner_id", user_id)
            .eq("is_default", False)
            .single()
            .execute()
        )
        
        if not existing.data:
            return {"error": "Profile not found or not authorized to update"}, 404
        
        # Prepare update data
        update_data = {**data}
        update_data["updated_at"] = datetime.utcnow().isoformat()
        
        # Remove fields that shouldn't be updated
        update_data.pop("id", None)
        update_data.pop("owner_id", None)
        update_data.pop("is_default", None)
        update_data.pop("created_at", None)
        
        result = (
            supabase.table("agent_profiles")
            .update(update_data)
            .eq("id", profile_id)
            .execute()
        )
        
        return jsonify(result.data[0]), 200

    except Exception as e:
        return {"error": f"Failed to update profile: {str(e)}"}, 500


@agent_profiles_bp.route("/<profile_id>", methods=["DELETE"])
def delete_agent_profile(profile_id: str):
    """
    Delete an existing agent profile.
    User can only delete their own profiles (not defaults).
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
        
        result = (
            supabase.table("agent_profiles")
            .delete()
            .eq("id", profile_id)
            .eq("owner_id", user_id)
            .eq("is_default", False)
            .execute()
        )
        
        if not result.data:
            return {"error": "Profile not found or not authorized to delete"}, 404
        
        return {"message": "Profile deleted successfully"}, 200

    except Exception as e:
        return {"error": f"Failed to delete profile: {str(e)}"}, 500


@agent_profiles_bp.route("/<profile_id>/activate", methods=["PUT"])
def set_active_agent_profile(profile_id: str):
    """
    Set a profile as active for its agent role.
    Deactivates all other profiles for the same role and user.
    """
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return {"error": "Unauthorized"}, 401
    
    token = auth_header.replace("Bearer ", "")
    user_id = get_user_id_from_token(token)
    
    if not user_id:
        return {"error": "Invalid token"}, 401
    
    data = request.get_json()
    agent_role = data.get("agent_role")
    
    if not agent_role:
        return {"error": "agent_role is required"}, 400
    
    try:
        supabase = get_supabase()
        
        # Verify the profile exists and belongs to the user
        profile = (
            supabase.table("agent_profiles")
            .select("*")
            .eq("id", profile_id)
            .eq("agent_role", agent_role)
            .single()
            .execute()
        )
        
        if not profile.data:
            return {"error": "Profile not found or not authorized"}, 404
        
        # Deactivate all other profiles for this role and user
        supabase.table("agent_profiles").update({"is_active": False}).eq("agent_role", agent_role).eq("owner_id", user_id).execute()
        
        # Activate the selected profile
        result = (
            supabase.table("agent_profiles")
            .update({"is_active": True, "updated_at": datetime.utcnow().isoformat()})
            .eq("id", profile_id)
            .execute()
        )
        
        return jsonify(result.data[0]), 200

    except Exception as e:
        return {"error": f"Failed to activate profile: {str(e)}"}, 500


@agent_profiles_bp.route("/active/<agent_role>", methods=["GET"])
def get_active_profile(agent_role: str):
    """
    Get the active profile for a specific agent role.
    Returns user's active profile or falls back to default.
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
        
        # Try to get user's active profile first
        profile = (
            supabase.table("agent_profiles")
            .select("*")
            .eq("agent_role", agent_role)
            .eq("owner_id", user_id)
            .eq("is_active", True)
            .limit(1)
            .execute()
        )
        
        # If no user profile, try to get default
        if not profile.data:
            profile = (
                supabase.table("agent_profiles")
                .select("*")
                .eq("agent_role", agent_role)
                .is_("owner_id", "null")
                .eq("is_default", True)
                .limit(1)
                .execute()
            )
        
        if profile.data:
            return jsonify(profile.data[0]), 200
        else:
            return {"error": "No active profile found for this agent role"}, 404

    except Exception as e:
        return {"error": f"Failed to fetch active profile: {str(e)}"}, 500
