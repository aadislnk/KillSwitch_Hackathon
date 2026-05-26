from __future__ import annotations

import logging
from typing import Any
from uuid import UUID

from fastapi import APIRouter, HTTPException, Query, status
from pydantic import BaseModel, Field, HttpUrl, ValidationError

from app.db.supabase import DatabaseConfigError, DatabaseQueryError
from app.integrations.aws_mock_connector import AWSMockConnector, SAMPLE_AWS_MOCK_RESPONSE
from app.integrations.github_connector import SAMPLE_GITHUB_RESPONSE
from app.integrations.normalizer import normalize_records
from app.integrations.slack_connector import SAMPLE_SLACK_ALERT, SlackConnector, SlackIntegrationError
from app.schemas.integrations import IntegrationCreate
from app.services.database import database_service
from app.services.sync_service import sync_service

router = APIRouter()
logger = logging.getLogger(__name__)


class GitHubConnectRequest(BaseModel):
    user_id: UUID
    org: str = Field(min_length=1)
    token: str = Field(min_length=1)


class SlackConnectRequest(BaseModel):
    webhook_url: HttpUrl
    send_test_alert: bool = True


class IntegrationConnectResponse(BaseModel):
    provider: str
    connected: bool
    integration: dict[str, Any] | None = None
    message: str


@router.post("/github/connect", response_model=IntegrationConnectResponse)
def connect_github(payload: GitHubConnectRequest):
    """
    Register a GitHub integration record.

    The token is validated at the API boundary but is not stored in Supabase.
    Secret storage will be introduced with the auth/security module.
    """

    try:
        integration = database_service.create_integration(
            IntegrationCreate(
                user_id=payload.user_id,
                provider="github",
                status="connected",
                metadata={"org": payload.org, "sample_response": SAMPLE_GITHUB_RESPONSE},
            )
        )
    except (DatabaseConfigError, DatabaseQueryError, ValidationError) as exc:
        logger.exception("github_connect_failed org=%s", payload.org)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"GitHub integration could not be saved: {exc}",
        ) from exc

    return IntegrationConnectResponse(
        provider="github",
        connected=True,
        integration=integration,
        message="GitHub integration connected. Use /github/sync with integration_id, org, and token.",
    )


@router.get("/github/sync")
async def sync_github(
    integration_id: UUID = Query(...),
    org: str = Query(..., min_length=1),
    token: str = Query(..., min_length=1),
):
    """Fetch GitHub org seat activity, normalize it, and store spend records."""

    result = await sync_service.sync_github(
        integration_id=str(integration_id),
        org=org,
        token=token,
    )
    if result.errors and not result.normalized_records:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail={"message": "GitHub sync failed", "errors": result.errors},
        )
    return result.to_dict()


@router.post("/slack/connect")
async def connect_slack(payload: SlackConnectRequest):
    """Validate Slack webhook delivery with an optional test alert."""

    delivery: dict[str, Any] = {"delivered": False, "skipped": True}
    if payload.send_test_alert:
        try:
            delivery = await SlackConnector(str(payload.webhook_url)).send_alert(
                "Slack webhook connected successfully."
            )
        except (SlackIntegrationError, ValueError) as exc:
            logger.exception("slack_connect_failed=true")
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Slack webhook connection failed: {exc}",
            ) from exc

    return {
        "provider": "slack",
        "connected": True,
        "delivery": delivery,
        "sample_alert": SAMPLE_SLACK_ALERT,
    }


@router.get("/aws/mock-data")
def get_aws_mock_data(
    count: int = Query(default=6, ge=1, le=50),
    integration_id: UUID | None = Query(default=None),
    store: bool = Query(default=False),
):
    """
    Return realistic mock AWS spend data.

    When `store=true` and `integration_id` is provided, the data also flows
    through the sync service into Supabase spend records.
    """

    if store and integration_id:
        return sync_service.sync_aws_mock(integration_id=str(integration_id), count=count).to_dict()

    raw_records = AWSMockConnector().fetch_usage_data(count=count)
    normalized = normalize_records("aws", raw_records)
    return {
        "provider": "aws",
        "sample_response": SAMPLE_AWS_MOCK_RESPONSE,
        "raw_records": raw_records,
        "normalized_records": [record.model_dump(mode="json") for record in normalized],
    }
