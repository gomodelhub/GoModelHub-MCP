# One-time install: dependencies + global bin (gomodelhub-3d-mcp).
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root
Write-Host "Installing dependencies in $root ..."
npm install
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
Write-Host "Installing gomodelhub-3d-mcp globally ..."
npm install -g .
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
Write-Host ""
Write-Host "Done. Next steps:"
Write-Host "  1. Edit mcp.json — set GOMODELHUB_BASE_URL and GOMODELHUB_API_KEY"
Write-Host "  2. command: gomodelhub-3d-mcp"
Write-Host "  3. Refresh MCP in Cursor / restart Claude Desktop"
