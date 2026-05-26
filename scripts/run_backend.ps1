$ErrorActionPreference = "Stop"

& (Join-Path (Split-Path $PSScriptRoot -Parent) "backend\\scripts\\run_dev.ps1")

