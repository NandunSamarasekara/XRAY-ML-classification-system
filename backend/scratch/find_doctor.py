import sys
import os
from dotenv import load_dotenv

load_dotenv('c:\\Users\\ASUS\\PycharmProjects\\Wedakam\\backend\\.env')
sys.path.append('c:\\Users\\ASUS\\PycharmProjects\\Wedakam\\backend')
from app.config import settings
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.doctor import Doctor

def find_vidu():
    engine = create_engine(settings.DATABASE_URL)
    Session = sessionmaker(bind=engine)
    session = Session()
    try:
        vidu = session.query(Doctor).filter(Doctor.first_name == 'Vidu').first()
        if vidu:
            print(f"Vidu ID: {vidu.id}, Email: {vidu.email}")
        else:
            print("Vidu not found.")
            doctors = session.query(Doctor).all()
            for d in doctors:
                print(f"Doctor: {d.first_name} {d.last_name}, ID: {d.id}")
    finally:
        session.close()

if __name__ == "__main__":
    find_vidu()
