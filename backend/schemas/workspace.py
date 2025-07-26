from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel


class WorkspaceCreate(BaseModel):
    name: str
    store_url: Optional[str] = None
    store_platform: Optional[str] = None


class WorkspaceUpdate(BaseModel):
    name: Optional[str] = None
    store_url: Optional[str] = None
    store_platform: Optional[str] = None


class WorkspaceMemberCreate(BaseModel):
    email: str
    role: str = "member"


class WorkspaceRead(BaseModel):
    id: int
    name: str
    slug: str
    store_url: Optional[str] = None
    store_platform: Optional[str] = None
    created_at: datetime
    owner_id: int


class WorkspaceMemberRead(BaseModel):
    id: int
    workspace_id: int
    user_id: int
    role: str
    created_at: datetime


class WorkspaceWithMembers(BaseModel):
    id: int
    name: str
    slug: str
    store_url: Optional[str] = None
    store_platform: Optional[str] = None
    created_at: datetime
    owner_id: int
    user_role: str