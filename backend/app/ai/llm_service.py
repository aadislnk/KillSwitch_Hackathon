from __future__ import annotations

import json
import logging
from typing import Any

import httpx

from app.ai.prompts import SYSTEM_PROMPT, build_enrichment_prompt
from app.core.config import settings

logger = logging.getLogger(__name__)


class LLMServiceError(RuntimeError):
    """Raised when an LLM provider cannot enrich a finding."""


class LLMService:
    """Optional enrichment service for already-detected findings."""

    def __init__(
        self,
        *,
        openai_api_key: str | None = settings.openai_api_key,
        anthropic_api_key: str | None = settings.anthropic_api_key,
        timeout: float = 20.0,
    ) -> None:
        self.openai_api_key = openai_api_key
        self.anthropic_api_key = anthropic_api_key
        self.timeout = timeout

    async def enrich_finding(self, finding: dict[str, Any]) -> dict[str, str]:
        if self.openai_api_key:
            return await self._enrich_with_openai(finding)
        if self.anthropic_api_key:
            return await self._enrich_with_claude(finding)
        return self._fallback_enrichment(finding)

    async def _enrich_with_openai(self, finding: dict[str, Any]) -> dict[str, str]:
        payload = {
            "model": "gpt-4o-mini",
            "response_format": {"type": "json_object"},
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": build_enrichment_prompt(finding)},
            ],
        }
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers={"Authorization": f"Bearer {self.openai_api_key}"},
                    json=payload,
                )
                response.raise_for_status()
                content = response.json()["choices"][0]["message"]["content"]
                return self._parse_json_enrichment(content)
        except Exception as exc:
            logger.exception("openai_enrichment_failed finding_type=%s", finding.get("finding_type"))
            raise LLMServiceError("OpenAI enrichment failed") from exc

    async def _enrich_with_claude(self, finding: dict[str, Any]) -> dict[str, str]:
        payload = {
            "model": "claude-3-5-haiku-latest",
            "max_tokens": 500,
            "system": SYSTEM_PROMPT,
            "messages": [{"role": "user", "content": build_enrichment_prompt(finding)}],
        }
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    "https://api.anthropic.com/v1/messages",
                    headers={
                        "x-api-key": str(self.anthropic_api_key),
                        "anthropic-version": "2023-06-01",
                    },
                    json=payload,
                )
                response.raise_for_status()
                blocks = response.json().get("content", [])
                text = "".join(block.get("text", "") for block in blocks if block.get("type") == "text")
                return self._parse_json_enrichment(text)
        except Exception as exc:
            logger.exception("claude_enrichment_failed finding_type=%s", finding.get("finding_type"))
            raise LLMServiceError("Claude enrichment failed") from exc

    @staticmethod
    def _parse_json_enrichment(content: str) -> dict[str, str]:
        data = json.loads(content)
        return {
            "explanation": str(data.get("explanation", "")),
            "risk_summary": str(data.get("risk_summary", "")),
            "optimization_recommendation": str(data.get("optimization_recommendation", "")),
        }

    @staticmethod
    def _fallback_enrichment(finding: dict[str, Any]) -> dict[str, str]:
        action = finding.get("recommended_action", "Review the resource before taking action.")
        reason = finding.get("reason", "The heuristic engine detected a cost optimization opportunity.")
        return {
            "explanation": str(reason),
            "risk_summary": "No automation is executed by this analysis. Human review is recommended.",
            "optimization_recommendation": str(action),
        }


llm_service = LLMService()
