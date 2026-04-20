from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel

from app.db.session import get_db
from app.schemas.report import ReportCreate, ReportOut, ReportUpdate
from app.models.report import Report
from app.core.security import get_current_doctor
from app.models.doctor import Doctor
from app.core.email import send_report_email

class PatientContextPayload(BaseModel):
    gender: Optional[str] = 'N/A'
    age: Optional[str] = 'N/A'
    email: Optional[str] = 'N/A'

class EmailPayload(BaseModel):
    email: str
    normal_image: Optional[str] = None
    heatmap_image: Optional[str] = None
    patient_context: Optional[PatientContextPayload] = None

router = APIRouter(prefix="/reports", tags=["reports"])


@router.post("/", response_model=ReportOut, status_code=status.HTTP_201_CREATED)
def create_report(
    payload: ReportCreate,
    db: Session = Depends(get_db),
    current_doctor: Doctor = Depends(get_current_doctor)
):
    db_report = Report(
        doctor_id=current_doctor.id,
        patient_name=payload.patient_name,
        status=payload.status,
        diagnosis=payload.diagnosis,
        clinical_observations=payload.clinical_observations,
        treatment_plan=payload.treatment_plan,
        additional_comments=payload.additional_comments,
    )
    db.add(db_report)
    db.commit()
    db.refresh(db_report)
    return db_report


@router.get("/", response_model=List[ReportOut])
def list_reports(
    db: Session = Depends(get_db),
    current_doctor: Doctor = Depends(get_current_doctor)
):
    return db.query(Report).filter(Report.doctor_id == current_doctor.id).order_by(Report.report_id.desc()).all()


@router.get("/{report_id}", response_model=ReportOut)
def get_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_doctor: Doctor = Depends(get_current_doctor)
):
    report = db.query(Report).filter(
        Report.report_id == report_id,
        Report.doctor_id == current_doctor.id
    ).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report


@router.put("/{report_id}", response_model=ReportOut)
def update_report(
    report_id: int,
    payload: ReportUpdate,
    db: Session = Depends(get_db),
    current_doctor: Doctor = Depends(get_current_doctor)
):
    report = db.query(Report).filter(
        Report.report_id == report_id,
        Report.doctor_id == current_doctor.id
    ).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    for field, value in payload.dict(exclude_unset=True).items():
        setattr(report, field, value)

    db.commit()
    db.refresh(report)
    return report


@router.delete("/{report_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_doctor: Doctor = Depends(get_current_doctor)
):
    report = db.query(Report).filter(
        Report.report_id == report_id,
        Report.doctor_id == current_doctor.id
    ).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    db.delete(report)
    db.commit()
    return None


@router.post("/{report_id}/send-email")
def email_report(
    report_id: int,
    payload: EmailPayload,
    db: Session = Depends(get_db),
    current_doctor: Doctor = Depends(get_current_doctor)
):
    report = db.query(Report).filter(
        Report.report_id == report_id,
        Report.doctor_id == current_doctor.id
    ).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    report_dict = {
        "report_id": report.report_id,
        "patient_name": report.patient_name,
        "diagnosis": report.diagnosis,
        "clinical_observations": report.clinical_observations,
        "treatment_plan": report.treatment_plan,
        "additional_comments": report.additional_comments,
        "created_date": str(report.created_date) if report.created_date else "",
        "normal_image": payload.normal_image,
        "heatmap_image": payload.heatmap_image,
        "patient_context": payload.patient_context.dict() if payload.patient_context else {},
    }
    
    try:
        send_report_email(payload.email, report_dict)
        return {"message": "Email sent successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
