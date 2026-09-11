from typing import List, Optional, Literal
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field

CONTROLLED_SKILLS = [
    "civil engineering",
    "electrical engineering",
    "mechanical engineering",
    "software development",
    "GIS and mapping",
    "surveying",
    "data analysis",
    "environmental science",
    "project management",
    "construction",
    "public health",
    "water management",
    "waste management",
]

CONTROLLED_DOMAINS = [
    "civil infrastructure",
    "electrical grid & power",
    "water & wastewater",
    "environmental monitoring",
    "public health & sanitation",
    "urban planning & transportation",
    "education & civic technology",
    "waste & recycling management",
    "general civic maintenance",
]


class ExtractedCapabilities(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    skills: List[str] = Field(default_factory=list, description="Required skills from controlled vocabulary")
    technical_domains: List[str] = Field(default_factory=list, description="Technical domains from controlled vocabulary")
    equipment: List[str] = Field(default_factory=list, description="Required heavy, diagnostic, or field equipment")
    materials: List[str] = Field(default_factory=list, description="Required physical consumables and building materials")
    software_tools: List[str] = Field(default_factory=list, description="Software, simulation, CAD, or data tools")
    manpower: List[str] = Field(default_factory=list, description="Human resource roles, personnel count, or trades needed")
    complexity: Literal["low", "medium", "high"] = Field(default="medium", description="Estimated project execution complexity")
    estimated_duration_days: Optional[int] = Field(None, description="Estimated duration in days to complete assessment or pilot")
    budget_min: Optional[float] = Field(None, description="Minimum estimated budget in INR, if mentioned")
    budget_max: Optional[float] = Field(None, description="Maximum estimated budget in INR, if mentioned")
    safety_requirements: List[str] = Field(default_factory=list, description="Crucial safety protocols, PPE, or barricade guidelines")
    department_domain: str = Field(default="", description="Relevant government department or public sector domain")


class CapabilityResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    track_id: str
    ai_capability_status: str
    ai_capabilities: ExtractedCapabilities
    ai_capability_confidence: float = Field(..., ge=0.0, le=1.0)
    ai_capability_reasons: List[str] = Field(default_factory=list)
    ai_capability_model: Optional[str] = None
    ai_capability_analyzed_at: Optional[datetime] = None
    disclaimer: str = "AI-extracted requirements are suggestions and must be reviewed by authorized officials."
