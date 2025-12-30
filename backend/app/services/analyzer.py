
from typing import Any, Dict
import json

try:
    from openai import OpenAI
except Exception:
    OpenAI = None

try:
    # Prefer package-relative imports
    from .config import OPENAI_API_KEY, OPENAI_MODEL
except Exception:
    try:
        # Fallback to absolute import if needed
        from backend.app.services.config import OPENAI_API_KEY, OPENAI_MODEL
    except Exception:
        OPENAI_API_KEY = None
        OPENAI_MODEL = "gpt-4.1-mini"

_client: Any = None

def _get_client():
    global _client
    # Lazy init and tolerate missing deps/keys so import doesn't fail
    if _client is not None:
        return _client
    if OpenAI is None:
        return None
    api_key = OPENAI_API_KEY
    if not api_key:
        return None
    try:
        _client = OpenAI(api_key=api_key)
        return _client
    except Exception:
        return None


# 2) Hjelpefunksjon: analyser ett live-frame (base64 JPG fra kamera)
async def analyze_live_frame(frame_base64: str) -> Dict[str, Any]:
    """
    Tar inn et base64-kodet JPG-bilde og returnerer en enkel CoatVision-vurdering.

    Denne funksjonen er "hjernen" som kalles fra /api/analyze/live.
    """

    system_prompt = (
        "Du er en ekspert på bilpleie, lakkkorrigering og keramisk coating. "
        "Du får ett bilde av et panel på en bil. "
        "Analyser det og vurder:\n"
        "- generelt inntrykk av lakken\n"
        "- om coating-dekning ser jevn ut eller ujevn\n"
        "- om du ser typiske feil (high spots, hologrammer, tørkestriper, osv.)\n"
        "Svar som ren JSON uten forklarende tekst."
        "Nøkler: overall_condition, coating_coverage, defects, recommendation."
    )

    client = _get_client()
    if client is None:
        # Fallback result when OpenAI is not configured/available
        return {
            "overall_condition": "unknown",
            "coating_coverage": "unknown",
            "defects": [],
            "recommendation": "OpenAI not configured. Set OPENAI_API_KEY to enable AI analysis.",
        }

    response = client.chat.completions.create(
        model=OPENAI_MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": "Analyser dette panelet basert på bildet:"},
                    {
                        "type": "input_image",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{frame_base64}",
                        },
                    },
                ],
            },
        ],
        response_format={"type": "json_object"},
    )

    content = response.choices[0].message.content
    # OpenAI returnerer innholdet som en JSON-streng – parse til Python-dict:
    try:
        result: Dict[str, Any] = json.loads(content)
    except json.JSONDecodeError:
        # fallback: pakk rå-teksten inn i et felt, så krasjer ikke backend
        result = {
            "overall_condition": "ukjent",
            "coating_coverage": "ukjent",
            "defects": [],
            "recommendation": content,
        }

    return result
