# GoModelHub 3D MCP

MCP server for the GoModelHub 3D generation API. Use it in **Cursor** and other Agents with natural language.

| Tool | Description |
|------|-------------|
| `generate_3d` | Submit a 3D job; returns `taskId` |
| `get_3d_status` | Poll task status once |
| `generate_3d_and_wait` | Submit and poll until done (recommended) |

Requires **Node.js 18+** and a platform API Key (`gk-` / `sk-`).

[中文文档](./README.zh-CN.md)

---

## Option 1: Remote MCP (recommended, zero install)

**Limitation:** Remote MCP does **not** support local `imagePath`. For image-to-3D, use a public `image` URL; for local image files, use the local MCP below.

Cursor → Settings → MCP → edit `mcp.json`:

```json
{
  "mcpServers": {
    "gomodelhub-3d": {
      "url": "https://login.gomodelhub.com/mcp/3d",
      "headers": {
        "Authorization": "Bearer gk-your-platform-key"
      }
    }
  }
}
```

See [`examples/mcp.remote.json`](./examples/mcp.remote.json).

---

## Option 2: Local MCP (supports imagePath)

### 1. Install (one-time per machine)

```bash
git clone https://github.com/kelouer/GoModelHub-MCP.git
cd GoModelHub-MCP
npm install
npm install -g .
```

Windows: `powershell -ExecutionPolicy Bypass -File scripts/install-global.ps1`  
macOS/Linux: `bash scripts/install-global.sh`

Verify: `where gomodelhub-3d-mcp` (Windows) or `which gomodelhub-3d-mcp`.

### 2. Configure

```json
{
  "mcpServers": {
    "gomodelhub-3d": {
      "command": "gomodelhub-3d-mcp",
      "env": {
        "GOMODELHUB_BASE_URL": "https://login.gomodelhub.com",
        "GOMODELHUB_API_KEY": "gk-your-platform-key"
      }
    }
  }
}
```

See [`examples/mcp.local.json`](./examples/mcp.local.json). Save and **Refresh** in the MCP panel.

### 3. Local image (image-to-3D)

```json
{
  "model": "v3.1-20260211",
  "imagePath": "D:/photos/chair.jpg",
  "mode": "image"
}
```

Supports jpg / png / webp, max 50MB per file.

---

## Comparison

| | Remote MCP | Local MCP |
|--|------------|-----------|
| Install | None | `npm install -g .` |
| Text-to-3D | ✅ | ✅ |
| Public `image` URL | ✅ | ✅ |
| Local `imagePath` | ❌ | ✅ |

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| disconnected | Run global install; ensure `gomodelhub-3d-mcp` is on PATH |
| Missing GOMODELHUB_BASE_URL | Check `env` in `mcp.json` |
| HTTP 401 / 403 | Invalid key or insufficient quota |
| Remote image-to-3D fails | Do not use `imagePath`; use public `image` URL or local MCP |

## License

MIT — see [LICENSE](./LICENSE).
