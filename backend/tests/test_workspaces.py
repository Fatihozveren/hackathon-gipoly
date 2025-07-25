import pytest
from fastapi import status


class TestWorkspaces:
    """Test workspace endpoints."""

    def test_create_workspace_success(self, client, auth_headers):
        """Test successful workspace creation."""
        response = client.post("/api/workspaces/", json={
            "name": "Test Workspace"
        }, headers=auth_headers)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["name"] == "Test Workspace"
        assert "slug" in data
        assert "id" in data

    def test_create_workspace_without_auth(self, client):
        """Test workspace creation without authentication."""
        response = client.post("/api/workspaces/", json={
            "name": "Test Workspace"
        })
        
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_create_workspace_empty_name(self, client, auth_headers):
        """Test workspace creation with empty name."""
        response = client.post("/api/workspaces/", json={
            "name": ""
        }, headers=auth_headers)
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_list_workspaces(self, client, auth_headers, test_workspace):
        """Test listing user workspaces."""
        response = client.get("/api/workspaces/", headers=auth_headers)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1
        assert any(w["name"] == "Test Workspace" for w in data)

    def test_list_workspaces_without_auth(self, client):
        """Test listing workspaces without authentication."""
        response = client.get("/api/workspaces/")
        
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_get_workspace_by_slug(self, client, auth_headers, test_workspace):
        """Test getting workspace by slug."""
        response = client.get(f"/api/workspaces/{test_workspace.slug}", headers=auth_headers)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["name"] == "Test Workspace"
        assert data["slug"] == test_workspace.slug

    def test_get_workspace_nonexistent(self, client, auth_headers):
        """Test getting non-existent workspace."""
        response = client.get("/api/workspaces/nonexistent-slug", headers=auth_headers)
        
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_get_workspace_without_auth(self, client, test_workspace):
        """Test getting workspace without authentication."""
        response = client.get(f"/api/workspaces/{test_workspace.slug}")
        
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_create_multiple_workspaces(self, client, auth_headers):
        """Test creating multiple workspaces (should be limited to 3)."""
        # Create first workspace
        response1 = client.post("/api/workspaces/", json={
            "name": "Workspace 1"
        }, headers=auth_headers)
        assert response1.status_code == status.HTTP_200_OK
        
        # Create second workspace
        response2 = client.post("/api/workspaces/", json={
            "name": "Workspace 2"
        }, headers=auth_headers)
        assert response2.status_code == status.HTTP_200_OK
        
        # Create third workspace
        response3 = client.post("/api/workspaces/", json={
            "name": "Workspace 3"
        }, headers=auth_headers)
        assert response3.status_code == status.HTTP_200_OK
        
        # Try to create fourth workspace (should fail)
        response4 = client.post("/api/workspaces/", json={
            "name": "Workspace 4"
        }, headers=auth_headers)
        assert response4.status_code == status.HTTP_400_BAD_REQUEST 