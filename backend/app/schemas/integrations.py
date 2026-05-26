from __future__ import annotations

from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, Field

from app.models.enums import IntegrationStatus


class IntegrationBase(BaseModel):
    user_id: UUID
    provider: str
    status: IntegrationStatus = IntegrationStatus.PENDING
    last_sync: datetime | None = None
    metadata: dict[str, Any] = Field(default_factory=dict)


class IntegrationCreate(IntegrationBase):
    pass


class IntegrationUpdate(BaseModel):
    provider: str | None = None
    status: IntegrationStatus | None = None
    last_sync: datetime | None = None
    metadata: dict[str, Any] | None = None


class IntegrationRead(IntegrationBase):
    id: UUID
