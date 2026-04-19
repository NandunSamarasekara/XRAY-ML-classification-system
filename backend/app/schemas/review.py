from typing import Optional
from datetime import datetime

from pydantic import BaseModel, Field


# ---------- Request schemas ----------

class ReviewCreate(BaseModel):
    doctor_name: str = Field(..., min_length=1, max_length=200)
    rating: int = Field(..., ge=1, le=5)
    comment: str = Field(..., min_length=1)


class ReviewUpdate(BaseModel):
    doctor_name: Optional[str] = Field(None, min_length=1, max_length=200)
    rating: Optional[int] = Field(None, ge=1, le=5)
    comment: Optional[str] = Field(None, min_length=1)


# ---------- Response schema ----------

class ReviewOut(BaseModel):
    id: int
    doctor_id: int
    doctor_name: str
    rating: int
    comment: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
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
