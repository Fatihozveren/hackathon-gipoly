from datetime import datetime
from typing import Optional, List, TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship
import shortuuid

if TYPE_CHECKING:
    from tools.trend_agent.models import TrendSuggestion

class Workspace(SQLModel, table=True, extend_existing=True):
    __tablename__ = "workspace"
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    slug: str = Field(unique=True, index=True)
    store_url: Optional[str] = None
    store_platform: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    owner_id: int = Field(foreign_key="user.id")
    
    # Relationships
    owner: Optional["User"] = Relationship(back_populates="owned_workspaces")
    members: List["WorkspaceMember"] = Relationship(back_populates="workspace", sa_relationship_kwargs={"cascade": "all, delete-orphan"})
    trend_suggestions: List["TrendSuggestion"] = Relationship(back_populates="workspace", sa_relationship_kwargs={"cascade": "all, delete-orphan"})
    
    def __init__(self, **data):
        super().__init__(**data)
        if not self.slug:
            self.slug = self._generate_slug()
    
    def _generate_slug(self) -> str:
        """Generate unique slug from name + shortuuid"""
        base_slug = self.name.lower().replace(" ", "-").replace("_", "-")
        base_slug = "".join(c for c in base_slug if c.isalnum() or c == "-")
        base_slug = "-".join(filter(None, base_slug.split("-")))
        unique_id = shortuuid.ShortUUID().random(length=8)
        return f"{base_slug}-{unique_id}"


class WorkspaceMember(SQLModel, table=True, extend_existing=True):
    __tablename__ = "workspace_member"
    id: Optional[int] = Field(default=None, primary_key=True)
    workspace_id: int = Field(foreign_key="workspace.id")
    user_id: int = Field(foreign_key="user.id")
    role: str = Field(default="member")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    workspace: Optional[Workspace] = Relationship(back_populates="members")
    user: Optional["User"] = Relationship(back_populates="workspace_memberships")
    
 