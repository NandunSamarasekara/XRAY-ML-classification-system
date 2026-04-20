from sqlalchemy import Column, Integer, String, Text, Time, Date, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.session import Base


class Comparison(Base):
    __tablename__ = "comparisons"

    case_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    doctor_id = Column(Integer, ForeignKey("doctors.id"), nullable=False)
    patient_name = Column(String(200), nullable=False)
    condition = Column(String(200), nullable=True)
    disease = Column(String(200), nullable=True)
    doctor_note = Column(Text, nullable=True)
    created_date = Column(Date, server_default=func.current_date(), nullable=False)
    created_time = Column(Time, server_default=func.current_time(), nullable=False)

    doctor = relationship("Doctor", back_populates="comparisons")
