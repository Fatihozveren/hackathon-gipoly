"""
Router for AdCreative endpoints.
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
    AdCreativeRequest, AdCreativeResult, AdCreativeAnalysisRead
)
from .models import AdCreativeAnalysis
from .agent import AdCreativeAgent

router = APIRouter(prefix="/tools/adcreative", tags=["adcreative"])


@router.post("/", response_model=AdCreativeResult)
async def generate_ad_campaign(
    request: AdCreativeRequest,
    workspace_slug: str,
    current_user: User = Depends(get_current_user),
    current_workspace: Workspace = Depends(get_current_workspace),
    db: Session = Depends(get_session),
    http_request: Request = None
):
    """
    Generate a complete advertising campaign including text and image.
    """
    try:
        # Initialize AdCreativeAgent
        agent = AdCreativeAgent()
        
        # Check workspace limit (max 3 analyses per workspace)
        existing_analyses = db.exec(
            select(AdCreativeAnalysis)
            .where(AdCreativeAnalysis.workspace_id == current_workspace.id)
        ).all()
        
        if len(existing_analyses) >= 3:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=get_localized_message("workspace_limit_reached", http_request) or "Workspace limit reached. Maximum 3 campaigns allowed per workspace."
            )
        
        # Get user's language preference
        language = get_language_from_request(http_request) if http_request else "en"
        
        # Generate campaign
        response = await agent.generate_ad_campaign(request)
        
        # Save to database
        import json
        
        # Store as JSON strings with character preservation
        request_data = json.dumps(request.dict(), ensure_ascii=False)
        response_data = json.dumps(response.dict(), ensure_ascii=False)
        
        analysis = AdCreativeAnalysis(
            workspace_id=current_workspace.id,
            user_id=current_user.id,
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
            detail=get_localized_message("adcreative_generation_error", http_request)
        )


@router.get("/analyses", response_model=List[AdCreativeAnalysisRead])
async def get_workspace_analyses(
    workspace_slug: str,
    current_user: User = Depends(get_current_user),
    current_workspace: Workspace = Depends(get_current_workspace),
    db: Session = Depends(get_session)
):
    """
    Get all AdCreative analyses for the current workspace.
    """
    analyses = db.exec(
        select(AdCreativeAnalysis)
        .where(AdCreativeAnalysis.workspace_id == current_workspace.id)
        .order_by(AdCreativeAnalysis.created_at.desc())
    ).all()
    
    # Decode characters from database
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
            AdCreativeAnalysisRead(
                id=a.id,
                workspace_id=a.workspace_id,
                user_id=a.user_id,
                request_data=request_data,
                response_data=response_data,
                created_at=a.created_at
            )
        )
    
    return decoded_analyses


@router.get("/analyses/{analysis_id}", response_model=AdCreativeAnalysisRead)
async def get_analysis_by_id(
    analysis_id: int,
    workspace_slug: str,
    current_user: User = Depends(get_current_user),
    current_workspace: Workspace = Depends(get_current_workspace),
    db: Session = Depends(get_session)
):
    """
    Get a specific AdCreative analysis by ID.
    """
    analysis = db.exec(
        select(AdCreativeAnalysis)
        .where(
            AdCreativeAnalysis.id == analysis_id,
            AdCreativeAnalysis.workspace_id == current_workspace.id
        )
    ).first()
    
    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=get_localized_message("analysis_not_found")
        )
    
    # Decode characters from database
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
        
    return AdCreativeAnalysisRead(
        id=analysis.id,
        workspace_id=analysis.workspace_id,
        user_id=analysis.user_id,
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
    Delete a specific AdCreative analysis.
    """
    analysis = db.exec(
        select(AdCreativeAnalysis)
        .where(
            AdCreativeAnalysis.id == analysis_id,
            AdCreativeAnalysis.workspace_id == current_workspace.id
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