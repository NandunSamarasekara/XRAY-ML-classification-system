import sys
import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

load_dotenv('c:\\Users\\ASUS\\PycharmProjects\\Wedakam\\backend\\.env')
sys.path.append('c:\\Users\\ASUS\\PycharmProjects\\Wedakam\\backend')
from app.config import settings

def clean_recreate():
    engine = create_engine(settings.DATABASE_URL)
    
    with engine.connect() as conn:
        print("Dropping old reviews table...")
        conn.execute(text("DROP TABLE IF EXISTS reviews CASCADE"))
        conn.commit()
        
        print("Recreating clean reviews table...")
        # Recreate based on the current model needs
        create_sql = """
        CREATE TABLE reviews (
            id SERIAL PRIMARY KEY,
            doctor_id INTEGER NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
            doctor_name VARCHAR(200) NOT NULL,
            rating INTEGER NOT NULL,
            comment TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
        """
        conn.execute(text(create_sql))
        conn.commit()
        print("Clean reviews table created successfully.")

if __name__ == "__main__":
    clean_recreate()
