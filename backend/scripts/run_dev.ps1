$ErrorActionPreference = "Stop"

Set-Location (Split-Path $PSScriptRoot -Parent)

if (-not (Test-Path ".venv")) {
  python -m venv .venv
}

& .\.venv\Scripts\python.exe -m pip install -U pip
& .\.venv\Scripts\pip.exe install -r requirements.txt

$env:PYTHONPATH = (Join-Path (Get-Location) "app")

& .\.venv\Scripts\uvicorn.exe app.main:app --reload --host 127.0.0.1 --port 8000

