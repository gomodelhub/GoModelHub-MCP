#!/usr/bin/env sh
# One-time install: dependencies + global bin (gomodelhub-3d-mcp).
set -e
cd "$(dirname "$0")/.."
echo "Installing dependencies in $(pwd) ..."
npm install
echo "Installing gomodelhub-3d-mcp globally ..."
npm install -g .
echo ""
echo "Done. Next steps:"
echo "  1. Edit mcp.json — set GOMODELHUB_BASE_URL and GOMODELHUB_API_KEY"
echo "  2. command: gomodelhub-3d-mcp"
echo "  3. Refresh MCP in Cursor / restart Claude Desktop"
