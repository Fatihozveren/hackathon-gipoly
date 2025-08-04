from datetime import datetime
from typing import Optional, List, TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship

if TYPE_CHECKING:
    from tools.trend_agent.models import TrendSuggestion


class User(SQLModel, table=True, extend_existing=True):
    __tablename__ = "user"
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)
    password: str
    full_name: Optional[str] = None
    website_url: Optional[str] = None
    store_platform: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    owned_workspaces: List["Workspace"] = Relationship(back_populates="owner")
    workspace_memberships: List["WorkspaceMember"] = Relationship(back_populates="user")
    trend_suggestions: List["TrendSuggestion"] = Relationship(back_populates="user")
    

