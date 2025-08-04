from datetime import datetime
from sqlmodel import SQLModel, Field
from typing import Optional, TYPE_CHECKING

if TYPE_CHECKING:
    from models.workspace import Workspace
    from models.user import User


class AdCreativeAnalysis(SQLModel, table=True):
    """Database model for AdCreative analyses."""
    
    __tablename__ = "adcreative_analyses"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    workspace_id: int = Field(..., foreign_key="workspace.id")
    user_id: int = Field(..., foreign_key="user.id")
    request_data: str = Field(..., description="JSON string of request data")
    response_data: str = Field(..., description="JSON string of response data")
    created_at: datetime = Field(default_factory=datetime.utcnow) 