from datetime import datetime
from typing import Dict, List, Optional, Tuple
from pydantic import BaseModel, ConfigDict, Field

# Controlled Taxonomy for ImpactForge AI Categorization
# Categories reflect real ImpactForge civic sectors and public problem registries
CONTROLLED_TAXONOMY: Dict[str, Dict[str, List[str]]] = {
    "Water and Sanitation": {
        "Drinking Water Supply": [
            "Contaminated Water",
            "Pipeline Leak",
            "Dry Borewell",
            "Low Water Pressure",
            "Water Supply Disruption",
        ],
        "Sewage and Drainage": [
            "Open Drain Overflow",
            "Blocked Sewer",
            "Stagnant Wastewater",
            "Drainage Breach",
        ],
        "Sanitation Facilities": [
            "Damaged Public Toilet",
            "Lack of Hygiene Amenities",
            "Unsanitary Waste Disposal",
        ],
    },
    "Roads and Transport": {
        "Road Damage": [
            "Pothole",
            "Broken Pavement",
            "Road Caved In",
            "Unpaved Road Degradation",
        ],
        "Traffic and Safety": [
            "Missing Streetlight",
            "Broken Traffic Signal",
            "Dangerous Crossing",
            "Missing Guardrail",
        ],
        "Public Transit": [
            "Inadequate Bus Route",
            "Damaged Bus Shelter",
            "Transit Accessibility",
        ],
    },
    "Healthcare": {
        "Clinical Services": [
            "Doctor Shortage",
            "Medicine Out of Stock",
            "Sub-center Closed",
            "Diagnostic Facility Down",
        ],
        "Public Health": [
            "Disease Outbreak Risk",
            "Mosquito Breeding",
            "Immunization Gap",
            "Sanitation Hazard",
        ],
        "Emergency Services": [
            "Ambulance Delay",
            "Emergency Equipment Breakdown",
        ],
    },
    "Education": {
        "School Infrastructure": [
            "Damaged Classroom",
            "Lack of Drinking Water",
            "Electricity Failure",
            "Boundary Wall Collapse",
        ],
        "Learning Resources": [
            "Teacher Shortage",
            "Missing Study Materials",
            "Digital Lab Down",
        ],
    },
    "Agriculture": {
        "Irrigation and Water": [
            "Canal Blockage",
            "Drip System Failure",
            "Lift Irrigation Breakdown",
        ],
        "Crop and Soil": [
            "Soil Salinity/Degradation",
            "Pest Attack",
            "Cold Storage Breakdown",
            "Grain Storage Loss",
        ],
    },
    "Environment": {
        "Pollution Control": [
            "Illegal Waste Dumping",
            "Industrial Smoke",
            "River Pollution",
            "Plastic Waste Accumulation",
        ],
        "Forestry and Ecology": [
            "Deforestation",
            "Human-Wildlife Conflict",
            "Soil Erosion",
        ],
    },
    "Public Safety": {
        "Hazardous Conditions": [
            "Dark Unlit Alley",
            "Structural Building Hazard",
            "Exposed Live Wire",
            "Open Manhole",
        ],
        "Civic Security": [
            "Public Nuisance",
            "Unsafe Pedestrian Zone",
        ],
    },
    "Accessibility": {
        "Barrier-Free Access": [
            "Missing Ramps",
            "Broken Wheelchair Paths",
            "Inaccessible Public Building",
            "Lack of Tactile Paving",
        ],
    },
    "Rural Development": {
        "Village Connectivity": [
            "Bridge Connectivity Cut Off",
            "Culvert Damage",
            "Community Hall Damage",
            "Village Pathway Blocked",
        ],
    },
    "Digital Services": {
        "Civic Connectivity": [
            "CSC Center Offline",
            "Village Internet Outage",
            "Aadhaar Portal Failure",
            "Digital Kiosk Broken",
        ],
    },
    "Other": {
        "General Civic Issue": [
            "Uncategorized Grievance",
            "Miscellaneous Civic Need",
        ],
    },
}


def validate_taxonomy_item(
    category: str,
    subcategory: Optional[str] = None,
    problem_type: Optional[str] = None,
) -> Tuple[str, str, str, bool]:
    """
    Validates category, subcategory, and problem_type against CONTROLLED_TAXONOMY.
    If valid, returns (category, subcategory, problem_type, True).
    If category is invalid or unmapped, returns:
    ('Other', 'General Civic Issue', 'Uncategorized Grievance', False)
    """
    cleaned_cat = category.strip() if category else ""

    # Case-insensitive category match
    matched_cat_key = None
    for cat_key in CONTROLLED_TAXONOMY.keys():
        if cat_key.lower() == cleaned_cat.lower():
            matched_cat_key = cat_key
            break

    if not matched_cat_key:
        return ("Other", "General Civic Issue", "Uncategorized Grievance", False)

    subcats = CONTROLLED_TAXONOMY[matched_cat_key]

    # Validate subcategory
    matched_subcat_key = None
    if subcategory:
        cleaned_subcat = subcategory.strip().lower()
        for sub_key in subcats.keys():
            if sub_key.lower() == cleaned_subcat:
                matched_subcat_key = sub_key
                break

    # If subcategory wasn't specified or matched, pick default first subcategory
    if not matched_subcat_key:
        matched_subcat_key = next(iter(subcats.keys()))

    # Validate problem_type
    matched_pt = None
    valid_pts = subcats[matched_subcat_key]
    if problem_type:
        cleaned_pt = problem_type.strip().lower()
        for pt in valid_pts:
            if pt.lower() == cleaned_pt:
                matched_pt = pt
                break

    if not matched_pt:
        matched_pt = valid_pts[0] if valid_pts else "General Issue"

    return (matched_cat_key, matched_subcat_key, matched_pt, True)


class CategorizationOutput(BaseModel):
    category: str = Field(..., description="Top-level taxonomy category")
    subcategory: str = Field(..., description="Subcategory under category")
    problem_type: str = Field(..., description="Specific problem type")
    short_summary: str = Field(..., description="Concise summary of the civic problem")
    confidence_score: float = Field(..., ge=0.0, le=1.0, description="Confidence score between 0.0 and 1.0")
    analysis_status: str = Field(
        default="completed",
        description="Analysis state: completed, needs_review, failed, or skipped",
    )


class AIAnalysisResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    track_id: str
    category: Optional[str] = None
    subcategory: Optional[str] = None
    problem_type: Optional[str] = None
    short_summary: Optional[str] = None
    confidence_score: Optional[float] = None
    analysis_status: str
    model: Optional[str] = None
    analyzed_at: Optional[datetime] = None
