import pytest
from fastapi import status
from unittest.mock import patch
from app.models.otp import UserOTP

def test_send_otp_success(client):
    with patch("app.api.routes_auth.send_otp_email", return_value=True):
        response = client.post(
            "/auth/send-otp",
            json={"email": "newuser@example.com"}
        )
        assert response.status_code == status.HTTP_200_OK
        assert response.json()["detail"] == "OTP sent successfully"

def test_send_otp_duplicate_email(client, db_session):
    # Register a user first (need valid OTP)
    email = "existing@example.com"
    with patch("app.api.routes_auth.send_otp_email", return_value=True):
        client.post("/auth/send-otp", json={"email": email})
        
        # Get OTP from DB using the fixture session
        otp_record = db_session.query(UserOTP).filter(UserOTP.email == email).first()
        otp_code = otp_record.otp_code
        
        client.post(
            "/auth/register",
            json={
                "first_name": "Existing",
                "last_name": "User",
                "email": email,
                "password": "password123",
                "phone_no": "1234567890",
                "qualification": "MD",
                "otp_code": otp_code
            }
        )
    
    # Try to send OTP to existing email
    response = client.post(
        "/auth/send-otp",
        json={"email": email}
    )
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert response.json()["detail"] == "Email already registered"

def test_register_with_valid_otp(client, db_session):
    email = "validotp@example.com"
    with patch("app.api.routes_auth.send_otp_email", return_value=True):
        client.post("/auth/send-otp", json={"email": email})
        
        # Get OTP from DB using the fixture session
        otp_record = db_session.query(UserOTP).filter(UserOTP.email == email).first()
        otp_code = otp_record.otp_code
        
        response = client.post(
            "/auth/register",
            json={
                "first_name": "Valid",
                "last_name": "OTP",
                "email": email,
                "password": "password123",
                "phone_no": "1234567890",
                "qualification": "MD",
                "otp_code": otp_code
            }
        )
        assert response.status_code == status.HTTP_201_CREATED
        assert response.json()["email"] == email

def test_register_with_invalid_otp(client):
    email = "invalidotp@example.com"
    with patch("app.api.routes_auth.send_otp_email", return_value=True):
        client.post("/auth/send-otp", json={"email": email})
        
        response = client.post(
            "/auth/register",
            json={
                "first_name": "Invalid",
                "last_name": "OTP",
                "email": email,
                "password": "password123",
                "phone_no": "1234567890",
                "qualification": "MD",
                "otp_code": "000000" # Wrong OTP
            }
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert response.json()["detail"] == "Invalid OTP code"
