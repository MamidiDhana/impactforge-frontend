from typing import List, Optional, Literal, Dict, Any
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class HEIFactorScores(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    skills: float = Field(..., ge=0.0, le=30.0, description="Skill match component (0-30 points / 30%)")
    technical_domains: float = Field(..., ge=0.0, le=25.0, description="Technical domain match component (0-25 points / 25%)")
    equipment: float = Field(..., ge=0.0, le=15.0, description="Equipment & lab match component (0-15 points / 15%)")
    software: float = Field(..., ge=0.0, le=10.0, description="Software & computational tools component (0-10 points / 10%)")
    location: float = Field(..., ge=0.0, le=10.0, description="District & state proximity relevance (0-10 points / 10%)")
    complexity: float = Field(..., ge=0.0, le=10.0, description="Project complexity & faculty capacity alignment (0-10 points / 10%)")


class MatchedCapabilityDetails(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    matched_skills: List[str] = Field(default_factory=list)
    matched_domains: List[str] = Field(default_factory=list)
    matched_equipment: List[str] = Field(default_factory=list)
    matched_software: List[str] = Field(default_factory=list)


class MissingCapabilityDetails(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    missing_skills: List[str] = Field(default_factory=list)
    missing_domains: List[str] = Field(default_factory=list)
    missing_equipment: List[str] = Field(default_factory=list)
    missing_software: List[str] = Field(default_factory=list)


class HEIProfileData(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    hei_id: str
    name: str
    district: str
    state: str = "Jharkhand"
    institution_type: str
    departments: List[str] = Field(default_factory=list)
    available_skills: List[str] = Field(default_factory=list)
    technical_domains: List[str] = Field(default_factory=list)
    laboratories: List[str] = Field(default_factory=list)
    equipment: List[str] = Field(default_factory=list)
    software_tools: List[str] = Field(default_factory=list)
    project_experience: Dict[str, Any] = Field(default_factory=dict)
    available_faculty_capacity: int = 10
    verification_status: str = "unverified"
    contact_email: Optional[str] = None


class HEIRecommendationMatch(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    hei_id: str
    hei_name: str
    district: str
    state: str
    institution_type: str
    verification_status: str
    match_score: float = Field(..., ge=0.0, le=100.0, description="Overall match score (0-100)")
    recommendation_level: Literal["low", "moderate", "strong", "excellent"]
    factor_scores: HEIFactorScores
    matched_capabilities: MatchedCapabilityDetails
    missing_capabilities: MissingCapabilityDetails
    reasons: List[str] = Field(default_factory=list)
    confidence: float = Field(default=0.85, ge=0.0, le=1.0)
    departments: List[str] = Field(default_factory=list)
    available_skills: List[str] = Field(default_factory=list)
    technical_domains: List[str] = Field(default_factory=list)
    laboratories: List[str] = Field(default_factory=list)
    equipment: List[str] = Field(default_factory=list)
    software_tools: List[str] = Field(default_factory=list)
    project_experience: Dict[str, Any] = Field(default_factory=dict)
    available_faculty_capacity: int = 10
    contact_email: Optional[str] = None


class HEIInterestRecord(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: Optional[int] = None
    hei_id: str
    hei_name: str
    action_type: str  # official_recommendation | expression_of_interest
    actor_user_id: Optional[int] = None
    actor_name: str
    actor_role: str
    actor_email: str
    remarks: str
    created_at: datetime


class HEIMatchingResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    track_id: str
    ai_hei_matching_status: str
    matches: List[HEIRecommendationMatch] = Field(default_factory=list)
    recorded_interests: List[HEIInterestRecord] = Field(default_factory=list)
    model: Optional[str] = None
    analyzed_at: Optional[datetime] = None
    disclaimer: str = "AI recommendations are advisory. Authorized officials must review and approve any institutional collaboration."


class HEIInterestCreate(BaseModel):
    hei_id: str = Field(..., min_length=2, max_length=100, description="Target HEI identifier (slug)")
    remarks: str = Field(..., min_length=2, max_length=2000, description="Official recommendation remarks or institutional rationale")


class HEIInterestActionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    status: str = "success"
    action_type: str
    track_id: str
    hei_id: str
    hei_name: str
    recorded_by: str
    remarks: str
    created_at: datetime
    disclaimer: str = "AI recommendations are advisory. Authorized officials must review and approve any institutional collaboration."
