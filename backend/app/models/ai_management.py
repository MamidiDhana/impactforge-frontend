from datetime import datetime
from typing import Optional
from sqlalchemy import String, Text, DateTime, Integer, Float, Boolean, JSON, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base


class AIFeedback(Base):
    __tablename__ = "ai_feedback"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    report_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("reports.id", ondelete="SET NULL"), nullable=True, index=True)
    prediction_type: Mapped[str] = mapped_column(String(50), nullable=False, default="category", index=True)
    
    # Store original prediction object and human correction
    original_prediction: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    corrected_value: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    
    # feedback_status: 'correct' | 'incorrect' | 'needs_review'
    feedback_status: Mapped[str] = mapped_column(String(30), nullable=False, default="needs_review", index=True)
    feedback_reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    admin_feedback: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    reviewer_email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    reviewer_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    model_version: Mapped[str] = mapped_column(String(100), nullable=False, default="v1.0.0")
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    def __repr__(self) -> str:
        return f"<AIFeedback id={self.id} status={self.feedback_status} type={self.prediction_type}>"


class TrainingRecord(Base):
    __tablename__ = "training_records"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    feedback_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("ai_feedback.id", ondelete="SET NULL"), nullable=True, index=True)
    
    input_text: Mapped[str] = mapped_column(Text, nullable=False)
    prediction_type: Mapped[str] = mapped_column(String(50), nullable=False, default="category")
    original_prediction: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    target_label: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    feedback_reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # approval_status: 'pending' | 'approved' | 'rejected'
    approval_status: Mapped[str] = mapped_column(String(30), nullable=False, default="pending", index=True)
    approved_by: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    approved_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    
    is_duplicate: Mapped[bool] = mapped_column(Boolean, default=False)
    dataset_version: Mapped[str] = mapped_column(String(50), nullable=False, default="v1.0")
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    def __repr__(self) -> str:
        return f"<TrainingRecord id={self.id} approval={self.approval_status}>"


class AIModelVersion(Base):
    __tablename__ = "ai_model_versions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    version_tag: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    model_name: Mapped[str] = mapped_column(String(100), nullable=False)
    provider: Mapped[str] = mapped_column(String(50), nullable=False, default="gemini")
    
    # status: 'active' | 'candidate' | 'deprecated' | 'rejected' | 'rolled_back'
    status: Mapped[str] = mapped_column(String(30), nullable=False, default="candidate", index=True)
    dataset_version: Mapped[str] = mapped_column(String(50), nullable=False, default="v1.0")
    
    accuracy_score: Mapped[float] = mapped_column(Float, nullable=False, default=94.5)
    f1_score: Mapped[float] = mapped_column(Float, nullable=False, default=92.1)
    latency_ms: Mapped[float] = mapped_column(Float, nullable=False, default=320.0)
    
    deployed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    created_by: Mapped[str] = mapped_column(String(255), nullable=False, default="Super Admin")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    def __repr__(self) -> str:
        return f"<AIModelVersion tag={self.version_tag} status={self.status}>"


class AIRetrainingJob(Base):
    __tablename__ = "ai_retraining_jobs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    job_id: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    
    # status: 'pending_validation' | 'ready' | 'running' | 'evaluating' | 'completed' | 'failed' | 'cancelled'
    status: Mapped[str] = mapped_column(String(30), nullable=False, default="ready", index=True)
    base_model_version: Mapped[str] = mapped_column(String(50), nullable=False, default="v1.0.0")
    candidate_model_version: Mapped[str] = mapped_column(String(50), nullable=False, default="v1.1.0")
    dataset_version: Mapped[str] = mapped_column(String(50), nullable=False, default="v1.0")
    
    approved_records_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    progress_percent: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    
    logs: Mapped[Optional[list]] = mapped_column(JSON, nullable=True, default=list)
    evaluation_metrics: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True, default=dict)
    
    # approval_status: 'pending_review' | 'approved' | 'rejected'
    approval_status: Mapped[str] = mapped_column(String(30), nullable=False, default="pending_review")
    reviewed_by: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    reviewed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    
    started_by: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    started_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    def __repr__(self) -> str:
        return f"<AIRetrainingJob job_id={self.job_id} status={self.status}>"
