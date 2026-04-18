import sys
import os
from sqlalchemy import create_engine, inspect

# Add backend to path
sys.path.append(r'c:\Users\ASUS\PycharmProjects\Wedakam\backend')

from app.config import settings

def list_tables():
    print(f"Checking database: {settings.DATABASE_URL}")
    try:
        engine = create_engine(settings.DATABASE_URL)
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        print(f"Tables found: {tables}")
        
        if 'reviews' in tables:
            print("\nContent of 'reviews' table:")
            with engine.connect() as conn:
                from sqlalchemy import text
                result = conn.execute(text("SELECT * FROM reviews LIMIT 10"))
                rows = result.fetchall()
                if not rows:
                    print("Table is empty.")
                for row in rows:
                    print(row)
        else:
            print("\n'reviews' table NOT found!")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    list_tables()
