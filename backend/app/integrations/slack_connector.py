from __future__ import annotations

import logging
from typing import Any

import httpx

logger = logging.getLogger(__name__)

SAMPLE_SLACK_ALERT: dict[str, Any] = {
    "text": "KillSwitch alert: 3 inactive SaaS seats found with estimated monthly waste.",
}


class SlackIntegrationError(RuntimeError):
    """Raised when Slack webhook delivery fails."""


class SlackConnector:
    """Webhook-based Slack notifier for alerts and action updates."""

    def __init__(self, webhook_url: str, *, timeout: float = 10.0) -> None:
        if not webhook_url:
            raise ValueError("Slack webhook URL is required")
        self.webhook_url = webhook_url
        self.timeout = timeout

    async def send_message(self, message: str, *, context: dict[str, Any] | None = None) -> dict[str, Any]:
        payload: dict[str, Any] = {"text": message}
        if context:
            payload["metadata"] = {"event_type": "killswitch_notification", "event_payload": context}

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(self.webhook_url, json=payload)
                response.raise_for_status()
        except httpx.HTTPStatusError as exc:
            logger.exception("slack_webhook_http_error status=%s", exc.response.status_code)
            raise SlackIntegrationError("Slack webhook returned an error") from exc
        except httpx.HTTPError as exc:
            logger.exception("slack_webhook_request_failed=true")
            raise SlackIntegrationError("Slack webhook request failed") from exc

        return {"delivered": True, "status_code": response.status_code}

    async def send_alert(self, message: str) -> dict[str, Any]:
        return await self.send_message(f"KillSwitch alert: {message}", context={"type": "alert"})

    async def send_action_notification(self, message: str) -> dict[str, Any]:
        return await self.send_message(
            f"KillSwitch action update: {message}",
            context={"type": "action_notification"},
        )
