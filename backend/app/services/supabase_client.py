import json
import logging
import requests
import importlib

_pkg = __package__ or "backend.app.services"
try:
    _config = importlib.import_module(_pkg + ".config")
    SUPABASE_URL = getattr(_config, "SUPABASE_URL", None)
    SUPABASE_SERVICE_KEY = getattr(_config, "SUPABASE_SERVICE_KEY", None)
except Exception:
    SUPABASE_URL = None
    SUPABASE_SERVICE_KEY = None


def insert_analysis_payload(payload: dict) -> bool:
    """Insert an analysis payload into Supabase via RPC.

    Returns True on success. No-ops and returns False if not configured.
    """
    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        return False
    url = SUPABASE_URL.rstrip("/") + "/rest/v1/rpc/insert_analysis_from_payload"
    headers = {
        "apikey": SUPABASE_SERVICE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
        "Content-Type": "application/json",
    }
    try:
        resp = requests.post(url, headers=headers, json={"payload": payload}, timeout=15)
        if resp.ok:
            return True
        logging.warning("Supabase insert failed: %s %s", resp.status_code, resp.text[:200])
    except Exception as e:
        logging.warning("Supabase insert error: %s", e)
    return False


def _headers():
    if not SUPABASE_SERVICE_KEY:
        return None
    return {
        "apikey": SUPABASE_SERVICE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
        "Content-Type": "application/json",
    }


def get_dashboard_summary():
    """Fetch aggregated dashboard summary from Supabase via RPC.

    Returns dict or None if not configured/error.
    """
    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        return None
    url = SUPABASE_URL.rstrip("/") + "/rest/v1/rpc/get_dashboard_summary"
    try:
        resp = requests.post(url, headers=_headers(), json={}, timeout=15)
        if resp.ok:
            return resp.json()
        logging.warning("Supabase summary failed: %s %s", resp.status_code, resp.text[:200])
    except Exception as e:
        logging.warning("Supabase summary error: %s", e)
    return None


def get_latest_analyses(limit: int = 10):
    """Fetch latest analyses for dashboard.

    Returns list or None.
    """
    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        return None
    url = SUPABASE_URL.rstrip("/") + "/rest/v1/rpc/get_latest_analyses"
    try:
        resp = requests.post(url, headers=_headers(), json={"p_limit": int(limit)}, timeout=15)
        if resp.ok:
            return resp.json()
        logging.warning("Supabase latest failed: %s %s", resp.status_code, resp.text[:200])
    except Exception as e:
        logging.warning("Supabase latest error: %s", e)
    return None
