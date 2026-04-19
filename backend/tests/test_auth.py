import pytest
from fastapi import status

def test_register_doctor(client):
    response = client.post(
        "/auth/register",
        json={
            "first_name": "Test",
            "last_name": "Doctor",
            "email": "testdoctor@example.com",
            "password": "password123",
            "phone_no": "1234567890",
            "qualification": "MD"
        }
    )
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["email"] == "testdoctor@example.com"
    assert data["first_name"] == "Test"
    assert "id" in data
    assert "username" in data
    assert data["username"] == f"TestDoctor{data['id']}"

def test_register_duplicate_email(client):
    userData = {
        "first_name": "Test",
        "last_name": "Doctor",
        "email": "testdoctor@example.com",
        "password": "password123",
        "phone_no": "1234567890",
        "qualification": "MD"
    }
    client.post("/auth/register", json=userData)
    response = client.post("/auth/register", json=userData)
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert response.json()["detail"] == "Email already registered"

def test_login_doctor(client):
    # Register first
    client.post(
        "/auth/register",
        json={
            "first_name": "Login",
            "last_name": "Test",
            "email": "login@example.com",
            "password": "password123",
            "phone_no": "1234567890",
            "qualification": "MD"
        }
    )
    
    # Login
    response = client.post(
        "/auth/login",
        json={
            "email": "login@example.com",
            "password": "password123"
        }
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["doctor"]["email"] == "login@example.com"

def test_login_invalid_credentials(client):
    response = client.post(
        "/auth/login",
        json={
            "email": "nonexistent@example.com",
            "password": "wrongpassword"
        }
    )
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

def test_update_profile(client):
    # Register and login
    client.post(
        "/auth/register",
        json={
            "first_name": "Update",
            "last_name": "Test",
            "email": "update@example.com",
            "password": "password123",
            "phone_no": "1234567890",
            "qualification": "MD"
        }
    )
    login_resp = client.post(
        "/auth/login",
        json={
            "email": "update@example.com",
            "password": "password123"
        }
    )
    token = login_resp.json()["access_token"]
    
    # Update profile
    response = client.patch(
        "/auth/update-profile",
        json={
            "first_name": "Updated",
            "last_name": "Name",
            "phone_no": "0987654321"
        },
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["first_name"] == "Updated"
    assert data["last_name"] == "Name"
    assert data["phone_no"] == "0987654321"

def test_delete_account(client):
    # Register and login
    client.post(
        "/auth/register",
        json={
            "first_name": "Delete",
            "last_name": "Test",
            "email": "delete@example.com",
            "password": "password123",
            "phone_no": "1234567890",
            "qualification": "MD"
        }
    )
    login_resp = client.post(
        "/auth/login",
        json={
            "email": "delete@example.com",
            "password": "password123"
        }
    )
    token = login_resp.json()["access_token"]
    
    # Delete account
    response = client.delete(
        "/auth/delete_account",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["detail"] == "Account deleted successfully"
    
    # Try to login again
    login_resp = client.post(
        "/auth/login",
        json={
            "email": "delete@example.com",
            "password": "password123"
        }
    )
    assert login_resp.status_code == status.HTTP_401_UNAUTHORIZED
