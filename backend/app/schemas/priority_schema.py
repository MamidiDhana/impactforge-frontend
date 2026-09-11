from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field


class PriorityFactors(BaseModel):
    safety_risk: int = Field(..., ge=0, le=40, description="Public safety risk factor (0-40)")
    affected_people: int = Field(..., ge=0, le=25, description="Scale of affected population (0-25)")
    urgency_indicators: int = Field(..., ge=0, le=20, description="Urgency and hazard indicators (0-20)")
    infrastructure_impact: int = Field(..., ge=0, le=15, description="Infrastructure / service disruption (0-15)")


class PriorityScoringOutput(BaseModel):
    priority: str = Field(..., description="Priority level: Low, Medium, High, or Critical")
    score: int = Field(..., ge=0, le=100, description="Explainable aggregate score out of 100")
    factors: PriorityFactors = Field(..., description="Detailed breakdown of factor points")
    reasons: List[str] = Field(default_factory=list, description="Human-readable explainable rationale")
    status: str = Field(default="completed", description="Analysis status: pending, completed, failed, or needs_review")
    detected_indicators: List[str] = Field(default_factory=list, description="Urgency keywords detected")


class AIPriorityResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    track_id: str
    priority: Optional[str] = None
    score: Optional[int] = None
    factors: Optional[PriorityFactors] = None
    reasons: List[str] = Field(default_factory=list)
    status: str
    model: Optional[str] = None
    analyzed_at: Optional[datetime] = None
