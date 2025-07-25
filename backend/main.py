# backend/main.py

import os
from fastapi import FastAPI, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from database import init_db
from routers.auth import router as auth_router
from routers.workspaces import router as workspaces_router
from routers.health import router as health_router
from dependencies import get_current_user
from models.user import User
from schemas.user import UserRead
from utils.logging_config import setup_logging, get_logger
from utils.rate_limiting import setup_rate_limiting
from utils.exception_handlers import setup_exception_handlers

# Setup logging
setup_logging()
logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager."""
    # Startup
    logger.info("Starting Gipoly Backend API...")
    init_db()
    logger.info("Database initialized successfully")
    yield
    # Shutdown
    logger.info("Shutting down Gipoly Backend API...")


app = FastAPI(
    title="Gipoly API", 
    version="1.0.0",
    description="Production-ready API with authentication and workspace management",
    lifespan=lifespan
)

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Setup rate limiting (only in production)
if os.getenv("ENVIRONMENT") != "test":
    setup_rate_limiting(app)
    logger.info("Rate limiting enabled")
else:
    logger.info("Rate limiting disabled for test environment")

# Setup exception handlers
setup_exception_handlers(app)

# Include routers
app.include_router(auth_router)
app.include_router(workspaces_router)
app.include_router(health_router)


@app.get("/")
def read_root():
    """Root endpoint."""
    return {
        "message": "Gipoly backend API is live!",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health"
    }


@app.get("/me", response_model=UserRead)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information (protected endpoint)."""
    logger.info(f"User info requested for: {current_user.email}")
    return current_user


@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log all requests."""
    import time
    start_time = time.time()
    
    response = await call_next(request)
    
    process_time = time.time() - start_time
    logger.info(
        f"{request.method} {request.url.path} - "
        f"Status: {response.status_code} - "
        f"Time: {process_time:.3f}s"
    )
    
    return response


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )