import copy
import json
import logging
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from sqlalchemy.orm import Session

from app.models.report import Report
from app.models.rematching import AIRematchingEvent
from app.models.audit_log import AuditLog
from app.models.notification import Notification

from app.services.hei_matching_service import analyze_and_store_report_hei_matches
from app.services.faculty_student_matching_service import analyze_and_store_report_faculty_student_matches
from app.services.capability_gap_service import analyze_and_store_report_capability_gaps
from app.services.partner_matching_service import analyze_and_store_report_partner_matches
from app.services.project_analytics_service import analyze_and_store_report_project_analytics

logger = logging.getLogger("dynamic_rematching_service")

# All recognized rematching modules in logical dependency order
ALL_MATCHING_MODULES = ["hei", "faculty", "student", "capability_gap", "partner"]


def capture_matching_snapshot(report: Report) -> Dict[str, Any]:
    """
    Captures an immutable JSON snapshot of all current AI matching recommendations
    and capability evaluations on the given report.
    """
    return {
        "version": getattr(report, "ai_rematching_version", 1) or 1,
        "captured_at": datetime.now(timezone.utc).isoformat(),
        "hei_matches": copy.deepcopy(report.ai_hei_matches) if report.ai_hei_matches else [],
        "faculty_matches": copy.deepcopy(report.ai_faculty_matches) if report.ai_faculty_matches else [],
        "student_matches": copy.deepcopy(report.ai_student_matches) if report.ai_student_matches else [],
        "capability_gap_analysis": copy.deepcopy(report.ai_capability_gap_analysis) if report.ai_capability_gap_analysis else {},
        "partner_matches": copy.deepcopy(report.ai_partner_matches) if report.ai_partner_matches else [],
    }


def _diff_entity_list(
    prev_list: List[Dict[str, Any]],
    new_list: List[Dict[str, Any]],
    id_key: str,
    name_key: str,
    score_key: str = "overall_match_score",
    level_key: str = "recommendation_level",
) -> List[Dict[str, Any]]:
    """
    Compares two lists of recommendation items and outputs itemized diffs:
    added, removed, score_changed, or unchanged.
    """
    prev_map = {str(item.get(id_key)): item for item in (prev_list or []) if item and item.get(id_key)}
    new_map = {str(item.get(id_key)): item for item in (new_list or []) if item and item.get(id_key)}

    diffs: List[Dict[str, Any]] = []

    # 1. Newly added recommendations
    for entity_id, new_item in new_map.items():
        if entity_id not in prev_map:
            new_score = float(new_item.get(score_key, 0.0) or 0.0)
            new_lvl = str(new_item.get(level_key, "moderate_match"))
            diffs.append({
                "entity_id": entity_id,
                "entity_name": str(new_item.get(name_key) or entity_id),
                "change_type": "added",
                "old_score": None,
                "new_score": round(new_score, 3),
                "old_level": None,
                "new_level": new_lvl,
                "notes": f"Newly added recommendation ({new_lvl})",
            })

    # 2. Removed recommendations
    for entity_id, prev_item in prev_map.items():
        if entity_id not in new_map:
            old_score = float(prev_item.get(score_key, 0.0) or 0.0)
            old_lvl = str(prev_item.get(level_key, "moderate_match"))
            diffs.append({
                "entity_id": entity_id,
                "entity_name": str(prev_item.get(name_key) or entity_id),
                "change_type": "removed",
                "old_score": round(old_score, 3),
                "new_score": None,
                "old_level": old_lvl,
                "new_level": None,
                "notes": "No longer in top recommended matches",
            })

    # 3. Present in both: check score or recommendation level change
    for entity_id, new_item in new_map.items():
        if entity_id in prev_map:
            prev_item = prev_map[entity_id]
            old_score = float(prev_item.get(score_key, 0.0) or 0.0)
            new_score = float(new_item.get(score_key, 0.0) or 0.0)
            old_lvl = str(prev_item.get(level_key, ""))
            new_lvl = str(new_item.get(level_key, ""))

            score_diff = abs(new_score - old_score)
            if score_diff >= 0.01 or old_lvl != new_lvl:
                diffs.append({
                    "entity_id": entity_id,
                    "entity_name": str(new_item.get(name_key) or entity_id),
                    "change_type": "score_changed",
                    "old_score": round(old_score, 3),
                    "new_score": round(new_score, 3),
                    "old_level": old_lvl,
                    "new_level": new_lvl,
                    "notes": f"Score changed from {old_score:.2f} to {new_score:.2f} ({old_lvl} -> {new_lvl})",
                })

    return diffs


def calculate_matching_diff(prev_snapshot: Dict[str, Any], new_snapshot: Dict[str, Any]) -> Dict[str, Any]:
    """
    Calculates differential changes across all matching categories between two snapshots.
    """
    hei_diffs = _diff_entity_list(
        prev_snapshot.get("hei_matches", []),
        new_snapshot.get("hei_matches", []),
        id_key="hei_id",
        name_key="name",
    )

    faculty_diffs = _diff_entity_list(
        prev_snapshot.get("faculty_matches", []),
        new_snapshot.get("faculty_matches", []),
        id_key="faculty_id",
        name_key="name",
    )

    student_diffs = _diff_entity_list(
        prev_snapshot.get("student_matches", []),
        new_snapshot.get("student_matches", []),
        id_key="student_id",
        name_key="name",
    )

    partner_diffs = _diff_entity_list(
        prev_snapshot.get("partner_matches", []),
        new_snapshot.get("partner_matches", []),
        id_key="partner_id",
        name_key="organization_name",
    )

    # Capability gap diff
    prev_gap = prev_snapshot.get("capability_gap_analysis") or {}
    new_gap = new_snapshot.get("capability_gap_analysis") or {}
    old_cov = float(prev_gap.get("overall_coverage_percentage", 0.0) or 0.0)
    new_cov = float(new_gap.get("overall_coverage_percentage", 0.0) or 0.0)
    old_sev = str(prev_gap.get("gap_severity", ""))
    new_sev = str(new_gap.get("gap_severity", ""))

    gap_diff = {
        "old_coverage": round(old_cov, 1),
        "new_coverage": round(new_cov, 1),
        "coverage_delta": round(new_cov - old_cov, 1),
        "old_severity": old_sev,
        "new_severity": new_sev,
        "severity_changed": old_sev != new_sev if (old_sev and new_sev) else False,
    }

    all_diff_items = hei_diffs + faculty_diffs + student_diffs + partner_diffs
    total_added = sum(1 for d in all_diff_items if d["change_type"] == "added")
    total_removed = sum(1 for d in all_diff_items if d["change_type"] == "removed")
    total_changed = sum(1 for d in all_diff_items if d["change_type"] == "score_changed")

    return {
        "hei_diffs": hei_diffs,
        "faculty_diffs": faculty_diffs,
        "student_diffs": student_diffs,
        "partner_diffs": partner_diffs,
        "capability_gap_diff": gap_diff,
        "total_added": total_added,
        "total_removed": total_removed,
        "total_changed": total_changed,
    }


def detect_affected_modules(changed_fields: List[str]) -> List[str]:
    """
    Identifies which matching modules need re-evaluation based on updated fields.
    Preserves computational efficiency by skipping unaffected matching engines.
    """
    if not changed_fields:
        return ALL_MATCHING_MODULES.copy()

    normalized = [f.lower().strip() for f in changed_fields]

    # Changes that alter foundational problem definition or requirements cascade across all modules
    foundational_triggers = {
        "category", "problem_type", "description", "title", "required_skills",
        "technical_domains", "equipment", "equipment_needed", "software", "software_tools",
        "materials", "budget", "estimated_budget", "location", "district",
        "urgency", "priority", "report", "ai_capabilities"
    }
    if any(any(ft in field for ft in foundational_triggers) for field in normalized):
        return ALL_MATCHING_MODULES.copy()

    # HEI profile update triggers HEI, Faculty/Student, Gap, and Partner
    if any("hei" in f for f in normalized):
        return ["hei", "faculty", "student", "capability_gap", "partner"]

    # Faculty / Student workload or profile updates trigger Faculty, Student, and Gap
    if any("faculty" in f or "student" in f or "workload" in f for f in normalized):
        return ["faculty", "student", "capability_gap"]

    # Capability gap update triggers Gap and Partner
    if any("gap" in f or "capability" in f for f in normalized):
        return ["capability_gap", "partner"]

    # Partner support proposals or partner profile updates trigger Partner matching
    if any("partner" in f or "proposal" in f or "funding" in f for f in normalized):
        return ["partner"]

    return ALL_MATCHING_MODULES.copy()


def mask_event_for_citizen(event: AIRematchingEvent) -> Dict[str, Any]:
    """
    Returns a privacy-safe view of a rematching event for citizens.
    Strips internal reviewer identity, partner commercial metrics, and private contact info.
    """
    diff = event.diff_summary or {}
    total_added = diff.get("total_added", 0)
    total_changed = diff.get("total_changed", 0)

    summary = "Matching recommendations updated."
    if total_added > 0:
        summary = f"Matching updated: {total_added} new potential academic or industry collaborators identified."
    elif total_changed > 0:
        summary = "Matching updated: Collaborator recommendation scores adjusted to latest project status."

    return {
        "id": event.id,
        "track_id": event.track_id,
        "trigger_type": event.trigger_type,
        "changed_fields": event.changed_fields or [],
        "affected_matching_types": event.affected_matching_types or [],
        "status": event.status,
        "summary_notes": summary,
        "created_at": event.created_at,
        "completed_at": event.completed_at,
    }


def execute_dynamic_rematch(
    db: Session,
    report: Report,
    trigger_type: str,
    trigger_source: str,
    changed_fields: List[str],
    actor_name: str = "system",
    actor_user_id: Optional[int] = None,
    actor_email: Optional[str] = None,
    affected_types: Optional[List[str]] = None,
    reason: Optional[str] = None,
) -> AIRematchingEvent:
    """
    Executes a dynamic rematching cycle:
    1. Debounce and concurrency guard.
    2. Snapshot previous recommendations.
    3. Strict Zero-Mutation preservation of civic report status and priority.
    4. Re-calculates affected matching engines.
    5. Snapshot new recommendations.
    6. Computes explainable differential summary.
    7. Creates AIRematchingEvent and immutable AuditLog.
    """
    now = datetime.now(timezone.utc)

    # 1. Debounce / Concurrency Guard
    if report.ai_rematching_status == "running":
        logger.warning(f"Report {report.track_id} is already in 'running' rematching status. Skipping duplicate run.")
        latest = (
            db.query(AIRematchingEvent)
            .filter(AIRematchingEvent.report_id == report.id)
            .order_by(AIRematchingEvent.created_at.desc())
            .first()
        )
        if latest:
            return latest
        return AIRematchingEvent(
            report_id=report.id,
            track_id=report.track_id,
            trigger_type=trigger_type,
            trigger_source=trigger_source,
            status="running",
            created_at=now,
            created_by=actor_name,
        )

    # If completed within last 3 seconds for automated triggers, debounce
    if (
        report.ai_last_rematched_at
        and trigger_type != "manual_trigger"
        and (now - report.ai_last_rematched_at).total_seconds() < 3.0
    ):
        logger.info(f"Report {report.track_id} was rematched recently. Debouncing duplicate trigger.")
        latest = (
            db.query(AIRematchingEvent)
            .filter(AIRematchingEvent.report_id == report.id)
            .order_by(AIRematchingEvent.created_at.desc())
            .first()
        )
        if latest:
            return latest

    # Determine affected modules
    target_modules = affected_types if affected_types else detect_affected_modules(changed_fields)

    # 2. Capture Previous Snapshot
    prev_snapshot = capture_matching_snapshot(report)

    # 3. ZERO-MUTATION GUARANTEE: preserve core report fields
    original_core_status = report.status
    original_core_priority = report.priority
    original_core_assigned_to = report.assigned_to

    # Mark report as running
    report.ai_rematching_status = "running"
    db.commit()

    # Create initial event record
    event = AIRematchingEvent(
        report_id=report.id,
        track_id=report.track_id,
        trigger_type=trigger_type,
        trigger_source=trigger_source,
        changed_fields=changed_fields,
        previous_matching_snapshot=prev_snapshot,
        new_matching_snapshot={},
        affected_matching_types=target_modules,
        diff_summary=None,
        status="running",
        created_at=now,
        created_by=actor_name,
    )
    db.add(event)
    db.commit()
    db.refresh(event)

    try:
        # 4. Re-calculate affected engines in strict dependency order
        if "hei" in target_modules:
            logger.info(f"Rematching HEI for report {report.track_id}")
            analyze_and_store_report_hei_matches(db, report)

        if "faculty" in target_modules or "student" in target_modules:
            logger.info(f"Rematching Faculty & Students for report {report.track_id}")
            analyze_and_store_report_faculty_student_matches(db, report)

        if "capability_gap" in target_modules:
            logger.info(f"Rematching Capability Gaps for report {report.track_id}")
            analyze_and_store_report_capability_gaps(db, report)

        if "partner" in target_modules:
            logger.info(f"Rematching Partners for report {report.track_id}")
            analyze_and_store_report_partner_matches(db, report)

        # Refresh advisory project analytics with new matching snapshot
        try:
            analyze_and_store_report_project_analytics(db, report)
        except Exception as e:
            logger.warning(f"Note on refreshing project analytics after rematch: {e}")

        # 5. Capture New Snapshot
        new_snapshot = capture_matching_snapshot(report)

        # 6. Compute Differential Summary
        diff_summary = calculate_matching_diff(prev_snapshot, new_snapshot)

        # Increment report version and update rematching metadata
        new_version = (getattr(report, "ai_rematching_version", 1) or 1) + 1
        report.ai_rematching_version = new_version
        report.ai_last_rematched_at = datetime.now(timezone.utc)
        report.ai_rematching_reason = reason or f"Triggered by {trigger_type} ({', '.join(changed_fields)})"
        report.ai_rematching_status = "completed"

        # Re-enforce zero-mutation invariants
        report.status = original_core_status
        report.priority = original_core_priority
        report.assigned_to = original_core_assigned_to

        # Finalize event
        event.new_matching_snapshot = new_snapshot
        event.diff_summary = diff_summary
        event.status = "completed"
        event.completed_at = datetime.now(timezone.utc)

        # 7. Create immutable AuditLog
        audit = AuditLog(
            actor_user_id=actor_user_id,
            actor_email=actor_email or actor_name,
            action="AI_DYNAMIC_REMATCH",
            entity_type="report",
            entity_id=report.track_id,
            metadata_json=json.dumps({
                "event_id": event.id,
                "version": new_version,
                "trigger_type": trigger_type,
                "trigger_source": trigger_source,
                "affected_types": target_modules,
                "total_added": diff_summary.get("total_added", 0),
                "total_removed": diff_summary.get("total_removed", 0),
                "total_changed": diff_summary.get("total_changed", 0),
                "reason": report.ai_rematching_reason,
            }),
        )
        db.add(audit)

        # Optional: create notification for government/admin
        notification = Notification(
            role="government",
            type="REMATCH_UPDATE",
            title=f"Recommendations Updated: {report.track_id}",
            message=f"Dynamic rematching v{new_version} finished ({diff_summary.get('total_added', 0)} added, {diff_summary.get('total_changed', 0)} updated).",
            related_track_id=report.track_id,
            priority="Normal",
        )
        db.add(notification)

        db.commit()
        db.refresh(event)
        logger.info(f"Dynamic rematching completed successfully for report {report.track_id} (version {new_version})")
        return event

    except Exception as e:
        logger.exception(f"Error during dynamic rematching for report {report.track_id}: {e}")
        db.rollback()

        # Update event and report to failed
        report.ai_rematching_status = "failed"
        report.status = original_core_status
        report.priority = original_core_priority
        report.assigned_to = original_core_assigned_to

        event.status = "failed"
        event.error_message = str(e)
        event.completed_at = datetime.now(timezone.utc)

        db.commit()
        return event
