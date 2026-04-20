from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class ReviewBase(BaseModel):
    review_type: str = Field(..., description="binary_model, multiclass_model, or general_system")
    rating: int = Field(..., ge=1, le=5)
    review_text: str

class ReviewCreate(ReviewBase):
    pass

class ReviewResponse(ReviewBase):
    id: int
    doctor_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class DoctorInfo(BaseModel):
    first_name: str
    last_name: str
    qualification: str

    class Config:
        from_attributes = True

class ReviewWithDoctor(ReviewResponse):
    doctor: DoctorInfo
