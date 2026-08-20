#!/usr/bin/env node
/**
 * GoModelHub 3D MCP — Remote MCP (Streamable HTTP, stateless)
 *
 * Platform deployment (Phase C). Users connect via URL + Authorization header.
 *
 * Server env:
 *   GOMODELHUB_BASE_URL     Upstream platform API (default http://127.0.0.1:8888)
 *   MCP_HTTP_HOST           Bind host (default 127.0.0.1; use 0.0.0.0 behind nginx)
 *   MCP_HTTP_PORT           Port (default 3110)
 *   MCP_HTTP_PATH           HTTP path (default /mcp/3d)
 *   MCP_ALLOWED_HOSTS       Comma-separated Host allowlist when binding 0.0.0.0
 *
 * Per-request auth: Authorization: Bearer gk-xxx / sk-xxx (user platform key)
 */

import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createMcpExpressApp } from "@modelcontextprotocol/sdk/server/express.js";
import { ApiClient, parseBearerToken } from "./api-client.js";
import { createGoModelHub3dMcpServer } from "./mcp-server.js";

const DEFAULT_BASE = process.env.GOMODELHUB_BASE_URL || process.env.AIDEMO_BASE_URL || "http://127.0.0.1:8888";
const HOST = process.env.MCP_HTTP_HOST || "127.0.0.1";
const PORT = Number(process.env.MCP_HTTP_PORT || "3110");
const MCP_PATH = normalizePath(process.env.MCP_HTTP_PATH || "/mcp/3d");
const ALLOWED_HOSTS = (process.env.MCP_ALLOWED_HOSTS || "")
  .split(",")
  .map((h) => h.trim())
  .filter(Boolean);

function normalizePath(p) {
  const raw = p.trim() || "/mcp/3d";
  return raw.startsWith("/") ? raw.replace(/\/+$/, "") || "/" : `/${raw.replace(/\/+$/, "")}`;
}

function jsonRpcError(res, status, message, code = -32000) {
  if (res.headersSent) return;
  res.status(status).json({
    jsonrpc: "2.0",
    error: { code, message },
    id: null,
  });
}

function extractApiKey(req) {
  const fromAuth = parseBearerToken(req.headers.authorization);
  if (fromAuth) return fromAuth;
  const apiKeyHeader = req.headers["x-api-key"];
  if (typeof apiKeyHeader === "string" && apiKeyHeader.trim()) {
    return apiKeyHeader.trim();
  }
  return "";
}

function extractDefaultModel(req) {
  const fromHeader = req.headers["x-gomodelhub-default-model"];
  if (typeof fromHeader === "string" && fromHeader.trim()) {
    return fromHeader.trim();
  }
  const fromEnv = process.env.GOMODELHUB_DEFAULT_MODEL;
  return typeof fromEnv === "string" ? fromEnv.trim() : "";
}

async function handleMcpPost(req, res) {
  const apiKey = extractApiKey(req);
  if (!apiKey) {
    return jsonRpcError(res, 401, "Missing Authorization: Bearer <platform-api-key>");
  }

  let client;
  try {
    client = new ApiClient({ baseUrl: DEFAULT_BASE, apiKey });
  } catch (e) {
    return jsonRpcError(res, 500, e instanceof Error ? e.message : String(e), -32603);
  }

  const server = createGoModelHub3dMcpServer(client, {
    remote: true,
    defaultModel: extractDefaultModel(req),
  });
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
  });

  try {
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
    res.on("close", () => {
      transport.close();
      server.close();
    });
  } catch (error) {
    console.error("[gomodelhub-3d-mcp-http] request error:", error);
    jsonRpcError(res, 500, "Internal server error", -32603);
    transport.close();
    server.close();
  }
}

function methodNotAllowed(res) {
  jsonRpcError(res, 405, "Method not allowed.");
}

const appOptions = { host: HOST };
if (ALLOWED_HOSTS.length > 0) {
  appOptions.allowedHosts = ALLOWED_HOSTS;
} else if (HOST === "0.0.0.0" || HOST === "::") {
  appOptions.allowedHosts = ["login.gomodelhub.com", "localhost", "127.0.0.1", "[::1]"];
}

const app = createMcpExpressApp(appOptions);

app.get(`${MCP_PATH}/health`, (_req, res) => {
  res.json({
    ok: true,
    service: "gomodelhub-3d-mcp",
    mode: "streamable-http",
    path: MCP_PATH,
    upstream: DEFAULT_BASE.replace(/\/+$/, ""),
  });
});

app.post(MCP_PATH, handleMcpPost);
app.get(MCP_PATH, (_req, res) => methodNotAllowed(res));
app.delete(MCP_PATH, (_req, res) => methodNotAllowed(res));

app.listen(PORT, HOST, (error) => {
  if (error) {
    console.error("[gomodelhub-3d-mcp-http] failed to start:", error);
    process.exit(1);
  }
  console.error(
    `[gomodelhub-3d-mcp-http] listening http://${HOST}:${PORT}${MCP_PATH} upstream=${DEFAULT_BASE}`
  );
});

process.on("SIGINT", () => process.exit(0));
