from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from sqlalchemy import String, Text, DateTime, Integer, JSON, func, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base


class HEIProfile(Base):
    """
    Higher Education Institution (HEI) capability profile.
    Contains institutional research capacity, departments, equipment, and lab facilities
    used to calculate explainable matching with citizen report capability requirements.
    """
    __tablename__ = "hei_profiles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    hei_id: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    district: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    state: Mapped[str] = mapped_column(String(100), nullable=False, default="Jharkhand")
    institution_type: Mapped[str] = mapped_column(String(100), nullable=False)
    departments: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)
    available_skills: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)
    technical_domains: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)
    laboratories: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)
    equipment: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)
    software_tools: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)
    project_experience: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)
    available_faculty_capacity: Mapped[int] = mapped_column(Integer, default=10, nullable=False)
    verification_status: Mapped[str] = mapped_column(String(50), default="unverified", nullable=False)
    contact_email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    associated_user_email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    def __repr__(self) -> str:
        return f"<HEIProfile {self.hei_id}: {self.name} ({self.district}, {self.state})>"


class HEIInterest(Base):
    """
    Records an official recommendation (by Government/Admin) or an
    expression of interest (by an authorized HEI representative) for a civic report.
    Does NOT create a binding project assignment.
    """
    __tablename__ = "hei_interests"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    report_id: Mapped[int] = mapped_column(Integer, ForeignKey("reports.id", ondelete="CASCADE"), index=True, nullable=False)
    track_id: Mapped[str] = mapped_column(String(50), index=True, nullable=False)
    hei_id: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    hei_name: Mapped[str] = mapped_column(String(255), nullable=False)
    action_type: Mapped[str] = mapped_column(String(50), nullable=False)  # official_recommendation | expression_of_interest
    actor_user_id: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    actor_name: Mapped[str] = mapped_column(String(150), nullable=False)
    actor_role: Mapped[str] = mapped_column(String(50), nullable=False)
    actor_email: Mapped[str] = mapped_column(String(255), nullable=False)
    remarks: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    def __repr__(self) -> str:
        return f"<HEIInterest {self.action_type} by {self.actor_name} on {self.track_id} -> {self.hei_id}>"
