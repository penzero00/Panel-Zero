"""
Flask Routes for User Profile Management
Handles user profile creation and updates
"""

from flask import Blueprint, request, jsonify
from supabase import create_client
from core.config import settings
from datetime import datetime

user_profiles_bp = Blueprint("user_profiles", __name__, url_prefix="/api/v1/user-profiles")


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


def get_user_from_token(token: str):
    """Return full user object from JWT token via Supabase"""
    try:
        supabase = get_supabase()
        response = supabase.auth.get_user(token)
        return response.user if response else None
    except Exception as e:
        print(f"Token validation error: {e}")
        return None


@user_profiles_bp.route("", methods=["POST"])
def create_user_profile():
    """
    Create a new user profile.
    Called immediately after user account verification.
    """
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return {"error": "Unauthorized"}, 401

    token = auth_header.replace("Bearer ", "")
    user_id = get_user_id_from_token(token)
    auth_user = get_user_from_token(token)

    if not user_id:
        return {"error": "Invalid token"}, 401

    data = request.get_json()
    full_name = data.get("full_name", "")
    institution = data.get("institution", "")
    role = data.get("role", "student")
    email = data.get("email") or (auth_user.email if auth_user else None)

    if not full_name:
        return {"error": "full_name is required"}, 400

    try:
        supabase = get_supabase()

        # Check if profile already exists
        existing = (
            supabase.table("user_profiles")
            .select("id")
            .eq("id", user_id)
            .execute()
        )

        if existing.data and len(existing.data) > 0:
            # Profile exists, update it
            update_fields = {
                "full_name": full_name,
                "institution": institution,
                "role": role,
                "updated_at": datetime.utcnow().isoformat(),
            }
            if email:
                update_fields["email"] = email

            result = (
                supabase.table("user_profiles")
                .update(update_fields)
                .eq("id", user_id)
                .execute()
            )
        else:
            # Create new profile
            result = (
                supabase.table("user_profiles")
                .insert({
                    "id": user_id,
                    "full_name": full_name,
                    "email": email,
                    "institution": institution,
                    "role": role,
                    "email_verified": True,
                    "created_at": datetime.utcnow().isoformat(),
                    "updated_at": datetime.utcnow().isoformat(),
                })
                .execute()
            )

        return {
            "message": "User profile created successfully",
            "user_id": user_id,
            "profile": result.data[0] if result.data else None,
        }, 201

    except Exception as e:
        return {"error": f"Failed to create profile: {str(e)}"}, 500


@user_profiles_bp.route("", methods=["GET"])
def get_user_profile():
    """
    Get the authenticated user's profile.
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
        profile = (
            supabase.table("user_profiles")
            .select("*")
            .eq("id", user_id)
            .single()
            .execute()
        )

        if not profile.data:
            return {"error": "Profile not found"}, 404

        return jsonify(profile.data), 200

    except Exception as e:
        return {"error": str(e)}, 500


@user_profiles_bp.route("", methods=["PUT"])
def update_user_profile():
    """
    Update the authenticated user's profile.
    """
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return {"error": "Unauthorized"}, 401

    token = auth_header.replace("Bearer ", "")
    user_id = get_user_id_from_token(token)

    if not user_id:
        return {"error": "Invalid token"}, 401

    data = request.get_json()

    try:
        supabase = get_supabase()

        # Only update allowed fields
        update_data = {}
        if "full_name" in data:
            update_data["full_name"] = data["full_name"]
        if "institution" in data:
            update_data["institution"] = data["institution"]
        if "avatar_url" in data:
            update_data["avatar_url"] = data["avatar_url"]
        if "role" in data:
            update_data["role"] = data["role"]
        if "email" in data:
            update_data["email"] = data["email"]

        update_data["updated_at"] = datetime.utcnow().isoformat()

        result = (
            supabase.table("user_profiles")
            .update(update_data)
            .eq("id", user_id)
            .execute()
        )

        return {
            "message": "Profile updated successfully",
            "profile": result.data[0] if result.data else None,
        }, 200

    except Exception as e:
        return {"error": str(e)}, 500
