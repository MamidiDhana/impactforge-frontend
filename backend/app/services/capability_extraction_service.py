import re
import json
import logging
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple
import httpx
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.report import Report
from app.schemas.capability_schema import (
    CONTROLLED_SKILLS,
    CONTROLLED_DOMAINS,
    CapabilityResponse,
    ExtractedCapabilities,
)

logger = logging.getLogger("capability_extraction_service")


def _clean_and_filter_skills(skills: List[str]) -> List[str]:
    """Filters and maps skills against the controlled vocabulary."""
    valid_skills = []
    lower_map = {s.lower(): s for s in CONTROLLED_SKILLS}
    for s in skills:
        cleaned = s.strip().lower()
        if cleaned in lower_map:
            if lower_map[cleaned] not in valid_skills:
                valid_skills.append(lower_map[cleaned])
        else:
            # Fuzzy match keywords
            for cs in CONTROLLED_SKILLS:
                if any(w in cleaned for w in cs.split()) and cs not in valid_skills:
                    valid_skills.append(cs)
                    break
    if not valid_skills:
        valid_skills = ["project management"]
    return valid_skills


def _clean_and_filter_domains(domains: List[str], primary_domain: str = "") -> List[str]:
    """Filters domains against controlled domains list."""
    valid_domains = []
    lower_map = {d.lower(): d for d in CONTROLLED_DOMAINS}
    for d in domains:
        cleaned = d.strip().lower()
        if cleaned in lower_map:
            if lower_map[cleaned] not in valid_domains:
                valid_domains.append(lower_map[cleaned])
        else:
            for cd in CONTROLLED_DOMAINS:
                if any(w in cleaned for w in cd.split()) and cd not in valid_domains:
                    valid_domains.append(cd)
                    break
    if not valid_domains:
        valid_domains = [primary_domain] if primary_domain in CONTROLLED_DOMAINS else ["general civic maintenance"]
    return valid_domains


def _parse_budget_mentions(text: str) -> Tuple[Optional[float], Optional[float]]:
    """Attempts to extract budget mentions (e.g. Rs 50,000 or 1 lakh)."""
    text_lower = text.lower()
    # Check for lakh patterns
    lakh_match = re.search(r"(\d+(?:\.\d+)?)\s*(?:lakh|lac|lakhs)", text_lower)
    if lakh_match:
        val = float(lakh_match.group(1)) * 100000.0
        return val * 0.8, val * 1.2

    # Check for numbers preceded by rs/inr/rupees/₹
    num_match = re.search(r"(?:rs\.?|inr|rupees|₹)\s*([\d,]+)", text_lower)
    if num_match:
        try:
            num_str = num_match.group(1).replace(",", "")
            val = float(num_str)
            if val > 100:
                return val * 0.9, val * 1.1
        except ValueError:
            pass

    return None, None


def _heuristic_fallback_capabilities(
    title: str,
    description: str,
    category: Optional[str] = None,
    priority: Optional[str] = None,
) -> Tuple[ExtractedCapabilities, float, List[str]]:
    """
    Deterministic rule-based NLP extraction supporting English, Hindi, and Telugu.
    Maps civic problem text into structured capability requirements.
    """
    text = f"{title} {description} {category or ''}".lower()
    reasons: List[str] = []

    # Detect budget if mentioned
    b_min, b_max = _parse_budget_mentions(f"{title} {description}")

    # Determine complexity based on priority or hazardous indicators
    if priority and priority.lower() == "critical":
        complexity = "high"
        duration = 60
    elif priority and priority.lower() == "high":
        complexity = "high"
        duration = 45
    elif priority and priority.lower() == "low":
        complexity = "low"
        duration = 14
    else:
        complexity = "medium"
        duration = 30

    # 1. Water and Sanitation
    if any(k in text for k in [
        "water", "pipe", "leak", "drain", "sewage", "gutter", "borewell", "sanitation", "overflow",
        "पानी", "सीवर", "नाली", "पाइप", "नीरु", "మురుగు", "పైపు"
    ]):
        skills = ["water management", "civil engineering", "public health"]
        domains = ["water & wastewater", "public health & sanitation"]
        equipment = ["Pipe inspection CCTV crawler", "High-pressure sewer jetting machine", "Dewatering pump"]
        materials = ["PVC/HDPE conduit pipes", "High-grade rubberized gaskets", "Joint sealant compound"]
        software = ["EPANET hydraulic network simulation", "QGIS spatial drainage mapping"]
        manpower = ["1 Hydraulic Engineer", "2 Certified Pipe Fitters", "3 Municipal Sanitation Workers"]
        safety = [
            "Hazardous H2S gas detection meters before trench entry",
            "Heavy-duty chemical-resistant nitrile gloves and rubber boots",
            "Reflective perimeter safety barricades around excavation pit",
        ]
        dept = "Public Health Engineering Department (PHED)"
        reasons.append("Identified water/wastewater keywords; assigned hydraulic engineering and sanitation resources.")

    # 2. Roads and Transport
    elif any(k in text for k in [
        "road", "pothole", "pavement", "traffic", "bridge", "highway", "asphalt",
        "सड़क", "गड्ढा", "मार्ग", "रस्ता", "రహదారి", "గుంతలు", "వంతెన"
    ]):
        skills = ["civil engineering", "construction", "surveying"]
        domains = ["civil infrastructure", "urban planning & transportation"]
        equipment = ["Vibratory asphalt road roller", "Diamond-blade pavement cutter", "Total station survey meter"]
        materials = ["Bituminous cold/hot mix asphalt", "Graded crushed aggregate base course", "Thermoplastic road marking paint"]
        software = ["AutoCAD Civil 3D", "QGIS transportation layer"]
        manpower = ["1 Civil Pavement Engineer", "1 Surveyor", "4 Construction Laborers"]
        safety = [
            "Retroreflective class-3 safety vests for all workers",
            "Fluorescent traffic diversion cones and advance warning signage",
            "Steel-toe protective work boots and dust masks",
        ]
        dept = "Road Construction Department (RCD)"
        reasons.append("Identified road and pavement disruption; allocated civil construction and traffic safety protocols.")

    # 3. Electrical and Power Safety
    elif any(k in text for k in [
        "wire", "electric", "shock", "transformer", "streetlight", "pole", "power", "spark",
        "बिजली", "तार", "ट्रांसफार्मर", "करंट", "విద్యుత్", "వైర్", "ట్రాన్స్‌ఫార్మర్"
    ]):
        skills = ["electrical engineering", "project management"]
        domains = ["electrical grid & power"]
        equipment = ["High-voltage insulation digital multimeter", "Hydraulic terminal cable crimper", "Insulated utility bucket vehicle"]
        materials = ["XLPE high-voltage insulated aluminum cables", "Surge arrestors", "Porcelain pin insulators"]
        software = ["ETAP electrical distribution power simulator", "SCADA grid telemetry monitoring"]
        manpower = ["1 Senior High-Voltage Electrical Engineer", "2 Certified Linemen", "1 Safety Compliance Officer"]
        safety = [
            "11kV-rated dielectric high-voltage insulated gloves",
            "Arc flash protective face shield and fire-retardant suit",
            "Strict Lockout/Tagout (LOTO) breaker isolation procedure before commencement",
        ]
        dept = "Jharkhand Bijli Vitran Nigam Limited (JBVNL)"
        reasons.append("Identified electrical power infrastructure hazard; allocated certified electrical engineering and arc-flash PPE.")

    # 4. Waste and Environment
    elif any(k in text for k in [
        "waste", "garbage", "dump", "pollution", "plastic", "smell", "dumping",
        "कचरा", "गंदगी", "प्रदूषण", "प्लास्टिक", "చెత్త", "కాలుష్యం"
    ]):
        skills = ["waste management", "environmental science", "public health"]
        domains = ["waste & recycling management", "environmental monitoring"]
        equipment = ["Solid waste hydraulic compactor vehicle", "Ambient air quality particulate monitor", "Tipping sorting trailer"]
        materials = ["Heavy-duty tear-resistant biodegradable sacks", "Odor neutralizer probiotic compound", "Heavy containment tarpaulins"]
        software = ["Municipal Solid Waste Route Optimization GIS", "AQI telemetry dashboard"]
        manpower = ["1 Environmental Health Officer", "1 Sanitation Supervisor", "4 Solid Waste Handlers"]
        safety = [
            "N95 / FFP2 particulate respirators",
            "Puncture-resistant heavy rubberized gloves",
            "Full biohazard protective coveralls and eye shields",
        ]
        dept = "Municipal Corporation & Urban Development"
        reasons.append("Identified solid waste or environmental pollution; allocated sanitation, air monitoring, and biohazard safeguards.")

    # 5. Healthcare and Medical Supply
    elif any(k in text for k in [
        "health", "hospital", "clinic", "medicine", "doctor", "nurse", "patient", "vaccine",
        "अस्पताल", "दवा", "इलाज", "डॉक्टर", "వైద్య", "ఆసుపత్రి", "మందులు"
    ]):
        skills = ["public health", "data analysis", "project management"]
        domains = ["public health & sanitation"]
        equipment = ["Cold chain solar vaccine refrigerator", "Digital multi-parameter vital signs monitor", "Benchtop autoclave sterilizer"]
        materials = ["Essential generic antibiotics & ORS packets", "Surgical disposable PPE packs", "Hospital-grade antiseptic concentrate"]
        software = ["e-Aushadhi drug inventory logistics system", "HMIS public health analytics portal"]
        manpower = ["1 Public Health Medical Specialist", "1 Certified Pharmacist", "2 Auxiliary Nurse Midwives"]
        safety = [
            "Strict clinical biomedical waste disposal container protocols",
            "Sterile disposable examination gloves and alcohol rub stations",
            "Isolated patient screening partition",
        ]
        dept = "Department of Health, Medical Education & Family Welfare"
        reasons.append("Identified medical or clinical supply challenge; assigned public health specialist and pharmaceutical inventory tools.")

    # 6. Default Fallback
    else:
        skills = ["project management", "surveying", "data analysis"]
        domains = ["general civic maintenance"]
        equipment = ["Handheld GPS locator", "Field survey measurement kit", "Digital inspection tablet"]
        materials = ["Standard civic maintenance hardware", "Reflective informational signage"]
        software = ["ImpactForge civic lifecycle portal", "QGIS spatial data platform"]
        manpower = ["1 Lead Project Coordinator", "1 Civic Field Surveyor", "2 General Municipal Technicians"]
        safety = [
            "High-visibility safety vests",
            "Basic industrial first aid kit",
            "Protective work gloves",
        ]
        dept = "District Administration & Municipal Council"
        reasons.append("General civic inquiry; allocated universal project management, survey measurement, and administrative resources.")

    # Validate skills and domains against controlled vocabulary
    valid_skills = _clean_and_filter_skills(skills)
    valid_domains = _clean_and_filter_domains(domains, dept)

    capabilities = ExtractedCapabilities(
        skills=valid_skills,
        technical_domains=valid_domains,
        equipment=equipment,
        materials=materials,
        software_tools=software,
        manpower=manpower,
        complexity=complexity,
        estimated_duration_days=duration,
        budget_min=b_min,
        budget_max=b_max,
        safety_requirements=safety,
        department_domain=dept,
    )

    confidence = 0.88 if reasons else 0.70
    return capabilities, confidence, reasons


def extract_capabilities_with_ai(
    title: str,
    description: str,
    category: Optional[str] = None,
    priority: Optional[str] = None,
) -> Tuple[ExtractedCapabilities, float, List[str], str]:
    """
    Extracts structured capabilities using configured AI model (Gemini/OpenAI)
    with automatic deterministic fallback on failure or missing API key.
    """
    if not settings.AI_ENABLED or not settings.AI_API_KEY:
        logger.info("AI extraction disabled or API key missing; utilizing deterministic heuristic fallback.")
        caps, conf, reasons = _heuristic_fallback_capabilities(title, description, category, priority)
        return caps, conf, reasons, "offline_heuristic_fallback"

    prompt = f"""
You are an expert civic engineering and public infrastructure technical analyst for the ImpactForge platform.
Analyze the following citizen-reported civic issue and extract all required resources and capabilities needed to assess and resolve it.

REPORT DETAILS:
Title: {title}
Description: {description}
Category: {category or 'General'}
Priority: {priority or 'Medium'}

CONTROLLED SKILLS (You MUST only select skills from this exact list):
{json.dumps(CONTROLLED_SKILLS, indent=2)}

CONTROLLED TECHNICAL DOMAINS (You MUST only select domains from this exact list):
{json.dumps(CONTROLLED_DOMAINS, indent=2)}

Respond ONLY with a valid, raw JSON object matching this schema:
{{
  "skills": ["string from CONTROLLED SKILLS"],
  "technical_domains": ["string from CONTROLLED TECHNICAL DOMAINS"],
  "equipment": ["specific tools or machinery"],
  "materials": ["specific physical supplies or consumables"],
  "software_tools": ["software or simulation tools"],
  "manpower": ["roles with counts, e.g. '1 Civil Engineer'"],
  "complexity": "low" | "medium" | "high",
  "estimated_duration_days": integer (e.g. 30),
  "budget_min": number or null,
  "budget_max": number or null,
  "safety_requirements": ["concrete safety precautions and PPE"],
  "department_domain": "string (name of responsible government department)",
  "confidence_score": float between 0.50 and 1.00,
  "reasons": ["brief explainable reasons for these requirements"]
}}
"""

    try:
        if settings.AI_PROVIDER == "openai":
            url = "https://api.openai.com/v1/chat/completions"
            headers = {
                "Authorization": f"Bearer {settings.AI_API_KEY}",
                "Content-Type": "application/json",
            }
            payload = {
                "model": settings.AI_MODEL,
                "messages": [
                    {"role": "system", "content": "You are a technical resource extraction specialist. Respond in JSON only."},
                    {"role": "user", "content": prompt},
                ],
                "response_format": {"type": "json_object"},
                "temperature": 0.1,
            }
            with httpx.Client(timeout=10.0) as client:
                resp = client.post(url, headers=headers, json=payload)
                resp.raise_for_status()
                data = resp.json()
                raw_text = data["choices"][0]["message"]["content"]
                parsed = json.loads(raw_text)
        else:
            # Default to Google Gemini REST
            models_to_try = [settings.AI_MODEL]
            fallback = getattr(settings, "AI_FALLBACK_MODEL", "gemini-3.5-flash-lite")
            for fb in [fallback, "gemini-3.5-flash"]:
                if fb and fb not in models_to_try:
                    models_to_try.append(fb)

            parsed = None
            last_error = None
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
            with httpx.Client(timeout=25.0) as client:
                for model in models_to_try:
                    try:
                        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
                        resp = client.post(url, json=payload, headers=headers)
                        resp.raise_for_status()
                        data = resp.json()
                        raw_text = data["candidates"][0]["content"]["parts"][0]["text"]
                        parsed = json.loads(raw_text)
                        break
                    except Exception as err:
                        last_error = err
                        logger.warning(f"Gemini capability call with model '{model}' failed: {err}")
                        continue

            if parsed is None:
                if last_error:
                    raise last_error
                raise RuntimeError("No Gemini model succeeded for capability extraction.")

        # Validate and sanitize fields
        skills = _clean_and_filter_skills(parsed.get("skills", []))
        domains = _clean_and_filter_domains(parsed.get("technical_domains", []))
        complexity = parsed.get("complexity", "medium")
        if complexity not in ["low", "medium", "high"]:
            complexity = "medium"

        conf = float(parsed.get("confidence_score", 0.85))
        conf = max(0.0, min(1.0, conf))

        caps = ExtractedCapabilities(
            skills=skills,
            technical_domains=domains,
            equipment=parsed.get("equipment", []),
            materials=parsed.get("materials", []),
            software_tools=parsed.get("software_tools", []),
            manpower=parsed.get("manpower", []),
            complexity=complexity,
            estimated_duration_days=parsed.get("estimated_duration_days"),
            budget_min=parsed.get("budget_min"),
            budget_max=parsed.get("budget_max"),
            safety_requirements=parsed.get("safety_requirements", []),
            department_domain=parsed.get("department_domain", "Municipal Department"),
        )
        reasons = parsed.get("reasons", ["Extracted technical requirements via AI model."])
        return caps, conf, reasons, settings.AI_MODEL

    except Exception as e:
        logger.warning(f"AI capability extraction failed ({e}); switching to deterministic heuristic fallback.")
        caps, conf, reasons = _heuristic_fallback_capabilities(title, description, category, priority)
        reasons.append("Applied deterministic rule-based extraction fallback.")
        return caps, conf, reasons, "offline_heuristic_fallback"


def analyze_and_store_report_capabilities(db: Session, report: Report) -> None:
    """
    Executes capability extraction and stores structured requirements in PostgreSQL.
    Non-blocking: will never cause report creation or callers to crash.
    """
    try:
        title = report.problem_title or ""
        desc = report.context_and_desired_outcome or ""
        cat = report.category or report.ai_category or ""
        prio = report.priority or report.ai_priority or "Medium"

        caps, conf, reasons, model_used = extract_capabilities_with_ai(
            title=title,
            description=desc,
            category=cat,
            priority=prio,
        )

        status = "completed" if conf >= 0.70 and caps.skills else "needs_review"

        report.ai_capability_status = status
        report.ai_capabilities = caps.model_dump()
        report.ai_capability_confidence = round(conf, 2)
        report.ai_capability_reasons = reasons
        report.ai_capability_model = model_used
        report.ai_capability_analyzed_at = datetime.now(timezone.utc)

        db.commit()
        db.refresh(report)
        logger.info(
            f"AI capability extraction stored for {report.track_id}: "
            f"{len(caps.skills)} skills, {len(caps.equipment)} equipment, status={status}"
        )
    except Exception as e:
        logger.error(f"Failed to store capabilities for {report.track_id}: {e}", exc_info=True)
        report.ai_capability_status = "failed"
        try:
            db.commit()
        except Exception:
            db.rollback()
