from datetime import datetime
from typing import Optional, List, Dict, Any
from sqlalchemy import String, Text, DateTime, Integer, JSON, func, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base


class FacultyProfile(Base):
    """
    Faculty capability profile for higher education institutions (HEIs).
    Contains academic specialization, technical domains, research expertise,
    project track record, availability, and active workload.
    """
    __tablename__ = "faculty_profiles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    faculty_id: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    institution_id: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    institution_name: Mapped[str] = mapped_column(String(255), nullable=False)
    department: Mapped[str] = mapped_column(String(150), index=True, nullable=False)
    skills: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)
    technical_domains: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)
    research_expertise: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)
    project_experience: Mapped[str] = mapped_column(String(100), default="medium", nullable=False)  # extensive | high | medium | low
    availability: Mapped[str] = mapped_column(String(50), default="available", nullable=False)  # available | limited | busy
    current_workload: Mapped[int] = mapped_column(Integer, default=2, nullable=False)  # active projects count
    district: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    state: Mapped[str] = mapped_column(String(100), nullable=False, default="Jharkhand")
    verification_status: Mapped[str] = mapped_column(String(50), default="unverified", nullable=False)
    contact_email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    associated_user_email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    def __repr__(self) -> str:
        return f"<FacultyProfile {self.faculty_id}: {self.name} ({self.institution_name})>"


class StudentProfile(Base):
    """
    Student project profile for university and polytechnic students.
    Contains field of study, skills, technical domains, academic interests,
    practical project experience, and availability.
    """
    __tablename__ = "student_profiles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    student_id: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    institution_id: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    institution_name: Mapped[str] = mapped_column(String(255), nullable=False)
    department: Mapped[str] = mapped_column(String(150), index=True, nullable=False)
    skills: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)
    technical_domains: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)
    interests: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)
    project_experience: Mapped[str] = mapped_column(String(100), default="academic", nullable=False)  # high | medium | low | academic
    availability: Mapped[str] = mapped_column(String(50), default="available", nullable=False)  # available | limited | busy
    current_workload: Mapped[int] = mapped_column(Integer, default=1, nullable=False)  # active projects count
    district: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    state: Mapped[str] = mapped_column(String(100), nullable=False, default="Jharkhand")
    verification_status: Mapped[str] = mapped_column(String(50), default="unverified", nullable=False)
    contact_email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    associated_user_email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    def __repr__(self) -> str:
        return f"<StudentProfile {self.student_id}: {self.name} ({self.institution_name})>"


class FacultyInterest(Base):
    """
    Records an official recommendation (by Government/Admin) or an
    expression of interest (by authorized HEI representative or faculty member) for a civic report.
    Does NOT mutate report status, priority, or binding project assignment.
    """
    __tablename__ = "faculty_interests"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    report_id: Mapped[int] = mapped_column(Integer, ForeignKey("reports.id", ondelete="CASCADE"), index=True, nullable=False)
    track_id: Mapped[str] = mapped_column(String(50), index=True, nullable=False)
    faculty_id: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    faculty_name: Mapped[str] = mapped_column(String(255), nullable=False)
    institution_id: Mapped[str] = mapped_column(String(100), nullable=False)
    action_type: Mapped[str] = mapped_column(String(50), nullable=False)  # official_recommendation | expression_of_interest
    actor_user_id: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    actor_name: Mapped[str] = mapped_column(String(150), nullable=False)
    actor_role: Mapped[str] = mapped_column(String(50), nullable=False)
    actor_email: Mapped[str] = mapped_column(String(255), nullable=False)
    remarks: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    def __repr__(self) -> str:
        return f"<FacultyInterest {self.action_type} by {self.actor_name} on {self.track_id} -> {self.faculty_id}>"


class StudentInterest(Base):
    """
    Records an official recommendation (by Government/Admin) or an
    expression of interest (by authorized HEI representative, faculty mentor, or student) for a civic report.
    Does NOT mutate report status, priority, or binding project assignment.
    """
    __tablename__ = "student_interests"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    report_id: Mapped[int] = mapped_column(Integer, ForeignKey("reports.id", ondelete="CASCADE"), index=True, nullable=False)
    track_id: Mapped[str] = mapped_column(String(50), index=True, nullable=False)
    student_id: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    student_name: Mapped[str] = mapped_column(String(255), nullable=False)
    institution_id: Mapped[str] = mapped_column(String(100), nullable=False)
    action_type: Mapped[str] = mapped_column(String(50), nullable=False)  # official_recommendation | expression_of_interest
    actor_user_id: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    actor_name: Mapped[str] = mapped_column(String(150), nullable=False)
    actor_role: Mapped[str] = mapped_column(String(50), nullable=False)
    actor_email: Mapped[str] = mapped_column(String(255), nullable=False)
    remarks: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    def __repr__(self) -> str:
        return f"<StudentInterest {self.action_type} by {self.actor_name} on {self.track_id} -> {self.student_id}>"
