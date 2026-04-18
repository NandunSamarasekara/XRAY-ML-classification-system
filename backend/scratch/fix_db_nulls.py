import sys
import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

load_dotenv('c:\\Users\\ASUS\\PycharmProjects\\Wedakam\\backend\\.env')
sys.path.append('c:\\Users\\ASUS\\PycharmProjects\\Wedakam\\backend')
from app.config import settings

def fix_db():
    engine = create_engine(settings.DATABASE_URL)
    
    with engine.connect() as conn:
        print("Making patient_name nullable...")
        try:
            conn.execute(text("ALTER TABLE reviews ALTER COLUMN patient_name DROP NOT NULL"))
            conn.commit()
            print("Successfully made patient_name nullable.")
        except Exception as e:
            print(f"Error or already nullable: {e}")

        # Fix any other columns that might be causing issues
        cols = ["patient_age", "patient_gender", "patient_phone"]
        for col in cols:
            try:
                conn.execute(text(f"ALTER TABLE reviews ALTER COLUMN {col} DROP NOT NULL"))
                conn.commit()
                print(f"Made {col} nullable.")
            except Exception:
                pass
            
    print("Database fix complete.")

if __name__ == "__main__":
    fix_db()
