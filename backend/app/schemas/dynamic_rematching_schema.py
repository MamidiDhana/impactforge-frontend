from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class RematchingDiffItem(BaseModel):
    """
    Represents an entity-level change between previous and current recommendations.
    """
    entity_id: str
    entity_name: str
    change_type: str = Field(..., description="added, removed, score_changed, rank_changed, unchanged")
    old_score: Optional[float] = None
    new_score: Optional[float] = None
    old_level: Optional[str] = None
    new_level: Optional[str] = None
    notes: Optional[str] = None


class RematchingDiffSummary(BaseModel):
    """
    Aggregated differential summary across all matching categories.
    """
    hei_diffs: List[RematchingDiffItem] = Field(default_factory=list)
    faculty_diffs: List[RematchingDiffItem] = Field(default_factory=list)
    student_diffs: List[RematchingDiffItem] = Field(default_factory=list)
    partner_diffs: List[RematchingDiffItem] = Field(default_factory=list)
    capability_gap_diff: Optional[Dict[str, Any]] = None
    total_added: int = 0
    total_removed: int = 0
    total_changed: int = 0


class RematchingEventRecord(BaseModel):
    """
    Complete rematching event record for officials, administrators, and connected partners/institutions.
    """
    id: int
    report_id: int
    track_id: str
    trigger_type: str
    trigger_source: str
    changed_fields: List[str] = Field(default_factory=list)
    affected_matching_types: List[str] = Field(default_factory=list)
    previous_matching_snapshot: Dict[str, Any] = Field(default_factory=dict)
    new_matching_snapshot: Dict[str, Any] = Field(default_factory=dict)
    diff_summary: Optional[Dict[str, Any]] = None
    status: str
    error_message: Optional[str] = None
    created_at: datetime
    completed_at: Optional[datetime] = None
    created_by: str


class CitizenRematchingEventRecord(BaseModel):
    """
    Privacy-safe rematching event record for citizens.
    Omits private contact info, executive details, and detailed commercial metrics.
    """
    id: int
    track_id: str
    trigger_type: str
    changed_fields: List[str] = Field(default_factory=list)
    affected_matching_types: List[str] = Field(default_factory=list)
    status: str
    summary_notes: str
    created_at: datetime
    completed_at: Optional[datetime] = None


class RematchingStatusResponse(BaseModel):
    """
    Current dynamic rematching status and metadata for a civic report.
    """
    track_id: str
    ai_rematching_status: str  # idle, pending, running, completed, failed
    ai_rematching_version: int = 1
    ai_last_rematched_at: Optional[datetime] = None
    ai_rematching_reason: Optional[str] = None
    latest_event: Optional[RematchingEventRecord] = None
    advisory_warning: str = (
        "AI dynamic re-matching is strictly advisory and does not automatically allocate funds, "
        "transfer capital, or alter civic report resolution status."
    )


class RematchingHistoryResponse(BaseModel):
    """
    Chronological rematching history response for officials and authorized stakeholders.
    """
    track_id: str
    total_events: int
    events: List[RematchingEventRecord] = Field(default_factory=list)
    advisory_warning: str = (
        "AI dynamic re-matching is strictly advisory and does not automatically allocate funds, "
        "transfer capital, or alter civic report resolution status."
    )


class CitizenRematchingHistoryResponse(BaseModel):
    """
    Privacy-safe chronological rematching history for citizens.
    """
    track_id: str
    total_events: int
    events: List[CitizenRematchingEventRecord] = Field(default_factory=list)
    advisory_warning: str = (
        "AI dynamic re-matching is strictly advisory and does not automatically allocate funds, "
        "transfer capital, or alter civic report resolution status."
    )


class ManualRematchRequest(BaseModel):
    """
    Payload for triggering on-demand rematching by Government or Super Admin.
    """
    reason: Optional[str] = Field("Manual administrative rematching review", max_length=500)
    affected_types: Optional[List[str]] = Field(
        None,
        description="Optional subset of matching modules to re-evaluate (hei, faculty, student, capability_gap, partner). Defaults to all.",
    )


class ManualRematchResponse(BaseModel):
    """
    Response returned after triggering dynamic rematching.
    """
    success: bool
    message: str
    version: int
    event: Optional[RematchingEventRecord] = None
    diff_summary: Optional[Dict[str, Any]] = None
    advisory_warning: str = (
        "AI dynamic re-matching is strictly advisory and does not automatically allocate funds, "
        "transfer capital, or alter civic report resolution status."
    )
