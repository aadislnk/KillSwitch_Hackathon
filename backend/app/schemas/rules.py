from __future__ import annotations

from uuid import UUID

from pydantic import BaseModel


class RuleBase(BaseModel):
    user_id: UUID
    condition_type: str
    threshold: str | int | float
    action: str
    approval_required: bool = True
    enabled: bool = True


class RuleCreate(RuleBase):
    pass


class RuleUpdate(BaseModel):
    condition_type: str | None = None
    threshold: str | int | float | None = None
    action: str | None = None
    approval_required: bool | None = None
    enabled: bool | None = None


class RuleRead(RuleBase):
    id: UUID
