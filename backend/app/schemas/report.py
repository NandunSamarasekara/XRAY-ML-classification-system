from pydantic import BaseModel
from typing import Optional
from datetime import date


class ReportCreate(BaseModel):
    patient_name: str
    status: str = "Draft"  # 'Draft' or 'Finalized'
    diagnosis: Optional[str] = None
    clinical_observations: Optional[str] = None
    treatment_plan: Optional[str] = None
    additional_comments: Optional[str] = None


class ReportUpdate(BaseModel):
    patient_name: Optional[str] = None
    status: Optional[str] = None
    diagnosis: Optional[str] = None
    clinical_observations: Optional[str] = None
    treatment_plan: Optional[str] = None
    additional_comments: Optional[str] = None


class ReportOut(BaseModel):
    report_id: int
    doctor_id: int
    patient_name: str
    status: str
    diagnosis: Optional[str] = None
    clinical_observations: Optional[str] = None
    treatment_plan: Optional[str] = None
    additional_comments: Optional[str] = None
    created_date: date

    class Config:
        from_attributes = True
