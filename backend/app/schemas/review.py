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
