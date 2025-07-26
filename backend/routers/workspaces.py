from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlmodel import Session, select
from database import get_session
from models.user import User
from models.workspace import Workspace, WorkspaceMember
from schemas.workspace import (
    WorkspaceCreate, WorkspaceRead, WorkspaceWithMembers, 
    WorkspaceUpdate, WorkspaceMemberCreate, WorkspaceMemberRead
)
from dependencies import get_current_user
from utils.localization import get_localized_message
from utils.logging_config import get_logger

router = APIRouter(prefix="/api/workspaces", tags=["workspaces"])
logger = get_logger(__name__)


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
        
        result.append(WorkspaceWithMembers(
            id=workspace.id,
            name=workspace.name,
            slug=workspace.slug,
            store_url=workspace.store_url,
            store_platform=workspace.store_platform,
            created_at=workspace.created_at,
            owner_id=workspace.owner_id,
            user_role=membership.role if membership else "member"
        ))
    
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


@router.put("/{workspace_slug}", response_model=WorkspaceRead)
def update_workspace(
    workspace_slug: str,
    workspace_data: WorkspaceUpdate,
    request: Request,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Update workspace (only owner can update)"""
    # Get workspace by slug
    statement = select(Workspace).where(Workspace.slug == workspace_slug)
    workspace = session.exec(statement).first()
    
    if not workspace:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=get_localized_message("WORKSPACE_NOT_FOUND", request)
        )
    
    # Check if user is the owner
    if workspace.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=get_localized_message("WORKSPACE_OWNER_ONLY", request)
        )
    
    # Update workspace fields
    if workspace_data.name is not None:
        workspace.name = workspace_data.name.strip()
    if workspace_data.store_url is not None:
        workspace.store_url = workspace_data.store_url
    if workspace_data.store_platform is not None:
        workspace.store_platform = workspace_data.store_platform
    
    session.add(workspace)
    session.commit()
    session.refresh(workspace)
    
    logger.info(f"Workspace updated: {workspace.slug} by user: {current_user.email}")
    return workspace


@router.delete("/{workspace_slug}")
def delete_workspace(
    workspace_slug: str,
    request: Request,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Delete workspace (only owner can delete)"""
    # Get workspace by slug
    statement = select(Workspace).where(Workspace.slug == workspace_slug)
    workspace = session.exec(statement).first()
    
    if not workspace:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=get_localized_message("WORKSPACE_NOT_FOUND", request)
        )
    
    # Check if user is the owner
    if workspace.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=get_localized_message("WORKSPACE_OWNER_ONLY", request)
        )
    
    # Delete workspace (cascade will handle members)
    session.delete(workspace)
    session.commit()
    
    logger.info(f"Workspace deleted: {workspace_slug} by user: {current_user.email}")
    return {"message": get_localized_message("WORKSPACE_DELETED", request)}


@router.post("/{workspace_slug}/members", response_model=WorkspaceMemberRead)
def add_member(
    workspace_slug: str,
    member_data: WorkspaceMemberCreate,
    request: Request,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Add member to workspace (only owner can add members)"""
    # Get workspace by slug
    statement = select(Workspace).where(Workspace.slug == workspace_slug)
    workspace = session.exec(statement).first()
    
    if not workspace:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=get_localized_message("WORKSPACE_NOT_FOUND", request)
        )
    
    # Check if user is the owner
    if workspace.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=get_localized_message("WORKSPACE_OWNER_ONLY", request)
        )
    
    # Find user to add
    user_statement = select(User).where(User.email == member_data.email)
    user_to_add = session.exec(user_statement).first()
    
    if not user_to_add:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=get_localized_message("USER_NOT_FOUND", request)
        )
    
    # Check if user is already a member
    existing_membership = session.exec(
        select(WorkspaceMember).where(
            WorkspaceMember.workspace_id == workspace.id,
            WorkspaceMember.user_id == user_to_add.id
        )
    ).first()
    
    if existing_membership:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=get_localized_message("USER_ALREADY_MEMBER", request)
        )
    
    # Add member
    membership = WorkspaceMember(
        workspace_id=workspace.id,
        user_id=user_to_add.id,
        role=member_data.role
    )
    
    session.add(membership)
    session.commit()
    session.refresh(membership)
    
    logger.info(f"Member added to workspace: {workspace_slug}, user: {member_data.email}")
    return membership


@router.get("/{workspace_slug}/members", response_model=List[WorkspaceMemberRead])
def list_members(
    workspace_slug: str,
    request: Request,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """List workspace members (user must be a member)"""
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
    
    # Get all members
    members_statement = select(WorkspaceMember).where(
        WorkspaceMember.workspace_id == workspace.id
    )
    members = session.exec(members_statement).all()
    
    return members


@router.delete("/{workspace_slug}/members/{user_id}")
def remove_member(
    workspace_slug: str,
    user_id: int,
    request: Request,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Remove member from workspace (only owner can remove members)"""
    # Get workspace by slug
    statement = select(Workspace).where(Workspace.slug == workspace_slug)
    workspace = session.exec(statement).first()
    
    if not workspace:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=get_localized_message("WORKSPACE_NOT_FOUND", request)
        )
    
    # Check if user is the owner
    if workspace.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=get_localized_message("WORKSPACE_OWNER_ONLY", request)
        )
    
    # Find membership to remove
    membership_statement = select(WorkspaceMember).where(
        WorkspaceMember.workspace_id == workspace.id,
        WorkspaceMember.user_id == user_id
    )
    membership = session.exec(membership_statement).first()
    
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=get_localized_message("USER_NOT_FOUND", request)
        )
    
    # Don't allow removing the owner
    if membership.role == "owner":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot remove workspace owner"
        )
    
    # Remove member
    session.delete(membership)
    session.commit()
    
    logger.info(f"Member removed from workspace: {workspace_slug}, user_id: {user_id}")
    return {"message": get_localized_message("MEMBER_REMOVED", request)} 