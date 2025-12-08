# AI Platform FAQ - CoatVision

Quick answers to common questions about AI capabilities in CoatVision.

## "Where is my AI platform from Sparks?"

**Short Answer:** No "Sparks" platform exists in this repository.

**What We Found:**
- No code, configuration, or documentation mentioning "Sparks"
- No git history of removed "Sparks" components
- No external service integrations named "Sparks"

**Possible Explanations:**
1. **Wrong Repository** - The Sparks platform might be in a different repo
2. **Not Yet Added** - Integration planned but not yet implemented
3. **Different Name** - Feature exists under a different name (LYXbot?)
4. **External Service** - Separate service not tracked in this codebase

**See:** [AI_PLATFORM_STATUS.md](./AI_PLATFORM_STATUS.md) for detailed investigation.

---

## What AI capabilities does CoatVision have?

**Currently Working:**
- ✅ OpenCV image processing (edge detection, basic analysis)
- ✅ FastAPI endpoints for analysis (`/api/analyze`)
- ✅ LYXbot agent endpoints (`/api/lyxbot/status`, `/api/lyxbot/command`)

**Ready to Implement:**
- ⚠️ OpenAI integration (dependency installed, needs API key)
- ⚠️ GPT-4o Vision for image analysis
- ⚠️ LYXbot conversational AI

**See:** [README.md - AI Features](./README.md#ai-features)

---

## How do I enable AI features?

**Quick Start:**
1. Get OpenAI API key from https://platform.openai.com
2. Create `.env` file in repository root:
   ```bash
   OPENAI_API_KEY=sk-your-key-here
   ```
3. Follow the implementation guide

**See:** [OPENAI_INTEGRATION_GUIDE.md](./OPENAI_INTEGRATION_GUIDE.md)

---

## Is the AI platform integrated?

**No**, not yet. The infrastructure is ready but requires:
- OpenAI API key configuration
- Implementation of OpenAI service module
- Updates to analyzer and LYXbot routers

**Status:**
- Backend has `openai==1.51.0` in requirements.txt ✅
- No OpenAI API calls in current code ❌
- LYXbot endpoints exist but return "not yet implemented" ❌

---

## What is LYXbot?

**LYXbot** is the planned AI assistant for CoatVision.

**Current State:**
- Router exists at `backend/routers/lyxbot.py`
- Endpoints: `/api/lyxbot/status` and `/api/lyxbot/command`
- Returns placeholder responses (not connected to AI)

**Planned Features:**
- Conversational AI for coating analysis
- Answer questions about results
- Provide recommendations
- Guide users through analysis process

**To Implement:**
See [OPENAI_INTEGRATION_GUIDE.md - Update LYXbot Router](./OPENAI_INTEGRATION_GUIDE.md#step-4-update-lyxbot-router)

---

## Can I use a different AI provider?

**Yes!** The codebase can be adapted for:
- **Anthropic Claude** - Similar API to OpenAI
- **Google Gemini** - multimodal AI with vision
- **Azure OpenAI** - Enterprise OpenAI hosting
- **Local Models** - Ollama, LM Studio, etc.

**How to Add:**
1. Add provider's Python SDK to `backend/requirements.txt`
2. Create service module similar to `openai_service.py`
3. Update analyzer and LYXbot to use new service
4. Add provider-specific environment variables

---

## Why was OpenAI added to requirements?

According to `.github/copilot-instructions.md`:
> "The project uses OpenCV for image processing, OpenAI for AI capabilities, and generates PDF reports with ReportLab."

**Intended Use:**
- Image analysis with GPT-4o Vision
- Coating quality assessment
- Defect detection
- Natural language recommendations
- LYXbot conversational assistant

**Current Status:** Dependency installed but not yet implemented.

---

## What happened to Sparks?

**We don't know.** Possible scenarios:

1. **Never Existed Here**
   - May be in different repository
   - May be external service
   - May be planned for future

2. **Confusion with Another Project**
   - Check other repositories
   - Review project documentation
   - Ask team members

3. **Renamed or Replaced**
   - LYXbot might be the new name
   - Architecture might have changed
   - Check git history of other branches

**Action Items:**
- Search other repositories in organization
- Check project planning documents
- Review team communications
- Contact original developer

---

## How much does OpenAI cost?

**Estimated Costs:**
- **GPT-4o:** $2.50 per 1M input tokens + $10.00 per 1M output tokens
- **GPT-4o with Vision:** ~$0.01-0.03 per image (varies by resolution)
- **GPT-4o-mini:** $0.15 per 1M input tokens + $0.60 per 1M output tokens
- **GPT-4o-mini recommended** for cost optimization on simple tasks

**Cost Optimization:**
- Cache analysis results for duplicate images
- Use GPT-4o-mini for simple queries
- Implement request rate limiting
- Monitor usage via OpenAI dashboard

**See:** [OPENAI_INTEGRATION_GUIDE.md - Cost Considerations](./OPENAI_INTEGRATION_GUIDE.md#cost-considerations)

---

## Is my API key secure?

**Security Checklist:**
- ✅ Store in `.env` file (not committed to git)
- ✅ `.env` is in `.gitignore`
- ✅ Never hardcode in source files
- ✅ Don't share in error messages
- ✅ Rotate keys regularly
- ✅ Monitor usage for anomalies

**See:** [OPENAI_INTEGRATION_GUIDE.md - Security Best Practices](./OPENAI_INTEGRATION_GUIDE.md#security-best-practices)

---

## How do I test AI features locally?

**Before Adding API Key:**
```bash
# Backend still works without AI
cd backend
source .venv/bin/activate
uvicorn main:app --reload

# OpenCV analysis works
# LYXbot returns "not yet implemented"
```

**After Adding API Key:**
```bash
# Set environment variable
export OPENAI_API_KEY=sk-your-key

# Start backend
uvicorn main:app --reload

# Test LYXbot
curl -X POST http://localhost:8000/api/lyxbot/command \
  -H "Content-Type: application/json" \
  -d '{"command": "What is coating analysis?"}'
```

**See:** [OPENAI_INTEGRATION_GUIDE.md - Testing](./OPENAI_INTEGRATION_GUIDE.md#step-5-testing)

---

## Where can I get help?

**Documentation:**
1. [AI_PLATFORM_STATUS.md](./AI_PLATFORM_STATUS.md) - Investigation and current state
2. [OPENAI_INTEGRATION_GUIDE.md](./OPENAI_INTEGRATION_GUIDE.md) - Implementation guide
3. [README.md](./README.md) - General setup and usage
4. [CONTRIBUTING.md](./CONTRIBUTING.md) - Contribution guidelines

**External Resources:**
- [OpenAI Documentation](https://platform.openai.com/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [CoatVision GitHub Issues](https://github.com/Coatvision/CoatVision_MVP/issues)

**Contact:**
- Open an issue on GitHub
- Check team communication channels
- Review project planning documents

---

## Quick Command Reference

```bash
# Check LYXbot status
curl http://localhost:8000/api/lyxbot/status

# Test LYXbot command
curl -X POST http://localhost:8000/api/lyxbot/command \
  -H "Content-Type: application/json" \
  -d '{"command": "Your question here"}'

# Analyze image
curl -X POST http://localhost:8000/api/analyze \
  -F "file=@image.jpg"

# Health check
curl http://localhost:8000/health

# API documentation (once backend is running)
# Visit: http://localhost:8000/docs
```

---

**Last Updated:** 2025-12-08  
**Status:** Documentation Complete, AI Integration Pending
