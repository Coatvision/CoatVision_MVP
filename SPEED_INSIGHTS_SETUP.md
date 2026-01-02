# Vercel Speed Insights Setup Guide

This document provides instructions for setting up and using Vercel Speed Insights with the CoatVision application.

## Overview

Vercel Speed Insights is now integrated into the CoatVision frontend and backend:

- **Frontend**: React-based dashboard with automatic Web Vitals tracking
- **Backend**: FastAPI with endpoints to collect and process performance metrics

## What Has Been Implemented

### Frontend Changes

1. **Package Addition**: Added `@vercel/speed-insights` to `/frontend/package.json`
   
2. **Component Integration**: Created `/frontend/src/components/SpeedInsights.jsx`
   - Provides a reusable SpeedInsights component
   - Automatically tracks Web Vitals (LCP, FID, CLS, etc.)
   
3. **Root Integration**: Updated `/frontend/src/main.jsx`
   - SpeedInsights component is rendered at the root level
   - Ensures tracking starts from initial page load

### Backend Changes

1. **Speed Insights Router**: Created `/backend/routers/speed_insights.py`
   - POST endpoint `/api/speed-insights/events` for receiving metrics
   - GET endpoint `/api/speed-insights/health` for health checks
   - Includes logging for metric collection

2. **Main App Integration**: Updated `/backend/main.py`
   - Imported speed_insights router
   - Registered the router with the FastAPI app

## Getting Started

### Prerequisites

- Vercel account (https://vercel.com/signup)
- Vercel CLI installed (`npm install -g vercel`)
- CoatVision project deployed to Vercel

### Setup Steps

#### 1. Install Dependencies

For the frontend:
```bash
cd frontend
npm install
# This will install @vercel/speed-insights
```

#### 2. Enable Speed Insights in Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Select your CoatVision project
3. Click on the **Speed Insights** tab
4. Click **Enable**

> **Note**: Enabling Speed Insights will add new routes (`/_vercel/speed-insights/*`) after your next deployment.

#### 3. Deploy to Vercel

```bash
# From project root
vercel deploy
```

Or connect your Git repository to Vercel for automatic deployments.

#### 4. Verify Installation

After deployment, you should be able to:
1. Access the application in your browser
2. See the Speed Insights script in the page source (`/_vercel/speed-insights/script.js`)
3. View metrics in the Vercel dashboard after users visit the site

## Architecture

### Frontend Flow

```
User visits site
    ↓
SpeedInsights component loads
    ↓
Automatic Web Vitals collection
    ↓
Sends data to Vercel (if enabled)
    ↓
Visible in Speed Insights dashboard
```

### Backend Integration

The backend provides:
- `/api/speed-insights/events` - Custom metrics endpoint for additional tracking
- `/api/speed-insights/health` - Service health check
- Middleware support for request/response timing

## Metrics Tracked

### Web Vitals (Automatically)

- **LCP** (Largest Contentful Paint): Visual page load completeness
- **FID** (First Input Delay): Responsiveness to user input (deprecated)
- **CLS** (Cumulative Layout Shift): Visual stability
- **TTFB** (Time to First Byte): Server response time
- **FCP** (First Contentful Paint): First visual change

### Additional Metrics

The application can be configured to track:
- Custom events
- Navigation timings
- Resource timing
- Framework-specific metrics

## Configuration

### Frontend Configuration

To customize Speed Insights behavior, you can add a `beforeSend` callback in your HTML:

```jsx
// In your root component or layout
window.speedInsightsBeforeSend = (data) => {
  // Sanitize sensitive information
  if (data.url && data.url.includes('secret')) {
    data.url = data.url.replace(/secret=.*/g, 'secret=***');
  }
  return data;
};
```

### Backend Configuration

The Speed Insights router logs all received metrics. In production, you might want to:

1. **Store metrics**: Save to database for long-term analysis
2. **Filter data**: Remove sensitive information before processing
3. **Aggregate data**: Combine metrics by URL, browser, etc.
4. **Alert on issues**: Set thresholds for degraded performance

Example of extending the backend:

```python
# In backend/routers/speed_insights.py
@router.post("/events")
async def receive_speed_insights_data(request: Request):
    data = await request.json()
    
    # Store in database
    # await save_metrics_to_db(data)
    
    # Process and aggregate
    # await process_metrics(data)
    
    # Check thresholds
    # await check_performance_alerts(data)
    
    return {"status": "received"}
```

## Viewing Data

### In Vercel Dashboard

1. Go to your project on Vercel
2. Select the **Speed Insights** tab
3. View metrics by:
   - Route
   - Time period
   - Browser/Device
   - Geography

### Key Features

- Real-time performance monitoring
- Historical data analysis
- Country/region breakdown
- Browser compatibility view
- Actionable recommendations

## Next Steps

1. **Review Metrics**: Check the Speed Insights dashboard regularly
2. **Optimize Performance**: Address any degraded metrics
3. **Set Targets**: Define performance budgets for your team
4. **Monitor Trends**: Track improvements over time

## Troubleshooting

### Script Not Appearing

- Verify Speed Insights is enabled in the Vercel dashboard
- Check that the deployment completed successfully
- Look for `/_vercel/speed-insights/script.js` in page source

### No Data Showing

- Allow 24 hours for initial data collection
- Ensure users are actually visiting your deployed site
- Check that your frontend is deployed to Vercel

### High Bounce Rate in Metrics

This is normal - Speed Insights collects data only from sessions that complete metrics measurement. Not all page visits will contribute data.

## Additional Resources

- [Vercel Speed Insights Docs](https://vercel.com/docs/speed-insights)
- [Web Vitals Guide](https://web.dev/vitals/)
- [Core Web Vitals Report](https://support.google.com/webmasters/answer/9205520)
- [@vercel/speed-insights Package](https://www.npmjs.com/package/@vercel/speed-insights)

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Vercel documentation
3. Check application logs in Vercel dashboard
4. Contact Vercel support through your account

---

**Last Updated**: January 2, 2026  
**Status**: Implemented and Ready for Deployment
