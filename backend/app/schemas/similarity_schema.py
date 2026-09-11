from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field


class SimilarProblemMatch(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    matching_track_id: str = Field(..., description="Track ID of the matching report")
    similarity_score: float = Field(..., ge=0.0, le=1.0, description="Cosine similarity score (0.00 to 1.00)")
    similarity_level: str = Field(
        ...,
        description="Level: 'possible similarity' (0.55-0.74), 'strong similarity' (0.75-0.84), or 'probable duplicate' (>=0.85)",
    )
    category: str = Field(..., description="Problem category of the matching report")
    district: str = Field(..., description="Jharkhand district")
    location: str = Field(..., description="Locality or landmark details")
    title: str = Field(..., description="Report title or short summary")
    status: str = Field(..., description="Current governance status of the matching report")


class SimilarProblemsResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    track_id: str
    status: str = Field(
        ...,
        description="Analysis state: 'completed', 'no_matches', 'needs_review', 'failed', or 'pending'",
    )
    matches: List[SimilarProblemMatch] = Field(
        default_factory=list,
        description="List of up to 5 similar reports ranked descending by similarity score",
    )
    model: Optional[str] = None
    analyzed_at: Optional[datetime] = None
    disclaimer: str = Field(
        default="Possible similar reports found. Please review before taking action.",
        description="Advisory notice confirming this is not an official automatic merge or deletion",
    )
