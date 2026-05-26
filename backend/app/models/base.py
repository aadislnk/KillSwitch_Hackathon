from __future__ import annotations

from datetime import date, datetime
from decimal import Decimal
from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class AppModel(BaseModel):
    """Base model with JSON-friendly config for database records."""

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


class UserModel(AppModel):
    id: UUID
    email: str
    company_name: str
    role: str
    created_at: datetime


class IntegrationModel(AppModel):
    id: UUID
    user_id: UUID
    provider: str
    status: str
    last_sync: datetime | None = None
    metadata: dict[str, Any] = Field(default_factory=dict)


class SpendRecordModel(AppModel):
    id: UUID
    integration_id: UUID
    tool_name: str
    monthly_cost: Decimal
    usage_score: int
    last_used: datetime | None = None
    resource_type: str
    snapshot_date: date


class AIFindingModel(AppModel):
    id: UUID
    resource_id: UUID
    finding_type: str
    severity: str
    confidence: Decimal
    estimated_savings: Decimal
    recommended_action: str
    reason: str | None = None
    explanation: str | None = None
    risk_summary: str | None = None
    optimization_recommendation: str | None = None
    status: str
    created_at: datetime | None = None
    updated_at: datetime | None = None


class RuleModel(AppModel):
    id: UUID
    user_id: UUID
    condition_type: str
    threshold: str | int | float
    action: str
    approval_required: bool
    enabled: bool


class ActionModel(AppModel):
    id: UUID
    finding_id: UUID
    action_type: str
    status: str
    executed_at: datetime | None = None
    savings: Decimal | None = None
    execution_log: str | None = None
    execution_result: str | None = None
    execution_mode: str | None = None
    rollback_status: str | None = None


class NotificationModel(AppModel):
    id: UUID
    user_id: UUID
    channel: str
    message: str
    status: str
    created_at: datetime


class ApprovalModel(AppModel):
    id: UUID
    finding_id: UUID
    action_id: UUID | None = None
    status: str
    approved_by: UUID | None = None
    approved_at: datetime | None = None
