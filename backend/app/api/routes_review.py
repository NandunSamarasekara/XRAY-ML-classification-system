from typing import List

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.doctor import Doctor
from app.models.review import Review
from app.schemas.review import ReviewCreate, ReviewUpdate, ReviewOut
from app.core.security import get_current_doctor

router = APIRouter(prefix="/reviews", tags=["Review Management"])


# ─────────────────────────────────────────────
# CREATE  – POST /reviews/
# ─────────────────────────────────────────────
@router.post("/", response_model=ReviewOut, status_code=status.HTTP_201_CREATED)
def create_review(
    payload: ReviewCreate,
    db: Session = Depends(get_db),
    current_doctor: Doctor = Depends(get_current_doctor),
):
    """Create a new service review."""
    review = Review(
        doctor_id=current_doctor.id,
        doctor_name=payload.doctor_name,
        rating=payload.rating,
        comment=payload.comment,
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    return review


# ─────────────────────────────────────────────
# READ ALL  – GET /reviews/
# ─────────────────────────────────────────────
@router.get("/", response_model=List[ReviewOut])
def list_reviews(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_doctor: Doctor = Depends(get_current_doctor),
):
    """List all reviews submitted by the authenticated doctor."""
    reviews = (
        db.query(Review)
        .filter(Review.doctor_id == current_doctor.id)
        .order_by(Review.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return reviews


# ─────────────────────────────────────────────
# READ ONE  – GET /reviews/{review_id}
# ─────────────────────────────────────────────
@router.get("/{review_id}", response_model=ReviewOut)
def get_review(
    review_id: int,
    db: Session = Depends(get_db),
    current_doctor: Doctor = Depends(get_current_doctor),
):
    review = db.query(Review).filter(
        Review.id == review_id,
        Review.doctor_id == current_doctor.id,
    ).first()
    if not review:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")
    return review


# ─────────────────────────────────────────────
# UPDATE  – PATCH /reviews/{review_id}
# ─────────────────────────────────────────────
@router.patch("/{review_id}", response_model=ReviewOut)
def update_review(
    review_id: int,
    payload: ReviewUpdate,
    db: Session = Depends(get_db),
    current_doctor: Doctor = Depends(get_current_doctor),
):
    review = db.query(Review).filter(
        Review.id == review_id,
        Review.doctor_id == current_doctor.id,
    ).first()
    if not review:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(review, field, value)

    db.commit()
    db.refresh(review)
    return review


# ─────────────────────────────────────────────
# DELETE  – DELETE /reviews/{review_id}
# ─────────────────────────────────────────────
@router.delete("/{review_id}", status_code=status.HTTP_200_OK)
def delete_review(
    review_id: int,
    db: Session = Depends(get_db),
    current_doctor: Doctor = Depends(get_current_doctor),
):
    review = db.query(Review).filter(
        Review.id == review_id,
        Review.doctor_id == current_doctor.id,
    ).first()
    if not review:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")

    db.delete(review)
    db.commit()
    return {"detail": f"Review {review_id} deleted successfully"}
