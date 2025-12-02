"""
Tests for CoatVision API endpoints.
"""
import sys
import os
import pytest
import tempfile
import numpy as np
import base64

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from fastapi.testclient import TestClient


@pytest.fixture(scope="module")
def client():
    """Create a test client for the FastAPI app."""
    from backend.main import app
    return TestClient(app)


class TestRootEndpoints:
    """Test root and health endpoints."""
    
    def test_root_endpoint(self, client):
        """Test the root endpoint returns API info."""
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert data["name"] == "CoatVision API"
        assert "version" in data
        assert "endpoints" in data
    
    def test_health_check(self, client):
        """Test health check endpoint."""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"


class TestAnalyzeEndpoint:
    """Test /api/analyze endpoints."""
    
    def test_analyze_status(self, client):
        """Test that analyze endpoint exists."""
        # POST without file should return 422 (validation error)
        response = client.post("/api/analyze/")
        assert response.status_code == 422
    
    def test_analyze_with_valid_image(self, client):
        """Test analyze with a valid test image."""
        # Create a simple test image
        import cv2
        
        with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as f:
            # Create a simple colored image
            img = np.zeros((100, 100, 3), dtype=np.uint8)
            img[:, :] = [128, 128, 200]  # Blue-ish color
            cv2.imwrite(f.name, img)
            
            # Read file and send
            with open(f.name, "rb") as img_file:
                response = client.post(
                    "/api/analyze/",
                    files={"file": ("test.jpg", img_file, "image/jpeg")}
                )
            
            # Clean up
            os.unlink(f.name)
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert "metrics" in data
        assert "cvi" in data["metrics"]
        assert "cqi" in data["metrics"]
        assert "coverage" in data["metrics"]
    
    def test_analyze_base64(self, client):
        """Test analyze with base64-encoded image."""
        import cv2
        
        # Create a test image
        img = np.zeros((100, 100, 3), dtype=np.uint8)
        img[:, :] = [100, 150, 200]
        
        # Encode to base64
        _, buffer = cv2.imencode('.jpg', img)
        base64_str = base64.b64encode(buffer).decode('utf-8')
        
        response = client.post(
            "/api/analyze/base64",
            json={"image": base64_str}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert "metrics" in data
    
    def test_analyze_base64_missing_image(self, client):
        """Test analyze with missing image field."""
        response = client.post(
            "/api/analyze/base64",
            json={}
        )
        
        assert response.status_code == 400
        assert "image" in response.json()["detail"].lower()


class TestWashEndpoint:
    """Test /api/wash endpoints."""
    
    def test_wash_status(self, client):
        """Test wash status endpoint."""
        response = client.get("/api/wash/status")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert data["module"] == "wash_analysis"
    
    def test_wash_analyze_default(self, client):
        """Test wash analyze with default values."""
        response = client.post(
            "/api/wash/analyze",
            json={"wash_count": 0, "condition": "good"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "analyzed"
        assert data["durability_score"] == 100
        assert data["recommendation"] == "continue"
    
    def test_wash_analyze_high_count(self, client):
        """Test wash analyze with high wash count."""
        response = client.post(
            "/api/wash/analyze",
            json={"wash_count": 30, "condition": "worn"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "analyzed"
        assert data["durability_score"] == 40
        assert data["recommendation"] == "recoat_recommended"
    
    def test_wash_analyze_boundary(self, client):
        """Test wash analyze at boundary (durability = 50)."""
        response = client.post(
            "/api/wash/analyze",
            json={"wash_count": 25, "condition": "fair"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["durability_score"] == 50
        assert data["recommendation"] == "recoat_recommended"


class TestLyxbotEndpoint:
    """Test /api/lyxbot endpoints."""
    
    def test_lyxbot_status(self, client):
        """Test LYXbot status endpoint."""
        response = client.get("/api/lyxbot/status")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert data["agent"] == "LYXbot"
        assert data["active"] is True
        assert "supported_commands" in data
    
    def test_lyxbot_help_command(self, client):
        """Test LYXbot help command."""
        response = client.post(
            "/api/lyxbot/command",
            json={"command": "help"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert "commands" in data
    
    def test_lyxbot_status_command(self, client):
        """Test LYXbot status command."""
        response = client.post(
            "/api/lyxbot/command",
            json={"command": "status"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert "system_status" in data
    
    def test_lyxbot_unknown_command(self, client):
        """Test LYXbot with unknown command."""
        response = client.post(
            "/api/lyxbot/command",
            json={"command": "unknown_command_xyz"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "unknown_command"
        assert "available_commands" in data
    
    def test_lyxbot_empty_command(self, client):
        """Test LYXbot with empty command."""
        response = client.post(
            "/api/lyxbot/command",
            json={"command": ""}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "error"


class TestJobsEndpoint:
    """Test /api/jobs endpoints."""
    
    def test_list_jobs(self, client):
        """Test listing jobs."""
        response = client.get("/api/jobs/")
        assert response.status_code == 200
        data = response.json()
        assert "jobs" in data
    
    def test_create_job(self, client):
        """Test creating a job."""
        response = client.post(
            "/api/jobs/",
            json={"name": "Test Job", "status": "pending"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "created"
        assert "job" in data
        assert data["job"]["name"] == "Test Job"


class TestCalibrationEndpoint:
    """Test /api/calibration endpoints."""
    
    def test_calibration_status(self, client):
        """Test calibration status endpoint."""
        response = client.get("/api/calibration/status")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert "calibrated" in data
    
    def test_run_calibration(self, client):
        """Test run calibration endpoint."""
        response = client.post("/api/calibration/run")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "started"
    
    def test_get_calibration_parameters(self, client):
        """Test getting calibration parameters."""
        response = client.get("/api/calibration/parameters")
        assert response.status_code == 200
        data = response.json()
        assert "brightness_offset" in data
        assert "contrast_factor" in data


class TestReportsEndpoint:
    """Test /api/report endpoints."""
    
    def test_report_status(self, client):
        """Test report status endpoint."""
        response = client.get("/api/report/status")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert "available_formats" in data


class TestLogsEndpoint:
    """Test /api/logs endpoints."""
    
    def test_logs_status(self, client):
        """Test logs status endpoint."""
        response = client.get("/api/logs/status")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert "levels" in data
    
    def test_get_logs(self, client):
        """Test getting logs (returns demo logs when Supabase not configured)."""
        response = client.get("/api/logs/")
        assert response.status_code == 200
        data = response.json()
        assert "logs" in data
        assert "total" in data
        assert "page" in data
    
    def test_get_logs_summary(self, client):
        """Test getting logs summary."""
        response = client.get("/api/logs/summary")
        assert response.status_code == 200
        data = response.json()
        assert "total_logs_24h" in data
        assert "errors_24h" in data
        assert "by_endpoint" in data
