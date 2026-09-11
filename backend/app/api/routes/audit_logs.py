from typing import List, Optional
from pydantic import BaseModel, ConfigDict
from datetime import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_optional_current_user, get_db
from app.models.audit_log import AuditLog
from app.models.user import User

router = APIRouter(prefix="/audit-logs", tags=["Audit Logs"])


class AuditLogResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    actor_user_id: Optional[int] = None
    actor_email: Optional[str] = None
    action: str
    entity_type: str
    entity_id: Optional[str] = None
    metadata_json: Optional[str] = None
    created_at: datetime


@router.get(
    "",
    response_model=List[AuditLogResponse],
    summary="List platform audit logs",
)
def list_audit_logs(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user),
) -> List[AuditLog]:
    return db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(200).all()
