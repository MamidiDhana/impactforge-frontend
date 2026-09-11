import sys
from collections import defaultdict
from app.db.session import SessionLocal
from app.models.report import Report
from sqlalchemy import text

db = SessionLocal()
reports = db.query(Report).all()

groups = defaultdict(list)
for r in reports:
    norm_title = " ".join(r.problem_title.strip().lower().split())
    norm_dist = (r.district or "").strip().lower()
    norm_loc = (r.locality or "").strip().lower()
    groups[(norm_title, norm_dist, norm_loc)].append(r)

dup_groups = {k: v for k, v in groups.items() if len(v) > 1}

referencing_tables = [
    ("student_interests", "report_id"),
    ("partner_interests", "report_id"),
    ("report_status_history", "report_id"),
    ("hei_interests", "report_id"),
    ("faculty_interests", "report_id"),
    ("ai_feedback", "report_id"),
    ("ai_rematching_events", "report_id"),
]

def score_record(r):
    pts = 0
    if r.ai_summary: pts += 20
    if r.ai_priority_score is not None: pts += 20
    if r.ai_priority: pts += 10
    if r.official_remarks: pts += 15
    if r.verification_status == "Verified": pts += 10
    elif r.verification_status == "Pending Verification": pts += 5
    if r.status in ("In Progress", "Resolved"): pts += 10
    ref_count = 0
    for tbl, col in referencing_tables:
        cnt = db.execute(
            text(f"SELECT COUNT(*) FROM {tbl} WHERE {col} = :rid"),
            {"rid": r.id},
        ).scalar()
        ref_count += cnt
    pts += ref_count * 2
    if r.track_id.startswith("IF-JH-2026-0"): pts += 15
    elif r.track_id.startswith("IF-JH-2026-"): pts += 10
    return (pts, -r.id)

print(f"Simulation of canonical selection across {len(dup_groups)} duplicate groups:\n")
for i, ((t, d, l), recs) in enumerate(dup_groups.items()):
    sorted_recs = sorted(recs, key=score_record, reverse=True)
    canonical = sorted_recs[0]
    duplicates = sorted_recs[1:]
    print(f"Group {i+1} ({len(recs)} records): '{t[:50]}' [{d}, {l}]")
    print(f"   --> KEEP CANONICAL: ID={canonical.id}, Track={canonical.track_id}, Status={canonical.status}, Ver={canonical.verification_status}, AI_Score={canonical.ai_priority_score}")
    print(f"   --> REMOVING: {len(duplicates)} duplicate records (Sample IDs: {[d.id for d in duplicates[:5]]}, Tracks: {[d.track_id for d in duplicates[:5]]})")

db.close()
