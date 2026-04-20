from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.models.review import Review
from app.models.doctor import Doctor
from app.schemas.review import ReviewCreate, ReviewWithDoctor
from app.core.security import get_current_doctor

router = APIRouter(prefix="/reviews", tags=["Reviews"])

@router.post("/", response_model=ReviewWithDoctor, status_code=status.HTTP_201_CREATED)
def create_review(
    payload: ReviewCreate,
    db: Session = Depends(get_db),
    current_doctor: Doctor = Depends(get_current_doctor)
):
    review = Review(
        doctor_id=current_doctor.id,
        review_type=payload.review_type,
        rating=payload.rating,
        review_text=payload.review_text
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    return review

@router.get("/featured", response_model=List[ReviewWithDoctor])
def get_featured_reviews(db: Session = Depends(get_db)):
    # User requested reviews with more than 3.5 ratings. 
    # Since ratings are integers 1-5, this means 4 and 5.
    reviews = db.query(Review).filter(Review.rating >= 4).order_by(Review.created_at.desc()).limit(10).all()
    return reviews

@router.get("/all", response_model=List[ReviewWithDoctor])
def get_all_reviews(db: Session = Depends(get_db)):
    reviews = db.query(Review).order_by(Review.created_at.desc()).all()
    return reviews


@router.get("/me", response_model=List[ReviewWithDoctor])
def get_my_reviews(
    db: Session = Depends(get_db),
    current_doctor: Doctor = Depends(get_current_doctor)
):
    reviews = db.query(Review).filter(Review.doctor_id == current_doctor.id).order_by(Review.created_at.desc()).all()
    return reviews


@router.delete("/{review_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_review(
    review_id: int,
    db: Session = Depends(get_db),
    current_doctor: Doctor = Depends(get_current_doctor)
):
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    
    # Ownership check
    if review.doctor_id != current_doctor.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this review")
    
    db.delete(review)
    db.commit()
    return None
