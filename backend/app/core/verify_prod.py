import os
import sys
import time
import requests

"""
Quick production verification script.
Usage:
    python backend/scripts/verify_prod.py https://your-backend.onrender.com <optional_admin_token>

Checks:
- GET /health
- GET /docs
- POST /v1/coatvision/analyze-image (with a small base64 payload)
- Optionally exercises admin-protected endpoint headers if token provided
"""

BASE64_FAKE_IMAGE = "ZmFrZV9iYXNlNjQ="
TEST_IMAGE_URL = "https://picsum.photos/256"


def main():
    """
    Runs a series of verification checks against a deployed backend instance.
    Usage:
        python backend/scripts/verify_prod.py <base_url> [admin_token]
    Performs:
        - GET /health
        - GET /docs
        - GET /openapi.json
        - POST /v1/coatvision/analyze-image (with a test image URL)
        - POST /v1/coatvision/analyze-live (with a fake base64 payload)
        - Optionally, POST /jobs with admin token if provided
    """
    if len(sys.argv) < 2:
        print("Usage: python backend/scripts/verify_prod.py <base_url> [admin_token]")
        sys.exit(1)
    base = sys.argv[1].rstrip('/')
    admin_token = sys.argv[2] if len(sys.argv) > 2 else None

    def url(path):
        return f"{base}{path}"

    print(f"Verifying backend at: {base}")

    # Health
    r = requests.get(url('/health'), timeout=15)
    print('GET /health ->', r.status_code, r.text[:200])

    # Docs
    r = requests.get(url('/docs'), timeout=15)
    print('GET /docs ->', r.status_code)

    # OpenAPI
    r = requests.get(url('/openapi.json'), timeout=15)
    print('GET /openapi.json ->', r.status_code)

    # Analyze image (v1) using a simple public test image URL
    payload = {"image": {"imageUrl": TEST_IMAGE_URL}}
    r = requests.post(url('/v1/coatvision/analyze-image'), json=payload, timeout=30)
    print('POST /v1/coatvision/analyze-image ->', r.status_code, str(r.text)[:200])

    # Analyze live (v1) with a tiny fake base64 payload (expected to 400 if not a real JPEG)
    payload_live = {"frame": {"frameBase64": BASE64_FAKE_IMAGE}}
    r_live = requests.post(url('/v1/coatvision/analyze-live'), json=payload_live, timeout=30)
    print('POST /v1/coatvision/analyze-live ->', r_live.status_code, str(r_live.text)[:200])

    # Admin-protected example (if token is provided, just demonstrate header usage)
    if admin_token:
        headers = {"X-Admin-Token": admin_token}
        # Example route: jobs create (if present)
        job_payload = {"name": "smoke-check", "params": {"source": "verify_prod"}}
        r = requests.post(url('/jobs'), json=job_payload, headers=headers, timeout=30)
        print('POST /jobs (admin) ->', r.status_code, str(r.text)[:200])

    print('Verification complete.')


if __name__ == '__main__':
    main()
