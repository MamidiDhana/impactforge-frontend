import sys
from collections import defaultdict
from sqlalchemy import text, inspect
from app.db.session import SessionLocal
from app.models.report import Report

def analyze():
    db = SessionLocal()
    reports = db.query(Report).all()
    print(f"Total reports in database: {len(reports)}")

    # Check columns
    mapper = inspect(Report)
    columns = [col.key for col in mapper.attrs]
    print(f"Report model columns: {columns}")

    # Group by normalized (title, district, locality, category)
    groups = defaultdict(list)
    for r in reports:
        t_norm = " ".join(r.problem_title.strip().lower().split())
        d_norm = (r.district or "").strip().lower()
        l_norm = (r.locality or "").strip().lower()
        cat_norm = (r.category or "").strip().lower()
        groups[(t_norm, d_norm, l_norm, cat_norm)].append(r)

    dup_groups = {k: v for k, v in groups.items() if len(v) > 1}
    singletons = {k: v for k, v in groups.items() if len(v) == 1}

    print(f"Duplicate groups found: {len(dup_groups)}")
    print(f"Singleton (already unique) groups: {len(singletons)}")

    total_dup_records = sum(len(v) for v in dup_groups.values())
    total_to_remove = total_dup_records - len(dup_groups)
    print(f"Total records in duplicate groups: {total_dup_records}")
    print(f"Duplicate records to remove: {total_to_remove}")
    print(f"Total unique records that will remain: {len(singletons) + len(dup_groups)}")

    print("\n--- ALL 35 DUPLICATE GROUPS ---")
    for i, ((t, d, l, c), recs) in enumerate(dup_groups.items()):
        statuses = set(r.status for r in recs)
        ver_statuses = set(r.verification_status for r in recs)
        ai_scores = [r.ai_priority_score for r in recs if r.ai_priority_score is not None]
        track_ids = [r.track_id for r in recs]
        has_std_track = any(tid.startswith("IF-JH-2026-") for tid in track_ids)
        print(f"\nGroup {i+1} [{len(recs)} copies]: '{t}' | Cat: '{c}' | Dist: '{d}' | Loc: '{l}'")
        print(f"   Statuses: {statuses} | Verification: {ver_statuses} | AI scores: {set(ai_scores)}")
        print(f"   Sample Track IDs: {track_ids[:4]} ... Total: {len(track_ids)}")

    print("\n--- ALL SINGLETON (UNIQUE) REPORTS ---")
    for i, ((t, d, l, c), recs) in enumerate(singletons.items()):
        r = recs[0]
        print(f"Singleton {i+1}: ID={r.id}, Track={r.track_id}, '{t}' | Dist: '{d}', Loc: '{l}' | Status: {r.status}")

    # Check if there are any reports with similar titles that didn't match exactly
    print("\n--- CHECKING TITLE SIMILARITIES ACROSS GROUPS ---")
    all_keys = list(groups.keys())
    for i in range(len(all_keys)):
        for j in range(i + 1, len(all_keys)):
            t1, d1, l1, c1 = all_keys[i]
            t2, d2, l2, c2 = all_keys[j]
            if t1 == t2 and (d1 != d2 or l1 != l2 or c1 != c2):
                print(f"Same title different loc/cat:")
                print(f"   1: '{t1}' in ({d1}, {l1}, {c1}) - {len(groups[all_keys[i]])} records")
                print(f"   2: '{t2}' in ({d2}, {l2}, {c2}) - {len(groups[all_keys[j]])} records")
            elif (t1 in t2 or t2 in t1) and len(t1) > 10 and len(t2) > 10 and t1 != t2:
                print(f"Sub-string title match:")
                print(f"   A: '{t1}' in ({d1}, {l1}, {c1})")
                print(f"   B: '{t2}' in ({d2}, {l2}, {c2})")

    db.close()

if __name__ == "__main__":
    analyze()
