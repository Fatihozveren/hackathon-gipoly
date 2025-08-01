from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class Audience(BaseModel):
    """Target audience model."""
    age: str = Field(..., description="Age range (e.g., '20-30')")
    interests: List[str] = Field(..., description="List of interests")


class AdCreativeRequest(BaseModel):
    """AdCreative request model."""
    lang: str = Field("en", description="Response language ('en' for English, 'tr' for Turkish)")
    product_name: str = Field(..., description="Product name")
    product_description: str = Field(..., description="Product description")
    platform: str = Field(..., description="Advertising platform (Instagram, TikTok, Meta, Google Ads)")
    goal: str = Field(..., description="Campaign goal (Sales, Traffic, Awareness)")
    audience: Audience = Field(..., description="Target audience information")


class Headlines(BaseModel):
    """Headlines model."""
    short: str = Field(..., description="Short headline (under 40 characters)")
    long: str = Field(..., description="Long headline (under 90 characters)")


class Keyword(BaseModel):
    """Keyword model with trend level."""
    keyword: str = Field(..., description="Keyword or hashtag")
    trend_level: str = Field(..., description="Trend indicator (🔥, ⭐, 📉)")
    search_volume: str = Field(..., description="Search volume (High, Medium, Low)")


class Performance(BaseModel):
    """Performance estimation model."""
    ctr_estimate: str = Field(..., description="Estimated CTR percentage")
    ad_score: int = Field(..., ge=0, le=100, description="Ad score (0-100)")
    conversion_potential: str = Field(..., description="Conversion potential rating")
    estimated_reach: str = Field(..., description="Estimated reach range")
    cost_per_click: str = Field(..., description="Estimated cost per click")
    roas_potential: str = Field(..., description="Return on ad spend potential")


class BudgetRecommendations(BaseModel):
    """Budget recommendations model."""
    daily_budget: str = Field(..., description="Recommended daily budget")
    campaign_duration: str = Field(..., description="Recommended campaign duration")
    budget_allocation: str = Field(..., description="Budget allocation strategy")


class AdCreativeResult(BaseModel):
    """AdCreative result model."""
    headlines: Headlines = Field(..., description="Generated headlines")
    ad_texts: List[str] = Field(..., description="List of 3-4 advertising text variations")
    ctas: List[str] = Field(..., description="List of 4-5 CTA suggestions")
    keywords: List[Keyword] = Field(..., description="Keywords and hashtags with trend indicators")
    performance: Performance = Field(..., description="Performance estimation")
    insights: List[str] = Field(..., description="5 actionable AI insights")
    platform_tips: List[str] = Field(..., description="Platform-specific optimization tips")
    ab_testing: List[str] = Field(..., description="A/B testing suggestions")
    budget_recommendations: BudgetRecommendations = Field(..., description="Budget recommendations")
    campaign_timeline: List[str] = Field(..., description="Campaign timeline suggestions")
    next_steps: List[str] = Field(..., description="Immediate next steps")
    image_url: str = Field(..., description="Publicly accessible URL of generated image")


class AdCreativeAnalysisCreate(BaseModel):
    """Model for creating AdCreative analyses."""
    workspace_id: int
    user_id: int
    request_data: Dict[str, Any]
    response_data: Dict[str, Any]


class AdCreativeAnalysisRead(BaseModel):
    """Model for reading AdCreative analyses."""
    id: int
    workspace_id: int
    user_id: int
    request_data: dict
    response_data: dict
    created_at: datetime 