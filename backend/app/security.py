import os
from typing import Optional
from fastapi import Header, HTTPException


ADMIN_TOKEN = os.getenv("ADMIN_TOKEN")


async def admin_guard(x_admin_token: Optional[str] = Header(default=None)):
    """Require X-Admin-Token header if ADMIN_TOKEN is configured.

    When ADMIN_TOKEN is set in env:
      - All endpoints using this guard will enforce the header match.
    When not set:
      - Guard is a no-op, endpoint remains open (useful for demos).
    """
    if ADMIN_TOKEN:
        if not x_admin_token or x_admin_token != ADMIN_TOKEN:
            raise HTTPException(status_code=403, detail="Admin token required")
    return True
