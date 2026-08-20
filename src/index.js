#!/usr/bin/env node
/**
 * GoModelHub 3D MCP — stdio (local) mode
 *
 * Env: GOMODELHUB_BASE_URL, GOMODELHUB_API_KEY
 * Optional file: ~/.gomodelhub/3d-mcp.json
 */

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { ApiClient } from "./api-client.js";
import { createGoModelHub3dMcpServer } from "./mcp-server.js";
import { loadConfig, requireConfig as assertConfig } from "./config.js";

const runtimeConfig = loadConfig();

async function main() {
  assertConfig(runtimeConfig);

  if (
    (process.env.AIDEMO_BASE_URL || process.env.AIDEMO_API_KEY) &&
    !(process.env.GOMODELHUB_BASE_URL || process.env.GOMODELHUB_API_KEY)
  ) {
    console.error(
      "[gomodelhub-3d-mcp] notice: AIDEMO_* env is deprecated; use GOMODELHUB_BASE_URL / GOMODELHUB_API_KEY"
    );
  }

  const cfgSource = runtimeConfig.configFile ? `file=${runtimeConfig.configFile}` : "env";
  console.error(
    `[gomodelhub-3d-mcp] stdio base=${runtimeConfig.baseUrl} key=set (${cfgSource})`
  );

  const client = new ApiClient({
    baseUrl: runtimeConfig.baseUrl,
    apiKey: runtimeConfig.apiKey,
  });
  const server = createGoModelHub3dMcpServer(client, { remote: false });
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error("[gomodelhub-3d-mcp] fatal", err);
  process.exit(1);
});
