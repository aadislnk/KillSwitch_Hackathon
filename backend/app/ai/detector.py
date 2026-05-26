from __future__ import annotations

from app.ai.heuristics import HeuristicFinding, run_heuristics


class FindingsDetector:
    """Hybrid detector entry point: heuristics first, enrichment later."""

    def detect(self, spend_records: list[dict]) -> list[HeuristicFinding]:
        return run_heuristics(spend_records)


findings_detector = FindingsDetector()
