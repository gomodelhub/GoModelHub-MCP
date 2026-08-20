import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const CONFIG_FILENAMES = ["3d-mcp.json", "config.json"];

function configFileCandidates() {
  const home = os.homedir();
  const dirs = [
    path.join(home, ".gomodelhub"),
    path.join(home, ".config", "gomodelhub"),
  ];
  if (process.platform === "win32" && process.env.APPDATA) {
    dirs.push(path.join(process.env.APPDATA, "gomodelhub"));
  }
  const files = [];
  for (const dir of dirs) {
    for (const name of CONFIG_FILENAMES) {
      files.push(path.join(dir, name));
    }
  }
  return files;
}

function readConfigFile() {
  for (const file of configFileCandidates()) {
    try {
      if (!fs.existsSync(file)) continue;
      const raw = fs.readFileSync(file, "utf8");
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        return { file, parsed };
      }
    } catch {
      /* try next candidate */
    }
  }
  return null;
}

function pickString(...values) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return "";
}

/**
 * Resolve credentials from env (highest priority) then optional config file.
 * Env: GOMODELHUB_BASE_URL / GOMODELHUB_API_KEY (legacy AIDEMO_* supported)
 * File (~/.gomodelhub/3d-mcp.json): baseUrl + apiKey
 */
export function loadConfig() {
  const fromFile = readConfigFile();

  const baseUrl = pickString(
    process.env.GOMODELHUB_BASE_URL,
    process.env.AIDEMO_BASE_URL,
    fromFile?.parsed?.baseUrl,
    fromFile?.parsed?.GOMODELHUB_BASE_URL,
    fromFile?.parsed?.AIDEMO_BASE_URL
  ).replace(/\/+$/, "");

  const apiKey = pickString(
    process.env.GOMODELHUB_API_KEY,
    process.env.AIDEMO_API_KEY,
    fromFile?.parsed?.apiKey,
    fromFile?.parsed?.GOMODELHUB_API_KEY,
    fromFile?.parsed?.AIDEMO_API_KEY
  );

  return {
    baseUrl,
    apiKey,
    configFile: fromFile?.file || null,
  };
}

export function requireConfig(config) {
  if (!config.baseUrl) {
    throw new Error(
      "Missing GOMODELHUB_BASE_URL. Set env in mcp.json or ~/.gomodelhub/3d-mcp.json (baseUrl)."
    );
  }
  if (!config.apiKey) {
    throw new Error(
      "Missing GOMODELHUB_API_KEY. Set env in mcp.json or ~/.gomodelhub/3d-mcp.json (apiKey)."
    );
  }
}
