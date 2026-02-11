# backend/routers/speed_insights.py
# Vercel Speed Insights API endpoint

from fastapi import APIRouter, Request
from typing import Optional, Dict, Any
import logging

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/speed-insights",
    tags=["speed-insights"]
)


@router.post("/events")
async def receive_speed_insights_data(request: Request, body: Optional[Dict[str, Any]] = None):
    """
    Receive Speed Insights metrics from the frontend.
    
    This endpoint is called by @vercel/speed-insights/react to send Web Vitals
    and other performance metrics.
    
    Args:
        request: FastAPI request object
        body: Optional JSON body with performance data
        
    Returns:
        Success response
        
    Reference: https://vercel.com/docs/speed-insights/package#beforesend
    """
    try:
        # Get request body if not provided
        if body is None:
            data = await request.json()
        else:
            data = body
            
        # Log the received metrics
        logger.info(f"Received Speed Insights metrics: {data}")
        
        # In production, you might want to:
        # - Store metrics in a database
        # - Send to analytics service
        # - Filter sensitive information
        # - Process and aggregate metrics
        
        return {
            "status": "received",
            "message": "Speed Insights data received successfully"
        }
    except Exception as e:
        logger.error(f"Error receiving Speed Insights data: {str(e)}")
        return {
            "status": "error",
            "message": f"Error processing Speed Insights data: {str(e)}"
        }


@router.get("/health")
async def speed_insights_health():
    """
    Health check endpoint for Speed Insights collection.
    
    Returns:
        Health status
    """
    return {
        "status": "healthy",
        "service": "Speed Insights Collector"
    }
