"""
Supabase Client for Backend
Handles database and storage operations with RLS enforcement
"""

from typing import Optional
import os
from supabase import create_client, Client
from backend.core.config import settings

class SupabaseClient:
    """Singleton Supabase client for backend operations"""
    
    _instance: Optional[Client] = None
    
    @classmethod
    def get_client(cls) -> Client:
        """Get or create Supabase client instance"""
        if cls._instance is None:
            if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_KEY:
                raise ValueError(
                    "Supabase credentials not configured. "
                    "Set SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables."
                )
            
            cls._instance = create_client(
                settings.SUPABASE_URL,
                settings.SUPABASE_SERVICE_KEY
            )
            print("✅ Supabase client initialized for backend")
        
        return cls._instance
    
    @classmethod
    def get_user_client(cls, access_token: str) -> Client:
        """Create a user-scoped Supabase client with RLS enforcement"""
        if not settings.SUPABASE_URL or not settings.SUPABASE_ANON_KEY:
            raise ValueError(
                "Supabase credentials not configured. "
                "Set SUPABASE_URL and SUPABASE_ANON_KEY environment variables."
            )
        
        # Create client with user's access token for RLS
        client = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_ANON_KEY
        )
        
        # Set the user's JWT token
        client.auth.set_session(access_token, "")
        
        return client


# Convenience function for getting the service client
def get_supabase() -> Client:
    """Get the service-level Supabase client (bypasses RLS)"""
    return SupabaseClient.get_client()


# Convenience function for getting user-scoped client
def get_user_supabase(access_token: str) -> Client:
    """Get a user-scoped Supabase client (respects RLS)"""
    return SupabaseClient.get_user_client(access_token)
