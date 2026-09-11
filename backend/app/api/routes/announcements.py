from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.api.deps import get_optional_current_user, require_roles, get_db
from app.models.announcement import Announcement
from app.models.user import User
from app.schemas.announcement import (
    AnnouncementCreate,
    AnnouncementResponse,
    AnnouncementUpdate,
)

router = APIRouter(prefix="/announcements", tags=["Announcements"])


@router.get(
    "",
    response_model=List[AnnouncementResponse],
    summary="List active announcements for current user role",
)
def list_announcements(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user),
) -> List[Announcement]:
    now = datetime.now(timezone.utc)
    query = db.query(Announcement).filter(
        Announcement.is_active == True,
        or_(
            Announcement.expires_at == None,
            Announcement.expires_at > now,
        ),
    )

    if current_user and current_user.role != "admin":
        # Role-targeted announcements: role match or "All Users"
        query = query.filter(
            or_(
                Announcement.target_role == "All Users",
                Announcement.target_role == current_user.role,
            )
        )
    elif not current_user:
        # Public or unauthenticated: show "All Users"
        query = query.filter(Announcement.target_role == "All Users")

    return query.order_by(Announcement.created_at.desc()).all()


@router.post(
    "",
    response_model=AnnouncementResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new platform announcement (Admin only)",
)
def create_announcement(
    payload: AnnouncementCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["admin"])),
) -> Announcement:
    announcement = Announcement(
        title=payload.title.strip(),
        message=payload.message.strip(),
        priority=payload.priority,
        target_role=payload.target_role,
        is_active=payload.is_active,
        expires_at=payload.expires_at,
        created_by=current_user.full_name,
    )
    db.add(announcement)
    db.commit()
    db.refresh(announcement)
    return announcement


@router.patch(
    "/{announcement_id}",
    response_model=AnnouncementResponse,
    summary="Update an announcement (Admin only)",
)
def update_announcement(
    announcement_id: int,
    payload: AnnouncementUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["admin"])),
) -> Announcement:
    announcement = db.query(Announcement).filter(Announcement.id == announcement_id).first()
    if not announcement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Announcement {announcement_id} not found.",
        )

    if payload.title is not None:
        announcement.title = payload.title.strip()
    if payload.message is not None:
        announcement.message = payload.message.strip()
    if payload.priority is not None:
        announcement.priority = payload.priority
    if payload.target_role is not None:
        announcement.target_role = payload.target_role
    if payload.is_active is not None:
        announcement.is_active = payload.is_active
    if payload.expires_at is not None:
        announcement.expires_at = payload.expires_at

    announcement.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(announcement)
    return announcement


@router.delete(
    "/{announcement_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete an announcement (Admin only)",
)
def delete_announcement(
    announcement_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["admin"])),
):
    announcement = db.query(Announcement).filter(Announcement.id == announcement_id).first()
    if not announcement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Announcement {announcement_id} not found.",
        )

    db.delete(announcement)
    db.commit()
    return None
