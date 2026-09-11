from sqlalchemy import text
from app.db.session import SessionLocal

db = SessionLocal()
tables = db.execute(text("""
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name;
""")).fetchall()

print("All tables in public schema:")
for t in tables:
    t_name = t[0]
    cols = db.execute(text(f"""
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = '{t_name}'
    """)).fetchall()
    ref_cols = [c[0] for c in cols if 'report' in c[0].lower() or 'track' in c[0].lower()]
    print(f"  {t_name}: {len(cols)} columns" + (f" -> ref cols: {ref_cols}" if ref_cols else ""))

db.close()
