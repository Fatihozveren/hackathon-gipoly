import pytest
from fastapi import status
from httpx import AsyncClient


class TestAuth:
    """Test authentication endpoints."""

    def test_register_success(self, client):
        """Test successful user registration."""
        response = client.post("/auth/register", json={
            "email": "newuser@example.com",
            "password": "testpassword123",
            "full_name": "New User"
        })
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        # Register returns user data, not token
        assert "email" in data
        assert data["email"] == "newuser@example.com"
        assert data["full_name"] == "New User"

    def test_register_duplicate_email(self, client, test_user):
        """Test registration with duplicate email."""
        response = client.post("/auth/register", json={
            "email": "test@example.com",
            "password": "testpassword123",
            "full_name": "Duplicate User"
        })
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_login_success(self, client, test_user):
        """Test successful login."""
        response = client.post("/auth/login", json={
            "email": "test@example.com",
            "password": "testpassword"
        })
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        # Login doesn't return user data in response

    def test_login_invalid_credentials(self, client):
        """Test login with invalid credentials."""
        response = client.post("/auth/login", json={
            "email": "nonexistent@example.com",
            "password": "wrongpassword"
        })
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_login_wrong_password(self, client, test_user):
        """Test login with wrong password."""
        response = client.post("/auth/login", json={
            "email": "test@example.com",
            "password": "wrongpassword"
        })
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_me_endpoint_with_token(self, client, auth_headers):
        """Test /me endpoint with valid token."""
        response = client.get("/me", headers=auth_headers)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "email" in data
        assert "full_name" in data

    def test_me_endpoint_without_token(self, client):
        """Test /me endpoint without token."""
        response = client.get("/me")
        
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_me_endpoint_invalid_token(self, client):
        """Test /me endpoint with invalid token."""
        response = client.get("/me", headers={"Authorization": "Bearer invalid_token"})
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED 