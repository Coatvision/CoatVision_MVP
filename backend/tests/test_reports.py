from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)


def test_report_status():
    r = client.get("/api/report/status")
    assert r.status_code == 200
    data = r.json()
    assert data["status"] == "ok"
    assert "/api/report/demo" in data["demo_endpoint"]

