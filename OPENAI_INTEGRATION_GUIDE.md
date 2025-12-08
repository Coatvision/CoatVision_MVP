# OpenAI Integration Guide for CoatVision

This guide explains how to integrate OpenAI into the CoatVision backend for AI-powered coating analysis.

## Prerequisites

✅ OpenAI package already in requirements.txt (openai==1.51.0)

## Step 1: Environment Configuration

Create or update `.env` file in the repository root:

```bash
# .env
OPENAI_API_KEY=sk-your-api-key-here
OPENAI_MODEL=gpt-4o  # or gpt-4o-mini for cost optimization
```

Add to `.gitignore` if not already present:
```
.env
.env.local
*.env
```

## Step 2: Create OpenAI Service

Create `backend/app/services/openai_service.py`:

```python
import os
from pathlib import Path
from typing import Dict, Any, Optional
import base64

from openai import OpenAI, OpenAIError, RateLimitError, APIConnectionError


class OpenAIService:
    """Service for OpenAI API interactions."""
    
    def __init__(self):
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OPENAI_API_KEY environment variable not set")
        self.client = OpenAI(api_key=api_key)
        self.model = os.getenv("OPENAI_MODEL", "gpt-4o")
    
    def encode_image(self, image_path: Path) -> str:
        """Encode image to base64 for API."""
        if not image_path.exists():
            raise FileNotFoundError(f"Image not found: {image_path}")
        if not os.access(image_path, os.R_OK):
            raise PermissionError(f"Image not readable: {image_path}")
        
        # Check file size (max 20MB for OpenAI API)
        file_size = image_path.stat().st_size
        max_size = 20 * 1024 * 1024  # 20MB
        if file_size > max_size:
            raise ValueError(f"Image too large: {file_size / 1024 / 1024:.1f}MB (max 20MB)")
        
        with open(image_path, "rb") as image_file:
            return base64.b64encode(image_file.read()).decode("utf-8")
    
    def analyze_coating(
        self, 
        image_path: Path, 
        prompt: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Analyze coating in an image using GPT-4 Vision.
        
        Args:
            image_path: Path to the image file
            prompt: Custom prompt (uses default if None)
        
        Returns:
            Dictionary with analysis results
        """
        if prompt is None:
            prompt = """Analyze this image for coating quality and coverage.
            Please provide:
            1. Estimated coating coverage percentage
            2. Quality assessment (excellent/good/fair/poor)
            3. Any visible defects or issues
            4. Recommendations for improvement
            
            Format your response as JSON with these keys:
            - coverage_percentage
            - quality_rating
            - defects
            - recommendations
            """
        
        base64_image = self.encode_image(image_path)
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": prompt},
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/jpeg;base64,{base64_image}"
                                }
                            }
                        ]
                    }
                ],
                max_tokens=1000
            )
            
            content = response.choices[0].message.content
            
            return {
                "success": True,
                "analysis": content,
                "model": self.model,
                "usage": {
                    "prompt_tokens": response.usage.prompt_tokens,
                    "completion_tokens": response.usage.completion_tokens,
                    "total_tokens": response.usage.total_tokens
                }
            }
        except RateLimitError as e:
            return {
                "success": False,
                "error": "Rate limit exceeded. Please try again later.",
                "error_type": "rate_limit"
            }
        except APIConnectionError as e:
            return {
                "success": False,
                "error": "Failed to connect to OpenAI API. Check your internet connection.",
                "error_type": "connection"
            }
        except OpenAIError as e:
            return {
                "success": False,
                "error": f"OpenAI API error: {str(e)}",
                "error_type": "api_error"
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    def chat_completion(
        self, 
        messages: list, 
        model: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Generic chat completion for LYXbot or other conversational features.
        
        Args:
            messages: List of message dicts with 'role' and 'content'
            model: Override default model
        
        Returns:
            Dictionary with response
        """
        try:
            response = self.client.chat.completions.create(
                model=model or "gpt-4o",
                messages=messages,
                max_tokens=500
            )
            
            return {
                "success": True,
                "response": response.choices[0].message.content,
                "usage": {
                    "prompt_tokens": response.usage.prompt_tokens,
                    "completion_tokens": response.usage.completion_tokens,
                    "total_tokens": response.usage.total_tokens
                }
            }
        except RateLimitError as e:
            return {
                "success": False,
                "error": "Rate limit exceeded. Please try again later.",
                "error_type": "rate_limit"
            }
        except APIConnectionError as e:
            return {
                "success": False,
                "error": "Failed to connect to OpenAI API. Check your internet connection.",
                "error_type": "connection"
            }
        except OpenAIError as e:
            return {
                "success": False,
                "error": f"OpenAI API error: {str(e)}",
                "error_type": "api_error"
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }


# Singleton instance with thread safety
import threading
_openai_service = None
_lock = threading.Lock()

def get_openai_service() -> OpenAIService:
    """Get or create OpenAI service singleton (thread-safe)."""
    global _openai_service
    if _openai_service is None:
        with _lock:
            # Double-check pattern
            if _openai_service is None:
                _openai_service = OpenAIService()
    return _openai_service
```

## Step 3: Update Analyzer Service

Modify `backend/app/services/analyzer.py` to use OpenAI:

```python
from pathlib import Path
from typing import Dict, Any, Tuple
import os

import cv2
import numpy as np

from .openai_service import get_openai_service


def analyze_image(input_path: Path, output_dir: Path) -> Tuple[Path, Dict[str, Any]]:
    """
    Analyze coating using OpenCV + OpenAI.
    """
    img = cv2.imread(str(input_path))
    if img is None:
        raise ValueError(f"Could not read image: {input_path}")

    # OpenCV analysis (fast, local)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    edges = cv2.Canny(gray, 100, 200)
    
    # Create visualization
    overlay = np.zeros_like(img)
    overlay[..., 1] = edges  # green channel
    blended = cv2.addWeighted(img, 0.8, overlay, 0.7, 0)
    
    output_path = output_dir / f"{input_path.stem}_cv_output.png"
    cv2.imwrite(str(output_path), blended)
    
    # OpenCV metrics
    opencv_coverage = float(np.count_nonzero(edges) / edges.size)
    
    metrics: Dict[str, Any] = {
        "opencv_edge_coverage": opencv_coverage,
    }
    
    # Optional: Add OpenAI analysis if API key is configured
    if os.getenv("OPENAI_API_KEY"):
        try:
            openai_service = get_openai_service()
            ai_result = openai_service.analyze_coating(input_path)
            
            if ai_result.get("success"):
                metrics["ai_analysis"] = ai_result["analysis"]
                metrics["ai_model"] = ai_result["model"]
                metrics["ai_tokens_used"] = ai_result["usage"]["total_tokens"]
            else:
                metrics["ai_error"] = ai_result.get("error")
        except Exception as e:
            metrics["ai_error"] = str(e)
    else:
        metrics["ai_analysis"] = "OpenAI API key not configured"
    
    return output_path, metrics
```

## Step 4: Update LYXbot Router

Modify `backend/routers/lyxbot.py` to use OpenAI:

```python
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os

from app.services.openai_service import get_openai_service

router = APIRouter(prefix="/api/lyxbot", tags=["lyxbot"])


class CommandRequest(BaseModel):
    command: str
    context: dict = {}


@router.get("/status")
async def lyxbot_status():
    """Get LYXbot agent status."""
    api_key_configured = bool(os.getenv("OPENAI_API_KEY"))
    return {
        "status": "ok",
        "agent": "LYXbot",
        "version": "1.0.0",
        "active": True,
        "ai_enabled": api_key_configured
    }


@router.post("/command")
async def lyxbot_command(request: CommandRequest):
    """Send a command to LYXbot agent."""
    
    if not os.getenv("OPENAI_API_KEY"):
        raise HTTPException(
            status_code=503,
            detail="OpenAI API key not configured. LYXbot requires AI capabilities."
        )
    
    try:
        openai_service = get_openai_service()
        
        # Build context-aware prompt
        system_message = {
            "role": "system",
            "content": """You are LYXbot, an AI assistant for CoatVision coating analysis.
            You help users analyze coating quality, interpret results, and provide recommendations.
            Be concise, technical, and helpful."""
        }
        
        user_message = {
            "role": "user",
            "content": request.command
        }
        
        messages = [system_message, user_message]
        
        result = openai_service.chat_completion(messages)
        
        if result.get("success"):
            return {
                "status": "success",
                "command": request.command,
                "response": result["response"],
                "tokens_used": result["usage"]["total_tokens"]
            }
        else:
            raise HTTPException(
                status_code=500,
                detail=f"AI processing error: {result.get('error')}"
            )
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"LYXbot error: {str(e)}"
        )
```

## Step 5: Testing

### Unit Tests

Create `backend/tests/test_openai_service.py`:

```python
import pytest
from unittest.mock import Mock, patch
from pathlib import Path

from app.services.openai_service import OpenAIService


@pytest.fixture
def mock_openai():
    with patch('openai.OpenAI') as mock:
        yield mock


def test_openai_service_initialization(mock_openai, monkeypatch):
    """Test OpenAI service initializes correctly."""
    monkeypatch.setenv("OPENAI_API_KEY", "test-key")
    service = OpenAIService()
    assert service.client is not None
    assert service.model == "gpt-4o"


def test_openai_service_missing_key(monkeypatch):
    """Test service raises error without API key."""
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)
    with pytest.raises(ValueError, match="OPENAI_API_KEY"):
        OpenAIService()


def test_analyze_coating_success(mock_openai, monkeypatch, tmp_path):
    """Test successful coating analysis."""
    monkeypatch.setenv("OPENAI_API_KEY", "test-key")
    
    # Create mock response
    mock_response = Mock()
    mock_response.choices = [Mock(message=Mock(content="Test analysis"))]
    mock_response.usage = Mock(
        prompt_tokens=100,
        completion_tokens=50,
        total_tokens=150
    )
    
    mock_client = Mock()
    mock_client.chat.completions.create.return_value = mock_response
    mock_openai.return_value = mock_client
    
    # Create test image
    test_image = tmp_path / "test.jpg"
    test_image.write_bytes(b"fake image data")
    
    service = OpenAIService()
    result = service.analyze_coating(test_image)
    
    assert result["success"] is True
    assert "analysis" in result
    assert result["usage"]["total_tokens"] == 150
```

### Integration Test

```bash
# Set your API key
export OPENAI_API_KEY=sk-your-key

# Test from Python REPL
cd backend
python
>>> from app.services.openai_service import get_openai_service
>>> service = get_openai_service()
>>> from pathlib import Path
>>> result = service.analyze_coating(Path("test_image.jpg"))
>>> print(result)
```

## Step 6: Usage Examples

### Analyze Image with AI

```bash
curl -X POST http://localhost:8000/api/analyze \
  -F "file=@coating_sample.jpg"
```

### Chat with LYXbot

```bash
curl -X POST http://localhost:8000/api/lyxbot/command \
  -H "Content-Type: application/json" \
  -d '{
    "command": "What indicates good coating coverage?",
    "context": {}
  }'
```

### Check LYXbot Status

```bash
curl http://localhost:8000/api/lyxbot/status
```

## Cost Considerations

- **GPT-4o:** $2.50 per 1M input tokens + $10.00 per 1M output tokens
- **GPT-4o with Vision:** Additional image costs based on resolution
- **GPT-4o-mini:** $0.15 per 1M input tokens + $0.60 per 1M output tokens (recommended for cost optimization)
- Typical image analysis: ~$0.01-0.03 per image with GPT-4o
- Monitor usage via OpenAI dashboard
- Consider caching results for duplicate images
- Use GPT-4o-mini for simple queries to reduce costs

## Security Best Practices

1. **Never commit API keys** - Always use environment variables
2. **Rate limiting** - Implement request limits to prevent abuse
3. **Input validation** - Validate image formats and sizes
4. **Error handling** - Don't expose API keys in error messages
5. **Monitoring** - Log API usage and costs

## Troubleshooting

### "OPENAI_API_KEY not set"
- Check `.env` file exists
- Verify environment variable is loaded
- Restart backend service after adding key

### "Rate limit exceeded"
- Slow down request rate
- Upgrade OpenAI plan
- Implement request queuing

### "Invalid model"
- Check model name spelling
- Verify model access in OpenAI account
- Update to available model

## Suggested Implementation Steps

**Basic Setup (Required):**
- Set up OpenAI API key
- Create OpenAI service module
- Update analyzer to use AI
- Enhance LYXbot with conversational AI

**Advanced Features (Optional):**
- Add result caching for duplicate images
- Implement usage tracking and monitoring
- Add cost monitoring dashboard

## Resources

- [OpenAI API Documentation](https://platform.openai.com/docs)
- [GPT-4 Vision Guide](https://platform.openai.com/docs/guides/vision)
- [OpenAI Python SDK](https://github.com/openai/openai-python)

---

**Status:** Ready for implementation  
**Last Updated:** 2025-12-08
