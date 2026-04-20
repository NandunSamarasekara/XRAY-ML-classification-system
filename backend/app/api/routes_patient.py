from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import random

from app.crud import patient as crud_patient
from app.db.session import get_db
from app.schemas.patient import PatientCreate, PatientOut, PatientUpdate, OTPVerify
from app.core.email import send_otp_email
from app.core.security import get_current_doctor, hash_password, verify_password
from app.models.doctor import Doctor

router = APIRouter(prefix="/patients", tags=["patients"])

@router.post("/", response_model=PatientOut, status_code=status.HTTP_201_CREATED)
def create_patient(payload: PatientCreate, db: Session = Depends(get_db), current_doctor: Doctor = Depends(get_current_doctor)) -> PatientOut:
    if payload.email:
        existing_patient = crud_patient.get_patient_by_email(db, payload.email)
        if existing_patient:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    plain_otp = "".join(str(random.randint(0, 9)) for _ in range(6))
    hashed_otp = hash_password(plain_otp)
    
    # Auto-generate a username. Example: "P_{firstname}_{rand_digits}"
    rand_suff = str(random.randint(1000, 9999))
    username = f"P_{payload.first_name}{payload.last_name}_{rand_suff}"
    
    from sqlalchemy.exc import IntegrityError
    
    try:
        patient = crud_patient.create_patient(db, payload, doctor_id=current_doctor.id, username=username, otp=hashed_otp)
    except IntegrityError as e:
        db.rollback()
        raise e
    
    if patient.email:
        send_otp_email(patient.email, plain_otp, f"{patient.first_name} {patient.last_name}")
            
    return patient

@router.post("/{patient_id}/verify-otp", response_model=PatientOut)
def verify_otp(patient_id: UUID, payload: OTPVerify, db: Session = Depends(get_db), current_doctor: Doctor = Depends(get_current_doctor)) -> PatientOut:
    patient = crud_patient.get_patient(db, patient_id, doctor_id=current_doctor.id)
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")
    if patient.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Patient is already active")
    
    if not patient.otp or not verify_password(payload.otp, patient.otp):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid verification code")
        
    patient.is_active = True
    patient.otp = None
    db.add(patient)
    db.commit()
    db.refresh(patient)
    return patient

@router.post("/{patient_id}/send-otp", response_model=PatientOut)
def send_otp(patient_id: UUID, db: Session = Depends(get_db), current_doctor: Doctor = Depends(get_current_doctor)) -> PatientOut:
    patient = crud_patient.get_patient(db, patient_id, doctor_id=current_doctor.id)
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")
    if patient.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Patient is already authorized")
    
    plain_otp = "".join(str(random.randint(0, 9)) for _ in range(6))
    patient.otp = hash_password(plain_otp)
    db.add(patient)
    db.commit()
    db.refresh(patient)
    
    if patient.email:
        send_otp_email(patient.email, plain_otp, f"{patient.first_name} {patient.last_name}")
            
    return patient

@router.get("/", response_model=list[PatientOut])
def list_patients(db: Session = Depends(get_db), current_doctor: Doctor = Depends(get_current_doctor)) -> list[PatientOut]:
    return crud_patient.get_patients(db, doctor_id=current_doctor.id)

@router.get("/{patient_id}", response_model=PatientOut)
def get_patient(patient_id: UUID, db: Session = Depends(get_db), current_doctor: Doctor = Depends(get_current_doctor)) -> PatientOut:
    patient = crud_patient.get_patient(db, patient_id, doctor_id=current_doctor.id)
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")
    return patient

@router.put("/{patient_id}", response_model=PatientOut)
def update_patient(patient_id: UUID, payload: PatientUpdate, db: Session = Depends(get_db), current_doctor: Doctor = Depends(get_current_doctor)) -> PatientOut:
    patient = crud_patient.get_patient(db, patient_id, doctor_id=current_doctor.id)
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")
        
    if payload.email and payload.email != patient.email:
        existing_patient = crud_patient.get_patient_by_email(db, payload.email)
        if existing_patient:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
            
    return crud_patient.update_patient(db, patient, payload)

@router.delete("/{patient_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_patient(patient_id: UUID, db: Session = Depends(get_db), current_doctor: Doctor = Depends(get_current_doctor)) -> None:
    patient = crud_patient.get_patient(db, patient_id, doctor_id=current_doctor.id)
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")
    crud_patient.delete_patient(db, patient)
    return None
