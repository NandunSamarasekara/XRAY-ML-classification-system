from sqlalchemy import Column, Integer, Text, Date, Time, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID

from app.db.session import Base


class Review(Base):
    __tablename__ = "reviews"

    review_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    doctor_id = Column(Integer, ForeignKey("doctors.id"), nullable=False)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patient_portfolios.portfolio_id"), nullable=False)
    message = Column(Text, nullable=False)
    rating = Column(Integer, nullable=True)
    created_date = Column(Date, server_default=func.current_date(), nullable=False)
    created_time = Column(Time, server_default=func.current_time(), nullable=False)

    doctor = relationship("Doctor", back_populates="reviews")
    patient = relationship("PatientPortfolio", back_populates="reviews")
