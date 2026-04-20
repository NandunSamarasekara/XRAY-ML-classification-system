from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base

class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    doctor_id = Column(Integer, ForeignKey("doctors.id"), nullable=False)
    review_type = Column(String(50), nullable=False)  # binary_model, multiclass_model, general_system
    rating = Column(Integer, nullable=False)  # 1-5
    review_text = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationship back to doctor
    doctor = relationship("Doctor", back_populates="reviews")
