"""ImpactForge - Deduplicate Problem Reports

Identifies duplicate problem reports, merges any missing AI/metadata fields into the
canonical winner, updates/re-links all foreign keys and referencing records across all
tables, and removes duplicate problem records atomically.
"""

import sys
import logging
from collections import defaultdict
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(backend_dir))

from sqlalchemy import text, bindparam
from app.db.session import SessionLocal
from app.models.report import Report

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("deduplicate_reports")


def deduplicate_problem_reports():
    db = SessionLocal()
    try:
        reports = db.query(Report).all()
        total_before = len(reports)
        logger.info(f"Total reports in database before deduplication: {total_before}")

        # Group by normalized title, district, and locality
        groups = defaultdict(list)
        for r in reports:
            norm_title = " ".join(r.problem_title.strip().lower().split())
            norm_dist = (r.district or "").strip().lower()
            norm_loc = (r.locality or "").strip().lower()
            groups[(norm_title, norm_dist, norm_loc)].append(r)

        dup_groups = {k: v for k, v in groups.items() if len(v) > 1}
        singletons = [v[0] for v in groups.values() if len(v) == 1]

        logger.info(f"Unique singleton reports: {len(singletons)}")
        logger.info(f"Duplicate groups found: {len(dup_groups)}")

        referencing_tables = [
            ("student_interests", "report_id"),
            ("partner_interests", "report_id"),
            ("report_status_history", "report_id"),
            ("hei_interests", "report_id"),
            ("faculty_interests", "report_id"),
            ("ai_feedback", "report_id"),
            ("ai_rematching_events", "report_id"),
        ]

        total_duplicates_removed = 0
        total_fields_merged = 0
        relinked_counts = defaultdict(int)

        for (title, dist, loc), recs in dup_groups.items():
            # Scoring function to select the most complete, canonical record
            def score_record(r):
                pts = 0
                if r.ai_summary:
                    pts += 20
                if r.ai_priority_score is not None:
                    pts += 20
                if r.ai_priority:
                    pts += 10
                if r.official_remarks:
                    pts += 15
                if r.verification_status == "Verified":
                    pts += 10
                elif r.verification_status == "Pending Verification":
                    pts += 5
                if r.status in ("In Progress", "Resolved"):
                    pts += 10

                ref_count = 0
                for tbl, col in referencing_tables:
                    cnt = db.execute(
                        text(f"SELECT COUNT(*) FROM {tbl} WHERE {col} = :rid"),
                        {"rid": r.id},
                    ).scalar()
                    ref_count += cnt
                pts += ref_count * 2

                # Prefer standard Track ID format (e.g. IF-JH-2026-0xxx)
                if r.track_id.startswith("IF-JH-2026-0"):
                    pts += 15
                elif r.track_id.startswith("IF-JH-2026-"):
                    pts += 10

                # Deterministic tie-breaker: lower ID (earlier created)
                return (pts, -r.id)

            sorted_recs = sorted(recs, key=score_record, reverse=True)
            canonical = sorted_recs[0]
            duplicates = sorted_recs[1:]

            # Merge any non-null fields from duplicates into canonical if canonical lacks them
            for d in duplicates:
                if not canonical.ai_summary and d.ai_summary:
                    canonical.ai_summary = d.ai_summary
                    total_fields_merged += 1
                if canonical.ai_priority_score is None and d.ai_priority_score is not None:
                    canonical.ai_priority_score = d.ai_priority_score
                    total_fields_merged += 1
                if not canonical.ai_priority and d.ai_priority:
                    canonical.ai_priority = d.ai_priority
                    total_fields_merged += 1
                if not canonical.official_remarks and d.official_remarks:
                    canonical.official_remarks = d.official_remarks
                    total_fields_merged += 1
                if canonical.verification_status == "Pending Verification" and d.verification_status == "Verified":
                    canonical.verification_status = d.verification_status
                    total_fields_merged += 1
                if canonical.status == "Open" and d.status in ("In Progress", "Resolved"):
                    canonical.status = d.status
                    total_fields_merged += 1

            dup_ids = [d.id for d in duplicates]
            dup_track_ids = [d.track_id for d in duplicates]

            # 1. student_interests: re-link report_id and track_id
            for d in duplicates:
                # Avoid inserting duplicate student interest for the same student on the same report
                existing_stu_ids = [
                    row[0]
                    for row in db.execute(
                        text("SELECT student_profile_id FROM student_interests WHERE report_id = :cid"),
                        {"cid": canonical.id},
                    ).fetchall()
                ]
                # Delete duplicate student interests that would violate logical uniqueness
                if existing_stu_ids:
                    db.execute(
                        text(
                            "DELETE FROM student_interests WHERE report_id = :did AND student_profile_id IN :sids"
                        ).bindparams(bindparam("sids", expanding=True)),
                        {"did": d.id, "sids": existing_stu_ids},
                    )
                # Re-link remaining student interests to canonical
                res = db.execute(
                    text(
                        "UPDATE student_interests SET report_id = :cid, track_id = :ctrack WHERE report_id = :did"
                    ),
                    {"cid": canonical.id, "ctrack": canonical.track_id, "did": d.id},
                )
                relinked_counts["student_interests"] += res.rowcount

            # 2. faculty_interests: re-link report_id and track_id
            for d in duplicates:
                existing_fac_ids = [
                    row[0]
                    for row in db.execute(
                        text("SELECT faculty_profile_id FROM faculty_interests WHERE report_id = :cid"),
                        {"cid": canonical.id},
                    ).fetchall()
                ]
                if existing_fac_ids:
                    db.execute(
                        text(
                            "DELETE FROM faculty_interests WHERE report_id = :did AND faculty_profile_id IN :fids"
                        ).bindparams(bindparam("fids", expanding=True)),
                        {"did": d.id, "fids": existing_fac_ids},
                    )
                res = db.execute(
                    text(
                        "UPDATE faculty_interests SET report_id = :cid, track_id = :ctrack WHERE report_id = :did"
                    ),
                    {"cid": canonical.id, "ctrack": canonical.track_id, "did": d.id},
                )
                relinked_counts["faculty_interests"] += res.rowcount

            # 3. hei_interests: re-link report_id and track_id
            for d in duplicates:
                existing_hei_ids = [
                    row[0]
                    for row in db.execute(
                        text("SELECT hei_profile_id FROM hei_interests WHERE report_id = :cid"),
                        {"cid": canonical.id},
                    ).fetchall()
                ]
                if existing_hei_ids:
                    db.execute(
                        text(
                            "DELETE FROM hei_interests WHERE report_id = :did AND hei_profile_id IN :hids"
                        ).bindparams(bindparam("hids", expanding=True)),
                        {"did": d.id, "hids": existing_hei_ids},
                    )
                res = db.execute(
                    text(
                        "UPDATE hei_interests SET report_id = :cid, track_id = :ctrack WHERE report_id = :did"
                    ),
                    {"cid": canonical.id, "ctrack": canonical.track_id, "did": d.id},
                )
                relinked_counts["hei_interests"] += res.rowcount

            # 4. partner_interests: re-link report_id and track_id
            for d in duplicates:
                existing_part_ids = [
                    row[0]
                    for row in db.execute(
                        text("SELECT partner_profile_id FROM partner_interests WHERE report_id = :cid"),
                        {"cid": canonical.id},
                    ).fetchall()
                ]
                if existing_part_ids:
                    db.execute(
                        text(
                            "DELETE FROM partner_interests WHERE report_id = :did AND partner_profile_id IN :pids"
                        ).bindparams(bindparam("pids", expanding=True)),
                        {"did": d.id, "pids": existing_part_ids},
                    )
                res = db.execute(
                    text(
                        "UPDATE partner_interests SET report_id = :cid, track_id = :ctrack WHERE report_id = :did"
                    ),
                    {"cid": canonical.id, "ctrack": canonical.track_id, "did": d.id},
                )
                relinked_counts["partner_interests"] += res.rowcount

            # 5. ai_feedback: re-link report_id
            res = db.execute(
                text(
                    "UPDATE ai_feedback SET report_id = :cid WHERE report_id IN :dids"
                ).bindparams(bindparam("dids", expanding=True)),
                {"cid": canonical.id, "dids": dup_ids},
            )
            relinked_counts["ai_feedback"] += res.rowcount

            # 6. ai_rematching_events: re-link report_id and track_id
            res = db.execute(
                text(
                    "UPDATE ai_rematching_events SET report_id = :cid, track_id = :ctrack WHERE report_id IN :dids"
                ).bindparams(bindparam("dids", expanding=True)),
                {"cid": canonical.id, "ctrack": canonical.track_id, "dids": dup_ids},
            )
            relinked_counts["ai_rematching_events"] += res.rowcount

            # 7. report_status_history: re-link report_id
            res = db.execute(
                text(
                    "UPDATE report_status_history SET report_id = :cid WHERE report_id IN :dids"
                ).bindparams(bindparam("dids", expanding=True)),
                {"cid": canonical.id, "dids": dup_ids},
            )
            relinked_counts["report_status_history"] += res.rowcount

            # 8. notifications: re-link related_track_id and action_url
            for d in duplicates:
                res = db.execute(
                    text(
                        "UPDATE notifications SET related_track_id = :ctrack, action_url = REPLACE(action_url, :dtrack, :ctrack) WHERE related_track_id = :dtrack"
                    ),
                    {"ctrack": canonical.track_id, "dtrack": d.track_id},
                )
                relinked_counts["notifications"] += res.rowcount

            # Now safely delete the duplicate reports
            res = db.execute(
                text("DELETE FROM reports WHERE id IN :dids").bindparams(bindparam("dids", expanding=True)),
                {"dids": dup_ids},
            )
            total_duplicates_removed += res.rowcount

        db.commit()

        # Validation after commit
        remaining_reports = db.query(Report).all()
        total_after = len(remaining_reports)

        logger.info("=" * 60)
        logger.info("DEDUPLICATION SUMMARY:")
        logger.info(f"Total reports before cleanup : {total_before}")
        logger.info(f"Duplicate groups handled     : {len(dup_groups)}")
        logger.info(f"Duplicate records removed    : {total_duplicates_removed}")
        logger.info(f"Unique reports remaining     : {total_after}")
        logger.info(f"Metadata fields merged       : {total_fields_merged}")
        logger.info("Foreign-key and reference re-link counts:")
        for tbl, cnt in relinked_counts.items():
            logger.info(f"  - {tbl}: {cnt}")
        logger.info("=" * 60)

        # Confirm zero duplicates remaining
        check_groups = defaultdict(list)
        for r in remaining_reports:
            key = (
                " ".join(r.problem_title.strip().lower().split()),
                (r.district or "").strip().lower(),
                (r.locality or "").strip().lower(),
            )
            check_groups[key].append(r)

        remaining_dups = {k: v for k, v in check_groups.items() if len(v) > 1}
        if remaining_dups:
            logger.error(f"ERROR: Found {len(remaining_dups)} remaining duplicate groups!")
            return False
        else:
            logger.info("SUCCESS: Exactly 0 duplicate groups remain. All reports are unique!")
            return True

    except Exception as e:
        db.rollback()
        logger.error(f"Deduplication failed with error: {e}", exc_info=True)
        raise
    finally:
        db.close()


if __name__ == "__main__":
    success = deduplicate_problem_reports()
    if not success:
        sys.exit(1)
