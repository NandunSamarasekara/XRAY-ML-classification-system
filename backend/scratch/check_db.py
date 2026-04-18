import sys
import os
from dotenv import load_dotenv

# Load env BEFORE importing settings
load_dotenv('c:\\Users\\ASUS\\PycharmProjects\\Wedakam\\backend\\.env')

sys.path.append('c:\\Users\\ASUS\\PycharmProjects\\Wedakam\\backend')
from app.config import settings
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.review import Review
from app.models.doctor import Doctor

def check_tables():
    print(f"URL: {settings.DATABASE_URL}")
    engine = create_engine(settings.DATABASE_URL)
    Session = sessionmaker(bind=engine)
    session = Session()
    try:
        doc_count = session.query(Doctor).count()
        print(f"Doctor count: {doc_count}")
        review_count = session.query(Review).count()
        print(f"Review count: {review_count}")
    except Exception as e:
        print(f"Query failed: {e}")
    finally:
        session.close()

if __name__ == "__main__":
    check_tables()
