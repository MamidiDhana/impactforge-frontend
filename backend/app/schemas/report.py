from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

# 24 Canonical Jharkhand Districts
JHARKHAND_DISTRICTS: List[str] = [
    "Ranchi",
    "East Singhbhum",
    "West Singhbhum",
    "Dhanbad",
    "Bokaro",
    "Deoghar",
    "Hazaribagh",
    "Giridih",
    "Ramgarh",
    "Dumka",
    "Gumla",
    "Simdega",
    "Lohardaga",
    "Palamu",
    "Chatra",
    "Latehar",
    "Sahibganj",
    "Pakur",
    "Godda",
    "Koderma",
    "Garhwa",
    "Khunti",
    "Saraikela-Kharsawan",
    "Jamtara",
]

# Alias dictionary for common district name variants
DISTRICT_ALIASES: Dict[str, str] = {
    "east singhbhum (jamshedpur)": "East Singhbhum",
    "east singhbhum": "East Singhbhum",
    "jamshedpur": "East Singhbhum",
    "west singhbhum": "West Singhbhum",
    "saraikela-kharsawan": "Saraikela-Kharsawan",
    "saraikela kharsawan": "Saraikela-Kharsawan",
    "seraikela-kharsawan": "Saraikela-Kharsawan",
    "seraikela kharsawan": "Saraikela-Kharsawan",
}


def normalize_jharkhand_district(district_raw: str) -> str:
    """Validates and returns canonical Jharkhand district name."""
    cleaned = district_raw.strip()
    lower = cleaned.lower()

    if lower in DISTRICT_ALIASES:
        return DISTRICT_ALIASES[lower]

    for d in JHARKHAND_DISTRICTS:
        if d.lower() == lower:
            return d

    raise ValueError(
        f"District '{district_raw}' is not a valid Jharkhand district. "
        f"Must be one of the 24 Jharkhand districts: {', '.join(JHARKHAND_DISTRICTS)}"
    )


class ReportStatus(str, Enum):
    OPEN = "Open"
    IN_PROGRESS = "In Progress"
    RESOLVED = "Resolved"
    REJECTED = "Rejected"


class ReportBase(BaseModel):
    problem_title: str = Field(..., min_length=3, max_length=255, description="Title of the reported problem")
    category: str = Field(..., min_length=2, max_length=100, description="Category of problem (e.g., Water / Facilities)")
    context_and_desired_outcome: Optional[str] = Field(None, description="Detailed problem background and desired outcome")
    existing_efforts: Optional[str] = Field(None, description="Previous or existing attempts to resolve the issue")
    expected_outcome: Optional[str] = Field(None, description="Measurable impact or expected resolution")
    state: str = Field(default="Jharkhand", description="State (restricted to Jharkhand)")
    district: str = Field(..., description="Jharkhand district name")
    locality: str = Field(..., min_length=1, max_length=150, description="City, village, block, or ward")
    address_or_landmark: str = Field(..., min_length=1, description="Specific location or landmark")
    latitude: Optional[float] = Field(None, description="GPS Latitude coordinate")
    longitude: Optional[float] = Field(None, description="GPS Longitude coordinate")
    priority: str = Field(default="Medium", description="Priority level (Low, Medium, High, Critical)")


class ReportCreate(ReportBase):
    @model_validator(mode="before")
    @classmethod
    def resolve_aliases(cls, data: Any) -> Any:
        """Allow common alternative field names sent from frontend or clients."""
        if isinstance(data, dict):
            # problem_title <- title
            if "problem_title" not in data and "title" in data:
                data["problem_title"] = data["title"]
            # context_and_desired_outcome <- description
            if "context_and_desired_outcome" not in data and "description" in data:
                data["context_and_desired_outcome"] = data["description"]
            # address_or_landmark <- address or landmark
            if "address_or_landmark" not in data:
                if "address" in data and data["address"]:
                    data["address_or_landmark"] = data["address"]
                elif "landmark" in data and data["landmark"]:
                    data["address_or_landmark"] = data["landmark"]
            # priority <- urgency
            if "priority" not in data and "urgency" in data:
                data["priority"] = data["urgency"]
        return data

    @field_validator("state")
    @classmethod
    def validate_state(cls, v: str) -> str:
        if v.strip().lower() != "jharkhand":
            raise ValueError("State must be restricted to 'Jharkhand'.")
        return "Jharkhand"

    @field_validator("district")
    @classmethod
    def validate_district(cls, v: str) -> str:
        return normalize_jharkhand_district(v)

    @field_validator("priority")
    @classmethod
    def validate_priority(cls, v: str) -> str:
        allowed = ["Low", "Medium", "High", "Critical"]
        for p in allowed:
            if p.lower() == v.strip().lower():
                return p
        return v.strip().capitalize()


class ReportStatusUpdate(BaseModel):
    status: ReportStatus = Field(..., description="Updated status (Open, In Progress, Resolved, Rejected)")


class ReportResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    track_id: str
    problem_title: str
    category: str
    context_and_desired_outcome: Optional[str] = None
    existing_efforts: Optional[str] = None
    expected_outcome: Optional[str] = None
    state: str
    district: str
    locality: str
    address_or_landmark: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    priority: str
    status: str
    created_at: datetime
    updated_at: datetime
