import sys
sys.path.insert(0, '.')
from app.db.session import engine
from sqlalchemy import inspect, text

inspector = inspect(engine)

# Check images table columns
cols = inspector.get_columns('images')
print('images columns:', [c['name'] for c in cols])

# Check comparisons table columns
cols2 = inspector.get_columns('comparisons')
print('comparisons columns:', [c['name'] for c in cols2])

# Check DB enums
with engine.connect() as conn:
    result = conn.execute(text("SELECT typname FROM pg_type WHERE typname LIKE '%enum%'"))
    print('Enums in DB:', [r[0] for r in result])
