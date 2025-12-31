from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)


def test_wash_status():
    r = client.get("/api/wash/status")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


def test_analyze_wash():
    payload = {"wash_count": 10, "condition": "good"}
    r = client.post("/api/wash/analyze", json=payload)
    assert r.status_code == 200
    data = r.json()
    assert data["status"] == "analyzed"
    assert data["wash_count"] == 10
    assert data["durability_score"] == max(0, 100 - (10 * 2))
