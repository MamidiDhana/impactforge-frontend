from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class FacultyFactorScores(BaseModel):
    """
    Explainable factor scores for Faculty matching (Total: 100%).
    """
    skills: float = Field(..., ge=0.0, le=35.0, description="Skill Match (35%)")
    technical_domains: float = Field(..., ge=0.0, le=25.0, description="Technical Domain Match (25%)")
    relevant_experience: float = Field(..., ge=0.0, le=15.0, description="Relevant Research & Project Experience (15%)")
    availability_workload: float = Field(..., ge=0.0, le=15.0, description="Availability and Workload (15%)")
    location_hei_relevance: float = Field(..., ge=0.0, le=10.0, description="Location and HEI Relevance (10%)")


class StudentFactorScores(BaseModel):
    """
    Explainable factor scores for Student matching (Total: 100%).
    """
    skills: float = Field(..., ge=0.0, le=30.0, description="Required Skills Match (30%)")
    technical_domains: float = Field(..., ge=0.0, le=20.0, description="Technical Domain Match (20%)")
    student_interests: float = Field(..., ge=0.0, le=20.0, description="Student Interests Alignment (20%)")
    availability_workload: float = Field(..., ge=0.0, le=15.0, description="Availability and Current Workload (15%)")
    location_hei_relevance: float = Field(..., ge=0.0, le=15.0, description="Institution and Location Relevance (15%)")


class FacultyRecommendationMatch(BaseModel):
    """
    A single recommended faculty member matched to a civic report.
    """
    faculty_id: str
    name: str
    institution_id: str
    institution_name: str
    department: str
    district: str
    state: str = "Jharkhand"
    verification_status: str = "unverified"
    availability: str = "available"
    current_workload: int = 2
    research_expertise: List[str] = Field(default_factory=list)
    match_score: float = Field(..., ge=0.0, le=100.0)
    recommendation_level: str = Field(..., description="low, moderate, strong, excellent")
    factor_scores: FacultyFactorScores
    matched_skills: List[str] = Field(default_factory=list)
    missing_skills: List[str] = Field(default_factory=list)
    reasons: List[str] = Field(default_factory=list)
    confidence: float = Field(default=0.85, ge=0.0, le=1.0)


class StudentRecommendationMatch(BaseModel):
    """
    A single recommended student matched to a civic report.
    """
    student_id: str
    name: str
    institution_id: str
    institution_name: str
    department: str
    district: str
    state: str = "Jharkhand"
    verification_status: str = "unverified"
    availability: str = "available"
    current_workload: int = 1
    interests: List[str] = Field(default_factory=list)
    match_score: float = Field(..., ge=0.0, le=100.0)
    recommendation_level: str = Field(..., description="low, moderate, strong, excellent")
    factor_scores: StudentFactorScores
    matched_skills: List[str] = Field(default_factory=list)
    missing_skills: List[str] = Field(default_factory=list)
    reasons: List[str] = Field(default_factory=list)
    confidence: float = Field(default=0.85, ge=0.0, le=1.0)


class FacultyInterestRecord(BaseModel):
    """
    Historical log of an official recommendation or expression of interest for a faculty profile.
    """
    id: int
    report_id: int
    track_id: str
    faculty_id: str
    faculty_name: str
    institution_id: str
    action_type: str  # official_recommendation | expression_of_interest
    actor_user_id: Optional[int] = None
    actor_name: str
    actor_role: str
    actor_email: str
    remarks: str
    created_at: datetime


class StudentInterestRecord(BaseModel):
    """
    Historical log of an official recommendation or expression of interest for a student profile.
    """
    id: int
    report_id: int
    track_id: str
    student_id: str
    student_name: str
    institution_id: str
    action_type: str  # official_recommendation | expression_of_interest
    actor_user_id: Optional[int] = None
    actor_name: str
    actor_role: str
    actor_email: str
    remarks: str
    created_at: datetime


class FacultyMatchingResponse(BaseModel):
    """
    Response returned by GET /api/reports/{track_id}/faculty-matches
    """
    track_id: str
    ai_faculty_matching_status: str
    matches: List[FacultyRecommendationMatch] = Field(default_factory=list)
    recorded_interests: List[FacultyInterestRecord] = Field(default_factory=list)
    model: Optional[str] = None
    analyzed_at: Optional[datetime] = None
    disclaimer: str = (
        "AI recommendations are advisory only. Academic collaboration requires "
        "official administrative approval and institutional consent."
    )


class StudentMatchingResponse(BaseModel):
    """
    Response returned by GET /api/reports/{track_id}/student-matches
    """
    track_id: str
    ai_student_matching_status: str
    matches: List[StudentRecommendationMatch] = Field(default_factory=list)
    recorded_interests: List[StudentInterestRecord] = Field(default_factory=list)
    model: Optional[str] = None
    analyzed_at: Optional[datetime] = None
    disclaimer: str = (
        "AI recommendations are advisory only. Student engagement requires "
        "faculty mentorship approval and institutional verification."
    )


class FacultyInterestCreate(BaseModel):
    """
    Payload to record faculty recommendation or interest.
    """
    faculty_id: str
    remarks: str = Field(..., min_length=3, max_length=1000)


class FacultyInterestActionResponse(BaseModel):
    status: str = "success"
    action_type: str
    track_id: str
    faculty_id: str
    faculty_name: str
    recorded_by: str
    remarks: str
    created_at: datetime
    disclaimer: str = (
        "AI recommendations are advisory only. Academic collaboration requires "
        "official administrative approval and institutional consent."
    )


class StudentInterestCreate(BaseModel):
    """
    Payload to record student recommendation or interest.
    """
    student_id: str
    remarks: str = Field(..., min_length=3, max_length=1000)


class StudentInterestActionResponse(BaseModel):
    status: str = "success"
    action_type: str
    track_id: str
    student_id: str
    student_name: str
    recorded_by: str
    remarks: str
    created_at: datetime
    disclaimer: str = (
        "AI recommendations are advisory only. Student engagement requires "
        "faculty mentorship approval and institutional verification."
    )
