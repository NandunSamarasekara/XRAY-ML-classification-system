from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.doctor import Doctor
from app.schemas.doctor import DoctorCreate, DoctorLogin, DoctorOut, Token
from app.core.security import hash_password, verify_password, create_access_token
from app.core.security import get_current_doctor

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=DoctorOut, status_code=status.HTTP_201_CREATED)
def register(payload: DoctorCreate, db: Session = Depends(get_db)):
    # 1. Check if email already taken
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