from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.comparison import ComparisonCreate, ComparisonOut, ComparisonUpdate
from app.models.comparison import Comparison
from app.core.security import get_current_doctor
from app.models.doctor import Doctor

router = APIRouter(prefix="/comparisons", tags=["comparisons"])

@router.post("/", response_model=ComparisonOut, status_code=status.HTTP_201_CREATED)
def create_comparison(
    payload: ComparisonCreate, 
    db: Session = Depends(get_db), 
    current_doctor: Doctor = Depends(get_current_doctor)
):
    # Enforce maximum 4 profiles for each member limit: auto-remove the oldest if there are 4 or more.
    existing_comparisons = db.query(Comparison).filter(
        Comparison.doctor_id == current_doctor.id,
        Comparison.patient_name == payload.patient_name
    ).order_by(Comparison.case_id.asc()).all()

    if len(existing_comparisons) >= 4:
        num_to_delete = len(existing_comparisons) - 3
        for comp in existing_comparisons[:num_to_delete]:
            db.delete(comp)
        db.commit()

    db_comparison = Comparison(
        doctor_id=current_doctor.id,
        patient_name=payload.patient_name,
        condition=payload.condition,
        disease=payload.disease,
        doctor_note=payload.doctor_note
    )
    db.add(db_comparison)
    db.commit()
    db.refresh(db_comparison)
    return db_comparison

@router.get("/", response_model=list[ComparisonOut])
def list_comparisons(
    db: Session = Depends(get_db), 
    current_doctor: Doctor = Depends(get_current_doctor)
):
    return db.query(Comparison).filter(Comparison.doctor_id == current_doctor.id).all()

@router.put("/{case_id}", response_model=ComparisonOut)
def update_comparison(
    case_id: int,
    payload: ComparisonUpdate,
    db: Session = Depends(get_db),
    current_doctor: Doctor = Depends(get_current_doctor)
):
    db_comparison = db.query(Comparison).filter(
        Comparison.case_id == case_id,
        Comparison.doctor_id == current_doctor.id
    ).first()
    if not db_comparison:
        raise HTTPException(status_code=404, detail="Comparison record not found")

    if payload.disease is not None:
        db_comparison.disease = payload.disease
    if payload.condition is not None:
        db_comparison.condition = payload.condition
    if payload.doctor_note is not None:
        db_comparison.doctor_note = payload.doctor_note

    db.commit()
    db.refresh(db_comparison)
    return db_comparison

@router.delete("/{case_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_comparison(
    case_id: int,
    db: Session = Depends(get_db),
    current_doctor: Doctor = Depends(get_current_doctor)
):
    db_comparison = db.query(Comparison).filter(
        Comparison.case_id == case_id,
        Comparison.doctor_id == current_doctor.id
    ).first()
    if not db_comparison:
        raise HTTPException(status_code=404, detail="Comparison record not found")

    db.delete(db_comparison)
    db.commit()
    return None
