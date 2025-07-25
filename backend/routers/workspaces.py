from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlmodel import Session, select
from backend.database import get_session
from backend.models.user import User
from backend.models.workspace import Workspace, WorkspaceMember
from backend.schemas.workspace import WorkspaceCreate, WorkspaceRead, WorkspaceWithMembers
from backend.dependencies import get_current_user
from backend.utils.localization import get_localized_message

router = APIRouter(prefix="/api/workspaces", tags=["workspaces"])


@router.post("/", response_model=WorkspaceRead)
def create_workspace(
    workspace_data: WorkspaceCreate,
    request: Request,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Create a new workspace (max 3 per user)"""
    # Check if user already has 3 workspaces
    statement = select(Workspace).where(Workspace.owner_id == current_user.id)
    existing_workspaces = session.exec(statement).all()
    
    if len(existing_workspaces) >= 3:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=get_localized_message("MAX_WORKSPACES", request)
        )
    
    # Validate workspace name
    if not workspace_data.name or not workspace_data.name.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=get_localized_message("WORKSPACE_NAME_REQUIRED", request)
        )
    
    # Create workspace
    workspace = Workspace(
        name=workspace_data.name.strip(),
        store_url=workspace_data.store_url,
        store_platform=workspace_data.store_platform,
        owner_id=current_user.id
    )
    
    session.add(workspace)
    session.commit()
    session.refresh(workspace)
    
    # Create owner membership
    owner_membership = WorkspaceMember(
        workspace_id=workspace.id,
        user_id=current_user.id,
        role="owner"
    )
    
    session.add(owner_membership)
    session.commit()
    
    return workspace


@router.get("/", response_model=List[WorkspaceWithMembers])
def list_user_workspaces(
    request: Request,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Get all workspaces where user is a member"""
    # Get all workspaces where user is a member
    statement = select(Workspace).join(WorkspaceMember).where(
        WorkspaceMember.user_id == current_user.id
    )
    workspaces = session.exec(statement).all()
    
    # Get user's role in each workspace
    result = []
    for workspace in workspaces:
        membership_statement = select(WorkspaceMember).where(
            WorkspaceMember.workspace_id == workspace.id,
            WorkspaceMember.user_id == current_user.id
        )
        membership = session.exec(membership_statement).first()
        
        workspace_with_role = WorkspaceWithMembers(
            id=workspace.id,
            name=workspace.name,
            slug=workspace.slug,
            store_url=workspace.store_url,
            store_platform=workspace.store_platform,
            created_at=workspace.created_at,
            owner_id=workspace.owner_id,
            user_role=membership.role if membership else "member"
        )
        result.append(workspace_with_role)
    
    return result


@router.get("/{workspace_slug}", response_model=WorkspaceRead)
def get_workspace(
    workspace_slug: str,
    request: Request,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Get specific workspace details (user must be a member)"""
    # Get workspace by slug
    statement = select(Workspace).where(Workspace.slug == workspace_slug)
    workspace = session.exec(statement).first()
    
    if not workspace:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=get_localized_message("WORKSPACE_NOT_FOUND", request)
        )
    
    # Check if user is a member
    membership_statement = select(WorkspaceMember).where(
        WorkspaceMember.workspace_id == workspace.id,
        WorkspaceMember.user_id == current_user.id
    )
    membership = session.exec(membership_statement).first()
    
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=get_localized_message("WORKSPACE_ACCESS_DENIED", request)
        )
    
    return workspace 