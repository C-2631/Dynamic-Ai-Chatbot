"""Analytics and reporting API router."""

from fastapi import APIRouter, Query, Header, HTTPException
from typing import Optional
from app.config import settings
from app.analytics.metrics import get_analytics_summary

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.get("/summary")
def summary(
    days: int = Query(default=7, ge=1, le=90, description="Reporting window in days"),
    x_api_key: Optional[str] = Header(default=None)
):
    """
    Returns high-level chatbot KPIs: containment rate, latency, fallback rate, CSAT, top intents.
    """
    # Enforce API key if non-development mode
    if settings.environment != "development" and x_api_key != settings.analytics_api_key:
        raise HTTPException(status_code=401, detail="Unauthorized analytics access")

    return get_analytics_summary(days=days)
