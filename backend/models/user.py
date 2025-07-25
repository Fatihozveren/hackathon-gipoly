from datetime import datetime
from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship


class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)
    password: str
    full_name: Optional[str] = None
    website_url: Optional[str] = None  # TrendAgent / SEO için kullanılacak
    store_platform: Optional[str] = None  # Shopify, Trendyol vb.
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    owned_workspaces: List["Workspace"] = Relationship(back_populates="owner")
    workspace_memberships: List["WorkspaceMember"] = Relationship(back_populates="user")
