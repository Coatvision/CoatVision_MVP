# Deployment Checklist

Use this checklist to ensure a successful deployment to Render.

## Pre-Deployment Checklist

### Code Preparation
- [x] All deployment configuration files created
- [x] Backend build script is executable (`backend/build.sh`)
- [x] Frontend has package.json with all dependencies
- [x] Environment variables documented
- [x] Health check endpoint exists (`/health`)
- [x] CORS configured properly
- [x] All secrets removed from code

### Files Verification
- [x] `render.yaml` exists and is valid
- [x] `backend/requirements.txt` has all dependencies
- [x] `backend/main.py` is the entry point
- [x] `backend/build.sh` is executable
- [x] `frontend/package.json` exists
- [x] `frontend/vite.config.js` exists
- [x] `frontend/index.html` exists
- [x] `.gitignore` excludes build artifacts

### Documentation
- [x] DEPLOYMENT.md created (English)
- [x] DEPLOYMENT_NO.md created (Norwegian)
- [x] QUICK_DEPLOY.md created
- [x] ARCHITECTURE.md created
- [x] README.md updated (already exists)

## Deployment Steps

### Step 1: Push to GitHub
```bash
# Check status
git status

# Add all files
git add .

# Commit changes
git commit -m "Add Render deployment configuration"

# Push to GitHub
git push origin main
```
- [ ] Code pushed to GitHub successfully
- [ ] All files included in commit
- [ ] No secrets committed

### Step 2: Create Render Account
- [ ] Go to https://render.com
- [ ] Sign up / Log in
- [ ] Verify email if needed

### Step 3: Deploy via Blueprint
- [ ] Click "New +" in Render Dashboard
- [ ] Select "Blueprint"
- [ ] Connect GitHub account
- [ ] Authorize Render to access repository
- [ ] Select `Coatvision/CoatVision_MVP` repository
- [ ] Render detects `render.yaml`
- [ ] Review services to be created:
  - [ ] coatvision-backend (Web Service)
  - [ ] coatvision-dashboard (Static Site)
- [ ] Click "Apply"

### Step 4: Configure Environment Variables

#### Backend Service
- [ ] Go to backend service settings
- [ ] Add environment variables:
  - [ ] `SECRET_KEY` (auto-generated or custom)
  - [ ] `OPENAI_API_KEY` (your API key - optional)
  - [ ] `DATABASE_URL` (if using external DB - optional)
- [ ] Save changes

#### Frontend Service
- [ ] Verify `VITE_API_URL` is set (should be automatic)
- [ ] Verify `NODE_ENV` is set to "production"

### Step 5: Wait for Build
- [ ] Backend build started
- [ ] Frontend build started
- [ ] Monitor build logs for errors
- [ ] Wait for "Live" status

## Post-Deployment Verification

### Backend Verification
```bash
# Test health endpoint
curl https://coatvision-backend.onrender.com/health

# Expected response:
# {"status": "healthy"}

# Test root endpoint
curl https://coatvision-backend.onrender.com/

# Expected response with API info
```
- [ ] Health check returns 200 OK
- [ ] Root endpoint returns API info
- [ ] No errors in logs

### Frontend Verification
- [ ] Visit dashboard URL in browser
- [ ] Homepage loads correctly
- [ ] Navigate to different pages:
  - [ ] Dashboard (/)
  - [ ] Jobs (/jobs)
  - [ ] Agents (/agents)
  - [ ] Reports (/reports)
- [ ] No console errors
- [ ] API calls work correctly

### Full System Test
- [ ] Upload an image via dashboard
- [ ] Process coating analysis
- [ ] Generate report
- [ ] Download PDF report
- [ ] Verify data persists

## Mobile App Configuration

### Update Mobile App
- [ ] Open `mobile/.env` or configuration
- [ ] Update `EXPO_PUBLIC_API_URL`:
  ```
  EXPO_PUBLIC_API_URL=https://coatvision-backend.onrender.com
  ```
- [ ] Test mobile app with new backend URL
- [ ] Verify image upload works
- [ ] Verify analysis works

## Optional Enhancements

### Custom Domain
- [ ] Purchase domain (if desired)
- [ ] Go to service settings in Render
- [ ] Add custom domain
- [ ] Update DNS records
- [ ] Verify SSL certificate

### Database Upgrade
- [ ] Create PostgreSQL database in Render
- [ ] Copy connection string
- [ ] Add to backend environment variables
- [ ] Restart backend service
- [ ] Migrate data if needed

### Monitoring
- [ ] Set up uptime monitoring (UptimeRobot, Pingdom)
- [ ] Configure email alerts
- [ ] Set up error tracking (Sentry)
- [ ] Document monitoring setup

### Performance
- [ ] Upgrade to paid tier (if needed)
- [ ] Enable CDN for static assets
- [ ] Optimize images
- [ ] Review and optimize API endpoints

## Troubleshooting

### Build Fails

#### Backend Build Failure
- [ ] Check build logs in Render Dashboard
- [ ] Verify Python version (3.11)
- [ ] Check `requirements.txt` for invalid packages
- [ ] Verify `build.sh` is executable
- [ ] Check for missing system dependencies

#### Frontend Build Failure
- [ ] Check build logs in Render Dashboard
- [ ] Verify Node.js version (18+)
- [ ] Check `package.json` syntax
- [ ] Verify all dependencies are available
- [ ] Check for build errors in code

### Runtime Errors

#### Backend Not Starting
- [ ] Check runtime logs
- [ ] Verify environment variables are set
- [ ] Check for import errors
- [ ] Verify port is using `$PORT` variable
- [ ] Check database connection (if using external DB)

#### Frontend Not Loading
- [ ] Check if static site is deployed
- [ ] Verify SPA rewrite rule is configured
- [ ] Check browser console for errors
- [ ] Verify API URL is correct
- [ ] Check CORS settings

#### 404 Errors
- [ ] Verify SPA rewrite rule: `/* → /index.html`
- [ ] Check if files are in `dist/` directory
- [ ] Verify build output path in `vite.config.js`

#### CORS Errors
- [ ] Check backend CORS configuration in `main.py`
- [ ] Verify allowed origins include frontend URL
- [ ] Check if credentials are required
- [ ] Test API directly (bypass browser CORS)

### Performance Issues

#### Slow Response Times
- [ ] Check service tier (free tier has limited resources)
- [ ] Review backend logs for slow queries
- [ ] Optimize database queries
- [ ] Consider caching
- [ ] Upgrade to paid tier

#### Cold Starts
- [ ] Free tier services sleep after inactivity
- [ ] First request after sleep takes 30-60 seconds
- [ ] Upgrade to paid tier for always-on service
- [ ] Implement health ping service

## Maintenance

### Regular Tasks
- [ ] Monitor service health weekly
- [ ] Review logs for errors
- [ ] Update dependencies monthly
- [ ] Rotate API keys quarterly
- [ ] Backup database (if applicable)

### Updates
```bash
# Make changes locally
git add .
git commit -m "Description of changes"
git push origin main

# Render auto-deploys from GitHub
# Monitor deployment in dashboard
```

## Cost Management

### Free Tier Usage
- [ ] Monitor free hours usage (750/month)
- [ ] Check bandwidth usage (100 GB/month)
- [ ] Review database usage (expires after 90 days)

### Upgrade Considerations
Upgrade to paid tier if you need:
- [ ] Always-on services (no cold starts)
- [ ] More CPU/memory
- [ ] Custom domains
- [ ] Priority support
- [ ] Longer log retention

## Support Resources

### Documentation
- [ ] Read DEPLOYMENT.md for full guide
- [ ] Read QUICK_DEPLOY.md for quick start
- [ ] Check ARCHITECTURE.md for system design

### External Resources
- [ ] Render Docs: https://render.com/docs
- [ ] Render Community: https://community.render.com
- [ ] FastAPI Docs: https://fastapi.tiangolo.com
- [ ] Vite Docs: https://vitejs.dev

### Getting Help
- [ ] Check Render status page: https://status.render.com
- [ ] Search Render community forum
- [ ] Open GitHub issue for code problems
- [ ] Contact Render support (paid tiers)

## Success Criteria

Your deployment is successful when:
- [x] All configuration files are in place
- [ ] Backend returns 200 from `/health`
- [ ] Frontend loads in browser
- [ ] API calls work from frontend
- [ ] Mobile app can connect to backend
- [ ] No critical errors in logs
- [ ] All features work as expected

## Next Steps After Successful Deployment

1. [ ] Document deployment date and URLs
2. [ ] Share URLs with team
3. [ ] Update mobile app configuration
4. [ ] Set up monitoring
5. [ ] Plan for production data
6. [ ] Create backup strategy
7. [ ] Document API endpoints for team
8. [ ] Set up CI/CD improvements

---

**Congratulations! 🎉**

If you've completed this checklist, your CoatVision application is successfully deployed to Render!

**Deployed URLs:**
- Backend: `https://coatvision-backend.onrender.com`
- Frontend: `https://coatvision-dashboard.onrender.com`

**Remember:**
- Free tier services may take 30-60 seconds for first request after inactivity
- Monitor your usage to avoid unexpected charges
- Keep your API keys secure and rotate them regularly
- Always test changes locally before deploying
