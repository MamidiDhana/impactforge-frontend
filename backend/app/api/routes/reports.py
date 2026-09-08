from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.report import Report
from app.schemas.report import (
    ReportCreate,
    ReportResponse,
    ReportStatus,
    ReportStatusUpdate,
)

router = APIRouter(prefix="/reports", tags=["Reports"])


def generate_unique_track_id(db: Session) -> str:
    """Generates the next sequential unique Track ID in IF-JH-2026-XXXX format."""
    prefix = "IF-JH-2026-"
    last_report = (
        db.query(Report)
        .filter(Report.track_id.like(f"{prefix}%"))
        .order_by(Report.id.desc())
        .first()
    )

    if last_report and last_report.track_id:
        try:
            seq_part = last_report.track_id.split("-")[-1]
            next_num = int(seq_part) + 1
        except (ValueError, IndexError):
            next_num = db.query(Report).count() + 1
    else:
        next_num = 1

    # Ensure uniqueness even if manual records or gaps exist
    while True:
        candidate = f"{prefix}{next_num:04d}"
        exists = db.query(Report.id).filter(Report.track_id == candidate).first()
        if not exists:
            return candidate
        next_num += 1


@router.post(
    "",
    response_model=ReportResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new community problem report",
    description="Registers a problem with Jharkhand location restrictions and generates a permanent Track ID.",
)
def create_report(
    payload: ReportCreate,
    db: Session = Depends(get_db),
) -> Report:
    track_id = generate_unique_track_id(db)

    db_report = Report(
        track_id=track_id,
        problem_title=payload.problem_title,
        category=payload.category,
        context_and_desired_outcome=payload.context_and_desired_outcome,
        existing_efforts=payload.existing_efforts,
        expected_outcome=payload.expected_outcome,
        state=payload.state,
        district=payload.district,
        locality=payload.locality,
        address_or_landmark=payload.address_or_landmark,
        latitude=payload.latitude,
        longitude=payload.longitude,
        priority=payload.priority,
        status=ReportStatus.OPEN.value,
    )

    db.add(db_report)
    db.commit()
    db.refresh(db_report)
    return db_report


@router.get(
    "",
    response_model=List[ReportResponse],
    summary="List all community problem reports",
    description="Returns all registered reports with optional filtering by district, status, or category.",
)
def list_reports(
    district: Optional[str] = Query(None, description="Filter by Jharkhand district"),
    status: Optional[str] = Query(None, description="Filter by report status (Open, In Progress, Resolved, Rejected)"),
    category: Optional[str] = Query(None, description="Filter by problem category"),
    priority: Optional[str] = Query(None, description="Filter by priority"),
    skip: int = Query(0, ge=0, description="Pagination offset"),
    limit: int = Query(100, ge=1, le=1000, description="Max results per page"),
    db: Session = Depends(get_db),
) -> List[Report]:
    query = db.query(Report)

    if district:
        query = query.filter(func.lower(Report.district) == district.strip().lower())
    if status:
        query = query.filter(func.lower(Report.status) == status.strip().lower())
    if category:
        query = query.filter(func.lower(Report.category) == category.strip().lower())
    if priority:
        query = query.filter(func.lower(Report.priority) == priority.strip().lower())

    return query.order_by(Report.created_at.desc()).offset(skip).limit(limit).all()


@router.get(
    "/{track_id}",
    response_model=ReportResponse,
    summary="Retrieve report by Track ID",
    description="Looks up a single report by its unique permanent Track ID (e.g. IF-JH-2026-0001).",
)
def get_report_by_track_id(
    track_id: str,
    db: Session = Depends(get_db),
) -> Report:
    report = (
        db.query(Report)
        .filter(func.lower(Report.track_id) == track_id.strip().lower())
        .first()
    )

    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Report with Track ID '{track_id}' not found.",
        )

    return report


@router.patch(
    "/{track_id}/status",
    response_model=ReportResponse,
    summary="Update report status",
    description="Updates the governance/resolution status of a problem report (Open, In Progress, Resolved, Rejected).",
)
def update_report_status(
    track_id: str,
    payload: ReportStatusUpdate,
    db: Session = Depends(get_db),
) -> Report:
    report = (
        db.query(Report)
        .filter(func.lower(Report.track_id) == track_id.strip().lower())
        .first()
    )

    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Report with Track ID '{track_id}' not found.",
        )

    report.status = payload.status.value
    report.updated_at = func.now()
    db.commit()
    db.refresh(report)

    return report
