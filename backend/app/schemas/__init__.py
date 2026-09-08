"""Pydantic schemas package."""

from pydantic import BaseModel
from app.schemas.report import (
    JHARKHAND_DISTRICTS,
    ReportCreate,
    ReportResponse,
    ReportStatus,
    ReportStatusUpdate,
)


class HealthResponse(BaseModel):
    status: str
    service: str


__all__ = [
    "HealthResponse",
    "ReportCreate",
    "ReportResponse",
    "ReportStatus",
    "ReportStatusUpdate",
    "JHARKHAND_DISTRICTS",
]
