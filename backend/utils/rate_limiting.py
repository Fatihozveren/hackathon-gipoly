import time
from typing import Dict, Optional
from fastapi import HTTPException, status, Request
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from utils.logging_config import get_logger

logger = get_logger(__name__)

# Initialize rate limiter
limiter = Limiter(key_func=get_remote_address)

# In-memory storage for failed login attempts (in production, use Redis)
failed_login_attempts: Dict[str, Dict] = {}

# Configuration
MAX_LOGIN_ATTEMPTS = 5
LOGIN_BLOCK_DURATION = 300  # 5 minutes


def check_login_attempts(email: str) -> bool:
    """Check if user is blocked due to too many failed login attempts"""
    if email in failed_login_attempts:
        attempts = failed_login_attempts[email]
        
        # Check if still blocked
        if attempts['count'] >= MAX_LOGIN_ATTEMPTS:
            time_since_first = time.time() - attempts['first_attempt']
            if time_since_first < LOGIN_BLOCK_DURATION:
                remaining_time = int(LOGIN_BLOCK_DURATION - time_since_first)
                logger.warning(f"Login blocked for {email}. Remaining time: {remaining_time}s")
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail=f"Too many failed login attempts. Try again in {remaining_time} seconds."
                )
            else:
                # Reset after block duration
                failed_login_attempts.pop(email, None)
                logger.info(f"Login block expired for {email}")
    
    return True


def record_failed_login(email: str):
    """Record a failed login attempt"""
    current_time = time.time()
    
    if email not in failed_login_attempts:
        failed_login_attempts[email] = {
            'count': 1,
            'first_attempt': current_time,
            'last_attempt': current_time
        }
    else:
        attempts = failed_login_attempts[email]
        attempts['count'] += 1
        attempts['last_attempt'] = current_time
    
    logger.warning(f"Failed login attempt for {email}. Total attempts: {failed_login_attempts[email]['count']}")


def record_successful_login(email: str):
    """Record a successful login and reset failed attempts"""
    if email in failed_login_attempts:
        failed_login_attempts.pop(email)
        logger.info(f"Successful login for {email}. Failed attempts reset.")





def setup_rate_limiting(app):
    """Setup rate limiting for the application"""
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
    
 