from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class TrendRequest(BaseModel):
    """Request model for trend analysis."""
    category: Optional[str] = Field(None, description="Product category (e.g., 'Electronics', 'Fashion', 'Home & Garden')")
    target_country: str = Field(..., description="Target country for market analysis")
    budget_range: Optional[str] = Field(None, description="Budget range (e.g., 'Low', 'Medium', 'High')")
    target_audience: Optional[str] = Field(None, description="Target audience (e.g., 'Young Adults', 'Parents', 'Professionals')")
    additional_notes: Optional[str] = Field(None, description="Additional requirements or preferences")
    include_trends: bool = Field(default=True, description="Include Google Trends analysis")
    product_count: int = Field(default=3, ge=1, le=5, description="Number of product suggestions (1-5)")
    language: Optional[str] = Field("tr", description="Response language ('tr' for Turkish, 'en' for English)")


class ProductSuggestion(BaseModel):
    """Individual product suggestion model."""
    product_idea: str = Field(..., description="Suggested product idea")
    description: str = Field(..., description="Detailed product description")
    recommended_price_range: str = Field(..., description="Recommended price range")
    target_audience: str = Field(..., description="Identified target audience")
    competition_score: int = Field(..., ge=1, le=10, description="Competition level score (1-10)")
    trend_score: int = Field(..., ge=1, le=10, description="Trend potential score (1-10)")
    profit_margin_estimate: str = Field(..., description="Estimated profit margin percentage")
    market_opportunity: str = Field(..., description="Market opportunity analysis")
    risks_and_challenges: str = Field(..., description="Potential risks and challenges")
    marketing_suggestions: str = Field(..., description="Marketing and promotion suggestions")
    ecommerce_platforms: List[str] = Field(default_factory=list, description="Recommended e-commerce platforms")
    estimated_demand: str = Field(..., description="Estimated market demand")


class GoogleTrendsData(BaseModel):
    """Google Trends data model."""
    keyword: str = Field(..., description="Search keyword")
    trend_score: int = Field(..., ge=0, le=100, description="Trend score (0-100)")
    interest_over_time: List[Dict[str, Any]] = Field(default_factory=list, description="Interest over time data")
    related_queries: List[Dict[str, Any]] = Field(default_factory=list, description="Related search queries")
    related_topics: List[Dict[str, Any]] = Field(default_factory=list, description="Related topics")
    chart_data: Optional[str] = Field(None, description="Base64 encoded chart image")


class TrendAnalysis(BaseModel):
    """Comprehensive trend analysis model."""
    category_analysis: str = Field(..., description="Overall category trend analysis")
    market_trends: str = Field(..., description="Current market trends")
    seasonal_factors: str = Field(..., description="Seasonal considerations")
    competitive_landscape: str = Field(..., description="Competitive landscape analysis")
    ai_recommendations: str = Field(..., description="AI-powered strategic recommendations")


class TrendResponse(BaseModel):
    """Enhanced response model for trend analysis results."""
    products: List[ProductSuggestion] = Field(..., description="Multiple product suggestions")
    trends_data: Optional[GoogleTrendsData] = Field(None, description="Google Trends analysis")
    trend_analysis: TrendAnalysis = Field(..., description="Comprehensive trend analysis")
    summary: str = Field(..., description="Executive summary")
    next_steps: List[str] = Field(default_factory=list, description="Recommended next steps")
    created_at: datetime = Field(default_factory=datetime.utcnow)


class TrendSuggestionCreate(BaseModel):
    """Model for creating trend suggestions."""
    workspace_id: int
    user_id: int
    request_data: TrendRequest
    response_data: TrendResponse


class TrendSuggestionRead(BaseModel):
    """Model for reading trend suggestions."""
    id: int
    workspace_id: int
    user_id: int
    request_data: dict
    response_data: dict
    created_at: datetime


class AIAgentRequest(BaseModel):
    """AI Agent conversation request model."""
    message: str = Field(..., description="User message to AI agent")
    context: Optional[Dict[str, Any]] = Field(None, description="Conversation context")
    workspace_slug: str = Field(..., description="Workspace identifier")


class AIAgentResponse(BaseModel):
    """AI Agent conversation response model."""
    response: str = Field(..., description="AI agent response")
    suggestions: List[str] = Field(default_factory=list, description="Suggested follow-up questions")
    actions: List[Dict[str, Any]] = Field(default_factory=list, description="Suggested actions")
    context: Dict[str, Any] = Field(default_factory=dict, description="Updated conversation context")
    created_at: datetime = Field(default_factory=datetime.utcnow) 