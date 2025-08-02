from datetime import datetime
from typing import Optional, Dict, Any
from sqlmodel import SQLModel, Field, Text, Column, Relationship


class TrendSuggestion(SQLModel, table=True, extend_existing=True):
    __tablename__ = "trend_suggestions"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    workspace_id: int = Field(foreign_key="workspace.id", index=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    request_data: str = Field(sa_column=Column(Text))
    response_data: str = Field(sa_column=Column(Text))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    workspace: Optional["Workspace"] = Relationship(back_populates="trend_suggestions")
    user: Optional["User"] = Relationship(back_populates="trend_suggestions")


class TrendCategory(SQLModel, table=True):
    """Model for storing trend category data."""
    __tablename__ = "trend_categories"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    category_name: str = Field(..., description="Category name")
    trend_data: str = Field(..., description="JSON string of trend data (date -> score)")
    last_updated: datetime = Field(default_factory=datetime.utcnow) 