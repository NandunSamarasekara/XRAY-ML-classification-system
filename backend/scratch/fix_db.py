import sys
import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

load_dotenv('c:\\Users\\ASUS\\PycharmProjects\\Wedakam\\backend\\.env')
sys.path.append('c:\\Users\\ASUS\\PycharmProjects\\Wedakam\\backend')
from app.config import settings

def check_and_add(engine, table, column, type_str):
    print(f"Checking {table}.{column}...")
    with engine.connect() as conn:
        try:
            conn.execute(text(f"SELECT {column} FROM {table} LIMIT 1"))
            print(f"{column} exists.")
        except Exception:
            print(f"{column} missing. Adding...")
            with engine.connect() as conn2:
                conn2.execute(text(f"ALTER TABLE {table} ADD COLUMN {column} {type_str}"))
                conn2.commit()
                print(f"{column} added.")

def fix_db():
    engine = create_engine(settings.DATABASE_URL)
    
    # columns to check for 'reviews' table
    # format: (column_name, sql_type)
    cols = [
        ("doctor_name", "VARCHAR(200) NOT NULL DEFAULT 'Unknown'"),
        ("rating", "INTEGER NOT NULL DEFAULT 5"),
        ("comment", "TEXT"),
        ("created_at", "TIMESTAMP WITH TIME ZONE DEFAULT NOW()"),
        ("updated_at", "TIMESTAMP WITH TIME ZONE DEFAULT NOW()")
    ]
    
    for col, t in cols:
        check_and_add(engine, "reviews", col, t)
            
    print("Database fix complete.")

if __name__ == "__main__":
    fix_db()
