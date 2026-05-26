from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, Field

from app.models.enums import ActionStatus


class ActionBase(BaseModel):
    finding_id: UUID
    action_type: str
    status: ActionStatus = ActionStatus.PENDING
    executed_at: datetime | None = None
    savings: Decimal | None = Field(default=None, ge=0)
    execution_log: str | None = None
    execution_result: str | None = None
    execution_mode: str | None = None
    rollback_status: str | None = None


class ActionCreate(ActionBase):
    pass


class ActionUpdate(BaseModel):
    action_type: str | None = None
    status: ActionStatus | None = None
    executed_at: datetime | None = None
    savings: Decimal | None = Field(default=None, ge=0)
    execution_log: str | None = None
    execution_result: str | None = None
    execution_mode: str | None = None
    rollback_status: str | None = None


class ActionRead(ActionBase):
    id: UUID
