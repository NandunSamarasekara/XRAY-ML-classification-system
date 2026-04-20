from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Date, Time
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID

from app.db.session import Base


class Report(Base):
    __tablename__ = "reports"

    report_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    doctor_id = Column(Integer, ForeignKey("doctors.id"), nullable=False)
    patient_name = Column(String, nullable=False)
    status = Column(String, nullable=False, default="Draft")  # 'Draft' or 'Finalized'
    diagnosis = Column(Text, nullable=True)
    clinical_observations = Column(Text, nullable=True)
    treatment_plan = Column(Text, nullable=True)
    additional_comments = Column(Text, nullable=True)
    created_date = Column(Date, server_default=func.current_date(), nullable=False)

    doctor = relationship("Doctor", back_populates="reports")
