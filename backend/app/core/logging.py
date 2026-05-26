import logging

from app.core.config import settings


def configure_logging() -> None:
    # Keep logging minimal; production can attach JSON handlers, tracing, etc.
    logging.basicConfig(
        level=getattr(logging, settings.log_level.upper(), logging.INFO),
        format="%(asctime)s %(levelname)s %(name)s - %(message)s",
    )

