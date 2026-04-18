from datetime import datetime, timedelta, timezone
from typing import Optional
import hashlib

from jose import jwt, JWTError
from passlib.context import CryptContext
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

import logging
from app.config import settings
from app.db.session import get_db
from app.models.doctor import Doctor

logger = logging.getLogger(__name__)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

security = HTTPBearer()


def hash_password(plain_password: str) -> str:
    # Truncate password to 72 bytes to comply with bcrypt limitations
    # Also ensure it's encoded properly
    password_bytes = plain_password.encode('utf-8')
    if len(password_bytes) > 72:
        # Take first 72 bytes and decode back to string
        truncated_password = password_bytes[:72].decode('utf-8', errors='ignore')
    else:
        truncated_password = plain_password
    return pwd_context.hash(truncated_password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    # Verify with truncated password to maintain consistency
    password_bytes = plain_password.encode('utf-8')
    if len(password_bytes) > 72:
        truncated_password = password_bytes[:72].decode('utf-8', errors='ignore')
    else:
        truncated_password = plain_password
    return pwd_context.verify(truncated_password, hashed_password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def get_current_doctor(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)) -> Doctor:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(credentials.credentials, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        doctor_id: Optional[str] = payload.get("sub")
        if doctor_id is None:
            logger.warning("Auth failure: 'sub' claim missing in JWT")
            raise credentials_exception
    except JWTError as e:
        logger.warning(f"Auth failure: JWT decode error: {e}")
        raise credentials_exception
    
    doctor = db.query(Doctor).filter(Doctor.id == int(doctor_id)).first()
    if doctor is None:
        logger.warning(f"Auth failure: Doctor ID {doctor_id} not found in database")
        raise credentials_exception
    return doctor