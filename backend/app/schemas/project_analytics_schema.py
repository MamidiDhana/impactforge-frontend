from datetime import datetime
from typing import Optional, List, Dict, Any, Literal
from pydantic import BaseModel, Field


class ScoreDetail(BaseModel):
    """
    Detailed explainable score breakdown for an analytical dimension.
    """
    score: float = Field(..., ge=0.0, le=100.0, description="Normalized score 0-100")
    level: Literal["low", "moderate", "strong", "excellent"] = Field(..., description="Categorical rating")
    explanation: str = Field(..., description="Human-readable plain English explanation")
    breakdown: Dict[str, Any] = Field(default_factory=dict, description="Factor-by-factor weight and score details")


class ResourceRequirementItem(BaseModel):
    """
    Required resource specification identified for project execution.
    """
    type: str  # skill, equipment, software, material, funding, manpower
    category: str
    description: str
    estimated_cost: Optional[float] = None
    source_status: str = "missing_gap"  # available_hei, available_partner, missing_gap


class ProjectAnalyticsDetail(BaseModel):
    """
    Comprehensive advisory project and impact analytics synthesis.
    """
    feasibility_score: ScoreDetail
    impact_score: ScoreDetail
    readiness_score: ScoreDetail
    risk_score: ScoreDetail
    confidence_score: ScoreDetail

    feasibility_summary: str
    implementation_complexity: Literal["low", "moderate", "high", "extreme"]
    
    # Quantitative estimates with explicit is_estimate flags
    estimated_duration_weeks: Dict[str, Any] = Field(
        default_factory=lambda: {
            "min_weeks": 2,
            "max_weeks": 6,
            "is_estimate": True,
            "basis": "Standard problem classification heuristics"
        }
    )
    estimated_budget_inr: Dict[str, Any] = Field(
        default_factory=lambda: {
            "min_budget": 0.0,
            "max_budget": 0.0,
            "currency": "INR",
            "is_estimate": True,
            "basis": "Identified gap materials and operational equipment"
        }
    )
    beneficiary_reach: Dict[str, Any] = Field(
        default_factory=lambda: {
            "min_reach": 100,
            "max_reach": 500,
            "reach_type": "direct_citizens",
            "is_estimate": True,
            "basis": "Locality and district population density profile"
        }
    )

    social_impact_summary: str
    risk_factors: List[Dict[str, Any]] = Field(default_factory=list)
    dependency_factors: List[str] = Field(default_factory=list)
    required_institutional_support: List[str] = Field(default_factory=list)
    required_partner_support: List[str] = Field(default_factory=list)
    capability_coverage: Dict[str, Any] = Field(default_factory=dict)
    recommended_next_steps: List[str] = Field(default_factory=list)

    # Explainability & Trust
    transparency: Dict[str, Any] = Field(
        default_factory=lambda: {
            "is_estimate": True,
            "input_factors": [],
            "assumptions": [],
            "calculation_explanation": "",
            "data_limitations": [],
            "advisory_disclaimer": "Advisory AI estimate for decision-support only. Does not modify official report status, priority, or assignment."
        }
    )


class ProjectAnalyticsResponse(BaseModel):
    """
    Full advisory analytics response for Gov Officials, Admins, and Connected HEI/Partners.
    """
    track_id: str
    problem_title: str
    status: str
    analytics: Optional[ProjectAnalyticsDetail] = None
    analyzed_at: Optional[datetime] = None
    model: Optional[str] = None


class CitizenProjectAnalyticsResponse(BaseModel):
    """
    Privacy-safe, civic-friendly subset of project analytics for Citizens.
    Omits partner proprietary costs, detailed HEI readiness matrices, and internal risk flags.
    """
    track_id: str
    problem_title: str
    feasibility_summary: str
    impact_level: str
    estimated_duration_weeks: Dict[str, Any]
    beneficiary_reach: Dict[str, Any]
    social_impact_summary: str
    recommended_next_steps: List[str] = Field(default_factory=list)
    disclaimer: str = "Estimated community impact and project projection for public information."


# ==============================================================================
# Aggregate Analytics Schemas
# ==============================================================================

class ImpactSummaryResponse(BaseModel):
    """
    State-wide / Platform-wide aggregate impact and feasibility summary.
    """
    total_reports: int
    analyzed_reports: int
    avg_feasibility_score: Optional[float] = None
    avg_impact_score: Optional[float] = None
    avg_readiness_score: Optional[float] = None
    avg_risk_score: Optional[float] = None
    total_estimated_beneficiaries: Optional[int] = None
    high_impact_count: int = 0
    critical_risk_count: int = 0
    insufficient_data: bool = False


class ImpactTrendItem(BaseModel):
    period: str  # e.g., "2026-W36" or "2026-09"
    report_count: int
    avg_impact_score: Optional[float] = None
    avg_feasibility_score: Optional[float] = None
    estimated_beneficiaries: int = 0


class ImpactTrendsResponse(BaseModel):
    trends: List[ImpactTrendItem] = Field(default_factory=list)
    insufficient_data: bool = False


class DistrictImpactItem(BaseModel):
    district: str
    report_count: int
    avg_impact_score: Optional[float] = None
    avg_feasibility_score: Optional[float] = None
    total_beneficiaries: int = 0
    top_category: Optional[str] = None


class DistrictImpactResponse(BaseModel):
    districts: List[DistrictImpactItem] = Field(default_factory=list)
    insufficient_data: bool = False


class CategoryImpactItem(BaseModel):
    category: str
    report_count: int
    avg_impact_score: Optional[float] = None
    avg_feasibility_score: Optional[float] = None
    avg_duration_weeks: Optional[float] = None
    total_beneficiaries: int = 0


class CategoryImpactResponse(BaseModel):
    categories: List[CategoryImpactItem] = Field(default_factory=list)
    insufficient_data: bool = False


class ResolutionPerformanceCategoryItem(BaseModel):
    category: str
    total_reports: int
    resolved_reports: int
    resolution_rate: float
    avg_days_to_resolve: Optional[float] = None


class ResolutionPerformanceDistrictItem(BaseModel):
    district: str
    total_reports: int
    resolved_reports: int
    resolution_rate: float
    avg_days_to_resolve: Optional[float] = None


class ResolutionPerformanceResponse(BaseModel):
    total_resolved: int
    overall_avg_days_to_resolve: Optional[float] = None
    overall_resolution_rate_percentage: float = 0.0
    by_category: List[ResolutionPerformanceCategoryItem] = Field(default_factory=list)
    by_district: List[ResolutionPerformanceDistrictItem] = Field(default_factory=list)
    insufficient_data: bool = False
