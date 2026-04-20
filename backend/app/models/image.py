from sqlalchemy import Column, Integer, String, Enum, Date, Time, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.session import Base
from app.models.enums import GenderEnum


class Image(Base):
    __tablename__ = "images"

    image_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    doctor_id = Column(Integer, ForeignKey("doctors.id"), nullable=False)
    patient_name = Column(String(200), nullable=False)
    patient_age = Column(Integer, nullable=True)
    gender = Column(Enum(GenderEnum, name="image_gender_enum"), nullable=True)
    x_ray_view = Column(String(100), nullable=True)
    created_date = Column(Date, server_default=func.current_date(), nullable=False)
    created_time = Column(Time, server_default=func.current_time(), nullable=False)

    doctor = relationship("Doctor", back_populates="images")
