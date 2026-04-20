from pydantic import BaseModel
from typing import Optional
from datetime import date, time

class ComparisonBase(BaseModel):
    patient_name: str
    condition: Optional[str] = None
    disease: Optional[str] = None
    doctor_note: Optional[str] = None

class ComparisonCreate(ComparisonBase):
    pass

class ComparisonUpdate(BaseModel):
    condition: Optional[str] = None
    disease: Optional[str] = None
    doctor_note: Optional[str] = None

class ComparisonOut(ComparisonBase):
    case_id: int
    doctor_id: int
    created_date: date
    created_time: time

    class Config:
        from_attributes = True
