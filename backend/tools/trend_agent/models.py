from datetime import datetime
from sqlmodel import SQLModel, Field, JSON, Column, Relationship
from typing import Optional



class TrendSuggestion(SQLModel, table=True, extend_existing=True):
    __tablename__ = "trend_suggestions"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    workspace_id: int = Field(foreign_key="workspace.id", index=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    request_data: dict = Field(sa_column=Column(JSON))
    response_data: dict = Field(sa_column=Column(JSON))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    workspace: Optional["Workspace"] = Relationship(back_populates="trend_suggestions")
    user: Optional["User"] = Relationship(back_populates="trend_suggestions") 