from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel

from app.models.enums import ApprovalStatus


class ApprovalBase(BaseModel):
    finding_id: UUID
    action_id: UUID | None = None
    status: ApprovalStatus = ApprovalStatus.PENDING
    approved_by: UUID | None = None
    approved_at: datetime | None = None


class ApprovalCreate(ApprovalBase):
    pass


class ApprovalUpdate(BaseModel):
    action_id: UUID | None = None
    status: ApprovalStatus | None = None
    approved_by: UUID | None = None
    approved_at: datetime | None = None


class ApprovalRead(ApprovalBase):
    id: UUID
