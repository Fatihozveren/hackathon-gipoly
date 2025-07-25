from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlmodel import Session, select
from database import get_session
from models.user import User
from models.workspace import Workspace, WorkspaceMember
from utils.security import verify_token
from utils.localization import get_localized_message

security = HTTPBearer()


async def get_current_user(
    request: Request,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    session: Session = Depends(get_session)
) -> User:
    """Get current user from JWT token"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=get_localized_message("ACCESS_DENIED", request),
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    email = verify_token(credentials.credentials)
    if email is None:
        raise credentials_exception
    
    # Get user from database
    statement = select(User).where(User.email == email)
    user = session.exec(statement).first()
    
    if user is None:
        raise credentials_exception
    
    return user


async def get_current_workspace(
    workspace_slug: str,
    request: Request,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
) -> Workspace:
    """Get current workspace and verify user access"""
    # Get workspace by slug
    statement = select(Workspace).where(Workspace.slug == workspace_slug)
    workspace = session.exec(statement).first()
    
    if not workspace:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=get_localized_message("WORKSPACE_NOT_FOUND", request)
        )
    
    # Check if user is a member of this workspace
    statement = select(WorkspaceMember).where(
        WorkspaceMember.workspace_id == workspace.id,
        WorkspaceMember.user_id == current_user.id
    )
    membership = session.exec(statement).first()
    
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=get_localized_message("WORKSPACE_ACCESS_DENIED", request)
        )
    
    return workspace


async def get_workspace_membership(
    workspace_slug: str,
    request: Request,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
) -> WorkspaceMember:
    """Get user's membership in a specific workspace"""
    # Get workspace by slug
    statement = select(Workspace).where(Workspace.slug == workspace_slug)
    workspace = session.exec(statement).first()
    
    if not workspace:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=get_localized_message("WORKSPACE_NOT_FOUND", request)
        )
    
    # Get user's membership
    statement = select(WorkspaceMember).where(
        WorkspaceMember.workspace_id == workspace.id,
        WorkspaceMember.user_id == current_user.id
    )
    membership = session.exec(statement).first()
    
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=get_localized_message("WORKSPACE_ACCESS_DENIED", request)
        )
    
    return membership 