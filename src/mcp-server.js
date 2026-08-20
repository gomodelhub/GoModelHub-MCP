import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ApiClient, textResult, errorResult } from "./api-client.js";

const IMAGE_INPUT_DESC =
  "Local image file path for image-to-3D (stdio MCP only). Prefer image URL on Remote MCP. Max 50MB, jpg/png/webp.";

const MCP_VERSION = "1.3.1";

function resolveModel(model, defaultModel) {
  const chosen = (model ?? "").trim() || (defaultModel ?? "").trim();
  if (!chosen) {
    throw new Error(
      "model is required. Set GOMODELHUB_DEFAULT_MODEL in mcp.json (local env or Remote header X-GoModelHub-Default-Model), or pass model in the tool call."
    );
  }
  return chosen;
}

/**
 * @param {ApiClient} client
 * @param {{ remote?: boolean, defaultModel?: string }} options
 */
export function createGoModelHub3dMcpServer(client, options = {}) {
  const remote = Boolean(options.remote);
  const allowLocalImage = !remote;
  const defaultModel = (options.defaultModel ?? "").trim();

  const modelDesc = defaultModel
    ? `3D modelCode (optional if GOMODELHUB_DEFAULT_MODEL is set to ${defaultModel}). Override per call when needed.`
    : "3D modelCode from marketplace (modelType=3d), e.g. hyper3d, neural4d, v3.1-20260211. Do NOT add tp- prefix.";

  const toolInputShape = {
    model: z.string().optional().describe(modelDesc),
    prompt: z.string().optional().describe("Text prompt. Required unless image or imagePath is set."),
    image: z.string().optional().describe("Public https image URL for image-to-3D (JSON submit)."),
    mode: z.string().optional().describe("Optional mode: text or image."),
    options: z
      .record(z.any())
      .optional()
      .describe("Vendor options. JSON submit: options object; local file: sent as metadata JSON."),
  };

  if (allowLocalImage) {
    toolInputShape.imagePath = z.string().optional().describe(IMAGE_INPUT_DESC);
  }

  const server = new McpServer({
    name: "gomodelhub-3d",
    version: MCP_VERSION,
  });

  const generateDesc = allowLocalImage
    ? "Submit a 3D generation job to GoModelHub. Supports text/URL (JSON) or local image file (multipart). Returns taskId."
    : "Submit a 3D generation job to GoModelHub (Remote MCP). Supports text prompt or public image URL. Returns taskId.";

  server.tool(
    "generate_3d",
    generateDesc,
    toolInputShape,
    async ({ model, prompt, image, imagePath, mode, options }) => {
      try {
        const modelCode = resolveModel(model, defaultModel);
        const { data, submitMode, uploadedImage } = await client.submit3dJob({
          model: modelCode,
          prompt,
          image,
          imagePath,
          mode,
          options,
          allowLocalImage,
        });
        return textResult({
          ok: true,
          submitMode,
          uploadedImage,
          hint: "Poll with get_3d_status(taskId) until status is succeeded or failed.",
          ...client.formatJob(data),
        });
      } catch (e) {
        return errorResult(e);
      }
    }
  );

  server.tool(
    "get_3d_status",
    "Poll 3D task status once. When status=succeeded, download via assetUrl with the same API key.",
    {
      taskId: z.string().describe("taskId returned by generate_3d"),
    },
    async ({ taskId }) => {
      try {
        const id = encodeURIComponent(taskId.trim());
        const data = await client.api("GET", `/api/v1/3d/generations/${id}`);
        return textResult({ ok: true, ...client.formatJob(data) });
      } catch (e) {
        return errorResult(e);
      }
    }
  );

  server.tool(
    "generate_3d_and_wait",
    allowLocalImage
      ? "Submit a 3D job (JSON or local image) and poll until succeeded/failed or timeout."
      : "Submit a 3D job (text or image URL) and poll until succeeded/failed or timeout.",
    {
      ...toolInputShape,
      pollIntervalSec: z
        .number()
        .min(1)
        .max(30)
        .optional()
        .describe("Poll interval seconds (default 3)"),
      timeoutSec: z
        .number()
        .min(10)
        .max(1800)
        .optional()
        .describe("Max wait seconds (default 300)"),
    },
    async ({
      model,
      prompt,
      image,
      imagePath,
      mode,
      options,
      pollIntervalSec,
      timeoutSec,
    }) => {
      try {
        const modelCode = resolveModel(model, defaultModel);
        const { data: submitted, submitMode, uploadedImage } = await client.submit3dJob({
          model: modelCode,
          prompt,
          image,
          imagePath,
          mode,
          options,
          allowLocalImage,
        });
        const taskId = submitted?.taskId;
        if (!taskId) {
          throw new Error("Submit succeeded but taskId missing: " + JSON.stringify(submitted));
        }

        const intervalMs = Math.round((pollIntervalSec ?? 3) * 1000);
        const deadline = Date.now() + (timeoutSec ?? 300) * 1000;
        let last = submitted;

        while (Date.now() < deadline) {
          await new Promise((r) => setTimeout(r, intervalMs));
          const id = encodeURIComponent(String(taskId));
          last = await client.api("GET", `/api/v1/3d/generations/${id}`);
          const status = String(last?.status || "").toLowerCase();
          if (status === "succeeded" || status === "failed") {
            return textResult({
              ok: status === "succeeded",
              submitMode,
              uploadedImage,
              ...client.formatJob(last),
            });
          }
        }

        return textResult({
          ok: false,
          error: "timeout waiting for 3D job",
          submitMode,
          uploadedImage,
          ...client.formatJob(last),
        });
      } catch (e) {
        return errorResult(e);
      }
    }
  );

  return server;
}

export { MCP_VERSION };
