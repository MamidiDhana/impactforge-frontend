from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from sqlalchemy import String, Text, DateTime, Integer, JSON, func, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base


class AIRematchingEvent(Base):
    """
    Records an automated or manually triggered dynamic rematching event.
    Stores historical snapshots of previous and new recommendations,
    detected changed fields, affected matching types, and differential diffs.
    """
    __tablename__ = "ai_rematching_events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    report_id: Mapped[int] = mapped_column(Integer, ForeignKey("reports.id", ondelete="CASCADE"), index=True, nullable=False)
    track_id: Mapped[str] = mapped_column(String(50), index=True, nullable=False)
    trigger_type: Mapped[str] = mapped_column(String(50), index=True, nullable=False)  # capability_update, priority_change, hei_update, partner_proposal, manual_reanalysis, etc.
    trigger_source: Mapped[str] = mapped_column(String(100), nullable=False, default="system")  # user:email, system:pipeline, api:manual
    changed_fields: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)
    previous_matching_snapshot: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)
    new_matching_snapshot: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)
    affected_matching_types: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)  # hei, faculty, student, capability_gap, partner
    diff_summary: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True, default=dict)
    status: Mapped[str] = mapped_column(String(30), default="pending", index=True, nullable=False)  # pending, running, completed, failed
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    created_by: Mapped[str] = mapped_column(String(150), nullable=False, default="System")

    def __repr__(self) -> str:
        return f"<AIRematchingEvent #{self.id} for {self.track_id} ({self.trigger_type}, status={self.status})>"
