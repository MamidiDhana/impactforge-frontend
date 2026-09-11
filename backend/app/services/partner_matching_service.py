import logging
from datetime import datetime, timezone
from typing import Dict, List, Any, Optional, Tuple

from sqlalchemy.orm import Session
from sqlalchemy import text

from app.models.report import Report
from app.models.partner import PartnerProfile, PartnerInterest
from app.models.audit_log import AuditLog
from app.schemas.partner_matching_schema import (
    PartnerFactorScores,
    PartnerRecommendationMatch,
    CitizenPartnerRecommendation,
    PartnerMatchingResponse,
    CitizenPartnerMatchingResponse,
)

logger = logging.getLogger("partner_matching_service")

# -------------------------------------------------------------------------
# Realistic demonstrational partner profiles across Jharkhand
# Note: In accordance with safety policies, all demo partners have verification_status="unverified".
# -------------------------------------------------------------------------
SEED_PARTNER_PROFILES = [
    {
        "partner_id": "DEMO-PARTNER-01",
        "organization_name": "Tata Steel Foundation (Demo CSR)",
        "partner_type": "CSR",
        "location": "East Singhbhum (Jamshedpur)",
        "service_districts": ["East Singhbhum", "Saraikela Kharsawan", "West Singhbhum", "Ranchi", "Ramgarh"],
        "supported_domains": ["Civil Infrastructure", "Water and Sanitation", "Public Health", "Rural Roads", "Education Infrastructure"],
        "supported_skills": ["Civil Engineering", "Structural Assessment", "Water Quality Management", "Project Management", "Masonry and Construction"],
        "equipment": ["Backhoe Loader Excavator", "Industrial Dewatering Pumps", "Water Quality Testing Kit", "Concrete Compactor", "Mobile Health Van"],
        "materials": ["TMT Steel Rebars", "Portland Slag Cement (PSC)", "HDPE Pipe Bundles", "Precast Concrete Culverts", "Gravel & Aggregates"],
        "software_tools": ["AutoCAD Civil 3D", "GIS Project Tracker", "SAP ERP", "Primavera"],
        "manpower_support": ["Civil Site Supervisors", "Heavy Machinery Operators", "Certified Masons", "Community Mobilizers", "Project Engineers"],
        "funding_capacity": "extensive",
        "maximum_project_budget": 2500000.0,
        "support_types": ["funding", "materials", "equipment", "manpower", "comprehensive"],
        "previous_experience": {
            "completed_projects": 48,
            "focus_areas": ["Drinking Water Networks", "Village Road Surfacing", "Drainage Canals"],
            "sector_experience_years": 15,
        },
        "availability": "immediate",
        "verification_status": "unverified",
        "contact_email": "csr.demo@tatasteelfoundation.org.demo",
        "associated_user_email": "partner@impactforge.org",
    },
    {
        "partner_id": "DEMO-PARTNER-02",
        "organization_name": "Jindal Steel & Power CSR Wing (Demo CSR)",
        "partner_type": "CSR",
        "location": "Ramgarh",
        "service_districts": ["Ramgarh", "Hazaribagh", "Ranchi", "Bokaro"],
        "supported_domains": ["Roads and Transport", "Civil Infrastructure", "Industrial Safety", "Community Sanitation"],
        "supported_skills": ["Pavement Engineering", "Structural Fabrication", "Drainage Network Design", "Welding & Steel Fabrication"],
        "equipment": ["Road Roller (Vibratory)", "Hydraulic Excavator", "Bitumen Sprayer", "Industrial Generator 50kVA", "Jackhammers"],
        "materials": ["Structural Steel Sections", "Bitumen Emulsion", "Crushed Stone Aggregates", "Steel Culvert Sheets"],
        "software_tools": ["STAAD.Pro", "Civil GIS Mapper"],
        "manpower_support": ["Pavement Construction Crew", "Certified Welders", "Safety Officers", "Site Foremen"],
        "funding_capacity": "high",
        "maximum_project_budget": 1800000.0,
        "support_types": ["funding", "materials", "equipment", "manpower"],
        "previous_experience": {
            "completed_projects": 32,
            "focus_areas": ["Industrial Corridor Access Roads", "Bridge Approaches"],
            "sector_experience_years": 12,
        },
        "availability": "immediate",
        "verification_status": "unverified",
        "contact_email": "csr.patratu@jindalsteel.demo",
        "associated_user_email": None,
    },
    {
        "partner_id": "DEMO-PARTNER-03",
        "organization_name": "Bharat Coking Coal Limited CSR Cell (Demo Industry)",
        "partner_type": "industry",
        "location": "Dhanbad",
        "service_districts": ["Dhanbad", "Bokaro", "Giridih", "Deoghar"],
        "supported_domains": ["Environmental Remediation", "Water Drainage & Mine Discharge", "Road Maintenance", "Earthworks"],
        "supported_skills": ["Heavy Earthmoving", "Mine Water Neutralization", "Slope Stabilization", "Industrial Dewatering"],
        "equipment": ["Heavy Bulldozer D85", "Multi-stage Slurry Pump 100HP", "Water Tankers (10,000L)", "Hydraulic Breaker", "Mobile Floodlights"],
        "materials": ["Industrial Lime / Neutralizing Agents", "Geotextile Membrane", "Heavy Iron Pipes 8-inch", "Sandbags & Gabion Mesh"],
        "software_tools": ["Minex GIS", "Surpac", "Environmental Monitoring Portal"],
        "manpower_support": ["Heavy Earthmoving Equipment Operators", "Pumping Station Technicians", "Environmental Engineers"],
        "funding_capacity": "extensive",
        "maximum_project_budget": 3000000.0,
        "support_types": ["equipment", "manpower", "funding", "materials"],
        "previous_experience": {
            "completed_projects": 55,
            "focus_areas": ["Mine-affected area road repairs", "Potable water supply to colliery bastis"],
            "sector_experience_years": 20,
        },
        "availability": "immediate",
        "verification_status": "unverified",
        "contact_email": "csr.dhanbad@bccl.gov.in.demo",
        "associated_user_email": None,
    },
    {
        "partner_id": "DEMO-PARTNER-04",
        "organization_name": "Ramky Waste & Clean Environment Solutions (Demo Supplier)",
        "partner_type": "supplier",
        "location": "Ranchi",
        "service_districts": ["Ranchi", "Khunti", "Lohardaga", "Gumla", "Ramgarh"],
        "supported_domains": ["Waste Management", "Public Sanitation", "Bio-medical Waste", "Septage & Drainage Cleaning"],
        "supported_skills": ["Solid Waste Processing", "Sewer Suction & Jetting", "Hazardous Waste Handling", "Sanitation Audit"],
        "equipment": ["Super Sucker Sewer Cleaning Machine", "High Pressure Jetting Machine", "Compactor Garbage Trucks", "Waste Shredder", "Bio-methanation Unit"],
        "materials": ["Disinfectant Chemical Drums", "HDPE Waste Bins (240L)", "Protective Hazmat PPE Kits", "Biodegradable Liner Bags"],
        "software_tools": ["Route Optimization GPS", "Fleet Management System", "Waste Tracking ERP"],
        "manpower_support": ["Certified Sanitation Workers", "Sanitary Technicians", "Fleet Drivers", "Hazardous Material Handlers"],
        "funding_capacity": "moderate",
        "maximum_project_budget": 800000.0,
        "support_types": ["equipment", "manpower", "materials"],
        "previous_experience": {
            "completed_projects": 26,
            "focus_areas": ["Urban Drain Desilting", "Ranchi Municipal Ward Waste Segregation"],
            "sector_experience_years": 8,
        },
        "availability": "immediate",
        "verification_status": "unverified",
        "contact_email": "operations.ranchi@ramkyclean.demo",
        "associated_user_email": None,
    },
    {
        "partner_id": "DEMO-PARTNER-05",
        "organization_name": "Jharkhand Rural Technology & Ecology Mission (Demo NGO)",
        "partner_type": "NGO",
        "location": "Ranchi",
        "service_districts": ["Ranchi", "Gumla", "Simdega", "Latehar", "Palamu", "Garhwa", "Khunti", "West Singhbhum"],
        "supported_domains": ["Renewable Energy", "Solar Mini-grids", "Rainwater Harvesting", "Community Drinking Water", "Rural Electrification"],
        "supported_skills": ["Solar PV Installation", "Micro-hydro Maintenance", "Community Water Filtration", "Jal Sahiya Training", "Low-cost Sanitation"],
        "equipment": ["Solar Panel Diagnostic Multimeters", "Pipe Threading Machine", "Water Hardness & Fluoride Test Kit", "Hand Drilling Rig"],
        "materials": ["Monocrystalline Solar Panels 330W", "Deep-cycle Tubular Batteries", "Solar Charge Controllers", "Bio-sand Filter Media", "UPVC Fittings"],
        "software_tools": ["PVsyst Solar Planner", "Open Data Kit (ODK)", "Mobile Survey App"],
        "manpower_support": ["Solar Electricians", "Barefoot Hydrologists", "Community Field Animators", "Women Self-Help Group Organizers"],
        "funding_capacity": "moderate",
        "maximum_project_budget": 600000.0,
        "support_types": ["technical_advisory", "manpower", "equipment", "funding"],
        "previous_experience": {
            "completed_projects": 41,
            "focus_areas": ["Solar water pump installations in Gumla", "Village check-dam restorations"],
            "sector_experience_years": 10,
        },
        "availability": "immediate",
        "verification_status": "unverified",
        "contact_email": "director@jharkhandruraltech.demo",
        "associated_user_email": None,
    },
    {
        "partner_id": "DEMO-PARTNER-06",
        "organization_name": "Eastern Equipment & Heavy Machinery Rentals (Demo Supplier)",
        "partner_type": "supplier",
        "location": "Bokaro",
        "service_districts": ["Bokaro", "Dhanbad", "Giridih", "Ranchi", "Ramgarh", "Purulia"],
        "supported_domains": ["Heavy Civil Works", "Pavement Construction", "Trenching & Excavation", "Bridge Fabrication"],
        "supported_skills": ["Heavy Rigging", "Precision Trenching", "Concrete Pumping", "Pothole Milling"],
        "equipment": ["JCB 3DX EcoXcellence Backhoe", "Crawler Crane 40-Ton", "Transit Mixer 6-cum", "Pavement Milling Machine", "Plate Compactors"],
        "materials": ["Precast Drainage Slabs", "Steel Shoring Plates", "Barricade Cones & Hazard Tapes", "Ready Mix Concrete (RMC)"],
        "software_tools": ["Fleet Telematics GPS", "Heavy Equipment ERP"],
        "manpower_support": ["Certified Crane Operators", "Heavy Excavator Drivers", "Mechanical Maintenance Technicians"],
        "funding_capacity": "moderate",
        "maximum_project_budget": 750000.0,
        "support_types": ["equipment", "materials", "manpower"],
        "previous_experience": {
            "completed_projects": 38,
            "focus_areas": ["Bokaro Steel City drainage widening", "NH33 road expansion machinery supply"],
            "sector_experience_years": 14,
        },
        "availability": "2_weeks",
        "verification_status": "unverified",
        "contact_email": "rentals@easternequip.demo",
        "associated_user_email": None,
    },
    {
        "partner_id": "DEMO-PARTNER-07",
        "organization_name": "Dalmia Bharat Cement CSR Initiatives (Demo CSR)",
        "partner_type": "CSR",
        "location": "Bokaro",
        "service_districts": ["Bokaro", "Dhanbad", "Ranchi", "Deoghar", "Dumka"],
        "supported_domains": ["Rural Housing & Infrastructure", "Water Conservation", "Pothole Patching & Road Safety", "School Sanitation"],
        "supported_skills": ["Concrete Technology", "Water Pond Desilting", "Cost-effective Construction", "Mason Skill Certification"],
        "equipment": ["Concrete Mixture Machine", "Slurry Paver", "Compressor Jackhammer", "Moisture Density Gauge"],
        "materials": ["Portland Pozzolana Cement (PPC)", "Ready-mix Mortar", "Paver Blocks", "Sanitary Ceramics", "Rainwater Harvesting Catchment Units"],
        "software_tools": ["Construction Quality App", "Cement Batch Tracker"],
        "manpower_support": ["Certified Civil Foremen", "Master Masons", "Rural Livelihood Coordinators"],
        "funding_capacity": "high",
        "maximum_project_budget": 1500000.0,
        "support_types": ["funding", "materials", "manpower", "equipment"],
        "previous_experience": {
            "completed_projects": 35,
            "focus_areas": ["Check-dam construction in Bokaro", "Paved village roads in Chandankiyari"],
            "sector_experience_years": 11,
        },
        "availability": "immediate",
        "verification_status": "unverified",
        "contact_email": "csr.bokaro@dalmiacement.demo",
        "associated_user_email": None,
    },
]


def normalize_token(s: str) -> str:
    """Normalize string for fuzzy substring matching."""
    return s.strip().lower()


def evaluate_equipment_materials_score(
    missing_equipment: List[str],
    missing_materials: List[str],
    partner_equipment: List[str],
    partner_materials: List[str],
    partner_support_types: List[str],
) -> Tuple[float, List[str], List[str]]:
    """
    Evaluates Factor 1: Missing Equipment & Materials Support (Weight: 25%).
    Returns: (score out of 25.0, matched_items, missing_items)
    """
    needed_items = list(dict.fromkeys(missing_equipment + missing_materials))
    partner_pool = [normalize_token(x) for x in (partner_equipment + partner_materials)]
    support_types_lower = [normalize_token(x) for x in partner_support_types]

    matched: List[str] = []
    unmatched: List[str] = []

    if not needed_items:
        # If no specific equipment/material was missing from the academic team,
        # assess general equipment/materials supply capability
        has_equip_supp = "equipment" in support_types_lower or bool(partner_equipment)
        has_mat_supp = "materials" in support_types_lower or bool(partner_materials)
        base = 22.0 if (has_equip_supp and has_mat_supp) else (18.0 if (has_equip_supp or has_mat_supp) else 12.0)
        return min(25.0, base), partner_equipment[:2] + partner_materials[:2], []

    for item in needed_items:
        item_norm = normalize_token(item)
        if any(item_norm in p or p in item_norm for p in partner_pool):
            matched.append(item)
        else:
            unmatched.append(item)

    match_ratio = len(matched) / len(needed_items)
    # Score has two parts: exact item match ratio (20 pts) + supply type support bonus (5 pts)
    type_bonus = 0.0
    if "equipment" in support_types_lower or "materials" in support_types_lower or "comprehensive" in support_types_lower:
        type_bonus = 5.0

    score = round((match_ratio * 20.0) + type_bonus, 1)
    return min(25.0, max(0.0, score)), matched, unmatched


def evaluate_funding_capacity_score(
    report_budget_max: float,
    budget_gap_str: Optional[str],
    partner_max_budget: float,
    funding_capacity: str,
    partner_type: str,
    partner_support_types: List[str],
) -> Tuple[float, List[str]]:
    """
    Evaluates Factor 2: Funding and Budget Capacity (Weight: 20%).
    Returns: (score out of 20.0, rationale_points)
    """
    cap_norm = funding_capacity.strip().lower()
    support_lower = [normalize_token(x) for x in partner_support_types]
    p_type_norm = partner_type.strip().lower()
    has_funding = "funding" in support_lower or p_type_norm in ["csr", "ngo"]

    rationale: List[str] = []

    # If partner does not provide funding (e.g. pure equipment rental)
    if not has_funding:
        rationale.append("Partner provides in-kind assets/labor without direct monetary sponsorship.")
        return 5.0, rationale

    # Base score by funding capacity category
    cap_scores = {
        "extensive": 16.0,
        "high": 14.0,
        "moderate": 11.0,
        "low": 7.0,
    }
    score = cap_scores.get(cap_norm, 10.0)

    # Budget headroom evaluation
    if report_budget_max > 0:
        if partner_max_budget >= report_budget_max:
            score += 4.0
            rationale.append(f"Partner maximum budget (₹{partner_max_budget:,.0f}) fully covers project scale (₹{report_budget_max:,.0f}).")
        elif partner_max_budget >= 0.5 * report_budget_max:
            score += 2.0
            rationale.append(f"Partner budget (₹{partner_max_budget:,.0f}) provides substantial co-funding toward project.")
        else:
            rationale.append(f"Partner budget (₹{partner_max_budget:,.0f}) provides partial micro-grant support.")
    else:
        # Default budget headroom bonus
        score += 3.0
        rationale.append(f"High funding capacity ({funding_capacity}) suitable for civic infrastructure co-sponsorship.")

    return min(20.0, max(0.0, round(score, 1))), rationale


def evaluate_domains_and_skills_score(
    report_domains: List[str],
    missing_skills: List[str],
    partner_domains: List[str],
    partner_skills: List[str],
) -> Tuple[float, List[str], List[str]]:
    """
    Evaluates Factor 3: Technical Domain and Skill Support (Weight: 20%).
    Returns: (score out of 20.0, matched_areas, missing_areas)
    """
    partner_domains_norm = [normalize_token(d) for d in partner_domains]
    partner_skills_norm = [normalize_token(s) for s in partner_skills]

    matched_areas: List[str] = []
    missing_areas: List[str] = []

    # Domain evaluation (12 pts)
    domain_score = 0.0
    if report_domains:
        d_hits = 0
        for d in report_domains:
            d_norm = normalize_token(d)
            if any(d_norm in pd or pd in d_norm for pd in partner_domains_norm):
                d_hits += 1
                matched_areas.append(f"Domain: {d}")
            else:
                missing_areas.append(f"Domain: {d}")
        domain_score = (d_hits / len(report_domains)) * 12.0
    else:
        domain_score = 10.0

    # Skill evaluation (8 pts)
    skill_score = 0.0
    if missing_skills:
        s_hits = 0
        for s in missing_skills:
            s_norm = normalize_token(s)
            if any(s_norm in ps or ps in s_norm for ps in partner_skills_norm):
                s_hits += 1
                matched_areas.append(f"Skill: {s}")
            else:
                missing_areas.append(f"Skill: {s}")
        skill_score = (s_hits / len(missing_skills)) * 8.0
    else:
        skill_score = 7.0

    total = round(domain_score + skill_score, 1)
    return min(20.0, max(0.0, total)), matched_areas, missing_areas


def evaluate_manpower_score(
    missing_manpower: List[str],
    partner_manpower: List[str],
    partner_support_types: List[str],
) -> Tuple[float, List[str]]:
    """
    Evaluates Factor 4: Manpower and Operational Support (Weight: 15%).
    Returns: (score out of 15.0, matched_manpower)
    """
    support_lower = [normalize_token(x) for x in partner_support_types]
    partner_crew_norm = [normalize_token(m) for m in partner_manpower]

    matched: List[str] = []

    if not missing_manpower:
        if "manpower" in support_lower or bool(partner_manpower):
            return 14.0, partner_manpower[:2]
        return 10.0, []

    hits = 0
    for req in missing_manpower:
        req_norm = normalize_token(req)
        if any(req_norm in pc or pc in req_norm for pc in partner_crew_norm):
            hits += 1
            matched.append(req)

    match_ratio = hits / len(missing_manpower)
    bonus = 3.0 if ("manpower" in support_lower or "operational" in support_lower) else 0.0
    score = round((match_ratio * 12.0) + bonus, 1)
    return min(15.0, max(0.0, score)), matched


def evaluate_location_score(
    report_district: str,
    partner_location: str,
    service_districts: List[str],
) -> Tuple[float, str]:
    """
    Evaluates Factor 5: Location and Service-District Relevance (Weight: 10%).
    Returns: (score out of 10.0, explanation)
    """
    rep_dist_norm = normalize_token(report_district)
    loc_norm = normalize_token(partner_location)
    svc_norm = [normalize_token(d) for d in service_districts]

    if rep_dist_norm in loc_norm or loc_norm in rep_dist_norm:
        return 10.0, f"Primary operational base located directly within {report_district}."

    if any(rep_dist_norm in s or s in rep_dist_norm for s in svc_norm):
        return 8.5, f"Report district '{report_district}' is within partner's active service coverage."

    if any(x in svc_norm for x in ["jharkhand", "all districts", "state-wide", "pan-jharkhand"]):
        return 6.0, "State-wide operational mandate covering all Jharkhand districts."

    return 3.0, f"Based in {partner_location}; remote deployment or transit mobilization required."


def evaluate_experience_score(
    experience_dict: Dict[str, Any],
    availability: str,
    partner_type: str,
) -> Tuple[float, List[str]]:
    """
    Evaluates Factor 6: Previous Experience and Reliability (Weight: 10%).
    Returns: (score out of 10.0, rationale)
    """
    completed = experience_dict.get("completed_projects", 0)
    years = experience_dict.get("sector_experience_years", 5)

    base = 4.0
    if completed >= 35 or years >= 12:
        base = 7.0
    elif completed >= 20 or years >= 8:
        base = 5.5
    elif completed >= 10:
        base = 4.5

    # Availability adjustment
    avail_norm = availability.strip().lower()
    avail_bonus = 3.0
    if avail_norm == "immediate":
        avail_bonus = 3.0
    elif avail_norm in ["2_weeks", "two_weeks"]:
        avail_bonus = 1.5
    else:
        avail_bonus = 0.5

    total = round(base + avail_bonus, 1)
    rationale = [
        f"{completed} completed civic/CSR projects across {years} years of institutional operation.",
        f"Mobilization availability: '{availability}'."
    ]
    return min(10.0, max(0.0, total)), rationale


def score_single_partner(
    partner: Any,
    report: Report,
    extracted_caps: Dict[str, Any],
    gap_analysis: Dict[str, Any],
) -> PartnerRecommendationMatch:
    """
    Calculates explainable 6-factor score for a single partner against the civic report
    and its Part 8 capability gap analysis.
    """
    # Extract partner fields safely (handles both ORM model and dict)
    if isinstance(partner, dict):
        p_id = partner["partner_id"]
        p_name = partner["organization_name"]
        p_type = partner["partner_type"]
        p_loc = partner["location"]
        p_districts = partner.get("service_districts", [])
        p_domains = partner.get("supported_domains", [])
        p_skills = partner.get("supported_skills", [])
        p_equip = partner.get("equipment", [])
        p_mat = partner.get("materials", [])
        p_soft = partner.get("software_tools", [])
        p_manpower = partner.get("manpower_support", [])
        p_funding_cap = partner.get("funding_capacity", "moderate")
        p_max_budget = float(partner.get("maximum_project_budget", 500000.0))
        p_supp_types = partner.get("support_types", [])
        p_exp = partner.get("previous_experience", {})
        p_avail = partner.get("availability", "immediate")
        p_verif = partner.get("verification_status", "unverified")
        p_email = partner.get("contact_email")
    else:
        p_id = partner.partner_id
        p_name = partner.organization_name
        p_type = partner.partner_type
        p_loc = partner.location
        p_districts = partner.service_districts or []
        p_domains = partner.supported_domains or []
        p_skills = partner.supported_skills or []
        p_equip = partner.equipment or []
        p_mat = partner.materials or []
        p_soft = partner.software_tools or []
        p_manpower = partner.manpower_support or []
        p_funding_cap = partner.funding_capacity
        p_max_budget = float(partner.maximum_project_budget or 500000.0)
        p_supp_types = partner.support_types or []
        p_exp = partner.previous_experience or {}
        p_avail = partner.availability
        p_verif = partner.verification_status
        p_email = partner.contact_email

    # Extract report requirements
    missing_equip = gap_analysis.get("missing_equipment", []) if gap_analysis else extracted_caps.get("equipment", [])
    missing_mat = gap_analysis.get("missing_materials", []) if gap_analysis else extracted_caps.get("materials", [])
    missing_skills = gap_analysis.get("missing_skills", []) if gap_analysis else extracted_caps.get("required_skills", [])
    missing_manpower = gap_analysis.get("missing_manpower", []) if gap_analysis else extracted_caps.get("manpower", [])
    missing_budget_str = gap_analysis.get("missing_budget_requirements") if gap_analysis else None

    # Budget max from extracted caps or default based on complexity
    budget_dict = extracted_caps.get("budget_range") or {}
    report_budget_max = float(budget_dict.get("max") or 0.0)
    if report_budget_max <= 0:
        complexity = (extracted_caps.get("project_complexity") or "Medium").lower()
        if complexity == "high":
            report_budget_max = 1200000.0
        elif complexity == "low":
            report_budget_max = 250000.0
        else:
            report_budget_max = 600000.0

    report_domains = extracted_caps.get("technical_domains", [])
    if report.category and report.category not in report_domains:
        report_domains = list(report_domains) + [report.category]

    # 1. Equipment & Materials (25%)
    equip_score, matched_assets, missing_assets = evaluate_equipment_materials_score(
        missing_equip, missing_mat, p_equip, p_mat, p_supp_types
    )

    # 2. Funding & Budget Capacity (20%)
    funding_score, funding_rationale = evaluate_funding_capacity_score(
        report_budget_max, missing_budget_str, p_max_budget, p_funding_cap, p_type, p_supp_types
    )

    # 3. Domains & Skills (20%)
    domain_score, matched_domains, missing_domains = evaluate_domains_and_skills_score(
        report_domains, missing_skills, p_domains, p_skills
    )

    # 4. Manpower & Operations (15%)
    manpower_score, matched_crew = evaluate_manpower_score(
        missing_manpower, p_manpower, p_supp_types
    )

    # 5. Location Relevance (10%)
    loc_score, loc_explanation = evaluate_location_score(
        report.district, p_loc, p_districts
    )

    # 6. Experience & Reliability (10%)
    exp_score, exp_rationale = evaluate_experience_score(
        p_exp, p_avail, p_type
    )

    # Total Score computation
    total_score = round(
        equip_score + funding_score + domain_score + manpower_score + loc_score + exp_score,
        1
    )
    total_score = min(100.0, max(0.0, total_score))

    # Match Level classification
    if total_score >= 85.0:
        match_level = "excellent"
    elif total_score >= 65.0:
        match_level = "strong"
    elif total_score >= 40.0:
        match_level = "moderate"
    else:
        match_level = "low"

    # Aggregated matched & missing areas
    matched_support_areas = list(dict.fromkeys(matched_assets + matched_domains + matched_crew))
    missing_support_areas = list(dict.fromkeys(missing_assets + missing_domains))

    # Estimated support type
    if "funding" in [normalize_token(x) for x in p_supp_types] and (matched_assets or matched_crew):
        est_support_type = "Comprehensive CSR Co-Funding & In-Kind Support"
    elif "funding" in [normalize_token(x) for x in p_supp_types]:
        est_support_type = "CSR Financial Grant & Sponsorship"
    elif matched_assets:
        est_support_type = "Heavy Machinery & Materials Supply"
    elif matched_crew:
        est_support_type = "Contracted Labor & Field Operations"
    else:
        est_support_type = "Technical Advisory & Equipment Rental"

    # Explanation narrative
    explanation = (
        f"{p_name} scored {total_score}/100 ({match_level} match) with {p_loc} coverage. "
        f"Offers {p_funding_cap} funding capacity (up to ₹{p_max_budget:,.0f}) and aligns with "
        f"{len(matched_support_areas)} required capability items."
    )

    # Detailed rationale bullet points
    rationale = [
        f"Missing Equipment/Materials Support: {equip_score}/25.0 pts ({len(matched_assets)} items covered).",
        f"Funding & Budget Capacity: {funding_score}/20.0 pts. " + (" ".join(funding_rationale)),
        f"Technical Domain & Skills: {domain_score}/20.0 pts.",
        f"Manpower & Operations: {manpower_score}/15.0 pts ({len(matched_crew)} roles supported).",
        f"Location Relevance: {loc_score}/10.0 pts. {loc_explanation}",
        f"Experience & Reliability: {exp_score}/10.0 pts. " + (" ".join(exp_rationale)),
    ]

    factor_scores = PartnerFactorScores(
        equipment_and_materials_score=equip_score,
        funding_and_budget_score=funding_score,
        domain_and_skills_score=domain_score,
        manpower_and_operations_score=manpower_score,
        location_relevance_score=loc_score,
        experience_and_reliability_score=exp_score,
        total_score=total_score,
    )

    confidence = 0.90 if gap_analysis else 0.78

    return PartnerRecommendationMatch(
        partner_id=p_id,
        organization_name=p_name,
        partner_type=p_type,
        location=p_loc,
        service_districts=p_districts,
        score=total_score,
        match_level=match_level,
        matched_support_areas=matched_support_areas,
        missing_support_areas=missing_support_areas,
        estimated_support_type=est_support_type,
        explanation=explanation,
        rationale=rationale,
        confidence=confidence,
        verification_status=p_verif,
        funding_capacity=p_funding_cap,
        maximum_project_budget=p_max_budget,
        availability=p_avail,
        factor_scores=factor_scores,
        contact_email=p_email,
    )


def match_report_to_partners(
    report: Report,
    extracted_caps: Optional[Dict[str, Any]],
    gap_analysis: Optional[Dict[str, Any]],
    partner_profiles: List[Any],
) -> List[PartnerRecommendationMatch]:
    """
    Evaluates all available partner profiles against the civic report's gaps,
    ranks by total score descending, and returns strictly the Top 5 recommendations.
    """
    caps = extracted_caps or (report.ai_capabilities or {})
    gaps = gap_analysis or (report.ai_capability_gap_analysis or {})

    candidates: List[PartnerRecommendationMatch] = []
    for partner in partner_profiles:
        try:
            match_obj = score_single_partner(partner, report, caps, gaps)
            candidates.append(match_obj)
        except Exception as e:
            logger.warning(f"Error evaluating partner {partner}: {e}")

    # Rank descending by score
    candidates.sort(key=lambda x: x.score, reverse=True)

    # Strictly limit to Top 5
    return candidates[:5]


def mask_for_citizen(rec: PartnerRecommendationMatch) -> CitizenPartnerRecommendation:
    """
    Converts full partner recommendation into privacy-safe citizen summary.
    Omits private contact info, executive emails, and exact commercial details.
    """
    return CitizenPartnerRecommendation(
        partner_id=rec.partner_id,
        organization_name=rec.organization_name,
        partner_type=rec.partner_type,
        location=rec.location,
        score=rec.score,
        match_level=rec.match_level,
        matched_support_areas=rec.matched_support_areas[:4],
        estimated_support_type=rec.estimated_support_type,
        explanation=rec.explanation,
        verification_status=rec.verification_status,
    )


def analyze_and_store_report_partner_matches(db: Session, report: Report) -> None:
    """
    Non-blocking worker routine that analyzes partner matching for a report
    and persists the Top 5 matches to the reports table.
    Ensures zero mutation to report.status, report.priority, or report.assigned_to.
    """
    try:
        # Fetch partner profiles from DB; fallback to SEED_PARTNER_PROFILES if empty
        db_partners = db.query(PartnerProfile).all()
        partner_pool = db_partners if db_partners else SEED_PARTNER_PROFILES

        extracted_caps = report.ai_capabilities or {}
        gap_analysis = report.ai_capability_gap_analysis or {}

        top_5_matches = match_report_to_partners(
            report=report,
            extracted_caps=extracted_caps,
            gap_analysis=gap_analysis,
            partner_profiles=partner_pool,
        )

        # Serialize for JSON storage
        serialized_matches = [m.model_dump() for m in top_5_matches]

        # Update report matching fields without mutating status, priority, or assignment
        report.ai_partner_matching_status = "completed"
        report.ai_partner_matches = serialized_matches
        report.ai_partner_matching_model = "impactforge-partner-matcher-v1"
        report.ai_partner_matching_analyzed_at = datetime.now(timezone.utc)

        db.commit()
        logger.info(
            f"Partner matching stored for {report.track_id}: "
            f"{len(top_5_matches)} recommendations (status=completed)"
        )
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to analyze partner matching for {report.track_id}: {e}", exc_info=True)
        try:
            report.ai_partner_matching_status = "failed"
            db.commit()
        except Exception:
            db.rollback()
