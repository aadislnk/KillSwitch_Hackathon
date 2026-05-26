from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel

from app.models.enums import NotificationStatus


class NotificationBase(BaseModel):
    user_id: UUID
    channel: str
    message: str
    status: NotificationStatus = NotificationStatus.PENDING


class NotificationCreate(NotificationBase):
    pass


class NotificationUpdate(BaseModel):
    channel: str | None = None
    message: str | None = None
    status: NotificationStatus | None = None


class NotificationRead(NotificationBase):
    id: UUID
    created_at: datetime
