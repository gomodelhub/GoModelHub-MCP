# GoModelHub 3D MCP

MCP server for the GoModelHub 3D generation API — use it in **Cursor** and other AI Agents with natural language.

[English](./README.md) · [中文文檔](./README.zh-TW.md) · [日本語](./README.ja.md) · [Deutsch](./README.de.md) · [Report Bug](https://github.com/kelouer/GoModelHub-MCP/issues) · [Deploy Guide](./DEPLOY-BAOTA.md)

---

## Features

- **Zero-config Remote MCP** — Streamable HTTP, no local install needed
- **Local stdio MCP** — supports local `imagePath` for image-to-3D
- **3 Tools** — `generate_3d`, `get_3d_status`, `generate_3d_and_wait`
- **Cross-platform** — Windows / macOS / Linux

## Tools

| Tool | Description |
|:-----|:------------|
| `generate_3d` | Submit a 3D job; returns `taskId` |
| `get_3d_status` | Poll task status |
| `generate_3d_and_wait` | Submit and poll until done (recommended) |

## Prerequisites

- **Node.js 18+**
- Platform API Key (`gk-` / `sk-`) — get it from [GoModelHub](https://login.gomodelhub.com)
- **modelCode** from Model Marketplace (e.g. `hyper3d`)

---

## Default Model

| Mode | Where | Example |
|:-----|:------|:--------|
| Remote MCP | `headers` | `"X-GoModelHub-Default-Model": "hyper3d"` |
| Local MCP | `env` | `"GOMODELHUB_DEFAULT_MODEL": "hyper3d"` |

Use the modelCode shown in Model Marketplace (no `tp-` prefix).

---

## Option 1: Remote MCP (recommended, zero install)

> Remote MCP does **not** support local `imagePath`. Use a public `image` URL for image-to-3D.

```json
{
  "mcpServers": {
    "gomodelhub-3d": {
      "url": "https://login.gomodelhub.com/mcp/3d",
      "headers": {
        "Authorization": "Bearer gk-your-key",
        "X-GoModelHub-Default-Model": "hyper3d"
      }
    }
  }
}
```

See [`examples/mcp.remote.json`](./examples/mcp.remote.json).

---

## Option 2: Local MCP (supports imagePath)

### Install

```bash
git clone https://github.com/kelouer/GoModelHub-MCP.git
cd GoModelHub-MCP
npm install
npm install -g .
```

<details>
<summary>Alternative install scripts</summary>

| OS | Command |
|:---|:--------|
| Windows | `powershell -ExecutionPolicy Bypass -File scripts/install-global.ps1` |
| macOS / Linux | `bash scripts/install-global.sh` |

Verify: `where gomodelhub-3d-mcp` (Windows) or `which gomodelhub-3d-mcp`.
</details>

### Configure

```json
{
  "mcpServers": {
    "gomodelhub-3d": {
      "command": "gomodelhub-3d-mcp",
      "env": {
        "GOMODELHUB_BASE_URL": "https://login.gomodelhub.com",
        "GOMODELHUB_API_KEY": "gk-your-key",
        "GOMODELHUB_DEFAULT_MODEL": "hyper3d"
      }
    }
  }
}
```

See [`examples/mcp.local.json`](./examples/mcp.local.json). Save and **Refresh**.

### Local image-to-3D

```json
{ "model": "v3.1-20260211", "imagePath": "D:/photos/chair.jpg", "mode": "image" }
```

Supports jpg / png / webp, max 50MB.

---

## Comparison

| | Remote MCP | Local MCP |
|:--|:-----------|:----------|
| Install | None | `npm install -g .` |
| Text-to-3D | ✅ | ✅ |
| Public `image` URL | ✅ | ✅ |
| Local `imagePath` | ❌ | ✅ |

---

## Troubleshooting

| Symptom | Fix |
|:--------|:----|
| `disconnected` | Ensure `gomodelhub-3d-mcp` is on PATH |
| `Missing GOMODELHUB_BASE_URL` | Check `env` in `mcp.json` |
| `model is required` | Set default model or pass `model` in the call |
| HTTP 401 / 403 | Invalid key or insufficient quota |
| Remote image-to-3D fails | Use public `image` URL or local MCP |

---

## License

MIT — see [LICENSE](./LICENSE).
