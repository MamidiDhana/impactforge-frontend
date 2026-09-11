from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from sqlalchemy import String, Text, DateTime, Integer, Float, JSON, func, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base


class PartnerProfile(Base):
    """
    Industry, CSR, NGO, and Supplier partner capability profile.
    Contains institutional capacity, supported domains, funding capacity, equipment,
    and service coverage for civic remediation projects.
    """
    __tablename__ = "partner_profiles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    partner_id: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    organization_name: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    partner_type: Mapped[str] = mapped_column(String(50), index=True, nullable=False)  # industry, CSR, NGO, government_agency, supplier
    location: Mapped[str] = mapped_column(String(150), nullable=False)
    service_districts: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)
    supported_domains: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)
    supported_skills: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)
    equipment: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)
    materials: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)
    software_tools: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)
    manpower_support: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)
    funding_capacity: Mapped[str] = mapped_column(String(50), nullable=False, default="moderate")  # low, moderate, high, extensive
    maximum_project_budget: Mapped[float] = mapped_column(Float, nullable=False, default=500000.0)
    support_types: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)  # funding, equipment, materials, manpower, technical_advisory
    previous_experience: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)
    availability: Mapped[str] = mapped_column(String(50), nullable=False, default="immediate")  # immediate, 2_weeks, 1_month, busy
    verification_status: Mapped[str] = mapped_column(String(50), default="unverified", nullable=False)
    contact_email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    associated_user_email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    def __repr__(self) -> str:
        return f"<PartnerProfile {self.partner_id}: {self.organization_name} ({self.partner_type})>"


class PartnerInterest(Base):
    """
    Records an expression of interest or support proposal from a partner,
    or an administrative partner invitation/nomination by Government/Admin.
    Does NOT automatically commit funds or change report resolution status.
    """
    __tablename__ = "partner_interests"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    report_id: Mapped[int] = mapped_column(Integer, ForeignKey("reports.id", ondelete="CASCADE"), index=True, nullable=False)
    track_id: Mapped[str] = mapped_column(String(50), index=True, nullable=False)
    partner_id: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    partner_name: Mapped[str] = mapped_column(String(255), nullable=False)
    support_type: Mapped[str] = mapped_column(String(100), nullable=False)  # funding, equipment, materials, manpower, comprehensive
    proposed_amount: Mapped[Optional[float]] = mapped_column(Float, nullable=True, default=0.0)
    proposed_resources: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)
    notes: Mapped[str] = mapped_column(Text, nullable=False, default="")
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="proposed")  # proposed, under_review, approved, rejected
    created_by: Mapped[str] = mapped_column(String(255), nullable=False)
    creator_user_id: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    creator_role: Mapped[str] = mapped_column(String(50), nullable=False, default="partner")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    def __repr__(self) -> str:
        return f"<PartnerInterest {self.id}: {self.partner_name} -> {self.track_id} ({self.status})>"
