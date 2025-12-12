# Deployment Guide - CoatVision to Render

This guide explains how to deploy the CoatVision application to Render.

## Overview

CoatVision consists of three components:
1. **Backend API** - FastAPI (Python) - Deploy as Web Service
2. **Frontend Dashboard** - React/Vite - Deploy as Static Site
3. **Mobile App** - React Native/Expo - Not deployed to Render (use Expo/App Stores)

## Prerequisites

- GitHub account with CoatVision repository
- Render account (free tier available at https://render.com)
- OpenAI API key (optional, for AI features)

## Deployment Methods

### Method 1: Blueprint Deployment (Recommended)

This method deploys all services at once using the `render.yaml` configuration.

1. **Push code to GitHub**
   ```bash
   git add .
   git commit -m "Add Render deployment configuration"
   git push origin main
   ```

2. **Deploy via Render Dashboard**
   - Log in to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Blueprint"
   - Connect your GitHub repository
   - Select the repository: `Coatvision/CoatVision_MVP`
   - Render will automatically detect `render.yaml`
   - Review the services that will be created:
     - `coatvision-backend` (Web Service)
     - `coatvision-dashboard` (Static Site)
   - Click "Apply" to deploy

3. **Configure Environment Variables**
   
   After deployment, add these environment variables to the backend service:
   
   - `SECRET_KEY` - (Auto-generated, or set your own)
   - `OPENAI_API_KEY` - Your OpenAI API key (optional)
   - `DATABASE_URL` - Database connection string (if using external DB)

4. **Verify Deployment**
   - Backend: Visit `https://coatvision-backend.onrender.com/health`
   - Frontend: Visit your dashboard URL (e.g., `https://coatvision-dashboard.onrender.com`)

### Method 2: Manual Service Deployment

If you prefer to deploy services individually:

#### Deploy Backend

1. Go to Render Dashboard
2. Click "New +" → "Web Service"
3. Connect GitHub repository
4. Configure:
   - **Name**: coatvision-backend
   - **Runtime**: Python 3
   - **Root Directory**: backend
   - **Build Command**: `./build.sh`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables (see above)
6. Click "Create Web Service"

#### Deploy Frontend

1. Go to Render Dashboard
2. Click "New +" → "Static Site"
3. Connect GitHub repository
4. Configure:
   - **Name**: coatvision-dashboard
   - **Root Directory**: frontend
   - **Build Command**: `npm ci && npm run build`
   - **Publish Directory**: dist
5. Add environment variable:
   - `VITE_API_URL`: URL of your backend service
6. Add rewrite rule for SPA:
   - Source: `/*`
   - Destination: `/index.html`
7. Click "Create Static Site"

## Configuration Details

### Backend Configuration

**Required Files:**
- `backend/requirements.txt` - Python dependencies
- `backend/main.py` - FastAPI application entry point
- `backend/build.sh` - Build script (created in this deployment)
- `backend/Dockerfile` - Optional, for Docker deployments

**Environment Variables:**
- `PORT` - Auto-set by Render
- `SECRET_KEY` - For JWT token signing
- `OPENAI_API_KEY` - Optional, for AI features
- `DATABASE_URL` - Optional, for external database
- `PYTHON_VERSION` - Set to "3.11"

**Health Check:**
- Path: `/health`
- Returns: `{"status": "healthy"}`

### Frontend Configuration

**Required Files:**
- `frontend/package.json` - Node dependencies and scripts
- `frontend/vite.config.js` - Vite configuration
- `frontend/index.html` - HTML entry point
- `frontend/src/main.jsx` - React entry point

**Environment Variables:**
- `VITE_API_URL` - Backend API URL (auto-set from backend service)
- `NODE_ENV` - Set to "production"

**Build Output:**
- Directory: `dist/`
- SPA rewrite rule needed for client-side routing

## Troubleshooting

### Build Failures

**Backend build fails:**
- Check `build.sh` has execute permissions
- Verify Python version is 3.10+ in Render settings
- Check all dependencies in `requirements.txt` are valid

**Frontend build fails:**
- Ensure `package.json` exists in frontend directory
- Verify Node.js version (18+ recommended)
- Check for missing dependencies

### Runtime Issues

**Backend not starting:**
- Check logs in Render dashboard
- Verify environment variables are set correctly
- Ensure PORT is not hardcoded (use `$PORT` from Render)

**Frontend shows 404 errors:**
- Verify SPA rewrite rule is configured
- Check VITE_API_URL points to correct backend

**CORS errors:**
- Backend CORS is configured for all origins in development
- For production, update `backend/main.py` to restrict origins

### Performance Issues

**Cold starts:**
- Free tier services spin down after inactivity
- First request after idle may take 30-60 seconds
- Upgrade to paid tier for always-on services

## Monitoring

### Health Checks

- Backend: `GET /health` returns `{"status": "healthy"}`
- Automatic health checks configured in render.yaml

### Logs

- Access logs via Render Dashboard
- Each service has separate log stream
- Use for debugging and monitoring

## Updating Deployment

### Via GitHub (Auto-deploy)

1. Make changes locally
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Update feature X"
   git push origin main
   ```
3. Render automatically detects changes and redeploys

### Manual Deploy

- Go to service in Render Dashboard
- Click "Manual Deploy" → "Deploy latest commit"

## Database Options

### SQLite (Default)

- Included in backend, no setup needed
- Data persists in Render disk storage
- Good for development/testing

### PostgreSQL (Recommended for Production)

1. Add PostgreSQL database in Render:
   - Click "New +" → "PostgreSQL"
   - Configure database name
2. Copy internal connection string
3. Add to backend environment variables:
   ```
   DATABASE_URL=postgresql://user:pass@host/dbname
   ```
4. Update backend code to use PostgreSQL

## Mobile App Deployment

The mobile app (React Native/Expo) is **not deployed to Render**. Instead:

1. **Development**: Use Expo Go app
   ```bash
   cd mobile
   npm start
   ```

2. **Production**:
   - Build with EAS Build: `eas build`
   - Submit to App Stores: `eas submit`
   - Or create standalone APK/IPA

3. **Configure API URL**:
   - Update `EXPO_PUBLIC_API_URL` to point to deployed backend
   - Example: `https://coatvision-backend.onrender.com`

## Cost Estimates

### Free Tier

- **Backend**: 750 hours/month free
- **Frontend**: Unlimited bandwidth (100 GB/month)
- **Database**: Expires after 90 days (free tier)

### Paid Plans

- **Starter**: $7/month per service
- **Standard**: $25/month per service
- Includes:
  - Always-on (no cold starts)
  - More CPU/memory
  - Custom domains
  - Priority support

## Security Best Practices

1. **Environment Variables**
   - Never commit secrets to Git
   - Use Render's environment variable management
   - Rotate API keys regularly

2. **CORS Configuration**
   - Update `backend/main.py` to restrict origins in production
   - Only allow your frontend domain

3. **HTTPS**
   - Automatic SSL certificates provided by Render
   - All connections encrypted

4. **API Authentication**
   - Implement JWT or API key authentication
   - Rate limiting for public endpoints

## Support

- **Render Docs**: https://render.com/docs
- **CoatVision Repo**: https://github.com/Coatvision/CoatVision_MVP
- **Issues**: Open issue on GitHub for bugs/questions

## Next Steps

After successful deployment:

1. ✅ Verify all services are running
2. ✅ Test API endpoints
3. ✅ Test frontend functionality
4. ✅ Configure custom domain (optional)
5. ✅ Set up monitoring/alerts
6. ✅ Document API for frontend team
7. ✅ Plan mobile app distribution

## Appendix: Commands Reference

```bash
# Check service status
curl https://coatvision-backend.onrender.com/health

# View backend logs
# (via Render Dashboard)

# Test API endpoint
curl https://coatvision-backend.onrender.com/

# Frontend build locally
cd frontend
npm ci
npm run build
npm run preview

# Backend test locally
cd backend
source .venv/bin/activate  # or .\.venv\Scripts\Activate.ps1
uvicorn main:app --reload --port 8000
```

## Changes Made for Deployment

This deployment added/modified:

1. ✅ `render.yaml` - Blueprint configuration
2. ✅ `backend/build.sh` - Build script for Render
3. ✅ `backend/Dockerfile` - Optional Docker support
4. ✅ `frontend/package.json` - Frontend dependencies
5. ✅ `frontend/vite.config.js` - Vite build configuration
6. ✅ `frontend/index.html` - HTML entry point
7. ✅ `DEPLOYMENT.md` - This deployment guide

All files are minimal and follow best practices for Render deployment.
