# backend/routers/logs.py
from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import List, Dict, Optional, Any
from pydantic import BaseModel
from datetime import datetime, timezone
from collections import Counter
import re
import tempfile
import os

router = APIRouter(prefix="/api/logs", tags=["logs"])


class LogAnalysisResult(BaseModel):
    filename: str
    total_lines: int
    error_count: int
    warning_count: int
    info_count: int
    error_frequencies: Dict[str, int]
    error_trends: List[Dict[str, Any]]
    top_errors: List[Dict[str, Any]]
    analyzed_at: str


# In-memory storage for log analysis results
log_analyses: List[Dict] = []


def parse_log_file(file_content: str) -> LogAnalysisResult:
    """
    Parse a log file and extract error frequencies and trends.
    Supports common log formats (Apache, Nginx, Python, Node.js, etc.)
    """
    lines = file_content.split('\n')
    total_lines = len(lines)
    
    # Patterns for different log levels
    error_pattern = re.compile(r'\b(ERROR|Error|error|FATAL|Fatal|fatal|CRITICAL|Critical|critical)\b', re.IGNORECASE)
    warning_pattern = re.compile(r'\b(WARN|Warn|warn|WARNING|Warning|warning)\b', re.IGNORECASE)
    info_pattern = re.compile(r'\b(INFO|Info|info|DEBUG|Debug|debug)\b', re.IGNORECASE)
    
    # Timestamp patterns (ISO, Apache, etc.)
    timestamp_pattern = re.compile(
        r'(\d{4}-\d{2}-\d{2}[\sT]\d{2}:\d{2}:\d{2})|'  # ISO format
        r'(\d{2}/[A-Za-z]{3}/\d{4}:\d{2}:\d{2}:\d{2})|'  # Apache format
        r'(\d{2}-\d{2}-\d{4}\s+\d{2}:\d{2}:\d{2})'  # Common format
    )
    
    errors = []
    warnings = []
    infos = []
    error_messages = []
    
    for line in lines:
        if not line.strip():
            continue
            
        # Extract timestamp if present
        timestamp_match = timestamp_pattern.search(line)
        timestamp = timestamp_match.group(0) if timestamp_match else None
        
        # Classify by log level
        if error_pattern.search(line):
            errors.append({
                'line': line,
                'timestamp': timestamp
            })
            # Extract error message (after the log level keyword)
            # Try to find ERROR/FATAL/CRITICAL and extract text after it
            error_match = error_pattern.search(line)
            if error_match:
                # Get text after the error keyword
                start_pos = error_match.end()
                error_msg = line[start_pos:].strip()[:100]
            else:
                error_msg = line[:100]
            error_messages.append(error_msg)
        elif warning_pattern.search(line):
            warnings.append({
                'line': line,
                'timestamp': timestamp
            })
        elif info_pattern.search(line):
            infos.append({
                'line': line,
                'timestamp': timestamp
            })
    
    # Count error frequencies
    error_frequencies = dict(Counter(error_messages).most_common(10))
    
    # Create top errors list
    top_errors = [
        {
            'message': msg,
            'count': count,
            'percentage': round((count / len(error_messages) * 100), 2) if error_messages else 0
        }
        for msg, count in list(error_frequencies.items())[:10]
    ]
    
    # Generate error trends (group by hour or similar)
    error_trends = []
    if errors:
        # Group errors by timestamp prefix (hour)
        trend_counter = Counter()
        for error in errors:
            if error['timestamp']:
                # Extract hour from timestamp
                hour_key = error['timestamp'][:13] if len(error['timestamp']) >= 13 else error['timestamp']
                trend_counter[hour_key] += 1
        
        error_trends = [
            {'time': time_key, 'count': count}
            for time_key, count in sorted(trend_counter.items())
        ]
    
    return LogAnalysisResult(
        filename="uploaded_log.txt",
        total_lines=total_lines,
        error_count=len(errors),
        warning_count=len(warnings),
        info_count=len(infos),
        error_frequencies=error_frequencies,
        error_trends=error_trends,
        top_errors=top_errors,
        analyzed_at=datetime.now(timezone.utc).isoformat()
    )


@router.post("/upload")
async def upload_log_file(file: UploadFile = File(...)):
    """
    Upload and analyze a log file.
    Returns error frequencies and trends.
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")
    
    # Read file content
    try:
        content = await file.read()
        content_str = content.decode('utf-8', errors='ignore')
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error reading file: {str(e)}")
    
    # Parse and analyze log file
    try:
        analysis = parse_log_file(content_str)
        analysis.filename = file.filename
        
        # Store analysis result
        analysis_dict = analysis.model_dump()
        analysis_dict['id'] = f"log_{len(log_analyses) + 1}"
        log_analyses.append(analysis_dict)
        
        return {
            "status": "success",
            "analysis": analysis_dict
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing log file: {str(e)}")


@router.get("/")
async def list_log_analyses():
    """List all log analysis results."""
    return {
        "count": len(log_analyses),
        "analyses": log_analyses
    }


@router.get("/{log_id}")
async def get_log_analysis(log_id: str):
    """Get a specific log analysis by ID."""
    for analysis in log_analyses:
        if analysis.get("id") == log_id:
            return analysis
    raise HTTPException(status_code=404, detail="Log analysis not found")


@router.delete("/{log_id}")
async def delete_log_analysis(log_id: str):
    """Delete a specific log analysis by ID."""
    global log_analyses
    for i, analysis in enumerate(log_analyses):
        if analysis.get("id") == log_id:
            deleted = log_analyses.pop(i)
            return {
                "status": "deleted",
                "analysis": deleted
            }
    raise HTTPException(status_code=404, detail="Log analysis not found")


@router.get("/stats/summary")
async def get_summary_stats():
    """Get summary statistics across all log analyses."""
    if not log_analyses:
        return {
            "total_analyses": 0,
            "total_errors": 0,
            "total_warnings": 0,
            "avg_errors_per_file": 0
        }
    
    total_errors = sum(a.get('error_count', 0) for a in log_analyses)
    total_warnings = sum(a.get('warning_count', 0) for a in log_analyses)
    
    return {
        "total_analyses": len(log_analyses),
        "total_errors": total_errors,
        "total_warnings": total_warnings,
        "avg_errors_per_file": round(total_errors / len(log_analyses), 2) if log_analyses else 0
    }
