from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class AnnouncementCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=255)
    message: str = Field(..., min_length=5)
    priority: str = Field(default="Normal")
    target_role: str = Field(default="All Users")
    is_active: bool = True
    expires_at: Optional[datetime] = None


class AnnouncementUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=3, max_length=255)
    message: Optional[str] = Field(None, min_length=5)
    priority: Optional[str] = None
    target_role: Optional[str] = None
    is_active: Optional[bool] = None
    expires_at: Optional[datetime] = None


class AnnouncementResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    message: str
    priority: str
    target_role: str
    is_active: bool
    expires_at: Optional[datetime] = None
    created_by: Optional[str] = None
    created_at: datetime
    updated_at: datetime
