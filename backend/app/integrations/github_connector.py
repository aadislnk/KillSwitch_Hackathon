from __future__ import annotations

import logging
from datetime import UTC, datetime, timedelta
from typing import Any

import httpx

logger = logging.getLogger(__name__)

GITHUB_API_BASE_URL = "https://api.github.com"
DEFAULT_GITHUB_SEAT_COST = 4.0

SAMPLE_GITHUB_RESPONSE: dict[str, Any] = {
    "organization": "example-org",
    "members": [
        {
            "login": "octo-admin",
            "resource_type": "github_user_seat",
            "monthly_cost": DEFAULT_GITHUB_SEAT_COST,
            "usage_score": 92,
            "last_activity_at": "2026-05-20T12:30:00Z",
            "inactive": False,
        },
        {
            "login": "stale-contributor",
            "resource_type": "github_user_seat",
            "monthly_cost": DEFAULT_GITHUB_SEAT_COST,
            "usage_score": 5,
            "last_activity_at": "2026-02-11T08:00:00Z",
            "inactive": True,
        },
    ],
}


class GitHubIntegrationError(RuntimeError):
    """Raised when GitHub cannot return integration data."""


class GitHubConnector:
    """Small GitHub REST connector for organization seat activity."""

    def __init__(self, token: str, org: str, *, timeout: float = 15.0) -> None:
        if not token:
            raise ValueError("GitHub token is required")
        if not org:
            raise ValueError("GitHub organization is required")

        self.token = token
        self.org = org
        self.timeout = timeout

    def _headers(self) -> dict[str, str]:
        return {
            "Authorization": f"Bearer {self.token}",
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
        }

    async def _get(self, path: str, params: dict[str, Any] | None = None) -> Any:
        url = f"{GITHUB_API_BASE_URL}{path}"
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(url, headers=self._headers(), params=params)
                response.raise_for_status()
                return response.json()
        except httpx.HTTPStatusError as exc:
            logger.exception("github_http_error status=%s path=%s", exc.response.status_code, path)
            raise GitHubIntegrationError("GitHub API returned an error") from exc
        except httpx.HTTPError as exc:
            logger.exception("github_request_failed path=%s", path)
            raise GitHubIntegrationError("GitHub API request failed") from exc

    async def fetch_organization_members(self) -> list[dict[str, Any]]:
        members = await self._get(f"/orgs/{self.org}/members", {"per_page": 100})
        return members if isinstance(members, list) else []

    async def fetch_seat_activity(self) -> list[dict[str, Any]]:
        """
        Fetch GitHub Copilot seat activity when available.

        GitHub returns 404/403 when the org does not use Copilot or the token
        lacks access. In that case callers can still rely on member data.
        """

        try:
            data = await self._get(f"/orgs/{self.org}/copilot/billing/seats", {"per_page": 100})
        except GitHubIntegrationError:
            logger.info("github_copilot_seat_activity_unavailable org=%s", self.org)
            return []

        seats = data.get("seats", []) if isinstance(data, dict) else []
        return seats if isinstance(seats, list) else []

    def _merge_member_activity(
        self,
        members: list[dict[str, Any]],
        seats: list[dict[str, Any]],
    ) -> list[dict[str, Any]]:
        activity_by_login: dict[str, dict[str, Any]] = {}
        for seat in seats:
            assignee = seat.get("assignee") or {}
            login = assignee.get("login")
            if login:
                activity_by_login[login] = seat

        merged = []
        for member in members:
            login = member.get("login", "unknown-github-user")
            seat = activity_by_login.get(login, {})
            last_activity_at = seat.get("last_activity_at") or member.get("updated_at")
            merged.append(
                {
                    "login": login,
                    "resource_type": "github_user_seat",
                    "monthly_cost": DEFAULT_GITHUB_SEAT_COST,
                    "usage_score": self._usage_score(last_activity_at),
                    "last_activity_at": last_activity_at,
                    "inactive": self._is_inactive(last_activity_at),
                }
            )
        return merged

    @staticmethod
    def _is_inactive(last_activity_at: str | None, inactive_days: int = 30) -> bool:
        if not last_activity_at:
            return True
        try:
            last_seen = datetime.fromisoformat(last_activity_at.replace("Z", "+00:00"))
        except ValueError:
            return True
        return last_seen < datetime.now(UTC) - timedelta(days=inactive_days)

    @classmethod
    def _usage_score(cls, last_activity_at: str | None) -> int:
        if not last_activity_at:
            return 0
        try:
            last_seen = datetime.fromisoformat(last_activity_at.replace("Z", "+00:00"))
        except ValueError:
            return 0
        days_since_activity = max(0, (datetime.now(UTC) - last_seen).days)
        return max(0, min(100, 100 - days_since_activity * 3))

    async def fetch_inactive_users(self) -> list[dict[str, Any]]:
        data = await self.fetch_usage_data()
        return [record for record in data if record.get("inactive")]

    async def fetch_usage_data(self) -> list[dict[str, Any]]:
        members = await self.fetch_organization_members()
        seats = await self.fetch_seat_activity()
        return self._merge_member_activity(members, seats)

    async def fetch_normalized_source_data(self) -> dict[str, Any]:
        records = await self.fetch_usage_data()
        return {
            "provider": "github",
            "organization": self.org,
            "members": records,
            "inactive_users": [record for record in records if record.get("inactive")],
        }
