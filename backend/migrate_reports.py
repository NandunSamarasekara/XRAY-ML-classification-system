"""
Migration script: drops and recreates the 'reports' table with the new schema.
Run from the backend directory with: .venv\Scripts\python.exe migrate_reports.py
"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from app.db.session import engine, Base
# Import ALL models so SQLAlchemy knows about all tables for FK resolution
from app.models.doctor import Doctor
from app.models.patient import PatientPortfolio
from app.models.report import Report
from app.models.comparison import Comparison
from app.models.image import Image

def migrate():
    # Drop the old reports table
    Report.__table__.drop(engine, checkfirst=True)
    print("Dropped 'reports' table.")
    
    # Recreate with new schema
    Report.__table__.create(engine, checkfirst=True)
    print("Created 'reports' table with new schema.")
    print("Migration complete!")

if __name__ == "__main__":
    migrate()
