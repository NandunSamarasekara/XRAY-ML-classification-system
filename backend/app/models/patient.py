from uuid import uuid4
from sqlalchemy import Column, Date, DateTime, Enum, String, Text, func, Boolean, ForeignKey, Integer
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID

from app.db.session import Base
from app.models.enums import GenderEnum

class PatientPortfolio(Base):
    __tablename__ = "patient_portfolios"

    id = Column("portfolio_id", UUID(as_uuid=True), primary_key=True, default=uuid4, nullable=False)
    doctor_id = Column(Integer, ForeignKey("doctors.id"), nullable=False)
    username = Column(String(200), unique=True, nullable=False, index=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    dob = Column(Date, nullable=False)
    gender = Column(Enum(GenderEnum, name="gender_enum"), nullable=True)
    phone = Column(String(50), nullable=True)
    email = Column(String(255), unique=True, nullable=False)
    address = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    is_active = Column(Boolean, default=False, nullable=False)
    otp = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    doctor = relationship("Doctor", back_populates="patient_portfolios")
    reviews = relationship("Review", back_populates="patient")
