import json
import logging
import re
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Set, Tuple
import httpx
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.report import Report
from app.schemas.priority_schema import (
    PriorityFactors,
    PriorityScoringOutput,
)

logger = logging.getLogger("priority_service")

# Multilingual Urgency Indicators (English, Hindi, Telugu)
# Maps indicator category key to list of regex patterns or keywords
INDICATOR_PATTERNS: Dict[str, List[str]] = {
    "accident": [
        r"\baccident\b", r"\baccidents\b", r"\bcrash\b", r"\bcollision\b",
        r"दुर्घटना", r"टक्कर",
        r"ప్రమాదం", r"ఢీకొనడం"
    ],
    "injury": [
        r"\binjur(?:y|ies|ed)\b", r"\bhurt\b", r"\bcasualt(?:y|ies)\b", r"\bwound(?:ed)?\b",
        r"चोट", r"घायल", r"ज़ख्मी", r"हताहत",
        r"గాయం", r"గాయపడిన", r"క్షతగాత్రులు"
    ],
    "death": [
        r"\bdeath\b", r"\bfatal(?:ity)?\b", r"\bdead\b", r"\bdied\b",
        r"मौत", r"मृत्यु", r"मृतक",
        r"మరణం", r"చనిపోయిన", r"మృతి"
    ],
    "danger": [
        r"\bdanger(?:ous)?\b", r"\bhazard(?:ous)?\b", r"\bperil(?:ous)?\b", r"\brisk of life\b",
        r"खतरा", r"खतरनाक", r"जोखिम",
        r"ప్రమాదకరమైన", r"ముప్పు", r"భయంకరమైన"
    ],
    "collapsed": [
        r"\bcollaps(?:ed|e|ing)\b", r"\bcave[ -]in\b", r"\bcaved[ -]in\b", r"\bfall(?:en)? down\b",
        r"ढहना", r"ढह गया", r"गिरा", r"गिर गया",
        r"కూలిపోయింది", r"కూలిపోవడం", r"పడిపోయింది"
    ],
    "fire": [
        r"\bfire\b", r"\bblaze\b", r"\bflame[s]?\b", r"\bburning\b", r"\bexplosion\b",
        r"आग", r"जलना", r"धमाका",
        r"మంటలు", r"అగ్ని", r"పేలుడు", r"కాలిన"
    ],
    "flood": [
        r"\bflood(?:ing|ed)?\b", r"\bsubmerged\b", r"\bwaterlogg(?:ing|ed)\b", r"\bdrown(?:ing)?\b",
        r"बाढ़", r"जलभराव", r"डूबना",
        r"వరద", r"ముంపు", r"నీరు నిలవడం", r"మునిగిపోవడం"
    ],
    "emergency": [
        r"\bemergency\b", r"\bcrisis\b", r"\bcritical condition\b",
        r"आपातकाल", r"आपातकालीन", r"गंभीर संकट",
        r"అత్యవసరం", r"సంక్షోభం"
    ],
    "blocked road": [
        r"\bblocked road\b", r"\broad block(?:ed)?\b", r"\btraffic halted\b", r"\bimpassable\b",
        r"सड़क बंद", r"रास्ता बंद", r"जाम",
        r"రహదారి మూసివేత", r"రహదారి దిగ్బంధనం", r"దారి మూసుకుపోయింది"
    ],
    "unsafe electricity": [
        r"\b(?:unsafe|exposed|live) electric(?:ity|al)?\b", r"\belectric shock\b",
        r"\blive wire\b", r"\bopen wire\b", r"\belectrocution\b", r"\btransformer spark\b",
        r"बिजली का झटका", r"नंगा तार", r"करंट", r"ट्रांसफार्मर",
        r"విద్యుత్ షాక్", r"లైవ్ వైర్", r"కరెంట్", r"ట్రాన్స్ఫార్మర్"
    ],
    "drinking water failure": [
        r"\bdrinking water failure\b", r"\bcontaminated water\b", r"\btoxic water\b",
        r"\bwater contamination\b", r"\bno drinking water\b", r"\bwater pipeline burst\b",
        r"पीने का पानी", r"दूषित पानी", r"पानी संकट",
        r"తాగునీరు", r"కలుషిత నీరు", r"నీటి సరఫరా నిలిచిపోయింది"
    ],
    "hospital or school impact": [
        r"\bhospital\b", r"\bclinic\b", r"\bprimary health\b", r"\bschool\b",
        r"\bclassroom\b", r"\bstudents\b", r"\bpatients\b",
        r"अस्पताल", r"प्राथमिक स्वास्थ्य", r"स्कूल", r"विद्यालय", r"छात्र", r"मरीज",
        r"ఆసుపత్రి", r"ప్రాథమిక ఆరోగ్య", r"పాఠశాల", r"విద్యార్థులు", r"రోగులు"
    ],
}


def detect_urgency_indicators(text: str) -> List[str]:
    """
    Detects concrete urgency indicators in English, Hindi, and Telugu.
    Ignores purely emotional, hyperbolic language without concrete facts.
    """
    if not text:
        return []

    matched: List[str] = []
    text_lower = text.lower()

    for indicator_name, patterns in INDICATOR_PATTERNS.items():
        for pattern in patterns:
            if re.search(pattern, text_lower, flags=re.IGNORECASE):
                matched.append(indicator_name)
                break  # one match per indicator category is sufficient

    return matched


def _heuristic_extract_signals(
    title: str,
    description: str,
    category: str,
    problem_type: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Deterministic rule-based NLP extraction of qualitative signals from report details.
    Used for offline testing, fallback, and validation.
    """
    full_text = f"{title} {description} {category} {problem_type or ''}".lower()
    detected_indicators = detect_urgency_indicators(full_text)

    # 1. Safety Risk Extraction
    safety_risk_level = "none"
    if any(k in detected_indicators for k in ["unsafe electricity", "death", "fire", "collapsed"]):
        safety_risk_level = "critical"
    elif any(k in detected_indicators for k in ["accident", "injury", "danger", "flood"]):
        safety_risk_level = "high"
    elif "water" in full_text and ("drain" in full_text or "sewage" in full_text or "contaminated" in full_text):
        safety_risk_level = "medium"
    elif "pothole" in full_text or "pavement" in full_text or "streetlight" in full_text:
        safety_risk_level = "medium"
    elif "waste" in full_text or "garbage" in full_text:
        safety_risk_level = "low"
    else:
        safety_risk_level = "low" if any(k in full_text for k in ["delay", "damage", "broken", "leak"]) else "none"

    # 2. Affected People Scale
    affected_scale = "few_households"
    if any(k in full_text for k in ["entire district", "entire city", "entire town", "widespread", "thousands of"]):
        affected_scale = "widespread"
    elif any(k in full_text for k in ["hospital", "school", "colony", "ward", "village", "community", "hundreds"]):
        affected_scale = "community"
    elif any(k in full_text for k in ["neighborhood", "street", "market", "locality", "chowk", "main road"]):
        affected_scale = "neighborhood"
    elif any(k in full_text for k in ["household", "houses", "lane", "families"]):
        affected_scale = "few_households"
    elif any(k in full_text for k in ["my house", "individual", "private", "personal"]):
        affected_scale = "individual"
    else:
        affected_scale = "neighborhood"

    # 3. Infrastructure Impact
    infra_impact = "none"
    if any(k in detected_indicators for k in ["hospital or school impact", "blocked road", "drinking water failure"]):
        infra_impact = "major"
        if any(k in detected_indicators for k in ["unsafe electricity", "fire", "collapsed"]):
            infra_impact = "critical"
    elif any(k in full_text for k in ["bridge collapsed", "pipeline burst", "substation", "sewer breach"]):
        infra_impact = "major"
    elif any(k in full_text for k in ["drain", "road", "pothole", "pavement", "classroom", "canal"]):
        infra_impact = "moderate"
    elif any(k in full_text for k in ["streetlight", "meter", "bench", "sign"]):
        infra_impact = "minor"

    return {
        "safety_risk_level": safety_risk_level,
        "affected_people_scale": affected_scale,
        "infrastructure_impact_level": infra_impact,
        "detected_indicators": detected_indicators,
        "raw_reasons": [],
    }


def _call_gemini_priority_extraction(prompt: str) -> Dict[str, Any]:
    """Invokes Google Gemini REST API for qualitative priority signal extraction with fallback."""
    models_to_try = [settings.AI_MODEL]
    fallback = getattr(settings, "AI_FALLBACK_MODEL", "gemini-3.5-flash-lite")
    for fb in [fallback, "gemini-3.5-flash"]:
        if fb and fb not in models_to_try:
            models_to_try.append(fb)

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
                return json.loads(raw_text)
            except Exception as err:
                last_error = err
                logger.warning(f"Gemini priority call with model '{model}' failed: {err}")
                continue

    if last_error:
        raise last_error
    raise RuntimeError("No Gemini model succeeded for priority extraction.")


def _call_openai_priority_extraction(prompt: str) -> Dict[str, Any]:
    """Invokes OpenAI Chat Completions API with JSON mode for signal extraction."""
    url = "https://api.openai.com/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {settings.AI_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": settings.AI_MODEL,
        "messages": [
            {
                "role": "system",
                "content": (
                    "You are a civic assessment assistant that extracts strictly factual "
                    "signals from public grievances. Respond in JSON only."
                ),
            },
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
        return json.loads(raw_text)


def extract_priority_signals(
    title: str,
    description: Optional[str] = None,
    district: Optional[str] = None,
    category: Optional[str] = None,
    problem_type: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Extracts qualitative priority signals using configured AI service or fallback rules.
    Extracts ONLY information present in the report.
    Never lets the LLM decide numeric points directly.
    """
    desc = description or ""
    cat = category or "General"
    pt = problem_type or ""

    # Check multilingual indicators from text directly
    detected_indicators = detect_urgency_indicators(f"{title} {desc}")

    # If AI disabled, missing API key, or provider is mock: use heuristic extraction
    provider = settings.AI_PROVIDER.lower().strip()
    api_key = settings.AI_API_KEY

    if not settings.AI_ENABLED or provider == "mock" or (provider in ["gemini", "openai"] and not api_key):
        signals = _heuristic_extract_signals(title, desc, cat, pt)
        # Ensure detected indicators are unified
        signals["detected_indicators"] = list(set(signals["detected_indicators"] + detected_indicators))
        return signals

    # LLM Prompt constrained strictly to qualitative categories
    prompt = f"""
You are an expert civic triage evaluator for the ImpactForge platform in Jharkhand, India.
Extract strictly factual signals present in the citizen report below. Do not guess or exaggerate.
Do not assign numeric scores.

REPORT DETAILS:
Title: {title}
Description: {desc}
District: {district or 'N/A'}
Category: {cat}
Problem Type: {pt or 'N/A'}

TASK:
Analyze the report and return a JSON object with EXACTLY these keys:
- "safety_risk_level": one of ["none", "low", "medium", "high", "critical"]
  ("critical" requires active electrocution risk, structural collapse, active fire, or imminent fatality danger).
- "affected_people_scale": one of ["individual", "few_households", "neighborhood", "community", "widespread"]
- "infrastructure_impact_level": one of ["none", "minor", "moderate", "major", "critical"]
- "urgency_indicators": list of detected factual indicators from report (e.g., accident, injury, fire, blocked road, live wire, hospital impact)
- "reasons": list of 2 to 3 concise, factual sentences explaining the risks directly identified in the report text.
"""

    try:
        if provider == "gemini":
            result = _call_gemini_priority_extraction(prompt)
        elif provider == "openai":
            result = _call_openai_priority_extraction(prompt)
        else:
            result = _heuristic_extract_signals(title, desc, cat, pt)

        # Normalize LLM responses safely
        safety_risk_level = str(result.get("safety_risk_level", "low")).lower().strip()
        if safety_risk_level not in ["none", "low", "medium", "high", "critical"]:
            safety_risk_level = "low"

        affected_scale = str(result.get("affected_people_scale", "few_households")).lower().strip()
        if affected_scale not in ["individual", "few_households", "neighborhood", "community", "widespread"]:
            affected_scale = "few_households"

        infra_impact = str(result.get("infrastructure_impact_level", "minor")).lower().strip()
        if infra_impact not in ["none", "minor", "moderate", "major", "critical"]:
            infra_impact = "minor"

        llm_indicators = result.get("urgency_indicators", [])
        if not isinstance(llm_indicators, list):
            llm_indicators = []

        # Combine regex verified indicators with LLM detected indicators
        combined_indicators = list(set(detected_indicators + [str(i).lower() for i in llm_indicators if isinstance(i, str)]))

        raw_reasons = result.get("reasons", [])
        if not isinstance(raw_reasons, list):
            raw_reasons = [str(raw_reasons)] if raw_reasons else []

        return {
            "safety_risk_level": safety_risk_level,
            "affected_people_scale": affected_scale,
            "infrastructure_impact_level": infra_impact,
            "detected_indicators": combined_indicators,
            "raw_reasons": [str(r) for r in raw_reasons if r],
        }

    except Exception as e:
        logger.warning(f"AI priority extraction call failed: {e}. Falling back to deterministic NLP heuristic.")
        fallback = _heuristic_extract_signals(title, desc, cat, pt)
        fallback["detected_indicators"] = list(set(fallback["detected_indicators"] + detected_indicators))
        return fallback


def calculate_priority_score(
    signals: Dict[str, Any],
    title: str = "",
    description: str = "",
) -> PriorityScoringOutput:
    """
    Explainable weighted scoring algorithm (0-100 total):
    1. Public safety risk: 0-40 points
    2. Number of people affected: 0-25 points
    3. Urgency indicators: 0-20 points
    4. Infrastructure or service impact: 0-15 points

    Mapping:
    - 0-24: Low
    - 25-49: Medium
    - 50-74: High
    - 75-100: Critical (requires verified clear evidence of serious danger, major disruption, or large public impact)
    """
    safety_risk_level = signals.get("safety_risk_level", "low")
    affected_scale = signals.get("affected_people_scale", "few_households")
    infra_impact = signals.get("infrastructure_impact_level", "minor")
    indicators = signals.get("detected_indicators", [])
    raw_reasons = signals.get("raw_reasons", [])

    reasons: List[str] = []

    # 1. Public Safety Risk (0-40 points)
    safety_base_map = {
        "critical": 35,
        "high": 27,
        "medium": 17,
        "low": 8,
        "none": 0,
    }
    safety_score = safety_base_map.get(safety_risk_level, 8)

    # Extra weight if life-threatening indicators are verified
    severe_hazards = {"unsafe electricity", "death", "fire", "collapsed"}
    if any(h in indicators for h in severe_hazards) and safety_score >= 35:
        safety_score = min(40, safety_score + 5)
        reasons.append(f"Public safety risk scored {safety_score}/40 due to severe immediate hazard.")
    elif safety_score > 0:
        reasons.append(f"Public safety risk evaluated as {safety_risk_level} ({safety_score}/40 points).")
    else:
        reasons.append("No immediate public safety hazard detected (0/40 points).")

    # 2. Number of People Affected (0-25 points)
    people_base_map = {
        "widespread": 24,
        "community": 18,
        "neighborhood": 12,
        "few_households": 6,
        "individual": 2,
    }
    people_score = people_base_map.get(affected_scale, 6)
    scale_label_map = {
        "widespread": "entire district / major transit corridor (widespread)",
        "community": "community / village / school facility",
        "neighborhood": "local neighborhood / market area",
        "few_households": "few households / local lane",
        "individual": "individual / private premises",
    }
    reasons.append(
        f"Population impact scored {people_score}/25 for {scale_label_map.get(affected_scale, affected_scale)}."
    )

    # 3. Urgency Indicators (0-20 points)
    # Count verified distinct indicators
    num_indicators = len(indicators)
    if num_indicators == 0:
        urgency_score = 0
        reasons.append("No urgent hazard or crisis keywords detected (0/20 points).")
    elif num_indicators == 1:
        urgency_score = 8
        reasons.append(f"Urgency indicator detected: '{indicators[0]}' (8/20 points).")
    elif num_indicators == 2:
        urgency_score = 14
        reasons.append(f"Multiple urgency indicators detected: {', '.join(indicators)} (14/20 points).")
    else:
        urgency_score = 20
        reasons.append(f"High urgency crisis indicators detected: {', '.join(indicators[:3])} (20/20 points).")

    # 4. Infrastructure or Service Impact (0-15 points)
    infra_base_map = {
        "critical": 14,
        "major": 11,
        "moderate": 7,
        "minor": 3,
        "none": 0,
    }
    infra_score = infra_base_map.get(infra_impact, 3)
    if "hospital or school impact" in indicators and infra_score < 15:
        infra_score = min(15, infra_score + 1)

    infra_label_map = {
        "critical": "critical lifeline disruption",
        "major": "major service / arterial route disruption",
        "moderate": "moderate civic infrastructure damage",
        "minor": "minor localized damage",
        "none": "no infrastructure damage",
    }
    reasons.append(
        f"Infrastructure disruption scored {infra_score}/15 ({infra_label_map.get(infra_impact, infra_impact)})."
    )

    # Add raw factual reasons from AI extraction if provided
    for r in raw_reasons[:2]:
        clean_r = r.strip()
        if clean_r and clean_r not in reasons:
            reasons.append(clean_r)

    # Calculate Total Score (0-100)
    total_score = min(100, max(0, safety_score + people_score + urgency_score + infra_score))

    # Priority Mapping and Critical Priority Gate
    # Critical requires clear evidence of serious danger, major disruption, or large public impact
    if total_score >= 75:
        has_serious_danger = safety_score >= 25
        has_major_disruption = infra_score >= 11
        has_large_public_impact = people_score >= 18

        if has_serious_danger or has_major_disruption or has_large_public_impact:
            priority = "Critical"
        else:
            # Score capped at 74 (High) due to lack of qualifying evidence
            total_score = 74
            priority = "High"
            reasons.append(
                "Score capped at High (74): Lacks qualifying threshold for Critical safety hazard, "
                "severe infrastructure disruption, or large public impact."
            )
    elif total_score >= 50:
        priority = "High"
    elif total_score >= 25:
        priority = "Medium"
    else:
        priority = "Low"

    return PriorityScoringOutput(
        priority=priority,
        score=total_score,
        factors=PriorityFactors(
            safety_risk=safety_score,
            affected_people=people_score,
            urgency_indicators=urgency_score,
            infrastructure_impact=infra_score,
        ),
        reasons=reasons,
        status="completed",
        detected_indicators=indicators,
    )


def assess_report_priority(
    title: str,
    description: Optional[str] = None,
    district: Optional[str] = None,
    category: Optional[str] = None,
    problem_type: Optional[str] = None,
) -> PriorityScoringOutput:
    """
    Main entry point for AI-assisted priority scoring.
    Extracts signals, calculates explainable score, and guarantees valid bounds.
    """
    try:
        signals = extract_priority_signals(
            title=title,
            description=description,
            district=district,
            category=category,
            problem_type=problem_type,
        )
        return calculate_priority_score(signals, title=title, description=description or "")
    except Exception as e:
        logger.error(f"Priority assessment error: {e}", exc_info=True)
        return PriorityScoringOutput(
            priority="Medium",
            score=35,
            factors=PriorityFactors(
                safety_risk=10,
                affected_people=10,
                urgency_indicators=8,
                infrastructure_impact=7,
            ),
            reasons=["Automated priority scoring encountered an unexpected error; set to default Medium for manual review."],
            status="failed",
            detected_indicators=[],
        )


def analyze_and_store_report_priority(db: Session, report: Report) -> None:
    """
    Executes priority scoring for a newly submitted report and persists fields in PostgreSQL.
    Preserves existing report fields; does NOT mutate report.priority or report.status.
    Ensures report creation remains successful even if scoring fails.
    """
    try:
        scoring = assess_report_priority(
            title=report.problem_title,
            description=report.context_and_desired_outcome,
            district=report.district,
            category=report.category,
            problem_type=report.ai_problem_type,
        )

        report.ai_priority = scoring.priority
        report.ai_priority_score = scoring.score
        report.ai_priority_reasons = scoring.reasons
        report.ai_priority_factors = scoring.factors.model_dump()
        report.ai_priority_status = scoring.status
        report.ai_priority_model = settings.AI_MODEL if settings.AI_ENABLED else "heuristic-nlp"
        report.ai_priority_analyzed_at = datetime.now(timezone.utc)

        db.commit()
        db.refresh(report)
        logger.info(
            f"AI priority stored for {report.track_id}: {report.ai_priority} "
            f"({report.ai_priority_score}/100, status={report.ai_priority_status})"
        )
    except Exception as e:
        logger.error(f"Failed to persist AI priority scoring for {report.track_id}: {e}")
        try:
            report.ai_priority_status = "failed"
            db.commit()
        except Exception:
            db.rollback()
