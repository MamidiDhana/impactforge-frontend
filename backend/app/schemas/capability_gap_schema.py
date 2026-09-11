from datetime import datetime
from typing import List, Optional, Dict, Any, Literal
from pydantic import BaseModel, ConfigDict, Field


class GapFactorScores(BaseModel):
    """
    Explainable factor scores for capability coverage (Total: 100%).
    """
    model_config = ConfigDict(from_attributes=True)

    skills_coverage: float = Field(..., ge=0.0, le=25.0, description="Skills Coverage (25%)")
    domains_coverage: float = Field(..., ge=0.0, le=20.0, description="Technical Domains Coverage (20%)")
    equipment_coverage: float = Field(..., ge=0.0, le=15.0, description="Equipment & Lab Facilities Coverage (15%)")
    software_coverage: float = Field(..., ge=0.0, le=10.0, description="Software & Computational Tools Coverage (10%)")
    manpower_coverage: float = Field(..., ge=0.0, le=10.0, description="Manpower & Capacity Alignment (10%)")
    safety_coverage: float = Field(..., ge=0.0, le=10.0, description="Safety Protocols & Expertise (10%)")
    materials_coverage: float = Field(..., ge=0.0, le=10.0, description="Materials & Domain Feasibility (10%)")


class PartialSkillMatch(BaseModel):
    """
    Represents a partially covered skill with explainable context.
    """
    model_config = ConfigDict(from_attributes=True)

    required_skill: str
    matched_domain_or_competency: str
    relevance_note: str


class VerificationSummary(BaseModel):
    """
    Indicates whether candidates used in gap comparison are verified or unverified.
    """
    model_config = ConfigDict(from_attributes=True)

    has_unverified_entities: bool = True
    verified_count: int = 0
    unverified_count: int = 0
    verification_notes: str = (
        "Demonstration institutional profiles are currently unverified. "
        "Official institutional verification must be completed prior to project launch."
    )


class CapabilityGapAnalysis(BaseModel):
    """
    Comprehensive structured capability-gap analysis for a civic report.
    """
    model_config = ConfigDict(from_attributes=True)

    coverage_score: float = Field(..., ge=0.0, le=100.0, description="Overall capability coverage percentage (0-100%)")
    gap_percentage: float = Field(..., ge=0.0, le=100.0, description="Uncovered capability gap percentage (0-100%)")
    gap_severity: Literal["minimal", "moderate", "significant", "critical"] = Field(
        ...,
        description="minimal (0-15% gap), moderate (16-35% gap), significant (36-60% gap), critical (>60% gap)"
    )

    factor_scores: GapFactorScores

    # Detailed Capability Breakdown
    available_skills: List[str] = Field(default_factory=list, description="Skills fully covered by academic candidates")
    missing_skills: List[str] = Field(default_factory=list, description="Required skills with no match in candidate profiles")
    partially_available_skills: List[PartialSkillMatch] = Field(default_factory=list, description="Skills partially matched through adjacent domains")

    missing_technical_domains: List[str] = Field(default_factory=list, description="Required technical domains missing from candidates")
    missing_equipment: List[str] = Field(default_factory=list, description="Required equipment or lab tools not available at HEI")
    missing_software_tools: List[str] = Field(default_factory=list, description="Required simulation/CAD/GIS software not available at HEI")
    missing_manpower: List[str] = Field(default_factory=list, description="Required personnel, trades, or field staff missing")
    missing_materials: List[str] = Field(default_factory=list, description="Required physical consumables and construction materials")
    missing_budget: Optional[str] = Field(None, description="Funding/budget gap summary if capital expenditure is required")
    missing_safety_expertise: List[str] = Field(default_factory=list, description="Required safety protocols lacking specialized academic oversight")
    missing_department_support: List[str] = Field(default_factory=list, description="Required municipal or state department authorization needed")

    # High-level Summaries
    covered_capabilities: Dict[str, Any] = Field(default_factory=dict, description="Summary of all covered assets")
    missing_capabilities: Dict[str, Any] = Field(default_factory=dict, description="Summary of all missing requirements")

    recommended_actions: List[str] = Field(default_factory=list, description="Explainable recommendations to bridge identified gaps")
    required_external_support: List[str] = Field(default_factory=list, description="External partners, CSR sponsors, or contractors required")

    verification_summary: VerificationSummary = Field(default_factory=VerificationSummary)
    confidence: float = Field(default=0.85, ge=0.0, le=1.0)
    explanation: str = Field(..., description="Explainable human-readable breakdown of how coverage was derived")


class CapabilityGapResponse(BaseModel):
    """
    Response returned by GET /api/reports/{track_id}/capability-gaps
    for official, government, admin, and HEI users.
    """
    model_config = ConfigDict(from_attributes=True)

    track_id: str
    ai_capability_gap_status: str
    gap_score: Optional[float] = None
    coverage_score: Optional[float] = None
    gap_severity: Optional[str] = None
    analysis: Optional[CapabilityGapAnalysis] = None
    model: Optional[str] = None
    analyzed_at: Optional[datetime] = None
    disclaimer: str = (
        "AI capability-gap analysis is advisory only. Collaboration, procurement, and resource "
        "commitments require official administrative approval and institutional consent."
    )


class CitizenCapabilityGapResponse(BaseModel):
    """
    Privacy-safe masked response for citizens viewing capability gaps for their own reports.
    """
    model_config = ConfigDict(from_attributes=True)

    track_id: str
    ai_capability_gap_status: str
    coverage_score: Optional[float] = None
    gap_severity: Optional[str] = None
    summary_of_covered_needs: List[str] = Field(default_factory=list)
    summary_of_missing_needs: List[str] = Field(default_factory=list)
    required_support_types: List[str] = Field(default_factory=list)
    explanation: str
    disclaimer: str = (
        "AI capability-gap analysis is advisory only. Academic collaboration and resource allocation "
        "are subject to official governmental and institutional verification."
    )
