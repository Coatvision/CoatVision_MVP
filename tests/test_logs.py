"""Tests for log file analysis endpoints."""
import pytest
from fastapi.testclient import TestClient
from io import BytesIO
import sys
import os

# Add backend directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from main import app

client = TestClient(app)


# Sample log content for testing
SAMPLE_LOG = """2024-12-07 10:15:23 INFO Application started
2024-12-07 10:15:24 ERROR Database connection failed
2024-12-07 10:15:25 WARN Retry attempt 1
2024-12-07 10:15:26 ERROR Database connection failed
2024-12-07 10:15:27 WARN Retry attempt 2
2024-12-07 10:15:28 INFO Connection established
2024-12-07 10:16:00 ERROR Invalid user input
2024-12-07 10:17:00 ERROR Database connection failed
2024-12-07 10:18:00 WARN Cache miss
"""


def test_health_check():
    """Test that the API health check endpoint works."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}


def test_upload_log_file():
    """Test uploading and analyzing a log file."""
    # Create a file-like object
    file_content = SAMPLE_LOG.encode('utf-8')
    files = {
        'file': ('test.log', BytesIO(file_content), 'text/plain')
    }
    
    response = client.post("/api/logs/upload", files=files)
    assert response.status_code == 200
    
    data = response.json()
    assert data["status"] == "success"
    assert "analysis" in data
    
    analysis = data["analysis"]
    assert analysis["filename"] == "test.log"
    assert analysis["total_lines"] > 0
    assert analysis["error_count"] == 4  # 4 ERROR lines in sample (3 "Database connection failed" + 1 "Invalid user input")
    assert analysis["warning_count"] == 3  # 3 WARN lines in sample
    assert "error_frequencies" in analysis
    assert "top_errors" in analysis


def test_list_log_analyses():
    """Test listing all log analyses."""
    response = client.get("/api/logs/")
    assert response.status_code == 200
    
    data = response.json()
    assert "count" in data
    assert "analyses" in data
    assert isinstance(data["analyses"], list)


def test_get_summary_stats():
    """Test getting summary statistics."""
    response = client.get("/api/logs/stats/summary")
    assert response.status_code == 200
    
    data = response.json()
    assert "total_analyses" in data
    assert "total_errors" in data
    assert "total_warnings" in data
    assert "avg_errors_per_file" in data


def test_upload_invalid_file():
    """Test uploading an invalid file."""
    # Try uploading without a file
    response = client.post("/api/logs/upload")
    assert response.status_code == 422  # Unprocessable Entity


def test_get_nonexistent_log():
    """Test getting a log analysis that doesn't exist."""
    response = client.get("/api/logs/nonexistent_id")
    assert response.status_code == 404


def test_delete_log_analysis():
    """Test deleting a log analysis."""
    # First upload a log
    file_content = SAMPLE_LOG.encode('utf-8')
    files = {
        'file': ('test_delete.log', BytesIO(file_content), 'text/plain')
    }
    
    upload_response = client.post("/api/logs/upload", files=files)
    assert upload_response.status_code == 200
    
    log_id = upload_response.json()["analysis"]["id"]
    
    # Then delete it
    delete_response = client.delete(f"/api/logs/{log_id}")
    assert delete_response.status_code == 200
    
    # Verify it's gone
    get_response = client.get(f"/api/logs/{log_id}")
    assert get_response.status_code == 404


def test_error_frequency_calculation():
    """Test that error frequencies are calculated correctly."""
    log_with_repeated_errors = """2024-12-07 10:15:23 ERROR Database connection failed
2024-12-07 10:15:24 ERROR Database connection failed
2024-12-07 10:15:25 ERROR Invalid user input
2024-12-07 10:15:26 ERROR Database connection failed
"""
    
    file_content = log_with_repeated_errors.encode('utf-8')
    files = {
        'file': ('repeated_errors.log', BytesIO(file_content), 'text/plain')
    }
    
    response = client.post("/api/logs/upload", files=files)
    assert response.status_code == 200
    
    analysis = response.json()["analysis"]
    
    # Check that "Database connection failed" appears in top errors
    top_errors = analysis["top_errors"]
    assert len(top_errors) > 0
    
    # The most common error should be "Database connection failed" (3 times)
    most_common = top_errors[0]
    assert most_common["count"] == 3


def test_log_with_timestamps():
    """Test that timestamps are properly parsed."""
    log_with_timestamps = """2024-12-07 10:00:00 ERROR Error at 10 AM
2024-12-07 11:00:00 ERROR Error at 11 AM
2024-12-07 12:00:00 ERROR Error at 12 PM
"""
    
    file_content = log_with_timestamps.encode('utf-8')
    files = {
        'file': ('timestamps.log', BytesIO(file_content), 'text/plain')
    }
    
    response = client.post("/api/logs/upload", files=files)
    assert response.status_code == 200
    
    analysis = response.json()["analysis"]
    
    # Check that error trends are created
    assert "error_trends" in analysis
    assert len(analysis["error_trends"]) > 0


def test_empty_log_file():
    """Test uploading an empty log file."""
    file_content = b""
    files = {
        'file': ('empty.log', BytesIO(file_content), 'text/plain')
    }
    
    response = client.post("/api/logs/upload", files=files)
    assert response.status_code == 200
    
    analysis = response.json()["analysis"]
    assert analysis["error_count"] == 0
    assert analysis["warning_count"] == 0


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
