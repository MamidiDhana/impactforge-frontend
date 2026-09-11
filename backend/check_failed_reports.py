from app.db.session import SessionLocal
from app.models.report import Report
from collections import Counter

db = SessionLocal()
reports = db.query(Report).all()
statuses = Counter(r.ai_analysis_status for r in reports)
print(f"Total reports in DB: {len(reports)}")
print(f"AI analysis status breakdown: {dict(statuses)}")

failed_reports = [r for r in reports if r.ai_analysis_status == 'failed']
print(f"Count of reports with ai_analysis_status == 'failed': {len(failed_reports)}")

print("\nSample failed reports (first 10):")
for r in failed_reports[:10]:
    print(f"  ID: {r.id} | Track: {r.track_id} | Title: '{r.problem_title}' | Summary: '{r.ai_summary}' | Model: {r.ai_model}")

db.close()
