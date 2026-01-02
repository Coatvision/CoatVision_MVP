# backend/core/logger.py
"""
Unified logging utility for CoatVision API.
Logs to console and optionally to Supabase `analyze_logs` table.
"""
import logging
import os
import traceback
from datetime import datetime, timezone
from typing import Any, Dict, Optional
from enum import Enum

from .supabase_client import get_client, is_supabase_configured


class LogLevel(str, Enum):
    """Log level enumeration."""
    DEBUG = "debug"
    INFO = "info"
    WARNING = "warning"
    ERROR = "error"
    CRITICAL = "critical"


# Configure console logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)


def get_logger(name: str) -> logging.Logger:
    """Get a configured logger instance."""
    return logging.getLogger(name)


async def log_to_supabase(
    endpoint: str,
    level: LogLevel,
    message: str,
    details: Optional[Dict[str, Any]] = None,
    user_id: Optional[str] = None,
    request_id: Optional[str] = None
) -> bool:
    """
    Log an entry to Supabase `analyze_logs` table.
    Returns True if logged successfully, False otherwise.
    """
    if not is_supabase_configured():
        return False
    
    client = get_client()
    if not client:
        return False
    
    try:
        log_entry = {
            "endpoint": endpoint,
            "level": level.value,
            "message": message,
            "details": details or {},
            "user_id": user_id,
            "request_id": request_id,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        client.table("analyze_logs").insert(log_entry).execute()
        return True
    except Exception as e:
        # Don't let logging failures break the application
        logging.getLogger("coatvision.logger").warning(
            f"Failed to log to Supabase: {e}"
        )
        return False


class APILogger:
    """
    API Logger that logs to both console and Supabase.
    Usage:
        logger = APILogger("analyze")
        await logger.info("Analysis started", {"filename": "test.jpg"})
        await logger.error("Analysis failed", {"error": str(e)})
    """
    
    def __init__(self, endpoint: str):
        self.endpoint = endpoint
        self.console_logger = get_logger(f"coatvision.{endpoint}")
    
    async def _log(
        self,
        level: LogLevel,
        message: str,
        details: Optional[Dict[str, Any]] = None,
        user_id: Optional[str] = None,
        request_id: Optional[str] = None
    ):
        """Internal logging method."""
        # Console logging
        log_method = getattr(self.console_logger, level.value)
        log_method(f"{message} - {details}" if details else message)
        
        # Supabase logging (non-blocking, errors are caught)
        await log_to_supabase(
            endpoint=self.endpoint,
            level=level,
            message=message,
            details=details,
            user_id=user_id,
            request_id=request_id
        )
    
    async def debug(self, message: str, details: Optional[Dict[str, Any]] = None, **kwargs):
        """Log debug level message."""
        await self._log(LogLevel.DEBUG, message, details, **kwargs)
    
    async def info(self, message: str, details: Optional[Dict[str, Any]] = None, **kwargs):
        """Log info level message."""
        await self._log(LogLevel.INFO, message, details, **kwargs)
    
    async def warning(self, message: str, details: Optional[Dict[str, Any]] = None, **kwargs):
        """Log warning level message."""
        await self._log(LogLevel.WARNING, message, details, **kwargs)
    
    async def error(self, message: str, details: Optional[Dict[str, Any]] = None, **kwargs):
        """Log error level message."""
        if details is None:
            details = {}
        # Include traceback only if there's an active exception
        exc_info = traceback.format_exc()
        if exc_info and exc_info.strip() != "NoneType: None":
            details["traceback"] = exc_info
        await self._log(LogLevel.ERROR, message, details, **kwargs)
    
    async def critical(self, message: str, details: Optional[Dict[str, Any]] = None, **kwargs):
        """Log critical level message."""
        if details is None:
            details = {}
        # Include traceback only if there's an active exception
        exc_info = traceback.format_exc()
        if exc_info and exc_info.strip() != "NoneType: None":
            details["traceback"] = exc_info
        await self._log(LogLevel.CRITICAL, message, details, **kwargs)


def create_api_logger(endpoint: str) -> APILogger:
    """Factory function to create an API logger."""
    return APILogger(endpoint)
