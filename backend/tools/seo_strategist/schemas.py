from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class ManualSEORequest(BaseModel):
    """Manual SEO analysis request model."""
    product_name: str = Field(..., description="Product name")
    product_description: str = Field(..., description="Product description")
    target_keywords: Optional[str] = Field(None, description="Target keywords (comma separated)")
    language: Optional[str] = Field("tr", description="Response language ('tr' for Turkish, 'en' for English)")


class URLSEORequest(BaseModel):
    """URL-based SEO analysis request model."""
    url: str = Field(..., description="URL to analyze")
    language: Optional[str] = Field("tr", description="Response language ('tr' for Turkish, 'en' for English)")


class SEOAnalysisResult(BaseModel):
    """SEO analysis result model."""
    title: str = Field(..., description="Optimized title")
    meta_description: str = Field(..., description="Optimized meta description")
    keywords: List[str] = Field(..., description="Recommended keywords")
    seo_description: str = Field(..., description="SEO-optimized description")
    recommendations: List[str] = Field(..., description="SEO recommendations")
    score: int = Field(..., ge=0, le=100, description="SEO score (0-100)")


class URLAnalysisResult(BaseModel):
    """URL analysis result model."""
    url: str = Field(..., description="Analyzed URL")
    content_info: Dict[str, Any] = Field(..., description="Content information")
    product_analysis: Dict[str, Any] = Field(..., description="Product analysis")
    seo_optimization: Dict[str, Any] = Field(..., description="SEO optimization")
    user_experience: Dict[str, Any] = Field(..., description="User experience analysis")
    technical_seo: Dict[str, Any] = Field(..., description="Technical SEO analysis")
    competitive_analysis: Dict[str, Any] = Field(..., description="Competitive analysis")
    impact_analysis: Dict[str, Any] = Field(..., description="Impact analysis")
    segment_scores: Dict[str, Any] = Field(..., description="Segment scores")
    action_items: Dict[str, Any] = Field(..., description="Action items")
    seo_score: int = Field(..., ge=0, le=100, description="Overall SEO score")


class SEOAnalysisCreate(BaseModel):
    """Model for creating SEO analyses."""
    workspace_id: int
    user_id: int
    analysis_type: str
    request_data: Dict[str, Any]
    response_data: Dict[str, Any]


class SEOAnalysisRead(BaseModel):
    """Model for reading SEO analyses."""
    id: int
    workspace_id: int
    user_id: int
    analysis_type: str
    request_data: dict
    response_data: dict
    created_at: datetime 