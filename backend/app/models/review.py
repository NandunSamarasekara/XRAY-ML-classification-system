from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.db.session import Base


from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base

class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    doctor_id = Column(Integer, ForeignKey("doctors.id", ondelete="CASCADE"), nullable=False, index=True)
    doctor_name = Column(String(200), nullable=False)       # name of the doctor being reviewed
    rating = Column(Integer, nullable=False)                # star rating 1–5
    comment = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # relationship back to the submitting doctor
    doctor = relationship("Doctor", backref="reviews")
    doctor_id = Column(Integer, ForeignKey("doctors.id"), nullable=False)
    review_type = Column(String(50), nullable=False)  # binary_model, multiclass_model, general_system
    rating = Column(Integer, nullable=False)  # 1-5
    review_text = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationship back to doctor
    doctor = relationship("Doctor", back_populates="reviews")
