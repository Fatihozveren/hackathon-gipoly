"""
Enhanced router for TrendAgent endpoints with Google Trends integration and AI agent chat.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlmodel import Session, select
from typing import List
from datetime import datetime
import json
from database import get_session
from dependencies import get_current_user, get_current_workspace
from models.user import User
from models.workspace import Workspace
from utils.localization import get_localized_message, get_language_from_request
from .schemas import (
    TrendRequest, TrendResponse, TrendSuggestionRead
)
from .models import TrendSuggestion, TrendCategory
from .agent import TrendAgent

router = APIRouter(prefix="/tools/trend-agent", tags=["trend-agent"])


@router.post("/suggest", response_model=TrendResponse)
async def generate_trend_suggestion(
    request: TrendRequest,
    current_user: User = Depends(get_current_user),
    current_workspace: Workspace = Depends(get_current_workspace),
    db: Session = Depends(get_session),
    http_request: Request = None
):
    """
    Generate comprehensive product trend suggestions using AI and Google Trends.
    
    Each workspace is limited to 3 suggestions.
    """
    try:
        # Check if workspace has reached the limit (3 suggestions)
        existing_suggestions = db.exec(
            select(TrendSuggestion).where(TrendSuggestion.workspace_id == current_workspace.id)
        ).all()
        
        if len(existing_suggestions) >= 3:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=get_localized_message("trend_suggestion_limit_reached", http_request)
            )
        
        # Initialize TrendAgent
        agent = TrendAgent()
        
        # Get user's language preference
        language = get_language_from_request(http_request) if http_request else "en"
        
        # Generate suggestion
        response = await agent.generate_suggestion(request)
        
        # Save to database
        # Convert response to dict and handle datetime serialization
        response_dict = response.dict()
        if 'created_at' in response_dict and isinstance(response_dict['created_at'], datetime):
            response_dict['created_at'] = response_dict['created_at'].isoformat()
        
        # Direct JSON string storage with Turkish character preservation
        import json
        
        # Store as JSON strings with Turkish characters preserved
        request_data = json.dumps(request.dict(), ensure_ascii=False)
        response_data = json.dumps(response_dict, ensure_ascii=False)
        
        suggestion = TrendSuggestion(
            workspace_id=current_workspace.id,
            user_id=current_user.id,
            request_data=request_data,
            response_data=response_data
        )
        
        try:
            db.add(suggestion)
            db.commit()
            db.refresh(suggestion)
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
            detail=get_localized_message("trend_analysis_error", http_request)
        )





@router.get("/suggestions", response_model=List[TrendSuggestionRead])
async def get_workspace_suggestions(
    current_user: User = Depends(get_current_user),
    current_workspace: Workspace = Depends(get_current_workspace),
    db: Session = Depends(get_session)
):
    """
    Get all trend suggestions for the current workspace.
    """
    suggestions = db.exec(
        select(TrendSuggestion)
        .where(TrendSuggestion.workspace_id == current_workspace.id)
        .order_by(TrendSuggestion.created_at.desc())
    ).all()
    
    # Decode Turkish characters from database
    import json
    decoded_suggestions = []
    for s in suggestions:
        # Decode request_data
        if isinstance(s.request_data, str):
            request_data = json.loads(s.request_data)
        else:
            request_data = s.request_data
            
        # Decode response_data
        if isinstance(s.response_data, str):
            response_data = json.loads(s.response_data)
        else:
            response_data = s.response_data
            
        decoded_suggestions.append(
            TrendSuggestionRead(
                id=s.id,
                workspace_id=s.workspace_id,
                user_id=s.user_id,
                request_data=request_data,
                response_data=response_data,
                created_at=s.created_at
            )
        )
    
    return decoded_suggestions


@router.get("/suggestions/{suggestion_id}", response_model=TrendSuggestionRead)
async def get_suggestion_by_id(
    suggestion_id: int,
    current_user: User = Depends(get_current_user),
    current_workspace: Workspace = Depends(get_current_workspace),
    db: Session = Depends(get_session)
):
    """
    Get a specific trend suggestion by ID.
    """
    suggestion = db.exec(
        select(TrendSuggestion)
        .where(
            TrendSuggestion.id == suggestion_id,
            TrendSuggestion.workspace_id == current_workspace.id
        )
    ).first()
    
    if not suggestion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=get_localized_message("suggestion_not_found")
        )
    
    # Decode Turkish characters from database
    import json
    
    # Decode request_data
    if isinstance(suggestion.request_data, str):
        request_data = json.loads(suggestion.request_data)
    else:
        request_data = suggestion.request_data
        
    # Decode response_data
    if isinstance(suggestion.response_data, str):
        response_data = json.loads(suggestion.response_data)
    else:
        response_data = suggestion.response_data
    
    return TrendSuggestionRead(
        id=suggestion.id,
        workspace_id=suggestion.workspace_id,
        user_id=suggestion.user_id,
        request_data=request_data,
        response_data=response_data,
        created_at=suggestion.created_at
    )


@router.delete("/suggestions/{suggestion_id}")
async def delete_suggestion(
    suggestion_id: int,
    current_user: User = Depends(get_current_user),
    current_workspace: Workspace = Depends(get_current_workspace),
    db: Session = Depends(get_session)
):
    """
    Delete a trend suggestion.
    """
    suggestion = db.exec(
        select(TrendSuggestion)
        .where(
            TrendSuggestion.id == suggestion_id,
            TrendSuggestion.workspace_id == current_workspace.id
        )
    ).first()
    
    if not suggestion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=get_localized_message("suggestion_not_found")
        )
    
    db.delete(suggestion)
    db.commit()
    
    return {"message": get_localized_message("suggestion_deleted")}


@router.get("/categories")
async def get_trend_categories(
    session: Session = Depends(get_session)
):
    """Get trend categories with their trend data."""
    try:
        categories = session.exec(select(TrendCategory)).all()
        
        result = []
        for category in categories:
            trend_data = json.loads(category.trend_data)
            result.append({
                "id": category.id,
                "name": category.category_name,
                "trend_data": trend_data,
                "last_updated": category.last_updated
            })
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))








 