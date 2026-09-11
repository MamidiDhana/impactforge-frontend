import json
import logging
import re
from datetime import datetime, timezone
from typing import Any, Dict, Optional, Tuple
import httpx
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.report import Report
from app.models.audit_log import AuditLog

logger = logging.getLogger("ai_routing_service")


def _heuristic_evaluate_routing(
    title: str,
    category: str,
    context: str,
    efforts: str,
    outcome: str,
) -> Tuple[bool, bool, str, str]:
    """
    Deterministic rule-based fallback evaluation for problem routing.
    Returns: (requires_funding, university_can_solve, routing_target, reasoning)
    
    Truth Table:
    - No funding  + University can solve    -> 'university'
    - Funding     + University can solve    -> 'both'
    - Funding     + University cannot solve -> 'partner'
    - No funding  + University cannot solve -> 'neither'
    """
    full_text = f"{title} {category} {context} {efforts} {outcome}".lower()

    # Funding indicators
    funding_indicators = [
        "fund", "budget", "cost", "crore", "lakh", "capital", "sponsor",
        "procure", "purchase", "equipment purchase", "investment", "financial",
        "civil work", "construction", "pipeline laying", "plant installation",
        "infrastructure build", "hardware deployment", "grant", "subsidy", "expensive"
    ]
    low_cost_indicators = [
        "zero cost", "low cost", "open source", "software only", "policy",
        "guideline", "advisory", "awareness", "survey", "curriculum", "algorithm",
        "analysis only", "free", "volunteer"
    ]

    has_funding_need = any(kw in full_text for kw in funding_indicators)
    has_low_cost_signal = any(kw in full_text for kw in low_cost_indicators)

    requires_funding = has_funding_need and not has_low_cost_signal

    # University feasibility indicators
    uni_solvable_indicators = [
        "research", "study", "analysis", "testing", "laboratory", "sensor", "iot",
        "water quality", "soil", "contaminat", "arsenic", "heavy metal", "prototype",
        "algorithm", "software", "portal", "ai", "machine learning", "engineering",
        "design", "gis", "mapping", "drone", "solar design", "biogas", "telehealth",
        "mobile app", "treatment system", "filtration model", "crop disease",
        "data model", "environmental monitoring", "renewable", "biotech"
    ]
    uni_unsuitable_indicators = [
        "pothole filling", "garbage collection", "sweep", "police patrol",
        "law and order", "bureaucracy", "pension delay", "ration card",
        "land dispute", "court case", "routine drain cleaning", "broken tap",
        "road resurfacing contractor", "traffic signal bulb"
    ]

    has_uni_match = any(kw in full_text for kw in uni_solvable_indicators)
    has_uni_unsuitable = any(kw in full_text for kw in uni_unsuitable_indicators)

    # University can solve if it requires research/prototyping/labs/software/engineering
    # and isn't purely administrative municipal maintenance
    university_can_solve = has_uni_match or (not has_uni_unsuitable and category in [
        "Water and Sanitation", "Agriculture", "Environment", "Healthcare", "Education"
    ])

    if has_uni_unsuitable:
        university_can_solve = False

    # Apply strict 4-way decision matrix
    if not requires_funding and university_can_solve:
        routing_target = "university"
        reasoning = (
            "Problem can be solved through university academic research, engineering prototyping, "
            "or computational analysis without requiring substantial external capital/partner funding."
        )
    elif requires_funding and university_can_solve:
        routing_target = "both"
        reasoning = (
            "Problem requires external partner/CSR capital funding for infrastructure/materials, "
            "combined with university technical research, lab testing, and engineering innovation."
        )
    elif requires_funding and not university_can_solve:
        routing_target = "partner"
        reasoning = (
            "Problem requires external funding and operational resources, but falls outside the scope of "
            "academic research or student innovation teams (better suited for civil/CSR partners)."
        )
    else:
        routing_target = "neither"
        reasoning = (
            "Problem does not require external partner funding and is outside academic/university scope; "
            "retained for direct government municipal or administrative departmental handling."
        )

    return requires_funding, university_can_solve, routing_target, reasoning


def _call_gemini_routing_decision(
    title: str,
    category: str,
    context: str,
    efforts: str,
    outcome: str,
    locality: str,
    district: str,
) -> Dict[str, Any]:
    """Calls Google Gemini API for structured routing assessment."""
    models_to_try = [settings.AI_MODEL]
    fallback = getattr(settings, "AI_FALLBACK_MODEL", "gemini-3.5-flash-lite")
    for fb in [fallback, "gemini-3.5-flash"]:
        if fb and fb not in models_to_try:
            models_to_try.append(fb)

    prompt = f"""You are the ImpactForge AI Governance Routing Engine for the Government of Jharkhand.
A civic problem has been validated by a Government officer.
Analyze this problem and make two decisions:

1. `requires_funding`: boolean
   - Does solving or implementing the solution for this problem require external capital expenditure, grants, CSR sponsorships, or third-party funding (e.g., infrastructure construction, hardware procurement, civil works, physical materials)?
   - Answer false if it can be resolved purely through existing operational resources, zero/low-cost software, student innovation, academic research, policy studies, or advisory frameworks.

2. `university_can_solve`: boolean
   - Is this challenge suitable for a University / Higher Education Institution (HEI) faculty, researchers, engineering students, or accredited labs to solve via research, testing, prototyping, software, GIS, or academic intervention?
   - Answer false if it is purely routine municipal garbage sweeping, manual pothole patching, law enforcement, land title disputes, or standard municipal operational maintenance.

PROBLEM DETAILS:
Title: {title}
Category: {category}
District: {district}, Locality: {locality}
Context & Desired Outcome: {context}
Existing Efforts: {efforts}
Expected Outcome: {outcome}

Return JSON strictly matching this schema:
{{
  "requires_funding": boolean,
  "university_can_solve": boolean,
  "reasoning": "A concise 2-sentence rationale explaining the funding need and university suitability."
}}
"""

    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "response_mime_type": "application/json",
            "temperature": 0.1,
        },
    }
    headers = {
        "x-goog-api-key": settings.AI_API_KEY or "",
        "Content-Type": "application/json",
    }

    last_error = None
    with httpx.Client(timeout=25.0) as client:
        for model in models_to_try:
            try:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
                resp = client.post(url, json=payload, headers=headers)
                resp.raise_for_status()
                data = resp.json()
                raw_text = data["candidates"][0]["content"]["parts"][0]["text"]
                parsed = json.loads(raw_text)
                parsed["model"] = model
                return parsed
            except Exception as err:
                last_error = err
                logger.warning(f"Gemini routing evaluation call with model '{model}' failed: {err}")
                continue

    if last_error:
        raise last_error
    raise RuntimeError("No Gemini model succeeded.")


def evaluate_and_route_problem(
    db: Session,
    report: Report,
    actor_email: Optional[str] = None,
    actor_id: Optional[int] = None,
) -> Report:
    """
    Evaluates a Government-validated problem and assigns it to:
    - 'university' (No funding + University can solve)
    - 'both'       (Funding + University can solve)
    - 'partner'    (Funding + University cannot solve)
    - 'neither'    (No funding + University cannot solve)

    Saves the routing target and rationale to the report and logs an audit record.
    """
    title = report.problem_title or ""
    category = report.category or ""
    context = report.context_and_desired_outcome or ""
    efforts = report.existing_efforts or ""
    outcome = report.expected_outcome or ""
    locality = report.locality or ""
    district = report.district or ""

    ai_model_name = "heuristic-rule-engine-v1"
    requires_funding = False
    university_can_solve = False
    reasoning = ""

    # Attempt Gemini API if enabled and API key is present
    if settings.AI_ENABLED and settings.AI_API_KEY and not settings.AI_API_KEY.startswith("mock_"):
        try:
            gemini_res = _call_gemini_routing_decision(
                title=title,
                category=category,
                context=context,
                efforts=efforts,
                outcome=outcome,
                locality=locality,
                district=district,
            )
            requires_funding = bool(gemini_res.get("requires_funding", False))
            university_can_solve = bool(gemini_res.get("university_can_solve", False))
            reasoning = gemini_res.get("reasoning", "")
            ai_model_name = gemini_res.get("model", settings.AI_MODEL)
            logger.info(f"Successfully evaluated routing with Gemini ({ai_model_name}) for {report.track_id}")
        except Exception as e:
            logger.warning(f"Gemini routing API call failed for {report.track_id}, using heuristic fallback: {e}")
            requires_funding, university_can_solve, _, reasoning = _heuristic_evaluate_routing(
                title, category, context, efforts, outcome
            )
            ai_model_name = "heuristic-fallback-v1"
    else:
        requires_funding, university_can_solve, _, reasoning = _heuristic_evaluate_routing(
            title, category, context, efforts, outcome
        )
        ai_model_name = "heuristic-rule-engine-v1"

    # Compute routing target strictly by truth table
    if not requires_funding and university_can_solve:
        routing_target = "university"
    elif requires_funding and university_can_solve:
        routing_target = "both"
    elif requires_funding and not university_can_solve:
        routing_target = "partner"
    else:
        routing_target = "neither"

    now = datetime.now(timezone.utc)
    report.routing_target = routing_target
    report.requires_funding = requires_funding
    report.university_can_solve = university_can_solve
    report.ai_routing_reason = reasoning
    report.ai_routing_analyzed_at = now
    report.ai_routing_model = ai_model_name

    # Set assigned role to the routing target
    if routing_target == "university":
        report.assigned_role = "hei"
        report.assigned_to = "Higher Education Institutions Network"
    elif routing_target == "partner":
        report.assigned_role = "partner"
        report.assigned_to = "CSR & Funding Partners Network"
    elif routing_target == "both":
        report.assigned_role = "both"
        report.assigned_to = "HEI Research & CSR Partner Coalition"
    else:
        report.assigned_role = "government"
        report.assigned_to = "Jharkhand District Administration"

    report.assigned_at = now
    report.assigned_by = actor_email or "AI Routing Engine"
    report.updated_at = now

    # Record AuditLog
    audit_entry = AuditLog(
        actor_user_id=actor_id,
        actor_email=actor_email or "ai-routing@impactforge.gov.in",
        action="ai_routing_decision_applied",
        entity_type="report",
        entity_id=report.track_id,
        metadata_json=json.dumps({
            "track_id": report.track_id,
            "problem_title": report.problem_title,
            "requires_funding": requires_funding,
            "university_can_solve": university_can_solve,
            "routing_target": routing_target,
            "reasoning": reasoning,
            "ai_model": ai_model_name,
            "rule_applied": (
                "No funding + University can solve -> University" if routing_target == "university"
                else "Funding + University can solve -> University + Partner" if routing_target == "both"
                else "Funding + University cannot solve -> Partner" if routing_target == "partner"
                else "No funding + University cannot solve -> Neither"
            ),
        }),
    )
    db.add(audit_entry)
    db.commit()
    db.refresh(report)

    logger.info(
        f"Problem {report.track_id} routed to '{routing_target}' "
        f"(requires_funding={requires_funding}, university_can_solve={university_can_solve}) by {ai_model_name}"
    )
    return report
