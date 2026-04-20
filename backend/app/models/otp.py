from sqlalchemy import Column, String, DateTime
from app.db.session import Base
from sqlalchemy.sql import func
import datetime

class UserOTP(Base):
    __tablename__ = "user_otps"
    
    email = Column(String(255), primary_key=True, index=True)
    otp_code = Column(String(6), nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def is_expired(self):
        now = datetime.datetime.now(datetime.timezone.utc)
        expires_at = self.expires_at
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=datetime.timezone.utc)
        return now > expires_at
