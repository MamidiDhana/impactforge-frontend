from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import and_, or_
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.notification import Notification
from app.models.user import User
from app.schemas.notification import NotificationResponse

router = APIRouter(prefix="/notifications", tags=["Notifications"])


def is_user_authorized_for_notification(notif: Notification, user: User) -> bool:
    """Verifies that the user owns or is targeted by the notification."""
    if user.role == "admin":
        return True
    if notif.user_id is not None:
        return notif.user_id == user.id
    if notif.role is not None:
        return notif.role in [user.role, "All Users"]
    return True


@router.get(
    "",
    response_model=List[NotificationResponse],
    summary="Get user-specific and role-targeted notifications",
)
def get_notifications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> List[Notification]:
    query = db.query(Notification).filter(
        Notification.is_dismissed == False,
        or_(
            Notification.user_id == current_user.id,
            and_(
                Notification.user_id == None,
                or_(
                    Notification.role == current_user.role,
                    Notification.role == "All Users",
                    Notification.role == None,
                ),
            ),
        ),
    )
    return query.order_by(Notification.created_at.desc()).limit(100).all()


@router.patch(
    "/{notification_id}/read",
    response_model=NotificationResponse,
    summary="Mark a notification as read",
)
def mark_as_read(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Notification:
    notif = db.query(Notification).filter(Notification.id == notification_id).first()
    if not notif:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found.",
        )

    if not is_user_authorized_for_notification(notif, current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this notification.",
        )

    notif.is_read = True
    db.commit()
    db.refresh(notif)
    return notif


@router.patch(
    "/read-all",
    summary="Mark all visible notifications as read",
)
def mark_all_as_read(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(Notification).filter(
        Notification.is_dismissed == False,
        Notification.is_read == False,
        or_(
            Notification.user_id == current_user.id,
            and_(
                Notification.user_id == None,
                or_(
                    Notification.role == current_user.role,
                    Notification.role == "All Users",
                    Notification.role == None,
                ),
            ),
        ),
    )
    count = query.update({Notification.is_read: True}, synchronize_session=False)
    db.commit()
    return {"message": f"Marked {count} notifications as read."}


@router.patch(
    "/{notification_id}/dismiss",
    response_model=NotificationResponse,
    summary="Dismiss a notification",
)
def dismiss_notification(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Notification:
    notif = db.query(Notification).filter(Notification.id == notification_id).first()
    if not notif:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found.",
        )

    if not is_user_authorized_for_notification(notif, current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this notification.",
        )

    notif.is_dismissed = True
    db.commit()
    db.refresh(notif)
    return notif
