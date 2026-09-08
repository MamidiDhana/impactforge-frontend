from datetime import datetime
from typing import Optional
from sqlalchemy import (
    String,
    Text,
    Float,
    DateTime,
    Integer,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base


class Report(Base):
    __tablename__ = "reports"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    track_id: Mapped[str] = mapped_column(String(32), unique=True, index=True, nullable=False)
    problem_title: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    category: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    context_and_desired_outcome: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    existing_efforts: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    expected_outcome: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    state: Mapped[str] = mapped_column(String(50), nullable=False, default="Jharkhand")
    district: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    locality: Mapped[str] = mapped_column(String(150), nullable=False)
    address_or_landmark: Mapped[str] = mapped_column(Text, nullable=False)
    latitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    longitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    priority: Mapped[str] = mapped_column(String(20), nullable=False, default="Medium")
    status: Mapped[str] = mapped_column(String(30), nullable=False, default="Open", index=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    def __repr__(self) -> str:
        return f"<Report {self.track_id}: {self.problem_title} ({self.status})>"
