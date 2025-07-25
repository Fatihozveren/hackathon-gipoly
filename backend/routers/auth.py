from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlmodel import Session, select
from backend.database import get_session
from backend.models.user import User
from backend.schemas.user import UserCreate, UserLogin, UserRead, Token
from backend.utils.security import get_password_hash, verify_password, create_access_token
from backend.utils.localization import get_localized_message
from backend.utils.rate_limiting import check_login_attempts, record_failed_login, record_successful_login
from backend.utils.logging_config import get_logger
from slowapi import Limiter
from slowapi.util import get_remote_address

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