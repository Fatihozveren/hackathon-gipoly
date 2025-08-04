from sqlmodel import SQLModel, Field
from datetime import datetime
from typing import Optional, TYPE_CHECKING

if TYPE_CHECKING:
    from models.workspace import Workspace
    from models.user import User


class SEOAnalysis(SQLModel, table=True):
    """SEO analysis results model."""
    __tablename__ = "seo_analyses"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    workspace_id: int = Field(foreign_key="workspace.id")
    user_id: int = Field(foreign_key="user.id")
    analysis_type: str = Field(description="Type of analysis: 'manual' or 'url'")
    request_data: str = Field(description="JSON string of request data")
    response_data: str = Field(description="JSON string of analysis results")
    created_at: datetime = Field(default_factory=datetime.utcnow) 