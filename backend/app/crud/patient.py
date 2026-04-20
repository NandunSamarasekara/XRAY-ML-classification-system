from sqlalchemy import select
from sqlalchemy.orm import Session
from uuid import UUID

from app.models.patient import PatientPortfolio
from app.schemas.patient import PatientCreate, PatientUpdate

def create_patient(db: Session, patient_in: PatientCreate, doctor_id: int, username: str, otp: str | None = None) -> PatientPortfolio:
    patient = PatientPortfolio(**patient_in.model_dump(), doctor_id=doctor_id, username=username, otp=otp, is_active=False)
    db.add(patient)
    db.commit()
    db.refresh(patient)
    return patient

def get_patient(db: Session, patient_id: UUID, doctor_id: int) -> PatientPortfolio | None:
    return db.scalar(select(PatientPortfolio).where(PatientPortfolio.id == patient_id, PatientPortfolio.doctor_id == doctor_id))

def get_patient_by_email(db: Session, email: str) -> PatientPortfolio | None:
    return db.scalar(select(PatientPortfolio).where(PatientPortfolio.email == email))

def get_patients(db: Session, doctor_id: int) -> list[PatientPortfolio]:
    stmt = select(PatientPortfolio).where(PatientPortfolio.doctor_id == doctor_id).order_by(PatientPortfolio.updated_at.desc(), PatientPortfolio.last_name.asc())
    return list(db.scalars(stmt))

def update_patient(db: Session, patient: PatientPortfolio, patient_in: PatientUpdate) -> PatientPortfolio:
    data = patient_in.model_dump(exclude_unset=True)
    for field, value in data.items():
        setattr(patient, field, value)
    db.add(patient)
    db.commit()
    db.refresh(patient)
    return patient

def delete_patient(db: Session, patient: PatientPortfolio) -> None:
    db.delete(patient)
    db.commit()
