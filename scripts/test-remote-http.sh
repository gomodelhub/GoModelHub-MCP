#!/usr/bin/env bash
# Smoke-test Remote MCP (Streamable HTTP) after Baota deployment.
#
# Usage (on server):
#   export GOMODELHUB_API_KEY='gk-your-platform-key'
#   bash scripts/test-remote-http.sh
#
# Optional:
#   MCP_URL=https://login.gomodelhub.com/mcp/3d
#   MCP_DEFAULT_MODEL=hyper3d
#   RUN_LIVE_TOOL=1   # also call generate_3d (costs quota)

set -euo pipefail

MCP_URL="${MCP_URL:-http://127.0.0.1:3110/mcp/3d}"
HEALTH_URL="${MCP_URL%/}/health"
API_KEY="${GOMODELHUB_API_KEY:-${MCP_API_KEY:-}}"
DEFAULT_MODEL="${MCP_DEFAULT_MODEL:-hyper3d}"
PROTO="${MCP_PROTOCOL_VERSION:-2024-11-05}"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

pass() { echo -e "${GREEN}[PASS]${NC} $*"; }
fail() { echo -e "${RED}[FAIL]${NC} $*"; exit 1; }
info() { echo -e "${YELLOW}[INFO]${NC} $*"; }

mcp_post() {
  local body="$1"
  shift
  curl -sS -X POST "$MCP_URL" \
    -H "Content-Type: application/json" \
    -H "Accept: application/json, text/event-stream" \
    "$@" \
    -d "$body"
}

echo "=== GoModelHub Remote MCP smoke test ==="
info "MCP_URL=$MCP_URL"

# 1) Health (no auth)
info "1/5 GET health"
health=$(curl -sS "$HEALTH_URL")
echo "$health" | grep -q '"ok"[[:space:]]*:[[:space:]]*true' \
  && pass "health ok" \
  || fail "health check failed: $health"

# 2) POST without auth → 401
info "2/5 POST without Authorization (expect 401)"
code=$(curl -sS -o /tmp/mcp-noauth.json -w '%{http_code}' -X POST "$MCP_URL" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"'"$PROTO"'","capabilities":{},"clientInfo":{"name":"smoke","version":"1.0"}}}')
[[ "$code" == "401" ]] && pass "unauthenticated blocked ($code)" || fail "expected 401, got $code: $(cat /tmp/mcp-noauth.json)"

if [[ -z "$API_KEY" ]]; then
  info "GOMODELHUB_API_KEY not set — skipping authenticated MCP tests (steps 3–5)."
  info "Export a platform key and re-run for full test."
  exit 0
fi

AUTH=(-H "Authorization: Bearer $API_KEY" -H "X-GoModelHub-Default-Model: $DEFAULT_MODEL")

# 3) initialize (stateless server: no session id required)
info "3/5 initialize"
init_body='{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"'"$PROTO"'","capabilities":{},"clientInfo":{"name":"smoke-test","version":"1.0"}}}'
init_resp=$(mcp_post "$init_body" "${AUTH[@]}")
echo "$init_resp" | grep -q 'gomodelhub-3d' \
  && pass "initialize returned server info" \
  || fail "initialize failed: $init_resp"

# 4) tools/list
info "4/5 tools/list"
list_body='{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}'
list_resp=$(mcp_post "$list_body" "${AUTH[@]}")
for tool in generate_3d get_3d_status generate_3d_and_wait; do
  echo "$list_resp" | grep -q "\"$tool\"" || fail "tools/list missing $tool: $list_resp"
done
pass "tools/list contains generate_3d, get_3d_status, generate_3d_and_wait"

# 5) optional live tool call
if [[ "${RUN_LIVE_TOOL:-0}" == "1" ]]; then
  info "5/5 tools/call generate_3d (live — consumes quota)"
  call_body='{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"generate_3d","arguments":{"prompt":"smoke test cube","mode":"text"}}}'
  call_resp=$(mcp_post "$call_body" "${AUTH[@]}")
  echo "$call_resp" | grep -qi 'task' \
    && pass "generate_3d returned task hint" \
    || fail "generate_3d failed: $call_resp"
else
  info "5/5 skip live tools/call (set RUN_LIVE_TOOL=1 to test billing path)"
  pass "skipped live tool call"
fi

echo ""
pass "All MCP smoke tests passed."
