"""
Enhanced router for TrendAgent endpoints with Google Trends integration and AI agent chat.
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
    TrendRequest, TrendResponse, TrendSuggestionRead, 
    AIAgentRequest, AIAgentResponse
)
from .models import TrendSuggestion
from .agent import TrendAgent

router = APIRouter(prefix="/tools/trend-agent", tags=["trend-agent"])


@router.post("/suggest", response_model=TrendResponse)
async def generate_trend_suggestion(
    request: TrendRequest,
    workspace_slug: str,
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
        print(f"User language preference: {language}")
        
        # Generate suggestion
        response = await agent.generate_suggestion(request)
        
        # Save to database
        print(f"Saving to database - workspace_id: {current_workspace.id}, user_id: {current_user.id}")
        print(f"Request data: {request.dict()}")
        
        # Convert response to dict and handle datetime serialization
        response_dict = response.dict()
        if 'created_at' in response_dict and isinstance(response_dict['created_at'], datetime):
            response_dict['created_at'] = response_dict['created_at'].isoformat()
        
        print(f"Response data: {response_dict}")
        
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
        
        print(f"Created suggestion object: {suggestion}")
        
        try:
            db.add(suggestion)
            print("Added to session")
            db.commit()
            print("Committed to database")
            db.refresh(suggestion)
            print("Refreshed suggestion")
        except Exception as e:
            print(f"Database error: {type(e).__name__}: {e}")
            db.rollback()
            raise
        
        return response
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        print(f"Router error: {type(e).__name__}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=get_localized_message("trend_analysis_error", http_request)
        )


@router.post("/chat", response_model=AIAgentResponse)
async def chat_with_agent(
    request: AIAgentRequest,
    current_user: User = Depends(get_current_user),
    current_workspace: Workspace = Depends(get_current_workspace),
    http_request: Request = None
):
    """
    Chat with the AI agent for trend analysis assistance.
    """
    try:
        # Initialize TrendAgent
        agent = TrendAgent()
        
        # Get user's language preference
        language = get_language_from_request(http_request) if http_request else "en"
        
        # Chat with agent
        response = await agent.chat_with_agent(request, language)
        
        return response
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="AI agent chat error"
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


@router.get("/trends/{keyword}")
async def get_trends_data(
    keyword: str,
    country: str = "TR",
    current_user: User = Depends(get_current_user),
    current_workspace: Workspace = Depends(get_current_workspace),
    db: Session = Depends(get_session)
):
    """
    Get Google Trends data for a specific keyword from database or fetch fresh data.
    """
    try:
        from services.trends_service import TrendsService
        
        trends_service = TrendsService()
        
        # First try to get from database
        db_trends = trends_service.get_trends_data(db, keyword, country)
        
        if db_trends:
            # Return data from database
            return {
                "keyword": db_trends.keyword,
                "trend_score": db_trends.trend_score,
                "interest_over_time": db_trends.interest_over_time,
                "related_queries": db_trends.related_queries,
                "related_topics": db_trends.related_topics,
                "chart_data": db_trends.chart_data,
                "source": "database",
                "updated_at": db_trends.updated_at.isoformat()
            }
        else:
            # Fetch fresh data if not in database
            from .trends_analyzer import TrendsAnalyzer
            analyzer = TrendsAnalyzer()
            trends_data = analyzer.get_trends_data(keyword, country)
            
            return {
                "keyword": trends_data.keyword,
                "trend_score": trends_data.trend_score,
                "interest_over_time": trends_data.interest_over_time,
                "related_queries": trends_data.related_queries,
                "related_topics": trends_data.related_topics,
                "chart_data": trends_data.chart_data,
                "source": "fresh",
                "updated_at": datetime.utcnow().isoformat()
            }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching trends data: {str(e)}"
        )


@router.get("/categories/{category}/trends")
async def get_category_trends(
    category: str,
    country: str = "TR",
    current_user: User = Depends(get_current_user),
    current_workspace: Workspace = Depends(get_current_workspace),
    db: Session = Depends(get_session)
):
    """
    Get Google Trends data for a product category from database.
    """
    try:
        from services.trends_service import TrendsService
        
        trends_service = TrendsService()
        category_trends = trends_service.get_category_trends(db, category, country)
        
        if category_trends:
            return {
                "category": category_trends.category,
                "average_trend_score": category_trends.average_trend_score,
                "top_keywords": category_trends.top_keywords,
                "updated_at": category_trends.updated_at.isoformat(),
                "source": "database"
            }
        else:
            # Fallback to fresh data
            from .trends_analyzer import TrendsAnalyzer
            analyzer = TrendsAnalyzer()
            fresh_trends = analyzer.analyze_category_trends(category, country)
            
            return {
                **fresh_trends,
                "source": "fresh",
                "updated_at": datetime.utcnow().isoformat()
            }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching category trends: {str(e)}"
        )


@router.get("/dashboard/trends")
async def get_dashboard_trends(
    country: str = "TR",
    current_user: User = Depends(get_current_user),
    current_workspace: Workspace = Depends(get_current_workspace),
    db: Session = Depends(get_session)
):
    """
    Get dashboard trends data for workspace.
    """
    try:
        from services.trends_service import TrendsService
        
        trends_service = TrendsService()
        
        # Get all category trends
        category_trends = trends_service.get_all_category_trends(db, country)
        
        # Get top trending keywords
        top_keywords = trends_service.get_top_trending_keywords(db, country, limit=10)
        
        return {
            "category_trends": [
                {
                    "category": ct.category,
                    "average_trend_score": ct.average_trend_score,
                    "top_keywords": ct.top_keywords,
                    "updated_at": ct.updated_at.isoformat()
                }
                for ct in category_trends
            ],
            "top_trending_keywords": [
                {
                    "keyword": tk.keyword,
                    "trend_score": tk.trend_score,
                    "updated_at": tk.updated_at.isoformat()
                }
                for tk in top_keywords
            ],
            "summary": {
                "total_categories": len(category_trends),
                "total_keywords": len(top_keywords),
                "last_updated": max([ct.updated_at for ct in category_trends]).isoformat() if category_trends else None
            }
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching dashboard trends: {str(e)}"
        )


@router.post("/admin/collect-trends")
async def collect_trends_data(
    country: str = "TR",
    current_user: User = Depends(get_current_user),
    current_workspace: Workspace = Depends(get_current_workspace),
    db: Session = Depends(get_session)
):
    """
    Manually trigger trends data collection (admin only).
    """
    try:
        from services.trends_service import TrendsService
        
        trends_service = TrendsService()
        
        # Collect daily trends
        collection_results = await trends_service.collect_daily_trends(db, country)
        
        # Update category trends
        category_results = await trends_service.update_category_trends(db, country)
        
        # Update word cloud analysis
        wordcloud_results = await trends_service.update_wordcloud_analysis(db, country)
        
        return {
            "message": "Trends data collection completed",
            "collection_results": collection_results,
            "category_results": category_results,
            "wordcloud_results": wordcloud_results,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error collecting trends data: {str(e)}"
        )


@router.get("/wordcloud/{category}")
async def get_wordcloud_data(
    category: str,
    country: str = "TR",
    current_user: User = Depends(get_current_user),
    current_workspace: Workspace = Depends(get_current_workspace),
    db: Session = Depends(get_session)
):
    """
    Get word cloud data for a specific category.
    """
    try:
        from services.text_analysis_service import TextAnalysisService
        
        text_analysis = TextAnalysisService()
        wordcloud_data = text_analysis.get_wordcloud_data(db, category, country)
        
        if wordcloud_data:
            return {
                "category": wordcloud_data.category,
                "word_frequencies": wordcloud_data.word_frequencies,
                "ngram_data": wordcloud_data.ngram_data,
                "wordcloud_image": wordcloud_data.wordcloud_image,
                "total_words": wordcloud_data.total_words,
                "unique_words": wordcloud_data.unique_words,
                "updated_at": wordcloud_data.updated_at.isoformat()
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No word cloud data found for category: {category}"
            )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching word cloud data: {str(e)}"
        )


@router.get("/ngrams/{category}")
async def get_ngram_analysis(
    category: str,
    n_gram_size: int = 2,
    country: str = "TR",
    current_user: User = Depends(get_current_user),
    current_workspace: Workspace = Depends(get_current_workspace),
    db: Session = Depends(get_session)
):
    """
    Get n-gram analysis for a specific category.
    """
    try:
        from services.text_analysis_service import TextAnalysisService
        
        text_analysis = TextAnalysisService()
        ngram_data = text_analysis.get_ngram_analysis(db, category, n_gram_size, country)
        
        if ngram_data:
            return {
                "category": ngram_data.category,
                "n_gram_size": ngram_data.n_gram_size,
                "ngram_frequencies": ngram_data.ngram_frequencies,
                "top_ngrams": ngram_data.top_ngrams,
                "total_ngrams": ngram_data.total_ngrams,
                "updated_at": ngram_data.updated_at.isoformat()
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No n-gram data found for category: {category}"
            )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching n-gram data: {str(e)}"
        )


@router.get("/dashboard/wordclouds")
async def get_all_wordclouds(
    country: str = "TR",
    current_user: User = Depends(get_current_user),
    current_workspace: Workspace = Depends(get_current_workspace),
    db: Session = Depends(get_session)
):
    """
    Get all word cloud data for dashboard.
    """
    try:
        from services.text_analysis_service import TextAnalysisService
        
        text_analysis = TextAnalysisService()
        all_wordclouds = text_analysis.get_all_wordcloud_data(db, country)
        
        return {
            "wordclouds": [
                {
                    "category": wc.category,
                    "total_words": wc.total_words,
                    "unique_words": wc.unique_words,
                    "wordcloud_image": wc.wordcloud_image,
                    "updated_at": wc.updated_at.isoformat()
                }
                for wc in all_wordclouds
            ],
            "summary": {
                "total_categories": len(all_wordclouds),
                "last_updated": max([wc.updated_at for wc in all_wordclouds]).isoformat() if all_wordclouds else None
            }
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching word cloud data: {str(e)}"
        ) 