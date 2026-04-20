from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.session import Base


class Doctor(Base):
    __tablename__ = "doctors"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    # username is auto-generated after insert: FirstnameLastnameID
    username = Column(String(200), unique=True, nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    phone_no = Column(String(20), nullable=False)
    qualification = Column(String(100), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # One doctor can write many reviews
    reviews = relationship("Review", back_populates="doctor")
