"""API Routes package."""

from app.api.routes.health import router as health_router
from app.api.routes.reports import router as reports_router

__all__ = ["health_router", "reports_router"]
