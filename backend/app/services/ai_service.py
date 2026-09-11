import json
import logging
import re
from datetime import datetime, timezone
from typing import Any, Dict, Optional
import httpx
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.report import Report
from app.schemas.ai_schema import (
    CONTROLLED_TAXONOMY,
    CategorizationOutput,
    validate_taxonomy_item,
)

logger = logging.getLogger("ai_service")

TAXONOMY_PROMPT_GUIDE = "\n".join(
    f"- {cat}: {', '.join(subcats.keys())}"
    for cat, subcats in CONTROLLED_TAXONOMY.items()
)


def _heuristic_fallback_classify(
    title: str,
    description: str,
    raw_category: Optional[str] = None,
) -> Dict[str, Any]:
    """Deterministic, offline rule-based classification against CONTROLLED_TAXONOMY."""
    text = f"{title} {description} {raw_category or ''}".lower()

    if any(k in text for k in ["water", "pipe", "leak", "drain", "sewage", "borewell", "sanitation", "toilet", "tap"]):
        if any(k in text for k in ["drain", "sewage", "overflow", "gutter"]):
            return {
                "category": "Water and Sanitation",
                "subcategory": "Sewage and Drainage",
                "problem_type": "Open Drain Overflow",
                "short_summary": "Drainage and wastewater blockage reported by residents.",
                "confidence_score": 0.88,
            }
        return {
            "category": "Water and Sanitation",
            "subcategory": "Drinking Water Supply",
            "problem_type": "Pipeline Leak" if "leak" in text else "Contaminated Water",
            "short_summary": "Drinking water infrastructure issue impacting local access.",
            "confidence_score": 0.92,
        }

    if any(k in text for k in ["road", "pothole", "pavement", "traffic", "bridge", "bus", "transport", "highway"]):
        return {
            "category": "Roads and Transport",
            "subcategory": "Road Damage",
            "problem_type": "Pothole" if "pothole" in text else "Broken Pavement",
            "short_summary": "Road infrastructure damage causing transport hazards.",
            "confidence_score": 0.91,
        }

    if any(k in text for k in ["health", "hospital", "doctor", "clinic", "medicine", "vaccine", "disease", "fever"]):
        return {
            "category": "Healthcare",
            "subcategory": "Clinical Services",
            "problem_type": "Doctor Shortage" if "doctor" in text else "Medicine Out of Stock",
            "short_summary": "Public health and medical resource availability challenge.",
            "confidence_score": 0.87,
        }

    if any(k in text for k in ["school", "teacher", "classroom", "student", "study", "education"]):
        return {
            "category": "Education",
            "subcategory": "School Infrastructure",
            "problem_type": "Damaged Classroom",
            "short_summary": "Educational facility deficit reported.",
            "confidence_score": 0.89,
        }

    if any(k in text for k in ["crop", "farmer", "agriculture", "irrigation", "soil", "harvest", "canal"]):
        return {
            "category": "Agriculture",
            "subcategory": "Irrigation and Water",
            "problem_type": "Canal Blockage",
            "short_summary": "Agricultural irrigation and cultivation issue.",
            "confidence_score": 0.85,
        }

    if any(k in text for k in ["pollution", "waste", "dump", "garbage", "river", "smoke", "plastic"]):
        return {
            "category": "Environment",
            "subcategory": "Pollution Control",
            "problem_type": "Illegal Waste Dumping",
            "short_summary": "Environmental contamination and waste disposal concern.",
            "confidence_score": 0.86,
        }

    if any(k in text for k in ["wire", "electric", "shock", "streetlight", "dark", "hazard", "safety", "manhole"]):
        return {
            "category": "Public Safety",
            "subcategory": "Hazardous Conditions",
            "problem_type": "Exposed Live Wire" if "wire" in text else "Dark Unlit Alley",
            "short_summary": "Hazardous civic condition presenting risk to pedestrians.",
            "confidence_score": 0.88,
        }

    # If raw category provided matches our taxonomy, use it
    if raw_category:
        cat, subcat, pt, valid = validate_taxonomy_item(raw_category)
        if valid and cat != "Other":
            return {
                "category": cat,
                "subcategory": subcat,
                "problem_type": pt,
                "short_summary": f"Report categorized under {cat}.",
                "confidence_score": 0.80,
            }

    return {
        "category": "Other",
        "subcategory": "General Civic Issue",
        "problem_type": "Uncategorized Grievance",
        "short_summary": "Civic problem requiring manual review.",
        "confidence_score": 0.50,
    }


def _call_gemini_api(prompt: str) -> Dict[str, Any]:
    """Invokes Google Gemini REST API with structured JSON output, supporting fallback model."""
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
                logger.warning(f"Gemini categorization call with model '{model}' failed: {err}")
                continue

    if last_error:
        raise last_error
    raise RuntimeError("No Gemini model succeeded.")


def _call_openai_api(prompt: str) -> Dict[str, Any]:
    """Invokes OpenAI Chat Completions API with JSON mode."""
    url = "https://api.openai.com/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {settings.AI_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": settings.AI_MODEL,
        "messages": [
            {"role": "system", "content": "You are a civic classification assistant. Respond in JSON only."},
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


def categorize_problem(
    title: str,
    description: Optional[str] = None,
    raw_category: Optional[str] = None,
    district: Optional[str] = None,
    locality: Optional[str] = None,
) -> CategorizationOutput:
    """
    Classifies a reported civic problem using the configured AI provider.
    Strictly validates against CONTROLLED_TAXONOMY.
    Never fails caller; returns failed or needs_review status upon error or unmapped category.
    """
    if not settings.AI_ENABLED:
        return CategorizationOutput(
            category="Other",
            subcategory="General Civic Issue",
            problem_type="Uncategorized Grievance",
            short_summary="AI classification is currently disabled in system settings.",
            confidence_score=0.0,
            analysis_status="skipped",
        )

    provider = settings.AI_PROVIDER.lower().strip()
    api_key = settings.AI_API_KEY

    # If provider requires an API key and it is missing, use offline fallback or mark skipped
    if provider in ["gemini", "openai"] and not api_key:
        logger.info(f"AI provider '{provider}' missing API key; applying offline taxonomy heuristic.")
        res = _heuristic_fallback_classify(title, description or "", raw_category)
        cat, subcat, pt, valid = validate_taxonomy_item(
            res["category"], res["subcategory"], res["problem_type"]
        )
        return CategorizationOutput(
            category=cat,
            subcategory=subcat,
            problem_type=pt,
            short_summary=res["short_summary"],
            confidence_score=res["confidence_score"],
            analysis_status="completed" if valid and cat != "Other" else "needs_review",
        )

    # In mock provider mode (for unit tests / offline development)
    if provider == "mock":
        res = _heuristic_fallback_classify(title, description or "", raw_category)
        cat, subcat, pt, valid = validate_taxonomy_item(
            res["category"], res["subcategory"], res["problem_type"]
        )
        return CategorizationOutput(
            category=cat,
            subcategory=subcat,
            problem_type=pt,
            short_summary=res["short_summary"],
            confidence_score=res["confidence_score"],
            analysis_status="completed" if valid and cat != "Other" else "needs_review",
        )

    # Construct prompt with strict taxonomy constraints
    prompt = f"""
You are an expert civic problem classifier for the ImpactForge platform in Jharkhand, India.
Analyze the following citizen report and classify it strictly into the controlled taxonomy below.

CONTROLLED TAXONOMY:
{TAXONOMY_PROMPT_GUIDE}

REPORT DETAILS:
Title: {title}
Description: {description or 'N/A'}
User Selected Category: {raw_category or 'N/A'}
District: {district or 'N/A'}
Locality: {locality or 'N/A'}

INSTRUCTIONS:
1. You MUST pick a category that exactly matches one of the top-level categories above.
2. If the problem cannot be accurately categorized, use category "Other".
3. Return a JSON object with EXACTLY these keys:
   - "category": string (must be in controlled taxonomy)
   - "subcategory": string
   - "problem_type": string
   - "short_summary": string (1-2 sentences summarizing the core issue)
   - "confidence_score": float (between 0.0 and 1.0)
"""

    try:
        if provider == "gemini":
            result = _call_gemini_api(prompt)
        elif provider == "openai":
            result = _call_openai_api(prompt)
        else:
            # Unknown provider fallback
            result = _heuristic_fallback_classify(title, description or "", raw_category)

        raw_cat = str(result.get("category", "")).strip()
        raw_subcat = str(result.get("subcategory", "")).strip()
        raw_pt = str(result.get("problem_type", "")).strip()
        summary = str(result.get("short_summary", "Civic problem analyzed by AI.")).strip()
        
        try:
            confidence = float(result.get("confidence_score", 0.85))
            confidence = max(0.0, min(1.0, confidence))
        except (ValueError, TypeError):
            confidence = 0.50

        # Validate against controlled taxonomy
        cat, subcat, pt, is_valid = validate_taxonomy_item(raw_cat, raw_subcat, raw_pt)

        if not is_valid or cat == "Other":
            return CategorizationOutput(
                category="Other",
                subcategory="General Civic Issue",
                problem_type="Uncategorized Grievance",
                short_summary=summary or "Report categorized under Other for manual review.",
                confidence_score=confidence,
                analysis_status="needs_review",
            )

        status = "completed" if confidence >= 0.65 else "needs_review"

        return CategorizationOutput(
            category=cat,
            subcategory=subcat,
            problem_type=pt,
            short_summary=summary,
            confidence_score=confidence,
            analysis_status=status,
        )

    except Exception as e:
        logger.warning(f"AI categorization service error: {e}")
        return CategorizationOutput(
            category="Other",
            subcategory="General Civic Issue",
            problem_type="Uncategorized Grievance",
            short_summary="Automated AI categorization could not be completed.",
            confidence_score=0.0,
            analysis_status="failed",
        )


def analyze_and_store_report_ai(db: Session, report: Report) -> None:
    """
    Executes AI categorization for a newly submitted report and persists fields.
    Does not raise exceptions, ensuring report creation never fails.
    """
    try:
        analysis = categorize_problem(
            title=report.problem_title,
            description=report.context_and_desired_outcome,
            raw_category=report.category,
            district=report.district,
            locality=report.locality,
        )

        report.ai_category = analysis.category
        report.ai_subcategory = analysis.subcategory
        report.ai_problem_type = analysis.problem_type
        report.ai_summary = analysis.short_summary
        report.ai_confidence_score = analysis.confidence_score
        report.ai_analysis_status = analysis.analysis_status
        report.ai_model = settings.AI_MODEL if settings.AI_ENABLED else "none"
        report.ai_analyzed_at = datetime.now(timezone.utc)

        db.commit()
        db.refresh(report)
        logger.info(f"AI categorization stored for {report.track_id}: {report.ai_category} ({report.ai_analysis_status})")
    except Exception as e:
        logger.error(f"Failed to persist AI analysis for report {report.track_id}: {e}")
        try:
            report.ai_analysis_status = "failed"
            db.commit()
        except Exception:
            db.rollback()
