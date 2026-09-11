import logging
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple
from sqlalchemy.orm import Session

from app.models.report import Report
from app.models.faculty_student import FacultyProfile, StudentProfile
from app.schemas.capability_schema import ExtractedCapabilities
from app.schemas.faculty_student_matching_schema import (
    FacultyFactorScores,
    StudentFactorScores,
    FacultyRecommendationMatch,
    StudentRecommendationMatch,
)

logger = logging.getLogger("faculty_student_matching_service")

# Controlled seed profiles for Faculty Members.
# All clearly marked as 'unverified' demo profiles per requirement.
SEED_FACULTY_PROFILES: List[Dict[str, Any]] = [
    {
        "faculty_id": "fac-bit-01",
        "name": "Dr. Alok Ranjan",
        "institution_id": "bit-mesra",
        "institution_name": "Birla Institute of Technology (BIT) Mesra",
        "department": "Civil and Environmental Engineering",
        "skills": [
            "civil engineering",
            "water management",
            "environmental science",
            "surveying",
            "project management",
        ],
        "technical_domains": [
            "water & wastewater",
            "civil infrastructure",
            "environmental monitoring",
        ],
        "research_expertise": [
            "Urban stormwater drainage design",
            "Groundwater contaminant transport",
            "Water treatment plant optimization",
        ],
        "project_experience": "extensive",
        "availability": "available",
        "current_workload": 2,
        "district": "Ranchi",
        "state": "Jharkhand",
        "verification_status": "unverified",
        "contact_email": "alok.ranjan@bitmesra.ac.in",
        "associated_user_email": "alok.ranjan@bitmesra.ac.in",
    },
    {
        "faculty_id": "fac-nit-01",
        "name": "Dr. Sunita Murmu",
        "institution_id": "nit-jamshedpur",
        "institution_name": "National Institute of Technology Jamshedpur",
        "department": "Civil Engineering",
        "skills": [
            "civil engineering",
            "construction",
            "surveying",
            "project management",
        ],
        "technical_domains": [
            "civil infrastructure",
            "urban planning & transportation",
        ],
        "research_expertise": [
            "Highway pavement engineering and asphalt durability",
            "Geotechnical foundation stability",
            "Traffic congestion reduction models",
        ],
        "project_experience": "high",
        "availability": "available",
        "current_workload": 1,
        "district": "East Singhbhum",
        "state": "Jharkhand",
        "verification_status": "unverified",
        "contact_email": "smurmu.ce@nitjsr.ac.in",
        "associated_user_email": "smurmu.ce@nitjsr.ac.in",
    },
    {
        "faculty_id": "fac-ism-01",
        "name": "Prof. Rajesh K. Tiwari",
        "institution_id": "iit-ism-dhanbad",
        "institution_name": "Indian Institute of Technology (ISM) Dhanbad",
        "department": "Environmental Science & Engineering",
        "skills": [
            "environmental science",
            "waste management",
            "data analysis",
            "water management",
        ],
        "technical_domains": [
            "environmental monitoring",
            "waste & recycling management",
            "water & wastewater",
        ],
        "research_expertise": [
            "Solid waste containment in mining zones",
            "Industrial effluent remediation",
            "Air quality index dispersion modeling",
        ],
        "project_experience": "extensive",
        "availability": "limited",
        "current_workload": 3,
        "district": "Dhanbad",
        "state": "Jharkhand",
        "verification_status": "unverified",
        "contact_email": "rktiwari@iitism.ac.in",
        "associated_user_email": "rktiwari@iitism.ac.in",
    },
    {
        "faculty_id": "fac-sindri-01",
        "name": "Dr. Priya Kumari",
        "institution_id": "bit-sindri",
        "institution_name": "Birsa Institute of Technology Sindri",
        "department": "Electrical Engineering",
        "skills": [
            "electrical engineering",
            "software development",
            "project management",
        ],
        "technical_domains": [
            "electrical grid & power",
            "education & civic technology",
        ],
        "research_expertise": [
            "Rural microgrid solar integration",
            "Distribution line fault isolation",
            "Smart energy telemetry sensors",
        ],
        "project_experience": "high",
        "availability": "available",
        "current_workload": 1,
        "district": "Dhanbad",
        "state": "Jharkhand",
        "verification_status": "unverified",
        "contact_email": "pkumari.ee@bitsindri.ac.in",
        "associated_user_email": "pkumari.ee@bitsindri.ac.in",
    },
    {
        "faculty_id": "fac-poly-01",
        "name": "Prof. Sandeep Verma",
        "institution_id": "govt-poly-ranchi",
        "institution_name": "Government Polytechnic Ranchi",
        "department": "Civil Engineering & Surveying",
        "skills": [
            "civil engineering",
            "surveying",
            "GIS and mapping",
            "construction",
        ],
        "technical_domains": [
            "civil infrastructure",
            "general civic maintenance",
        ],
        "research_expertise": [
            "Topographic total station field surveying",
            "Municipal road repair supervision",
            "Culvert drainage rehabilitation",
        ],
        "project_experience": "medium",
        "availability": "available",
        "current_workload": 1,
        "district": "Ranchi",
        "state": "Jharkhand",
        "verification_status": "unverified",
        "contact_email": "sverma@polytechnicranchi.ac.in",
        "associated_user_email": "sverma@polytechnicranchi.ac.in",
    },
    {
        "faculty_id": "fac-bau-01",
        "name": "Dr. Meenakshi Sahu",
        "institution_id": "bau-ranchi",
        "institution_name": "Birsa Agricultural University",
        "department": "Soil and Water Engineering",
        "skills": [
            "water management",
            "environmental science",
            "surveying",
            "data analysis",
        ],
        "technical_domains": [
            "water & wastewater",
            "environmental monitoring",
        ],
        "research_expertise": [
            "Watershed recharge structures in plateau terrain",
            "Rainwater harvesting systems",
            "Agricultural runoff nutrient control",
        ],
        "project_experience": "high",
        "availability": "available",
        "current_workload": 2,
        "district": "Ranchi",
        "state": "Jharkhand",
        "verification_status": "unverified",
        "contact_email": "msahu.agri@bauranchi.org",
        "associated_user_email": "msahu.agri@bauranchi.org",
    },
    {
        "faculty_id": "fac-rims-01",
        "name": "Dr. Arvind Kishore",
        "institution_id": "rims-ranchi",
        "institution_name": "Rajendra Institute of Medical Sciences",
        "department": "Community Medicine & Public Health",
        "skills": [
            "public health",
            "data analysis",
            "project management",
        ],
        "technical_domains": [
            "public health & sanitation",
            "environmental monitoring",
        ],
        "research_expertise": [
            "Epidemiological outbreak tracing of waterborne diseases",
            "Community sanitation intervention efficacy",
            "Bio-medical waste disposal audits",
        ],
        "project_experience": "extensive",
        "availability": "limited",
        "current_workload": 3,
        "district": "Ranchi",
        "state": "Jharkhand",
        "verification_status": "unverified",
        "contact_email": "akishore.psm@rimsranchi.ac.in",
        "associated_user_email": "akishore.psm@rimsranchi.ac.in",
    },
]

# Controlled seed profiles for Student Teams / Students.
# All clearly marked as 'unverified' demo profiles.
SEED_STUDENT_PROFILES: List[Dict[str, Any]] = [
    {
        "student_id": "stu-bit-01",
        "name": "Rahul Sharma",
        "institution_id": "bit-mesra",
        "institution_name": "Birla Institute of Technology (BIT) Mesra",
        "department": "Remote Sensing and GIS",
        "skills": [
            "GIS and mapping",
            "surveying",
            "software development",
            "data analysis",
        ],
        "technical_domains": [
            "urban planning & transportation",
            "civil infrastructure",
        ],
        "interests": [
            "Drone-based pothole and road distress mapping",
            "Geospatial dashboard development",
            "OpenStreetMap civic data validation",
        ],
        "project_experience": "high",
        "availability": "available",
        "current_workload": 1,
        "district": "Ranchi",
        "state": "Jharkhand",
        "verification_status": "unverified",
        "contact_email": "rahul.gis@bitmesra.ac.in",
        "associated_user_email": "rahul.gis@bitmesra.ac.in",
    },
    {
        "student_id": "stu-nit-01",
        "name": "Ananya Sen",
        "institution_id": "nit-jamshedpur",
        "institution_name": "National Institute of Technology Jamshedpur",
        "department": "Civil Engineering",
        "skills": [
            "civil engineering",
            "construction",
            "surveying",
        ],
        "technical_domains": [
            "civil infrastructure",
            "general civic maintenance",
        ],
        "interests": [
            "Road pavement repair durability testing",
            "Concrete mix optimization for monsoons",
            "Civic infrastructure structural audits",
        ],
        "project_experience": "medium",
        "availability": "available",
        "current_workload": 1,
        "district": "East Singhbhum",
        "state": "Jharkhand",
        "verification_status": "unverified",
        "contact_email": "ananya.sen.ce@nitjsr.ac.in",
        "associated_user_email": "ananya.sen.ce@nitjsr.ac.in",
    },
    {
        "student_id": "stu-ism-01",
        "name": "Deepak Mahato",
        "institution_id": "iit-ism-dhanbad",
        "institution_name": "Indian Institute of Technology (ISM) Dhanbad",
        "department": "Environmental Engineering",
        "skills": [
            "environmental science",
            "waste management",
            "water management",
            "data analysis",
        ],
        "technical_domains": [
            "environmental monitoring",
            "waste & recycling management",
            "water & wastewater",
        ],
        "interests": [
            "Decentralized wastewater filtration systems",
            "Community composting and segregation audits",
            "Water testing telemetry kits",
        ],
        "project_experience": "high",
        "availability": "available",
        "current_workload": 1,
        "district": "Dhanbad",
        "state": "Jharkhand",
        "verification_status": "unverified",
        "contact_email": "deepak.env@iitism.ac.in",
        "associated_user_email": "deepak.env@iitism.ac.in",
    },
    {
        "student_id": "stu-sindri-01",
        "name": "Pooja Rani",
        "institution_id": "bit-sindri",
        "institution_name": "Birsa Institute of Technology Sindri",
        "department": "Electrical and Electronics Engineering",
        "skills": [
            "electrical engineering",
            "software development",
            "project management",
        ],
        "technical_domains": [
            "electrical grid & power",
            "education & civic technology",
        ],
        "interests": [
            "Street light automated outage reporting",
            "Microcontroller IoT safety alarms",
            "Distribution transformer temperature monitoring",
        ],
        "project_experience": "medium",
        "availability": "available",
        "current_workload": 1,
        "district": "Dhanbad",
        "state": "Jharkhand",
        "verification_status": "unverified",
        "contact_email": "pooja.ee@bitsindri.ac.in",
        "associated_user_email": "pooja.ee@bitsindri.ac.in",
    },
    {
        "student_id": "stu-poly-01",
        "name": "Amit Kumar Baski",
        "institution_id": "govt-poly-ranchi",
        "institution_name": "Government Polytechnic Ranchi",
        "department": "Civil Engineering",
        "skills": [
            "surveying",
            "civil engineering",
            "construction",
        ],
        "technical_domains": [
            "civil infrastructure",
            "general civic maintenance",
        ],
        "interests": [
            "Field survey measurements with digital total stations",
            "Drainage gradient correction and alignment",
            "Field material quality control tests",
        ],
        "project_experience": "academic",
        "availability": "available",
        "current_workload": 0,
        "district": "Ranchi",
        "state": "Jharkhand",
        "verification_status": "unverified",
        "contact_email": "amit.baski@polytechnicranchi.ac.in",
        "associated_user_email": "amit.baski@polytechnicranchi.ac.in",
    },
    {
        "student_id": "stu-bau-01",
        "name": "Neha Tigga",
        "institution_id": "bau-ranchi",
        "institution_name": "Birsa Agricultural University",
        "department": "Agricultural Engineering",
        "skills": [
            "water management",
            "environmental science",
            "surveying",
        ],
        "technical_domains": [
            "water & wastewater",
            "environmental monitoring",
        ],
        "interests": [
            "Percolation pond survey and sedimentation traps",
            "Rural rainwater harvesting designs",
            "Subsurface drainage networks",
        ],
        "project_experience": "academic",
        "availability": "available",
        "current_workload": 1,
        "district": "Ranchi",
        "state": "Jharkhand",
        "verification_status": "unverified",
        "contact_email": "neha.tigga@bauranchi.org",
        "associated_user_email": "neha.tigga@bauranchi.org",
    },
    {
        "student_id": "stu-rims-01",
        "name": "Vikas Oraon",
        "institution_id": "rims-ranchi",
        "institution_name": "Rajendra Institute of Medical Sciences",
        "department": "Public Health & Epidemiology",
        "skills": [
            "public health",
            "data analysis",
            "project management",
        ],
        "technical_domains": [
            "public health & sanitation",
            "environmental monitoring",
        ],
        "interests": [
            "Community waterborne vector surveillance",
            "Drinking water quality coliform surveys",
            "Ward-level sanitation risk profiling",
        ],
        "project_experience": "high",
        "availability": "available",
        "current_workload": 1,
        "district": "Ranchi",
        "state": "Jharkhand",
        "verification_status": "unverified",
        "contact_email": "vikas.oraon@rimsranchi.ac.in",
        "associated_user_email": "vikas.oraon@rimsranchi.ac.in",
    },
]


def calculate_faculty_match(
    caps: ExtractedCapabilities,
    report_district: str,
    report_state: str,
    faculty: Dict[str, Any],
    matched_hei_ids: Optional[List[str]] = None,
) -> FacultyRecommendationMatch:
    """
    Computes explainable faculty match score (0-100) using the required rubric:
      - Skill Match: 35%
      - Technical Domain Match: 25%
      - Relevant Experience: 15%
      - Availability & Workload: 15%
      - Location & HEI Relevance: 10%
    """
    reasons: List[str] = []
    matched_hei_ids = [h.strip().lower() for h in (matched_hei_ids or [])]

    # 1. Skill Match (35%)
    req_skills = [s.strip().lower() for s in (caps.skills or []) if s.strip()]
    fac_skills = [s.strip().lower() for s in faculty.get("skills", []) if s.strip()]
    matched_skills: List[str] = []
    missing_skills: List[str] = []

    if req_skills:
        for s in req_skills:
            if any(fs in s or s in fs for fs in fac_skills):
                matched_skills.append(s)
            else:
                missing_skills.append(s)
        skill_ratio = len(matched_skills) / len(req_skills)
        skill_score = round(skill_ratio * 35.0, 1)
        reasons.append(
            f"Skills: Matched {len(matched_skills)}/{len(req_skills)} required competencies "
            f"({', '.join(matched_skills) if matched_skills else 'None'})."
        )
    else:
        skill_score = 17.5
        reasons.append("Skills: Standard academic baseline applied (no specific skill declared).")

    # 2. Technical Domain Match (25%)
    req_domains = [d.strip().lower() for d in (caps.technical_domains or []) if d.strip()]
    if not req_domains and caps.department_domain:
        req_domains = [caps.department_domain.strip().lower()]
    fac_domains = [d.strip().lower() for d in faculty.get("technical_domains", []) if d.strip()]
    fac_dept = faculty.get("department", "").strip().lower()

    matched_domains: List[str] = []
    if req_domains:
        for d in req_domains:
            if any(fd in d or d in fd for fd in fac_domains) or (d in fac_dept or fac_dept in d):
                matched_domains.append(d)
        domain_ratio = len(matched_domains) / len(req_domains)
        domain_score = round(domain_ratio * 25.0, 1)
        reasons.append(
            f"Domains: Matched {len(matched_domains)}/{len(req_domains)} technical domains "
            f"with {faculty.get('department')}."
        )
    else:
        domain_score = 12.5
        reasons.append("Domains: General civic infrastructure baseline applied.")

    # 3. Relevant Experience (15%)
    # - Research expertise overlap with problem domains/skills: up to 10 points
    # - Project experience track record: up to 5 points
    research_list = faculty.get("research_expertise", [])
    research_matches = 0
    keywords_to_check = set(req_skills + req_domains + [str(caps.department_domain or "").lower()])
    for r in research_list:
        r_lower = r.lower()
        if any(kw in r_lower for kw in keywords_to_check if kw):
            research_matches += 1

    research_score = min(10.0, round(research_matches * 5.0, 1)) if req_skills or req_domains else 6.0
    exp_level = str(faculty.get("project_experience", "medium")).lower()
    exp_weights = {"extensive": 5.0, "high": 4.0, "medium": 3.0, "low": 2.0}
    track_score = exp_weights.get(exp_level, 3.0)
    exp_score = min(15.0, round(research_score + track_score, 1))

    reasons.append(
        f"Experience: {exp_level.capitalize()} project record with {len(research_list)} active research focus areas."
    )

    # 4. Availability and Workload (15%)
    # - Availability: available (9.0), limited (5.0), busy (2.0)
    # - Current workload: <=1 (6.0), 2-3 (4.0), >3 (1.0)
    avail_status = str(faculty.get("availability", "available")).lower()
    avail_points = 9.0 if avail_status == "available" else (5.0 if avail_status == "limited" else 2.0)

    workload = int(faculty.get("current_workload", 2))
    workload_points = 6.0 if workload <= 1 else (4.0 if workload <= 3 else 1.0)
    avail_score = min(15.0, round(avail_points + workload_points, 1))

    reasons.append(
        f"Availability: Status is '{avail_status}' with {workload} active projects."
    )

    # 5. Location and HEI Relevance (10%)
    # - Affiliated with Part 6 matched HEIs: 6 points (or same district: 6 points; same state: 3 points)
    # - Direct district alignment with report: +4 points
    fac_hei = str(faculty.get("institution_id", "")).strip().lower()
    fac_dist = str(faculty.get("district", "")).strip().lower()
    rep_dist = str(report_district or "").strip().lower()
    fac_state = str(faculty.get("state", "Jharkhand")).strip().lower()
    rep_state = str(report_state or "Jharkhand").strip().lower()

    if matched_hei_ids and fac_hei in matched_hei_ids:
        hei_pts = 6.0
    elif fac_dist and rep_dist and fac_dist == rep_dist:
        hei_pts = 6.0
    elif fac_state == rep_state:
        hei_pts = 3.0
    else:
        hei_pts = 1.0

    dist_pts = 4.0 if (fac_dist and rep_dist and fac_dist == rep_dist) else 1.0
    location_score = min(10.0, round(hei_pts + dist_pts, 1))

    if fac_dist == rep_dist:
        reasons.append(f"Location: Local district presence in {faculty.get('district')}.")
    else:
        reasons.append(f"Location: Regional state proximity ({faculty.get('district')}, {faculty.get('state')}).")

    # Aggregate Total (0 to 100)
    raw_total = skill_score + domain_score + exp_score + avail_score + location_score
    total_score = round(max(0.0, min(100.0, raw_total)), 1)

    if total_score >= 85.0:
        recommendation_level = "excellent"
    elif total_score >= 65.0:
        recommendation_level = "strong"
    elif total_score >= 40.0:
        recommendation_level = "moderate"
    else:
        recommendation_level = "low"

    factor_scores = FacultyFactorScores(
        skills=skill_score,
        technical_domains=domain_score,
        relevant_experience=exp_score,
        availability_workload=avail_score,
        location_hei_relevance=location_score,
    )

    confidence = 0.90 if req_skills else 0.75

    return FacultyRecommendationMatch(
        faculty_id=str(faculty.get("faculty_id", "")),
        name=str(faculty.get("name", "")),
        institution_id=str(faculty.get("institution_id", "")),
        institution_name=str(faculty.get("institution_name", "")),
        department=str(faculty.get("department", "")),
        district=str(faculty.get("district", "")),
        state=str(faculty.get("state", "Jharkhand")),
        verification_status=str(faculty.get("verification_status", "unverified")),
        availability=avail_status,
        current_workload=workload,
        research_expertise=faculty.get("research_expertise", []),
        match_score=total_score,
        recommendation_level=recommendation_level,
        factor_scores=factor_scores,
        matched_skills=matched_skills,
        missing_skills=missing_skills,
        reasons=reasons,
        confidence=confidence,
    )


def calculate_student_match(
    caps: ExtractedCapabilities,
    report_district: str,
    report_state: str,
    report_category: str,
    report_title: str,
    student: Dict[str, Any],
    matched_hei_ids: Optional[List[str]] = None,
) -> StudentRecommendationMatch:
    """
    Computes explainable student match score (0-100) prioritizing:
      - Required Skills: 30%
      - Technical Domains: 20%
      - Student Interests: 20%
      - Availability & Workload: 15%
      - Institution & Location Relevance: 15%
    """
    reasons: List[str] = []
    matched_hei_ids = [h.strip().lower() for h in (matched_hei_ids or [])]

    # 1. Required Skills (30%)
    req_skills = [s.strip().lower() for s in (caps.skills or []) if s.strip()]
    stu_skills = [s.strip().lower() for s in student.get("skills", []) if s.strip()]
    matched_skills: List[str] = []
    missing_skills: List[str] = []

    if req_skills:
        for s in req_skills:
            if any(ss in s or s in ss for ss in stu_skills):
                matched_skills.append(s)
            else:
                missing_skills.append(s)
        skill_ratio = len(matched_skills) / len(req_skills)
        skill_score = round(skill_ratio * 30.0, 1)
        reasons.append(
            f"Skills: Matched {len(matched_skills)}/{len(req_skills)} required student skills "
            f"({', '.join(matched_skills) if matched_skills else 'None'})."
        )
    else:
        skill_score = 15.0
        reasons.append("Skills: Standard student technical baseline applied.")

    # 2. Technical Domains (20%)
    req_domains = [d.strip().lower() for d in (caps.technical_domains or []) if d.strip()]
    if not req_domains and caps.department_domain:
        req_domains = [caps.department_domain.strip().lower()]
    stu_domains = [d.strip().lower() for d in student.get("technical_domains", []) if d.strip()]
    stu_dept = student.get("department", "").strip().lower()

    matched_domains: List[str] = []
    if req_domains:
        for d in req_domains:
            if any(sd in d or d in sd for sd in stu_domains) or (d in stu_dept or stu_dept in d):
                matched_domains.append(d)
        domain_ratio = len(matched_domains) / len(req_domains)
        domain_score = round(domain_ratio * 20.0, 1)
        reasons.append(
            f"Domains: Department {student.get('department')} matches {len(matched_domains)}/{len(req_domains)} problem domains."
        )
    else:
        domain_score = 10.0
        reasons.append("Domains: General civic technology curriculum baseline applied.")

    # 3. Student Interests (20%)
    interests_list = student.get("interests", [])
    interest_matches = 0
    interest_tokens = set(req_skills + req_domains + [
        (report_category or "").lower(),
        str(caps.department_domain or "").lower(),
    ])
    title_words = [w.lower() for w in (report_title or "").split() if len(w) > 3]
    interest_tokens.update(title_words)

    for it in interests_list:
        it_lower = it.lower()
        if any(tok in it_lower for tok in interest_tokens if tok):
            interest_matches += 1

    if interests_list:
        interest_ratio = min(1.0, interest_matches / max(1, min(len(interests_list), 2)))
        interest_score = round(interest_ratio * 20.0, 1)
        reasons.append(
            f"Interests: {interest_matches} academic project interests align with community challenge."
        )
    else:
        interest_score = 10.0
        reasons.append("Interests: Baseline student project participation applied.")

    # 4. Availability & Current Workload (15%)
    avail_status = str(student.get("availability", "available")).lower()
    avail_points = 9.0 if avail_status == "available" else (5.0 if avail_status == "limited" else 2.0)

    workload = int(student.get("current_workload", 1))
    workload_points = 6.0 if workload <= 1 else (4.0 if workload <= 2 else 1.0)
    avail_score = min(15.0, round(avail_points + workload_points, 1))

    reasons.append(
        f"Availability: Candidate is '{avail_status}' with {workload} current active academic project."
    )

    # 5. Institution & Location Relevance (15%)
    stu_hei = str(student.get("institution_id", "")).strip().lower()
    stu_dist = str(student.get("district", "")).strip().lower()
    rep_dist = str(report_district or "").strip().lower()
    stu_state = str(student.get("state", "Jharkhand")).strip().lower()
    rep_state = str(report_state or "Jharkhand").strip().lower()

    if matched_hei_ids and stu_hei in matched_hei_ids:
        hei_pts = 8.0
    elif stu_dist and rep_dist and stu_dist == rep_dist:
        hei_pts = 8.0
    elif stu_state == rep_state:
        hei_pts = 4.0
    else:
        hei_pts = 2.0

    dist_pts = 7.0 if (stu_dist and rep_dist and stu_dist == rep_dist) else 3.0
    location_score = min(15.0, round(hei_pts + dist_pts, 1))

    if stu_dist == rep_dist:
        reasons.append(f"Location: Local institutional presence in {student.get('district')}.")
    else:
        reasons.append(f"Location: Regional proximity within {student.get('state')}.")

    # Aggregate Total (0 to 100)
    raw_total = skill_score + domain_score + interest_score + avail_score + location_score
    total_score = round(max(0.0, min(100.0, raw_total)), 1)

    if total_score >= 85.0:
        recommendation_level = "excellent"
    elif total_score >= 65.0:
        recommendation_level = "strong"
    elif total_score >= 40.0:
        recommendation_level = "moderate"
    else:
        recommendation_level = "low"

    factor_scores = StudentFactorScores(
        skills=skill_score,
        technical_domains=domain_score,
        student_interests=interest_score,
        availability_workload=avail_score,
        location_hei_relevance=location_score,
    )

    confidence = 0.88 if req_skills else 0.72

    return StudentRecommendationMatch(
        student_id=str(student.get("student_id", "")),
        name=str(student.get("name", "")),
        institution_id=str(student.get("institution_id", "")),
        institution_name=str(student.get("institution_name", "")),
        department=str(student.get("department", "")),
        district=str(student.get("district", "")),
        state=str(student.get("state", "Jharkhand")),
        verification_status=str(student.get("verification_status", "unverified")),
        availability=avail_status,
        current_workload=workload,
        interests=student.get("interests", []),
        match_score=total_score,
        recommendation_level=recommendation_level,
        factor_scores=factor_scores,
        matched_skills=matched_skills,
        missing_skills=missing_skills,
        reasons=reasons,
        confidence=confidence,
    )


def match_report_to_faculty(
    caps: ExtractedCapabilities,
    report_district: str,
    report_state: str,
    faculty_profiles: List[Dict[str, Any]],
    matched_hei_ids: Optional[List[str]] = None,
) -> Tuple[List[FacultyRecommendationMatch], str, float, str]:
    """
    Ranks faculty profiles against report capabilities and returns top 5.
    """
    evaluated: List[FacultyRecommendationMatch] = []
    for fac in faculty_profiles:
        try:
            match = calculate_faculty_match(
                caps=caps,
                report_district=report_district,
                report_state=report_state,
                faculty=fac,
                matched_hei_ids=matched_hei_ids,
            )
            evaluated.append(match)
        except Exception as e:
            logger.warning(f"Error calculating faculty match for {fac.get('faculty_id')}: {e}")
            continue

    evaluated.sort(key=lambda m: m.match_score, reverse=True)
    top_5 = evaluated[:5]

    status = "completed" if top_5 else "no_matches"
    avg_conf = round(sum(m.confidence for m in top_5) / len(top_5), 2) if top_5 else 0.0
    return top_5, status, avg_conf, "faculty_explainable_matcher_v1"


def match_report_to_students(
    caps: ExtractedCapabilities,
    report_district: str,
    report_state: str,
    report_category: str,
    report_title: str,
    student_profiles: List[Dict[str, Any]],
    matched_hei_ids: Optional[List[str]] = None,
) -> Tuple[List[StudentRecommendationMatch], str, float, str]:
    """
    Ranks student profiles against report capabilities and returns top 5.
    """
    evaluated: List[StudentRecommendationMatch] = []
    for stu in student_profiles:
        try:
            match = calculate_student_match(
                caps=caps,
                report_district=report_district,
                report_state=report_state,
                report_category=report_category,
                report_title=report_title,
                student=stu,
                matched_hei_ids=matched_hei_ids,
            )
            evaluated.append(match)
        except Exception as e:
            logger.warning(f"Error calculating student match for {stu.get('student_id')}: {e}")
            continue

    evaluated.sort(key=lambda m: m.match_score, reverse=True)
    top_5 = evaluated[:5]

    status = "completed" if top_5 else "no_matches"
    avg_conf = round(sum(m.confidence for m in top_5) / len(top_5), 2) if top_5 else 0.0
    return top_5, status, avg_conf, "student_explainable_matcher_v1"


def get_or_seed_faculty_profiles(db: Session) -> List[Dict[str, Any]]:
    """
    Retrieves all faculty profiles from PostgreSQL, seeding defaults if empty.
    """
    try:
        db_profiles = db.query(FacultyProfile).all()
        if db_profiles:
            return [
                {
                    "faculty_id": p.faculty_id,
                    "name": p.name,
                    "institution_id": p.institution_id,
                    "institution_name": p.institution_name,
                    "department": p.department,
                    "skills": p.skills or [],
                    "technical_domains": p.technical_domains or [],
                    "research_expertise": p.research_expertise or [],
                    "project_experience": p.project_experience,
                    "availability": p.availability,
                    "current_workload": p.current_workload,
                    "district": p.district,
                    "state": p.state,
                    "verification_status": p.verification_status,
                    "contact_email": p.contact_email,
                    "associated_user_email": p.associated_user_email,
                }
                for p in db_profiles
            ]

        logger.info("faculty_profiles table is empty; seeding default demo faculty...")
        for sp in SEED_FACULTY_PROFILES:
            new_p = FacultyProfile(
                faculty_id=sp["faculty_id"],
                name=sp["name"],
                institution_id=sp["institution_id"],
                institution_name=sp["institution_name"],
                department=sp["department"],
                skills=sp["skills"],
                technical_domains=sp["technical_domains"],
                research_expertise=sp["research_expertise"],
                project_experience=sp["project_experience"],
                availability=sp["availability"],
                current_workload=sp["current_workload"],
                district=sp["district"],
                state=sp["state"],
                verification_status=sp["verification_status"],
                contact_email=sp["contact_email"],
                associated_user_email=sp["associated_user_email"],
            )
            db.add(new_p)
        db.commit()
        return SEED_FACULTY_PROFILES
    except Exception as e:
        logger.error(f"Error querying or seeding faculty_profiles: {e}", exc_info=True)
        return SEED_FACULTY_PROFILES


def get_or_seed_student_profiles(db: Session) -> List[Dict[str, Any]]:
    """
    Retrieves all student profiles from PostgreSQL, seeding defaults if empty.
    """
    try:
        db_profiles = db.query(StudentProfile).all()
        if db_profiles:
            return [
                {
                    "student_id": p.student_id,
                    "name": p.name,
                    "institution_id": p.institution_id,
                    "institution_name": p.institution_name,
                    "department": p.department,
                    "skills": p.skills or [],
                    "technical_domains": p.technical_domains or [],
                    "interests": p.interests or [],
                    "project_experience": p.project_experience,
                    "availability": p.availability,
                    "current_workload": p.current_workload,
                    "district": p.district,
                    "state": p.state,
                    "verification_status": p.verification_status,
                    "contact_email": p.contact_email,
                    "associated_user_email": p.associated_user_email,
                }
                for p in db_profiles
            ]

        logger.info("student_profiles table is empty; seeding default demo students...")
        for sp in SEED_STUDENT_PROFILES:
            new_p = StudentProfile(
                student_id=sp["student_id"],
                name=sp["name"],
                institution_id=sp["institution_id"],
                institution_name=sp["institution_name"],
                department=sp["department"],
                skills=sp["skills"],
                technical_domains=sp["technical_domains"],
                interests=sp["interests"],
                project_experience=sp["project_experience"],
                availability=sp["availability"],
                current_workload=sp["current_workload"],
                district=sp["district"],
                state=sp["state"],
                verification_status=sp["verification_status"],
                contact_email=sp["contact_email"],
                associated_user_email=sp["associated_user_email"],
            )
            db.add(new_p)
        db.commit()
        return SEED_STUDENT_PROFILES
    except Exception as e:
        logger.error(f"Error querying or seeding student_profiles: {e}", exc_info=True)
        return SEED_STUDENT_PROFILES


def analyze_and_store_report_faculty_student_matches(db: Session, report: Report) -> None:
    """
    Calculates faculty and student matches for a report and stores results in PostgreSQL.
    Non-blocking: will never crash report submission or calling flows.
    """
    try:
        raw_caps = report.ai_capabilities
        if not raw_caps or not isinstance(raw_caps, dict):
            logger.info(f"Report {report.track_id} has no capabilities yet; faculty matching marked pending.")
            report.ai_faculty_matching_status = "pending"
            db.commit()
            return

        try:
            caps_obj = ExtractedCapabilities(**raw_caps)
        except Exception:
            caps_obj = None

        if caps_obj is None or not caps_obj.skills:
            report.ai_faculty_matching_status = "needs_review"
            db.commit()
            return

        # Extract matched HEI IDs from Part 6 if available
        matched_hei_ids: List[str] = []
        if report.ai_hei_matches and isinstance(report.ai_hei_matches, list):
            for hm in report.ai_hei_matches:
                if isinstance(hm, dict) and "hei_id" in hm:
                    matched_hei_ids.append(str(hm["hei_id"]))

        fac_profiles = get_or_seed_faculty_profiles(db)
        stu_profiles = get_or_seed_student_profiles(db)

        top_fac, fac_status, _, fac_model = match_report_to_faculty(
            caps=caps_obj,
            report_district=report.district,
            report_state=report.state or "Jharkhand",
            faculty_profiles=fac_profiles,
            matched_hei_ids=matched_hei_ids,
        )

        top_stu, stu_status, _, stu_model = match_report_to_students(
            caps=caps_obj,
            report_district=report.district,
            report_state=report.state or "Jharkhand",
            report_category=report.category,
            report_title=report.problem_title,
            student_profiles=stu_profiles,
            matched_hei_ids=matched_hei_ids,
        )

        report.ai_faculty_matching_status = fac_status
        report.ai_faculty_matches = [m.model_dump() for m in top_fac]
        report.ai_student_matches = [m.model_dump() for m in top_stu]
        report.ai_faculty_matching_model = f"{fac_model}+{stu_model}"
        report.ai_faculty_matching_analyzed_at = datetime.now(timezone.utc)

        db.commit()
        db.refresh(report)
        logger.info(
            f"Faculty & Student matching stored for {report.track_id}: "
            f"{len(top_fac)} faculty, {len(top_stu)} students (status={fac_status})"
        )
    except Exception as e:
        logger.error(f"Failed to store faculty/student matches for {report.track_id}: {e}", exc_info=True)
        try:
            report.ai_faculty_matching_status = "failed"
            db.commit()
        except Exception:
            db.rollback()
