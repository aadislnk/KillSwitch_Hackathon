from __future__ import annotations

from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, Field

from app.models.enums import FindingSeverity, FindingStatus


class AIFindingBase(BaseModel):
    resource_id: UUID
    finding_type: str
    severity: FindingSeverity
    confidence: Decimal = Field(ge=0, le=1)
    estimated_savings: Decimal = Field(ge=0)
    recommended_action: str
    reason: str | None = None
    explanation: str | None = None
    risk_summary: str | None = None
    optimization_recommendation: str | None = None
    status: FindingStatus = FindingStatus.OPEN


class AIFindingCreate(AIFindingBase):
    pass


class AIFindingUpdate(BaseModel):
    finding_type: str | None = None
    severity: FindingSeverity | None = None
    confidence: Decimal | None = Field(default=None, ge=0, le=1)
    estimated_savings: Decimal | None = Field(default=None, ge=0)
    recommended_action: str | None = None
    reason: str | None = None
    explanation: str | None = None
    risk_summary: str | None = None
    optimization_recommendation: str | None = None
    status: FindingStatus | None = None


class AIFindingRead(AIFindingBase):
    id: UUID
