from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from uuid import UUID
import base64
import random
from datetime import datetime, date

from app.db.session import get_db
from app.core.security import get_current_doctor
from app.models.doctor import Doctor
from app.models.patient import PatientPortfolio
from app.models.image import Image

router = APIRouter(prefix="/xray", tags=["xray"])

def generate_pytorch_mock_gradcam(image_bytes: bytes):
    """
    Simulates a PyTorch model inference and Grad-CAM generation.
    In a real PyTorch implementation, this would involve:
    1. img = PILImage.open(io.BytesIO(image_bytes))
    2. tensor = transform(img).unsqueeze(0)
    3. out = model(tensor)
    4. gradcam_map = generate_cam(model, tensor)
    5. overlay = overlay_heatmap(img, gradcam_map)
    """
    # For now, we simulate a mock prediction output:
    predictions = [
        {"name": "Pneumonia", "percent": random.randint(70, 95), "color": "#f97316"},
        {"name": "Mass", "percent": random.randint(5, 30), "color": "#8b5cf6"},
        {"name": "Nodule", "percent": random.randint(60, 99), "color": "#22d3ee"}
    ]
    
    # We'll just echo the uploaded image back as the base64 "heatmap" for visual demonstration.
    # In production, replace this with the generated heatmap overlay.
    heatmap_base64 = base64.b64encode(image_bytes).decode("utf-8")
    
    return {
        "predictions": predictions,
        "heatmap_base64": f"data:image/jpeg;base64,{heatmap_base64}"
    }

def calculate_age(dob: date) -> int:
    today = date.today()
    return today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))

@router.post("/predict")
async def predict_xray(
    patient_id: UUID = Form(...),
    x_ray_view: str = Form("PA"),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_doctor: Doctor = Depends(get_current_doctor)
):
    # 1. Fetch Patient
    patient = db.query(PatientPortfolio).filter(
        PatientPortfolio.id == patient_id, 
        PatientPortfolio.doctor_id == current_doctor.id
    ).first()

    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found or unauthorized")

    # 2. Read Image
    image_bytes = await file.read()

    # 3. Process with PyTorch (Mocked)
    result = generate_pytorch_mock_gradcam(image_bytes)

    # 4. Save metadata to Database
    patient_age = calculate_age(patient.dob) if patient.dob else 0
    full_name = f"{patient.first_name} {patient.last_name}"
    
    # Create Image record
    db_image = Image(
        doctor_id=current_doctor.id,
        patient_name=full_name,
        patient_age=patient_age,
        gender=patient.gender.name if patient.gender else None,
        x_ray_view=x_ray_view
    )
    db.add(db_image)
    db.commit()

    return {"status": "success", "data": result}
