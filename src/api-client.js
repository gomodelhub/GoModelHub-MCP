import fs from "node:fs";
import path from "node:path";
import os from "node:os";

export const MAX_IMAGE_BYTES = 50 * 1024 * 1024;
const ALLOWED_IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp"]);

function parseApiJson(text, status) {
  let json;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    throw new Error(`Non-JSON response HTTP ${status}: ${text.slice(0, 300)}`);
  }
  if (json && typeof json === "object" && "code" in json && json.code !== 1) {
    throw new Error(json.msg || `API code=${json.code}`);
  }
  return json?.data !== undefined ? json.data : json;
}

export class ApiClient {
  constructor({ baseUrl, apiKey }) {
    if (!baseUrl?.trim()) {
      throw new Error("Missing platform baseUrl");
    }
    if (!apiKey?.trim()) {
      throw new Error("Missing platform apiKey");
    }
    this.baseUrl = baseUrl.replace(/\/+$/, "");
    this.apiKey = apiKey.trim();
  }

  async api(method, apiPath, body) {
    const url = `${this.baseUrl}${apiPath}`;
    const res = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const text = await res.text();
    if (!res.ok) {
      let msg = text.slice(0, 300);
      try {
        const j = JSON.parse(text);
        msg = j?.msg || msg;
      } catch {
        /* keep raw */
      }
      throw new Error(`HTTP ${res.status}: ${msg}`);
    }
    return parseApiJson(text, res.status);
  }

  expandHome(inputPath) {
    const raw = inputPath.trim();
    if (raw === "~") return os.homedir();
    if (raw.startsWith("~/") || raw.startsWith("~\\")) {
      return path.join(os.homedir(), raw.slice(2));
    }
    return raw;
  }

  mimeFromExt(ext) {
    switch (ext.toLowerCase()) {
      case ".jpg":
      case ".jpeg":
        return "image/jpeg";
      case ".png":
        return "image/png";
      case ".webp":
        return "image/webp";
      default:
        return null;
    }
  }

  resolveLocalImage(imagePath) {
    if (!imagePath?.trim()) {
      throw new Error("imagePath is empty");
    }
    const resolved = path.resolve(this.expandHome(imagePath.trim()));
    if (!fs.existsSync(resolved)) {
      throw new Error(`image file not found: ${resolved}`);
    }
    const stat = fs.statSync(resolved);
    if (!stat.isFile()) {
      throw new Error(`imagePath is not a file: ${resolved}`);
    }
    if (stat.size <= 0) {
      throw new Error(`image file is empty: ${resolved}`);
    }
    if (stat.size > MAX_IMAGE_BYTES) {
      throw new Error(`image exceeds ${MAX_IMAGE_BYTES / (1024 * 1024)}MB limit`);
    }
    const ext = path.extname(resolved).toLowerCase();
    if (!ALLOWED_IMAGE_EXT.has(ext)) {
      throw new Error(`unsupported image type ${ext || "(no extension)"}; use jpg/png/webp`);
    }
    const mime = this.mimeFromExt(ext);
    return {
      absolutePath: resolved,
      filename: path.basename(resolved),
      mime,
      size: stat.size,
    };
  }

  async apiMultipart(apiPath, fields, imageFile) {
    const url = `${this.baseUrl}${apiPath}`;
    const form = new FormData();
    for (const [key, value] of Object.entries(fields)) {
      if (value === undefined || value === null || value === "") continue;
      form.append(key, String(value));
    }
    const bytes = fs.readFileSync(imageFile.absolutePath);
    const blob = new Blob([bytes], { type: imageFile.mime });
    form.append("image", blob, imageFile.filename);

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        Accept: "application/json",
      },
      body: form,
    });
    const text = await res.text();
    if (!res.ok) {
      let msg = text.slice(0, 300);
      try {
        const j = JSON.parse(text);
        msg = j?.msg || msg;
      } catch {
        /* keep raw */
      }
      throw new Error(`HTTP ${res.status}: ${msg}`);
    }
    return parseApiJson(text, res.status);
  }

  async submit3dJob({ model, prompt, image, imagePath, mode, options, allowLocalImage = true }) {
    const modelCode = model.trim();
    const hasPrompt = Boolean(prompt?.trim());
    const hasUrl = Boolean(image?.trim());
    const hasFile = Boolean(imagePath?.trim());

    if (!hasPrompt && !hasUrl && !hasFile) {
      throw new Error("prompt, image (URL), or imagePath (local file) is required");
    }
    if (hasUrl && hasFile) {
      throw new Error("use either image (URL) or imagePath (local file), not both");
    }
    if (hasFile && !allowLocalImage) {
      throw new Error(
        "imagePath is only supported by the local stdio MCP. Remote MCP: use image (https URL) instead."
      );
    }

    if (hasFile) {
      const file = this.resolveLocalImage(imagePath);
      const fields = { model: modelCode };
      if (hasPrompt) fields.prompt = prompt.trim();
      else fields.prompt = "(image)";
      if (mode?.trim()) fields.mode = mode.trim();
      else fields.mode = "image";
      if (options && Object.keys(options).length) {
        fields.metadata = JSON.stringify(options);
      }
      const data = await this.apiMultipart("/api/v1/3d/generations", fields, file);
      return {
        data,
        submitMode: "multipart",
        uploadedImage: {
          path: file.absolutePath,
          filename: file.filename,
          bytes: file.size,
        },
      };
    }

    const body = { model: modelCode };
    if (hasPrompt) body.prompt = prompt.trim();
    if (hasUrl) body.image = image.trim();
    if (mode?.trim()) body.mode = mode.trim();
    if (options && Object.keys(options).length) body.options = options;

    const data = await this.api("POST", "/api/v1/3d/generations", body);
    return { data, submitMode: "json" };
  }

  absoluteAssetUrl(assetUrl) {
    if (!assetUrl) return assetUrl;
    if (/^https?:\/\//i.test(assetUrl)) return assetUrl;
    if (assetUrl.startsWith("/")) return `${this.baseUrl}${assetUrl}`;
    return `${this.baseUrl}/${assetUrl}`;
  }

  formatJob(data) {
    const out = { ...data };
    if (out.assetUrl) {
      out.assetUrl = this.absoluteAssetUrl(out.assetUrl);
    }
    return out;
  }
}

export function textResult(obj) {
  return {
    content: [{ type: "text", text: JSON.stringify(obj, null, 2) }],
  };
}

export function errorResult(err) {
  const message = err instanceof Error ? err.message : String(err);
  return {
    content: [{ type: "text", text: JSON.stringify({ ok: false, error: message }, null, 2) }],
    isError: true,
  };
}

export function parseBearerToken(headerValue) {
  if (!headerValue || typeof headerValue !== "string") return "";
  const trimmed = headerValue.trim();
  if (/^Bearer\s+/i.test(trimmed)) {
    return trimmed.replace(/^Bearer\s+/i, "").trim();
  }
  return trimmed;
}
