#!/usr/bin/env bash
# 生產環境啟動腳本（搭配 PM2 或手動執行）
set -euo pipefail
cd "$(dirname "$0")"

export NODE_ENV="${NODE_ENV:-production}"
export GOMODELHUB_BASE_URL="${GOMODELHUB_BASE_URL:-http://127.0.0.1:8888}"
export MCP_HTTP_HOST="${MCP_HTTP_HOST:-127.0.0.1}"
export MCP_HTTP_PORT="${MCP_HTTP_PORT:-3110}"
export MCP_HTTP_PATH="${MCP_HTTP_PATH:-/mcp/3d}"

exec node src/http-server.js
