from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)


def test_calibration_status():
    r = client.get("/api/calibration/status")
    assert r.status_code == 200
    data = r.json()
    assert data["status"] == "ok"
    assert "calibrated" in data
    assert "last_calibration" in data


def test_run_calibration_demo_guard_no_token():
    # When ADMIN_TOKEN is not set, guard is a no-op
    r = client.post("/api/calibration/run")
    assert r.status_code == 200
    assert r.json()["status"] == "started"

