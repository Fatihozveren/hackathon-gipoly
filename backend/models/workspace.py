from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field, Relationship
import shortuuid


class Workspace(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    slug: str = Field(unique=True, index=True)
    store_url: Optional[str] = None
    store_platform: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    owner_id: int = Field(foreign_key="user.id")
    
    # Relationships
    owner: Optional["User"] = Relationship(back_populates="owned_workspaces")
    members: list["WorkspaceMember"] = Relationship(back_populates="workspace")
    
    def __init__(self, **data):
        super().__init__(**data)
        if not self.slug:
            self.slug = self._generate_slug()
    
    def _generate_slug(self) -> str:
        """Generate unique slug from name + shortuuid"""
        base_slug = self.name.lower().replace(" ", "-").replace("_", "-")
        # Remove special characters
        base_slug = "".join(c for c in base_slug if c.isalnum() or c == "-")
        # Remove multiple dashes
        base_slug = "-".join(filter(None, base_slug.split("-")))
        # Add shortuuid for uniqueness
        unique_id = shortuuid.ShortUUID().random(length=8)
        return f"{base_slug}-{unique_id}"


class WorkspaceMember(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    workspace_id: int = Field(foreign_key="workspace.id")
    user_id: int = Field(foreign_key="user.id")
    role: str = Field(default="member")  # "owner", "admin", "member"
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    workspace: Optional[Workspace] = Relationship(back_populates="members")
    user: Optional["User"] = Relationship(back_populates="workspace_memberships") 