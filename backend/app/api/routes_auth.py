from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.doctor import Doctor
from app.schemas.doctor import DoctorCreate, DoctorLogin, DoctorOut, Token, DoctorUpdate
from app.core.security import hash_password, verify_password, create_access_token
from app.core.security import get_current_doctor
from app.models.otp import UserOTP
from app.core.email import send_otp_email
import random
import datetime

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/send-otp", status_code=status.HTTP_200_OK)
def send_otp(payload: dict, db: Session = Depends(get_db)):
    email = payload.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="Email is required")
    
    # Check if user already exists
    existing = db.query(Doctor).filter(Doctor.email == email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Generate 6-digit OTP
    otp_code = str(random.randint(100000, 999999))
    
    # Set expiration
    from app.config import settings
    expires_at = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(minutes=settings.OTP_EXPIRE_MINUTES)
    
    # Store or update OTP
    db_otp = db.query(UserOTP).filter(UserOTP.email == email).first()
    if db_otp:
        db_otp.otp_code = otp_code
        db_otp.expires_at = expires_at
    else:
        new_otp = UserOTP(email=email, otp_code=otp_code, expires_at=expires_at)
        db.add(new_otp)
    
    db.commit()
    
    # Send email
    if send_otp_email(email, otp_code):
        return {"detail": "OTP sent successfully"}
    else:
        # Fallback: Print OTP to terminal for testing/debugging
        print(f"\n[TESTING FALLBACK] OTP for {email}: {otp_code}\n")
        return {"detail": "Email service failed, but OTP was generated (check terminal for TESTING FALLBACK)"}


@router.post("/register", response_model=DoctorOut, status_code=status.HTTP_201_CREATED)
def register(payload: DoctorCreate, db: Session = Depends(get_db)):
    # 1. Verify OTP
    db_otp = db.query(UserOTP).filter(UserOTP.email == payload.email).first()
    if not db_otp or db_otp.otp_code != payload.otp_code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid OTP code",
        )
    
    if db_otp.is_expired():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OTP code has expired",
        )

    # 2. Check if email already taken
    existing = db.query(Doctor).filter(Doctor.email == payload.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    # 2. Hash the password
    hashed = hash_password(payload.password)

    # 3. Create the doctor record
    doctor = Doctor(
        first_name=payload.first_name,
        last_name=payload.last_name,
        username="",  # Will be set after ID is generated
        email=payload.email,
        phone_no=payload.phone_no,
        qualification=payload.qualification,
        hashed_password=hashed,
    )
    db.add(doctor)
    db.flush()   # sends INSERT without committing so we get the auto-generated ID

    # 4. Generate username = FirstnameLastnameID   (e.g. "JohnDoe42")
    doctor.username = f"{payload.first_name}{payload.last_name}{doctor.id}"
    # 5. Delete OTP record after successful registration
    db.delete(db_otp)
    db.commit()
    db.refresh(doctor)

    return doctor


@router.post("/login", response_model=Token)
def login(payload: DoctorLogin, db: Session = Depends(get_db)):
    # 1. Look up doctor by email
    doctor = db.query(Doctor).filter(Doctor.email == payload.email).first()
    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    # 2. Verify password
    if not verify_password(payload.password, doctor.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    # 3. Issue JWT
    token = create_access_token(
        data={"sub": str(doctor.id), "username": doctor.username}
    )

    return Token(
        access_token=token,
        token_type="bearer",
        doctor=DoctorOut.from_orm(doctor),
    )


@router.delete("/delete_account", status_code=status.HTTP_200_OK)
def delete_account(db: Session = Depends(get_db), current_doctor: Doctor = Depends(get_current_doctor)):
    # Find and delete the current doctor's account
    doctor = db.query(Doctor).filter(Doctor.id == current_doctor.id).first()
    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor not found",
        )
    
    # Delete the doctor record
    db.delete(doctor)
    db.commit()
    
    return {"detail": "Account deleted successfully"}


@router.patch("/update-profile", response_model=DoctorOut)
def update_profile(
    payload: DoctorUpdate,
    db: Session = Depends(get_db),
    current_doctor: Doctor = Depends(get_current_doctor)
):
    # Update fields if provided in partial payload
    if payload.first_name is not None:
        current_doctor.first_name = payload.first_name
    if payload.last_name is not None:
        current_doctor.last_name = payload.last_name
    if payload.phone_no is not None:
        current_doctor.phone_no = payload.phone_no
    if payload.qualification is not None:
        current_doctor.qualification = payload.qualification
    
    # Handle password change separately
    if payload.password is not None and payload.password != "":
        current_doctor.hashed_password = hash_password(payload.password)
        
    db.commit()
    db.refresh(current_doctor)
    return current_doctor
