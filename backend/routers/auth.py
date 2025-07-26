from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlmodel import Session, select
from database import get_session
from models.user import User
from schemas.user import UserCreate, UserLogin, UserRead, UserUpdate, PasswordChange, Token
from utils.security import get_password_hash, verify_password, create_access_token
from utils.localization import get_localized_message
from utils.rate_limiting import check_login_attempts, record_failed_login, record_successful_login
from utils.logging_config import get_logger
from slowapi import Limiter
from slowapi.util import get_remote_address
from dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["authentication"])
logger = get_logger(__name__)

# Rate limiter instance
limiter = Limiter(key_func=get_remote_address)


@router.post("/register", response_model=UserRead)
@limiter.limit("5/minute")
def register(
    request: Request,
    user_data: UserCreate, 
    session: Session = Depends(get_session)
):
    """Register a new user."""
    logger.info(f"Registration attempt for email: {user_data.email}")
    
    # Check if user already exists
    statement = select(User).where(User.email == user_data.email)
    existing_user = session.exec(statement).first()
    
    if existing_user:
        logger.warning(f"Registration failed - email already exists: {user_data.email}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=get_localized_message("EMAIL_ALREADY_REGISTERED", request)
        )
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    user = User(
        email=user_data.email,
        password=hashed_password,
        full_name=user_data.full_name,
        website_url=user_data.website_url,
        store_platform=user_data.store_platform
    )
    
    session.add(user)
    session.commit()
    session.refresh(user)
    
    logger.info(f"User registered successfully: {user.email}")
    return user


@router.post("/login", response_model=Token)
@limiter.limit("5/minute")
def login(
    request: Request,
    user_credentials: UserLogin, 
    session: Session = Depends(get_session)
):
    """Login user and return JWT token."""
    logger.info(f"Login attempt for email: {user_credentials.email}")
    
    # Check for brute force attempts
    check_login_attempts(user_credentials.email)
    
    # Find user by email
    statement = select(User).where(User.email == user_credentials.email)
    user = session.exec(statement).first()
    
    if not user:
        record_failed_login(user_credentials.email)
        logger.warning(f"Login failed - user not found: {user_credentials.email}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=get_localized_message("INVALID_CREDENTIALS", request),
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Verify password
    if not verify_password(user_credentials.password, user.password):
        record_failed_login(user_credentials.email)
        logger.warning(f"Login failed - invalid password for: {user_credentials.email}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=get_localized_message("INVALID_CREDENTIALS", request),
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=30)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    # Record successful login
    record_successful_login(user_credentials.email)
    logger.info(f"User logged in successfully: {user.email}")
    
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=UserRead)
def get_current_user_info(
    request: Request,
    current_user: User = Depends(get_current_user)
):
    """Get current user information."""
    logger.info(f"User info requested for: {current_user.email}")
    return current_user


@router.put("/profile", response_model=UserRead)
def update_profile(
    request: Request,
    user_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Update user profile."""
    logger.info(f"Profile update requested for: {current_user.email}")
    
    # Update user fields
    if user_data.full_name is not None:
        current_user.full_name = user_data.full_name
    if user_data.website_url is not None:
        current_user.website_url = user_data.website_url
    if user_data.store_platform is not None:
        current_user.store_platform = user_data.store_platform
    
    session.add(current_user)
    session.commit()
    session.refresh(current_user)
    
    logger.info(f"Profile updated successfully for: {current_user.email}")
    return current_user


@router.put("/change-password")
def change_password(
    request: Request,
    password_data: PasswordChange,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Change user password."""
    logger.info(f"Password change requested for: {current_user.email}")
    
    # Verify current password
    if not verify_password(password_data.current_password, current_user.password):
        logger.warning(f"Password change failed - incorrect current password for: {current_user.email}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=get_localized_message("CURRENT_PASSWORD_INCORRECT", request)
        )
    
    # Update password
    current_user.password = get_password_hash(password_data.new_password)
    session.add(current_user)
    session.commit()
    
    logger.info(f"Password changed successfully for: {current_user.email}")
    return {"message": get_localized_message("PASSWORD_CHANGED", request)}


@router.delete("/profile")
def delete_account(
    request: Request,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Delete user account."""
    logger.info(f"Account deletion requested for: {current_user.email}")
    
    # Delete user
    session.delete(current_user)
    session.commit()
    
    logger.info(f"Account deleted successfully for: {current_user.email}")
    return {"message": get_localized_message("ACCOUNT_DELETED", request)} 