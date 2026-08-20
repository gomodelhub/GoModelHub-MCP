# Start Remote MCP (Streamable HTTP) — bind localhost, expose via nginx.
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

if (-not $env:GOMODELHUB_BASE_URL) {
  $env:GOMODELHUB_BASE_URL = "http://127.0.0.1:8888"
}
if (-not $env:MCP_HTTP_HOST) { $env:MCP_HTTP_HOST = "127.0.0.1" }
if (-not $env:MCP_HTTP_PORT) { $env:MCP_HTTP_PORT = "3110" }
if (-not $env:MCP_HTTP_PATH) { $env:MCP_HTTP_PATH = "/mcp/3d" }

Write-Host "Starting Remote MCP on http://$($env:MCP_HTTP_HOST):$($env:MCP_HTTP_PORT)$($env:MCP_HTTP_PATH)"
Write-Host "Upstream: $($env:GOMODELHUB_BASE_URL)"
node src/http-server.js
