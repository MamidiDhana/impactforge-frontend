import logging
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple
from sqlalchemy.orm import Session

from app.models.report import Report
from app.models.hei import HEIProfile
from app.models.faculty_student import FacultyProfile, StudentProfile
from app.schemas.capability_schema import ExtractedCapabilities
from app.schemas.capability_gap_schema import (
    GapFactorScores,
    PartialSkillMatch,
    VerificationSummary,
    CapabilityGapAnalysis,
)

logger = logging.getLogger("capability_gap_service")

AI_CAPABILITY_GAP_MODEL = "impactforge-gap-engine-v1.0"


def calculate_skills_coverage(
    required_skills: List[str],
    candidate_skills: List[str],
    candidate_domains: List[str],
) -> Tuple[float, List[str], List[str], List[PartialSkillMatch]]:
    """
    Evaluates required skills coverage against candidate profiles (Weight: 25%).
    Returns: (score out of 25.0, available_skills, missing_skills, partial_matches)
    """
    if not required_skills:
        return 25.0, [], [], []

    candidate_skills_lower = [s.strip().lower() for s in candidate_skills]
    candidate_domains_lower = [d.strip().lower() for d in candidate_domains]

    available: List[str] = []
    missing: List[str] = []
    partials: List[PartialSkillMatch] = []

    # Map skills to related domain keywords for partial matching
    skill_domain_map = {
        "civil engineering": ["civil infrastructure", "urban planning & transportation"],
        "electrical engineering": ["electrical grid & power"],
        "mechanical engineering": ["civil infrastructure", "general civic maintenance"],
        "software development": ["education & civic technology"],
        "gis and mapping": ["environmental monitoring", "urban planning & transportation"],
        "surveying": ["civil infrastructure", "urban planning & transportation"],
        "data analysis": ["education & civic technology", "environmental monitoring"],
        "environmental science": ["environmental monitoring", "water & wastewater", "waste & recycling management"],
        "project management": ["civil infrastructure", "urban planning & transportation"],
        "construction": ["civil infrastructure"],
        "public health": ["public health & sanitation"],
        "water management": ["water & wastewater"],
        "waste management": ["waste & recycling management", "public health & sanitation"],
    }

    match_points = 0.0
    for req in required_skills:
        req_norm = req.strip().lower()
        # Direct exact or substring match in candidate skills
        is_direct = any(req_norm in cs or cs in req_norm for cs in candidate_skills_lower)
        if is_direct:
            available.append(req)
            match_points += 1.0
            continue

        # Check partial match through technical domain alignment
        related_domains = skill_domain_map.get(req_norm, [])
        partial_hit = None
        for cd in candidate_domains_lower:
            if any(rd in cd or cd in rd for rd in related_domains):
                partial_hit = cd
                break

        if partial_hit:
            partials.append(
                PartialSkillMatch(
                    required_skill=req,
                    matched_domain_or_competency=partial_hit,
                    relevance_note=f"Skill partially addressed through domain expertise in '{partial_hit}'.",
                )
            )
            match_points += 0.5
        else:
            missing.append(req)

    coverage_ratio = match_points / len(required_skills)
    score = round(coverage_ratio * 25.0, 1)
    return min(25.0, max(0.0, score)), available, missing, partials


def calculate_domains_coverage(
    required_domains: List[str],
    candidate_domains: List[str],
) -> Tuple[float, List[str], List[str]]:
    """
    Evaluates required technical domains coverage (Weight: 20%).
    Returns: (score out of 20.0, covered_domains, missing_domains)
    """
    if not required_domains:
        return 20.0, [], []

    candidate_domains_lower = [d.strip().lower() for d in candidate_domains]
    covered: List[str] = []
    missing: List[str] = []

    for req in required_domains:
        req_norm = req.strip().lower()
        if any(req_norm in cd or cd in req_norm for cd in candidate_domains_lower):
            covered.append(req)
        else:
            missing.append(req)

    ratio = len(covered) / len(required_domains)
    score = round(ratio * 20.0, 1)
    return min(20.0, max(0.0, score)), covered, missing


def calculate_equipment_coverage(
    required_equipment: List[str],
    candidate_equipment: List[str],
    candidate_labs: List[str],
) -> Tuple[float, List[str], List[str]]:
    """
    Evaluates required equipment and specialized lab facilities coverage (Weight: 15%).
    Returns: (score out of 15.0, covered_equipment, missing_equipment)
    """
    if not required_equipment:
        return 15.0, [], []

    candidate_pool = [e.strip().lower() for e in (candidate_equipment + candidate_labs)]
    covered: List[str] = []
    missing: List[str] = []

    for req in required_equipment:
        req_norm = req.strip().lower()
        if any(req_norm in cp or cp in req_norm for cp in candidate_pool):
            covered.append(req)
        else:
            missing.append(req)

    ratio = len(covered) / len(required_equipment)
    score = round(ratio * 15.0, 1)
    return min(15.0, max(0.0, score)), covered, missing


def calculate_software_coverage(
    required_software: List[str],
    candidate_software: List[str],
) -> Tuple[float, List[str], List[str]]:
    """
    Evaluates required software, CAD, simulation, and analytical tools coverage (Weight: 10%).
    Returns: (score out of 10.0, covered_software, missing_software)
    """
    if not required_software:
        return 10.0, [], []

    candidate_pool = [s.strip().lower() for s in candidate_software]
    covered: List[str] = []
    missing: List[str] = []

    for req in required_software:
        req_norm = req.strip().lower()
        if any(req_norm in cp or cp in req_norm for cp in candidate_pool):
            covered.append(req)
        else:
            missing.append(req)

    ratio = len(covered) / len(required_software)
    score = round(ratio * 10.0, 1)
    return min(10.0, max(0.0, score)), covered, missing


def calculate_manpower_coverage(
    required_manpower: List[str],
    has_faculty: bool,
    has_students: bool,
    faculty_workload: int,
    student_workload: int,
) -> Tuple[float, List[str], List[str]]:
    """
    Evaluates manpower and human resource capacity alignment (Weight: 10%).
    Returns: (score out of 10.0, covered_manpower, missing_manpower)
    """
    covered: List[str] = []
    missing: List[str] = []

    # Academic teams provide faculty mentorship and student researchers
    if has_faculty:
        covered.append("Academic Faculty Mentorship / Technical Lead")
    if has_students:
        covered.append("Student Engineering & Field Survey Team")

    # Assess specific required roles against academic capacities
    academic_handled_roles = ["student", "survey", "analyst", "faculty", "researcher", "engineer", "cad"]
    for role in required_manpower:
        r_norm = role.strip().lower()
        if any(keyword in r_norm for keyword in academic_handled_roles):
            covered.append(role)
        else:
            # Roles like heavy equipment operators, mason, electrician, traffic marshal need external support
            missing.append(role)

    # Base capacity points
    points = 5.0
    if has_faculty and faculty_workload <= 3:
        points += 2.5
    elif has_faculty:
        points += 1.0

    if has_students and student_workload <= 2:
        points += 2.5
    elif has_students:
        points += 1.0

    # Adjust if specific non-academic manpower roles are required and unstaffed
    if required_manpower and missing:
        deduction = (len(missing) / max(len(required_manpower), 1)) * 3.0
        points = max(2.0, points - deduction)

    score = round(min(10.0, max(0.0, points)), 1)
    return score, covered, missing


def calculate_safety_coverage(
    required_safety: List[str],
    candidate_domains: List[str],
    has_faculty: bool,
) -> Tuple[float, List[str], List[str]]:
    """
    Evaluates safety requirements and institutional safety oversight (Weight: 10%).
    Returns: (score out of 10.0, covered_safety, missing_safety)
    """
    if not required_safety:
        return 10.0, ["Standard institutional field safety guidelines applicable"], []

    covered: List[str] = []
    missing: List[str] = []

    # Specialized municipal/police barricading vs academic laboratory PPE
    academic_handled = ["ppe", "helmet", "gloves", "water testing", "lab safety", "electrical safety"]
    for req in required_safety:
        req_norm = req.strip().lower()
        if any(term in req_norm for term in academic_handled) or has_faculty:
            covered.append(req)
        else:
            missing.append(req)

    ratio = len(covered) / max(len(required_safety), 1)
    score = round(ratio * 10.0, 1)
    return min(10.0, max(0.0, score)), covered, missing


def calculate_materials_and_domain_coverage(
    required_materials: List[str],
    department_domain: str,
    complexity: str,
) -> Tuple[float, List[str], List[str], List[str]]:
    """
    Evaluates materials and departmental domain readiness (Weight: 10%).
    Academic institutions supply technical design and test reagents;
    physical construction materials require government procurement or corporate CSR support.
    Returns: (score out of 10.0, covered_materials, missing_materials, missing_department_support)
    """
    covered: List[str] = []
    missing: List[str] = []
    dept_support_needed: List[str] = []

    if department_domain:
        dept_support_needed.append(f"Official municipal/state clearance from: {department_domain}")
    else:
        dept_support_needed.append("Local urban local body (ULB) / Panchayati Raj administrative clearance")

    # Evaluate physical materials
    if not required_materials:
        score = 10.0
        covered.append("No specialized bulk materials required")
    else:
        # Academic labs provide sample collection bottles, basic test reagents, diagnostic consumables
        lab_materials = ["sample bottle", "reagent", "test kit", "strip", "probe", "chemical"]
        for mat in required_materials:
            m_norm = mat.strip().lower()
            if any(term in m_norm for term in lab_materials):
                covered.append(mat)
            else:
                missing.append(mat)

        # Academic institutions typically cover 20-40% of materials directly (lab consumables)
        mat_ratio = len(covered) / max(len(required_materials), 1)
        score = 3.0 + (mat_ratio * 7.0)

    # Complexity penalty on domain readiness
    if complexity == "high":
        score = max(2.0, score - 2.0)

    score = round(min(10.0, max(0.0, score)), 1)
    return score, covered, missing, dept_support_needed


def generate_recommended_actions_and_support(
    missing_skills: List[str],
    missing_equipment: List[str],
    missing_software: List[str],
    missing_materials: List[str],
    missing_manpower: List[str],
    missing_safety: List[str],
    budget_gap: Optional[str],
    department_domain: str,
) -> Tuple[List[str], List[str]]:
    """
    Produces actionable recommendations and identifies required external support partners.
    """
    recommendations: List[str] = []
    external_support: List[str] = []

    if missing_equipment:
        items_str = ", ".join(missing_equipment[:3])
        recommendations.append(
            f"Coordinate equipment sharing or rental for specialized machinery ({items_str}) through state depots or industry partners."
        )
        external_support.append("Industry Partner / State Equipment Depot for specialized machinery")

    if missing_materials:
        items_str = ", ".join(missing_materials[:3])
        recommendations.append(
            f"Initiate procurement or corporate CSR sponsorship for physical consumables and construction materials ({items_str})."
        )
        external_support.append("Corporate CSR / Vendor Procurement for raw materials and consumables")

    if missing_skills:
        skills_str = ", ".join(missing_skills[:3])
        recommendations.append(
            f"Onboard an auxiliary technical consultant or secondary institution mentor specializing in {skills_str}."
        )

    if missing_software:
        soft_str = ", ".join(missing_software[:2])
        recommendations.append(
            f"Deploy open-source alternatives or request academic software licensing for {soft_str}."
        )

    if missing_manpower:
        roles_str = ", ".join(missing_manpower[:2])
        recommendations.append(
            f"Engage local municipal trade personnel or contracted labor for field execution ({roles_str})."
        )
        external_support.append("Municipal Operations Team / Contracted Labor for on-site execution")

    if missing_safety:
        recommendations.append(
            "Coordinate with local Traffic Police and Public Safety Department to institute perimeter barricades and safety signage."
        )
        external_support.append("Traffic Police / Department of Public Safety for field site security")

    if budget_gap:
        recommendations.append(
            f"Explore public-private co-funding: {budget_gap}"
        )
        external_support.append("State Innovation Grant / District Mineral Foundation Trust (DMFT) / CSR funding")

    dept_target = department_domain or "competent civic authority"
    recommendations.append(
        f"Secure administrative authorization and inter-departmental permits from {dept_target} before field mobilization."
    )

    return recommendations, external_support


def analyze_capability_gaps(
    report: Report,
    caps: ExtractedCapabilities,
    hei_matches: List[Dict[str, Any]],
    faculty_matches: List[Dict[str, Any]],
    student_matches: List[Dict[str, Any]],
) -> CapabilityGapAnalysis:
    """
    Comprehensive multi-factor capability-gap analysis.
    Evaluates requirements against the candidate academic ecosystem (HEI + Faculty + Students).
    """
    # 1. Aggregate candidate capabilities
    candidate_skills: List[str] = []
    candidate_domains: List[str] = []
    candidate_equipment: List[str] = []
    candidate_labs: List[str] = []
    candidate_software: List[str] = []
    has_faculty = len(faculty_matches) > 0
    has_students = len(student_matches) > 0
    fac_workload = 2
    stu_workload = 1

    verified_count = 0
    unverified_count = 0

    # Aggregate from top HEIs (top 2 candidates)
    for hm in hei_matches[:2]:
        if hm.get("verification_status") == "verified":
            verified_count += 1
        else:
            unverified_count += 1

        matched_caps = hm.get("matched_capabilities", {})
        if isinstance(matched_caps, dict):
            candidate_skills.extend(matched_caps.get("matched_skills", []))
            candidate_domains.extend(matched_caps.get("matched_domains", []))
            candidate_equipment.extend(matched_caps.get("matched_equipment", []))
            candidate_software.extend(matched_caps.get("matched_software", []))

    # Aggregate from top Faculty candidates (top 2 candidates)
    for fm in faculty_matches[:2]:
        if fm.get("verification_status") == "verified":
            verified_count += 1
        else:
            unverified_count += 1
        candidate_skills.extend(fm.get("matched_skills", []))
        candidate_skills.extend(fm.get("skills", []))
        fac_workload = min(fac_workload, int(fm.get("current_workload", 2)))

    # Aggregate from top Student candidates (top 2 candidates)
    for sm in student_matches[:2]:
        if sm.get("verification_status") == "verified":
            verified_count += 1
        else:
            unverified_count += 1
        candidate_skills.extend(sm.get("matched_skills", []))
        candidate_skills.extend(sm.get("skills", []))
        stu_workload = min(stu_workload, int(sm.get("current_workload", 1)))

    # Deduplicate candidate pools
    candidate_skills = list(dict.fromkeys(candidate_skills))
    candidate_domains = list(dict.fromkeys(candidate_domains))
    candidate_equipment = list(dict.fromkeys(candidate_equipment))
    candidate_software = list(dict.fromkeys(candidate_software))

    # 2. Calculate factor scores
    s_score, avail_skills, miss_skills, partial_skills = calculate_skills_coverage(
        required_skills=caps.skills,
        candidate_skills=candidate_skills,
        candidate_domains=candidate_domains,
    )

    d_score, cov_domains, miss_domains = calculate_domains_coverage(
        required_domains=caps.technical_domains,
        candidate_domains=candidate_domains,
    )

    e_score, cov_equip, miss_equip = calculate_equipment_coverage(
        required_equipment=caps.equipment,
        candidate_equipment=candidate_equipment,
        candidate_labs=candidate_labs,
    )

    sw_score, cov_sw, miss_sw = calculate_software_coverage(
        required_software=caps.software_tools,
        candidate_software=candidate_software,
    )

    m_score, cov_mp, miss_mp = calculate_manpower_coverage(
        required_manpower=caps.manpower,
        has_faculty=has_faculty,
        has_students=has_students,
        faculty_workload=fac_workload,
        student_workload=stu_workload,
    )

    saf_score, cov_saf, miss_saf = calculate_safety_coverage(
        required_safety=caps.safety_requirements,
        candidate_domains=candidate_domains,
        has_faculty=has_faculty,
    )

    mat_score, cov_mat, miss_mat, dept_support = calculate_materials_and_domain_coverage(
        required_materials=caps.materials,
        department_domain=caps.department_domain,
        complexity=caps.complexity,
    )

    # 3. Overall Coverage and Gap Calculation
    total_coverage = round(s_score + d_score + e_score + sw_score + m_score + saf_score + mat_score, 1)
    total_coverage = min(100.0, max(0.0, total_coverage))
    gap_percentage = round(100.0 - total_coverage, 1)

    # Classify Gap Severity according to rubric:
    # minimal: 0–15% gap
    # moderate: 16–35% gap
    # significant: 36–60% gap
    # critical: above 60% gap
    if gap_percentage <= 15.0:
        severity = "minimal"
    elif gap_percentage <= 35.0:
        severity = "moderate"
    elif gap_percentage <= 60.0:
        severity = "significant"
    else:
        severity = "critical"

    # Budget Gap Context
    budget_gap_str = None
    if caps.budget_max is not None and caps.budget_max > 0:
        b_min = f"₹{caps.budget_min:,.0f}" if caps.budget_min else "₹0"
        b_max = f"₹{caps.budget_max:,.0f}"
        budget_gap_str = f"Estimated project cost is {b_min} - {b_max}. Institutional research covers technical design; capital outlay requires external allocation."

    # Recommended Actions and External Support
    recs, ext_support = generate_recommended_actions_and_support(
        missing_skills=miss_skills,
        missing_equipment=miss_equip,
        missing_software=miss_sw,
        missing_materials=miss_mat,
        missing_manpower=miss_mp,
        missing_safety=miss_saf,
        budget_gap=budget_gap_str,
        department_domain=caps.department_domain,
    )

    factor_scores_obj = GapFactorScores(
        skills_coverage=s_score,
        domains_coverage=d_score,
        equipment_coverage=e_score,
        software_coverage=sw_score,
        manpower_coverage=m_score,
        safety_coverage=saf_score,
        materials_coverage=mat_score,
    )

    verification_summary_obj = VerificationSummary(
        has_unverified_entities=unverified_count > 0,
        verified_count=verified_count,
        unverified_count=unverified_count,
        verification_notes=(
            f"Evaluated {verified_count} verified and {unverified_count} unverified academic demo profiles. "
            "Formal administrative credentialing is required before project commencement."
        ),
    )

    explanation = (
        f"Overall capability coverage is {total_coverage}% ({severity} gap of {gap_percentage}%). "
        f"Skills coverage: {s_score}/25 pts ({len(avail_skills)} covered, {len(partial_skills)} partial, {len(miss_skills)} missing); "
        f"Technical domains: {d_score}/20 pts; Equipment & labs: {e_score}/15 pts; Software & CAD: {sw_score}/10 pts; "
        f"Manpower capacity: {m_score}/10 pts; Safety oversight: {saf_score}/10 pts; Materials & domain feasibility: {mat_score}/10 pts."
    )

    return CapabilityGapAnalysis(
        coverage_score=total_coverage,
        gap_percentage=gap_percentage,
        gap_severity=severity,
        factor_scores=factor_scores_obj,
        available_skills=avail_skills,
        missing_skills=miss_skills,
        partially_available_skills=partial_skills,
        missing_technical_domains=miss_domains,
        missing_equipment=miss_equip,
        missing_software_tools=miss_sw,
        missing_manpower=miss_mp,
        missing_materials=miss_mat,
        missing_budget=budget_gap_str,
        missing_safety_expertise=miss_saf,
        missing_department_support=dept_support,
        covered_capabilities={
            "skills": avail_skills,
            "domains": cov_domains,
            "equipment": cov_equip,
            "software": cov_sw,
            "manpower": cov_mp,
            "safety": cov_saf,
            "materials": cov_mat,
        },
        missing_capabilities={
            "skills": miss_skills,
            "domains": miss_domains,
            "equipment": miss_equip,
            "software": miss_sw,
            "manpower": miss_mp,
            "safety": miss_saf,
            "materials": miss_mat,
        },
        recommended_actions=recs,
        required_external_support=ext_support,
        verification_summary=verification_summary_obj,
        confidence=0.88,
        explanation=explanation,
    )


def analyze_and_store_report_capability_gaps(db: Session, report: Report) -> None:
    """
    Analyzes capability gaps for a report and persists results into PostgreSQL.
    Non-blocking: will never raise or crash report submission or status transitions.
    """
    try:
        raw_caps = report.ai_capabilities
        if not raw_caps or not isinstance(raw_caps, dict):
            logger.info(f"Report {report.track_id} has no capabilities yet; capability gap analysis marked pending.")
            report.ai_capability_gap_status = "pending"
            db.commit()
            return

        try:
            caps_obj = ExtractedCapabilities(**raw_caps)
        except Exception:
            caps_obj = None

        if caps_obj is None:
            report.ai_capability_gap_status = "needs_review"
            db.commit()
            return

        # Fetch HEI, Faculty, and Student matches
        hei_matches = report.ai_hei_matches if isinstance(report.ai_hei_matches, list) else []
        faculty_matches = report.ai_faculty_matches if isinstance(report.ai_faculty_matches, list) else []
        student_matches = report.ai_student_matches if isinstance(report.ai_student_matches, list) else []

        gap_analysis = analyze_capability_gaps(
            report=report,
            caps=caps_obj,
            hei_matches=hei_matches,
            faculty_matches=faculty_matches,
            student_matches=student_matches,
        )

        report.ai_capability_gap_status = "completed"
        report.ai_capability_gap_analysis = gap_analysis.model_dump()
        report.ai_capability_gap_score = gap_analysis.coverage_score
        report.ai_capability_gap_severity = gap_analysis.gap_severity
        report.ai_capability_gap_model = AI_CAPABILITY_GAP_MODEL
        report.ai_capability_gap_analyzed_at = datetime.now(timezone.utc)

        db.commit()
        db.refresh(report)
        logger.info(
            f"Capability-Gap analysis stored for {report.track_id}: "
            f"Coverage={gap_analysis.coverage_score}%, Severity={gap_analysis.gap_severity}"
        )
    except Exception as e:
        logger.error(f"Failed to calculate capability-gap analysis for {report.track_id}: {e}", exc_info=True)
        try:
            report.ai_capability_gap_status = "failed"
            db.commit()
        except Exception:
            db.rollback()
