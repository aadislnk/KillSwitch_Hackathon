#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

if [ ! -d ".venv" ]; then
  python -m venv .venv
fi

. .venv/bin/activate
python -m pip install -U pip
pip install -r requirements.txt

export PYTHONPATH="$(pwd)/app"

uvicorn app.main:app --reload --host 127.0.0.1 --port 8000

