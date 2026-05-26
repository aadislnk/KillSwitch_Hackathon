from __future__ import annotations

from datetime import date, datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, Field


class SpendRecordBase(BaseModel):
    integration_id: UUID
    tool_name: str
    monthly_cost: Decimal = Field(ge=0)
    usage_score: int = Field(ge=0, le=100)
    last_used: datetime | None = None
    resource_type: str
    snapshot_date: date


class SpendRecordCreate(SpendRecordBase):
    pass


class SpendRecordUpdate(BaseModel):
    tool_name: str | None = None
    monthly_cost: Decimal | None = Field(default=None, ge=0)
    usage_score: int | None = Field(default=None, ge=0, le=100)
    last_used: datetime | None = None
    resource_type: str | None = None
    snapshot_date: date | None = None


class SpendRecordRead(SpendRecordBase):
    id: UUID
