import time
import psutil
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, text
from backend.database import get_session
from backend.utils.logging_config import get_logger

router = APIRouter(prefix="/health", tags=["health"])
logger = get_logger(__name__)

# Application startup time
STARTUP_TIME = datetime.utcnow()


@router.get("/")
def health_check():
    """Basic health check endpoint."""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "uptime": str(datetime.utcnow() - STARTUP_TIME)
    }


@router.get("/detailed")
def detailed_health_check(db_session: Session = Depends(get_session)):
    """Detailed health check with database connectivity and system metrics."""
    try:
        # Check database connectivity
        db_status = "healthy"
        db_response_time = None
        
        try:
            start_time = time.time()
            result = db_session.exec(text("SELECT 1")).first()
            db_response_time = round((time.time() - start_time) * 1000, 2)  # ms
            
            if result != 1:
                db_status = "unhealthy"
        except Exception as e:
            logger.error(f"Database health check failed: {str(e)}")
            db_status = "unhealthy"
        
        # System metrics
        cpu_percent = psutil.cpu_percent(interval=1)
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        
        # Overall status
        overall_status = "healthy" if db_status == "healthy" else "unhealthy"
        
        return {
            "status": overall_status,
            "timestamp": datetime.utcnow().isoformat(),
            "uptime": str(datetime.utcnow() - STARTUP_TIME),
            "database": {
                "status": db_status,
                "response_time_ms": db_response_time
            },
            "system": {
                "cpu_percent": cpu_percent,
                "memory_percent": memory.percent,
                "disk_percent": disk.percent
            },
            "version": "1.0.0"
        }
        
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Health check failed"
        )


@router.get("/ready")
def readiness_check(db_session: Session = Depends(get_session)):
    """Readiness check for Kubernetes/container orchestration."""
    try:
        # Check database connectivity
        result = db_session.exec(text("SELECT 1")).first()
        
        if result != 1:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Database not ready"
            )
        
        return {
            "status": "ready",
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Readiness check failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Service not ready"
        )


@router.get("/live")
def liveness_check():
    """Liveness check for Kubernetes/container orchestration."""
    return {
        "status": "alive",
        "timestamp": datetime.utcnow().isoformat()
    } 