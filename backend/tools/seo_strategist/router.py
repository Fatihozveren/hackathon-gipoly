"""
Router for SEO Strategist endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlmodel import Session, select
from typing import List
from datetime import datetime
from database import get_session
from dependencies import get_current_user, get_current_workspace
from models.user import User
from models.workspace import Workspace
from utils.localization import get_localized_message, get_language_from_request
from .schemas import (
    ManualSEORequest, URLSEORequest, SEOAnalysisResult, URLAnalysisResult,
    SEOAnalysisRead
)
from .models import SEOAnalysis
from .agent import SEOStrategist

router = APIRouter(prefix="/tools/seo-strategist", tags=["seo-strategist"])


@router.post("/manual", response_model=SEOAnalysisResult)
async def analyze_manual_seo(
    request: ManualSEORequest,
    workspace_slug: str,
    current_user: User = Depends(get_current_user),
    current_workspace: Workspace = Depends(get_current_workspace),
    db: Session = Depends(get_session),
    http_request: Request = None
):
    """
    Analyze manual SEO input and provide optimization suggestions.
    """
    try:
        # Initialize SEOStrategist
        agent = SEOStrategist()
        
        # Get user's language preference
        language = get_language_from_request(http_request) if http_request else "en"
        
        # Generate analysis
        response = await agent.analyze_manual_seo(request)
        
        # Save to database
        import json
        
        # Store as JSON strings with Turkish character preservation
        request_data = json.dumps(request.dict(), ensure_ascii=False)
        response_data = json.dumps(response.dict(), ensure_ascii=False)
        
        analysis = SEOAnalysis(
            workspace_id=current_workspace.id,
            user_id=current_user.id,
            analysis_type="manual",
            request_data=request_data,
            response_data=response_data
        )
        
        try:
            db.add(analysis)
            db.commit()
            db.refresh(analysis)
        except Exception as e:
            db.rollback()
            raise
        
        return response
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=get_localized_message("seo_analysis_error", http_request)
        )


@router.post("/url", response_model=URLAnalysisResult)
async def analyze_url_seo(
    request: URLSEORequest,
    workspace_slug: str,
    current_user: User = Depends(get_current_user),
    current_workspace: Workspace = Depends(get_current_workspace),
    db: Session = Depends(get_session),
    http_request: Request = None
):
    """
    Analyze URL and provide comprehensive SEO and AIO analysis.
    """
    try:
        # Initialize SEOStrategist
        agent = SEOStrategist()
        
        # Get user's language preference
        language = get_language_from_request(http_request) if http_request else "en"
        
        # Generate analysis
        response = await agent.analyze_url_seo(request)
        
        # Save to database
        import json
        
        # Store as JSON strings with Turkish character preservation
        request_data = json.dumps(request.dict(), ensure_ascii=False)
        response_data = json.dumps(response.dict(), ensure_ascii=False)
        
        analysis = SEOAnalysis(
            workspace_id=current_workspace.id,
            user_id=current_user.id,
            analysis_type="url",
            request_data=request_data,
            response_data=response_data
        )
        
        try:
            db.add(analysis)
            db.commit()
            db.refresh(analysis)
        except Exception as e:
            db.rollback()
            raise
        
        return response
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=get_localized_message("seo_analysis_error", http_request)
        )


@router.get("/analyses", response_model=List[SEOAnalysisRead])
async def get_workspace_analyses(
    workspace_slug: str,
    current_user: User = Depends(get_current_user),
    current_workspace: Workspace = Depends(get_current_workspace),
    db: Session = Depends(get_session)
):
    """
    Get all SEO analyses for the current workspace.
    """
    analyses = db.exec(
        select(SEOAnalysis)
        .where(SEOAnalysis.workspace_id == current_workspace.id)
        .order_by(SEOAnalysis.created_at.desc())
    ).all()
    
    # Decode Turkish characters from database
    import json
    decoded_analyses = []
    for a in analyses:
        # Decode request_data
        if isinstance(a.request_data, str):
            request_data = json.loads(a.request_data)
        else:
            request_data = a.request_data
            
        # Decode response_data
        if isinstance(a.response_data, str):
            response_data = json.loads(a.response_data)
        else:
            response_data = a.response_data
            
        decoded_analyses.append(
            SEOAnalysisRead(
                id=a.id,
                workspace_id=a.workspace_id,
                user_id=a.user_id,
                analysis_type=a.analysis_type,
                request_data=request_data,
                response_data=response_data,
                created_at=a.created_at
            )
        )
    
    return decoded_analyses


@router.get("/analyses/{analysis_id}", response_model=SEOAnalysisRead)
async def get_analysis_by_id(
    analysis_id: int,
    workspace_slug: str,
    current_user: User = Depends(get_current_user),
    current_workspace: Workspace = Depends(get_current_workspace),
    db: Session = Depends(get_session)
):
    """
    Get a specific SEO analysis by ID.
    """
    analysis = db.exec(
        select(SEOAnalysis)
        .where(
            SEOAnalysis.id == analysis_id,
            SEOAnalysis.workspace_id == current_workspace.id
        )
    ).first()
    
    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=get_localized_message("analysis_not_found")
        )
    
    # Decode Turkish characters from database
    import json
    
    # Decode request_data
    if isinstance(analysis.request_data, str):
        request_data = json.loads(analysis.request_data)
    else:
        request_data = analysis.request_data
        
    # Decode response_data
    if isinstance(analysis.response_data, str):
        response_data = json.loads(analysis.response_data)
    else:
        response_data = analysis.response_data
        
    return SEOAnalysisRead(
        id=analysis.id,
        workspace_id=analysis.workspace_id,
        user_id=analysis.user_id,
        analysis_type=analysis.analysis_type,
        request_data=request_data,
        response_data=response_data,
        created_at=analysis.created_at
    )


@router.delete("/analyses/{analysis_id}")
async def delete_analysis(
    analysis_id: int,
    workspace_slug: str,
    current_user: User = Depends(get_current_user),
    current_workspace: Workspace = Depends(get_current_workspace),
    db: Session = Depends(get_session)
):
    """
    Delete a specific SEO analysis.
    """
    analysis = db.exec(
        select(SEOAnalysis)
        .where(
            SEOAnalysis.id == analysis_id,
            SEOAnalysis.workspace_id == current_workspace.id
        )
    ).first()
    
    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=get_localized_message("analysis_not_found")
        )
    
    try:
        db.delete(analysis)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete analysis"
        )
    
    return {"message": get_localized_message("analysis_deleted")} 