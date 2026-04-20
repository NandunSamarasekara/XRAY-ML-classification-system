from datetime import date, datetime
from uuid import UUID
from pydantic import BaseModel, EmailStr, Field, ConfigDict, field_validator

from app.models.enums import GenderEnum

class PatientBase(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    dob: date
    gender: GenderEnum | None = None
    phone: str | None = Field(default=None, max_length=50)
    email: EmailStr
    address: str | None = None
    notes: str | None = None

    @field_validator('dob')
    @classmethod
    def validate_dob(cls, v: date) -> date:
        today = date.today()
        if v > today:
            raise ValueError('Date of birth cannot be in the future.')
        max_age_years = 120
        min_allowed = today.replace(year=today.year - max_age_years)
        if v < min_allowed:
            raise ValueError(f'Date of birth cannot be more than {max_age_years} years ago. Please enter a valid date.')
        return v

class PatientCreate(PatientBase):
    pass
    
class PatientUpdate(BaseModel):
    first_name: str | None = Field(default=None, min_length=1, max_length=100)
    last_name: str | None = Field(default=None, min_length=1, max_length=100)
    dob: date | None = None
    gender: GenderEnum | None = None
    phone: str | None = Field(default=None, max_length=50)
    email: EmailStr | None = None
    address: str | None = None
    notes: str | None = None

    model_config = ConfigDict(extra="forbid")

class PatientOut(PatientBase):
    id: UUID
    doctor_id: int
    username: str
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class OTPVerify(BaseModel):
    otp: str = Field(..., min_length=6, max_length=6)
