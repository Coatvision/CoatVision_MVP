# backend/core/supabase_client.py
"""
Supabase client configuration for backend services.
Provides database connectivity for logging and data storage.
"""
import os
from typing import Optional

# Optional supabase dependency - gracefully handle if not installed
try:
    from supabase import create_client, Client
    SUPABASE_AVAILABLE = True
except ImportError:
    SUPABASE_AVAILABLE = False
    Client = None


def get_supabase_client() -> Optional["Client"]:
    """
    Create and return a Supabase client instance.
    Returns None if credentials are not configured or supabase is not installed.
    """
    if not SUPABASE_AVAILABLE:
        return None
    
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_KEY") or os.environ.get("SUPABASE_ANON_KEY")
    
    if not url or not key:
        return None
    
    try:
        return create_client(url, key)
    except Exception:
        return None


def is_supabase_configured() -> bool:
    """Check if Supabase credentials are configured."""
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_KEY") or os.environ.get("SUPABASE_ANON_KEY")
    return bool(url and key and SUPABASE_AVAILABLE)


# Singleton client instance
_client: Optional["Client"] = None


def get_client() -> Optional["Client"]:
    """Get the singleton Supabase client instance."""
    global _client
    if _client is None:
        _client = get_supabase_client()
    return _client
