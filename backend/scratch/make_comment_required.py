import sys
import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

load_dotenv('c:\\Users\\ASUS\\PycharmProjects\\Wedakam\\backend\\.env')
sys.path.append('c:\\Users\\ASUS\\PycharmProjects\\Wedakam\\backend')
from app.config import settings

def make_comment_required():
    engine = create_engine(settings.DATABASE_URL)
    with engine.connect() as conn:
        print("Ensuring existing comments are not null...")
        conn.execute(text("UPDATE reviews SET comment = 'No comment provided' WHERE comment IS NULL"))
        conn.commit()
        
        print("Setting comment column to NOT NULL...")
        conn.execute(text("ALTER TABLE reviews ALTER COLUMN comment SET NOT NULL"))
        conn.commit()
        print("Database updated successfully.")

if __name__ == "__main__":
    make_comment_required()
