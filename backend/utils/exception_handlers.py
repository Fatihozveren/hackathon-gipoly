from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import IntegrityError
from .logging_config import get_logger
from .localization import get_localized_message

logger = get_logger(__name__)


async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle validation errors (422)."""
    logger.warning(f"Validation error: {exc.errors()}")
    
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "detail": get_localized_message("VALIDATION_ERROR", request),
            "errors": exc.errors()
        }
    )


async def integrity_error_handler(request: Request, exc: IntegrityError):
    """Handle database integrity errors."""
    logger.error(f"Database integrity error: {str(exc)}")
    
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={
            "detail": get_localized_message("VALIDATION_ERROR", request),
            "message": "Database constraint violation"
        }
    )


async def not_found_exception_handler(request: Request, exc: Exception):
    """Handle 404 errors."""
    logger.warning(f"Not found: {request.url}")
    
    return JSONResponse(
        status_code=status.HTTP_404_NOT_FOUND,
        content={
            "detail": get_localized_message("NOT_FOUND", request),
            "path": str(request.url)
        }
    )


async def internal_server_error_handler(request: Request, exc: Exception):
    """Handle 500 errors."""
    logger.error(f"Internal server error: {str(exc)}", exc_info=True)
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": get_localized_message("INTERNAL_SERVER_ERROR", request)
        }
    )


async def rate_limit_exceeded_handler(request: Request, exc: Exception):
    """Handle rate limiting errors."""
    logger.warning(f"Rate limit exceeded for {request.client.host}")
    
    return JSONResponse(
        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
        content={
            "detail": "Rate limit exceeded. Please try again later.",
            "retry_after": 60
        }
    )


def setup_exception_handlers(app):
    """Setup all exception handlers for the application."""
    from fastapi.exceptions import RequestValidationError
    from sqlalchemy.exc import IntegrityError
    from slowapi.errors import RateLimitExceeded
    
    app.add_exception_handler(RequestValidationError, validation_exception_handler)
    app.add_exception_handler(IntegrityError, integrity_error_handler)
    app.add_exception_handler(RateLimitExceeded, rate_limit_exceeded_handler)
    
    # Add middleware for catching unhandled exceptions
    @app.middleware("http")
    async def catch_exceptions_middleware(request: Request, call_next):
        try:
            response = await call_next(request)
            return response
        except Exception as exc:
            logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
            return await internal_server_error_handler(request, exc) 