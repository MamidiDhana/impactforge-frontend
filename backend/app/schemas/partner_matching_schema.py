from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class PartnerFactorScores(BaseModel):
    """
    Explainable breakdown of 6-factor partner matching scoring rubric.
    """
    equipment_and_materials_score: float = Field(..., ge=0.0, le=25.0, description="Missing Equipment & Materials Support (25%)")
    funding_and_budget_score: float = Field(..., ge=0.0, le=20.0, description="Funding & Budget Capacity (20%)")
    domain_and_skills_score: float = Field(..., ge=0.0, le=20.0, description="Technical Domain & Skill Support (20%)")
    manpower_and_operations_score: float = Field(..., ge=0.0, le=15.0, description="Manpower & Operational Support (15%)")
    location_relevance_score: float = Field(..., ge=0.0, le=10.0, description="Location & Service District Relevance (10%)")
    experience_and_reliability_score: float = Field(..., ge=0.0, le=10.0, description="Previous Experience & Reliability (10%)")
    total_score: float = Field(..., ge=0.0, le=100.0, description="Total composite match score (0-100)")


class PartnerRecommendationMatch(BaseModel):
    """
    Detailed partner recommendation for Officials, Admins, HEI, Faculty, and Partners.
    """
    partner_id: str
    organization_name: str
    partner_type: str  # industry, CSR, NGO, government_agency, supplier
    location: str
    service_districts: List[str] = Field(default_factory=list)
    score: float = Field(..., ge=0.0, le=100.0)
    match_level: str  # low, moderate, strong, excellent
    matched_support_areas: List[str] = Field(default_factory=list)
    missing_support_areas: List[str] = Field(default_factory=list)
    estimated_support_type: str  # funding, equipment, materials, manpower, comprehensive
    explanation: str
    rationale: List[str] = Field(default_factory=list)
    confidence: float = Field(..., ge=0.0, le=1.0)
    verification_status: str = "unverified"
    funding_capacity: str = "moderate"
    maximum_project_budget: float = 0.0
    availability: str = "immediate"
    factor_scores: PartnerFactorScores
    contact_email: Optional[str] = None


class CitizenPartnerRecommendation(BaseModel):
    """
    Privacy-safe partner recommendation summary for Citizens.
    Omits private contact info, executive emails, and exact commercial details.
    """
    partner_id: str
    organization_name: str
    partner_type: str
    location: str
    score: float
    match_level: str
    matched_support_areas: List[str] = Field(default_factory=list)
    estimated_support_type: str
    explanation: str
    verification_status: str


class PartnerMatchingResponse(BaseModel):
    """
    Complete partner matching response for authorized administrative roles.
    """
    track_id: str
    status: str
    model: Optional[str] = None
    analyzed_at: Optional[datetime] = None
    total_evaluated_partners: int = 0
    recommendations: List[PartnerRecommendationMatch] = Field(default_factory=list)
    registered_interests: List[Dict[str, Any]] = Field(default_factory=list)
    advisory_warning: str = (
        "AI partner recommendations are strictly advisory and do not constitute "
        "financial commitments, formal contracts, or administrative project approvals."
    )


class CitizenPartnerMatchingResponse(BaseModel):
    """
    Privacy-safe response for citizens viewing their own civic problem report.
    """
    track_id: str
    status: str
    recommendations: List[CitizenPartnerRecommendation] = Field(default_factory=list)
    advisory_warning: str = (
        "AI partner recommendations are strictly advisory and do not constitute "
        "financial commitments, formal contracts, or administrative project approvals."
    )


class PartnerInterestCreate(BaseModel):
    """
    Payload for submitting an expression of interest or partner recommendation.
    """
    partner_id: str = Field(..., min_length=1, max_length=100)
    support_type: str = Field(..., min_length=1, max_length=100)  # funding, equipment, materials, manpower, comprehensive
    proposed_amount: Optional[float] = Field(0.0, ge=0.0)
    proposed_resources: List[str] = Field(default_factory=list)
    notes: str = Field("", max_length=1000)


class PartnerInterestUpdate(BaseModel):
    """
    Payload for reviewing or updating an existing partner interest.
    """
    status: Optional[str] = Field(None, description="proposed, under_review, approved, rejected")
    proposed_amount: Optional[float] = Field(None, ge=0.0)
    proposed_resources: Optional[List[str]] = None
    notes: Optional[str] = Field(None, max_length=1000)


class PartnerInterestRecord(BaseModel):
    """
    Serialized record of partner interest / support proposal.
    """
    id: int
    report_id: int
    track_id: str
    partner_id: str
    partner_name: str
    support_type: str
    proposed_amount: Optional[float] = 0.0
    proposed_resources: List[str] = Field(default_factory=list)
    notes: str = ""
    status: str
    created_by: str
    creator_user_id: Optional[int] = None
    creator_role: str
    created_at: datetime
    updated_at: datetime


class PartnerInterestActionResponse(BaseModel):
    """
    Response returned after recording or updating partner interest.
    """
    success: bool
    message: str
    interest: Optional[PartnerInterestRecord] = None
