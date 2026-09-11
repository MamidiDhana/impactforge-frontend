import sys
from collections import defaultdict
from app.db.session import SessionLocal
from app.models.report import Report

db = SessionLocal()
reports = db.query(Report).all()
print(f"Total reports: {len(reports)}")

groups = defaultdict(list)
for r in reports:
    norm_title = " ".join(r.problem_title.strip().lower().split())
    norm_dist = (r.district or "").strip().lower()
    norm_loc = (r.locality or "").strip().lower()
    groups[(norm_title, norm_dist, norm_loc)].append(r)

dup_groups = {k: v for k, v in groups.items() if len(v) > 1}
singletons = [v[0] for v in groups.values() if len(v) == 1]
print(f"Unique singletons: {len(singletons)}")
print(f"Duplicate groups: {len(dup_groups)}")

total_dup_records = sum(len(v) for v in dup_groups.values())
print(f"Total in dup groups: {total_dup_records}")
print(f"Total duplicates to remove: {total_dup_records - len(dup_groups)}")
print(f"Reports remaining after dedup: {len(singletons) + len(dup_groups)}")

db.close()
