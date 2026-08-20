# GoModelHub 3D MCP

GoModelHub 3D 生成 API 的 MCP 服务，供 **Cursor** 等 Agent 以自然语言调用。

| Tool | 说明 |
|------|------|
| `generate_3d` | 提交 3D 任务，返回 `taskId` |
| `get_3d_status` | 查询任务状态 |
| `generate_3d_and_wait` | 提交并轮询至完成（推荐） |

需要 **Node.js 18+**、平台 API Key（`gk-` / `sk-`），以及模型市场中的 **modelCode**（如 `hyper3d`）。

在 `mcp.json` 里配置默认模型后，对话里不必每次指定 `model`；单次任务仍可在 tool 调用里覆盖。

[English](./README.md)

---

## 在 `mcp.json` 配置默认模型

| 方式 | 配置位置 | 示例 |
|------|----------|------|
| Remote MCP | `headers` | `"X-GoModelHub-Default-Model": "hyper3d"` |
| 本地 MCP | `env` | `"GOMODELHUB_DEFAULT_MODEL": "hyper3d"` |

填模型市场中该 Key 可用的 modelCode，不要加 `tp-` 前缀。

---

## 方式一：Remote MCP（推荐，零安装）

**限制：** Remote MCP **不支持**本地 `imagePath`。图生请用公网 `image` URL；本机图片文件请用下方本地 MCP。

Cursor → Settings → MCP → 编辑 `mcp.json`：

```json
{
  "mcpServers": {
    "gomodelhub-3d": {
      "url": "https://login.gomodelhub.com/mcp/3d",
      "headers": {
        "Authorization": "Bearer gk-你的平台Key",
        "X-GoModelHub-Default-Model": "hyper3d"
      }
    }
  }
}
```

完整示例见 [`examples/mcp.remote.json`](./examples/mcp.remote.json)。

---

## 方式二：本地 MCP（支持 imagePath）

### 1. 安装（本机一次）

```bash
git clone https://github.com/kelouer/GoModelHub-MCP.git
cd GoModelHub-MCP
npm install
npm install -g .
```

Windows：`powershell -ExecutionPolicy Bypass -File scripts/install-global.ps1`  
macOS/Linux：`bash scripts/install-global.sh`

验证：`where gomodelhub-3d-mcp`（Windows）或 `which gomodelhub-3d-mcp`。

### 2. 配置

```json
{
  "mcpServers": {
    "gomodelhub-3d": {
      "command": "gomodelhub-3d-mcp",
      "env": {
        "GOMODELHUB_BASE_URL": "https://login.gomodelhub.com",
        "GOMODELHUB_API_KEY": "gk-你的平台Key",
        "GOMODELHUB_DEFAULT_MODEL": "hyper3d"
      }
    }
  }
}
```

完整示例见 [`examples/mcp.local.json`](./examples/mcp.local.json)。保存后在 MCP 面板 **Refresh**。

### 3. 本地图片图生

```json
{
  "model": "v3.1-20260211",
  "imagePath": "D:/photos/chair.jpg",
  "mode": "image"
}
```

支持 jpg / png / webp，单文件 ≤ 50MB。

---

## 对比

| | Remote MCP | 本地 MCP |
|--|------------|----------|
| 安装 | 无需 | `npm install -g .` |
| 文生 3D | ✅ | ✅ |
| 公网 image URL | ✅ | ✅ |
| 本地 imagePath | ❌ | ✅ |

---

## 故障排查

| 现象 | 处理 |
|------|------|
| disconnected | 确认已全局安装，终端能找到 `gomodelhub-3d-mcp` |
| Missing GOMODELHUB_BASE_URL | 检查 `mcp.json` 的 `env` |
| model is required | 配置 `GOMODELHUB_DEFAULT_MODEL` / `X-GoModelHub-Default-Model`，或在 tool 里传 `model` |
| HTTP 401 / 403 | Key 无效或额度不足 |
| Remote 图生失败 | 勿用 `imagePath`，改用公网 `image` URL 或本地 MCP |

## License

MIT — 见 [LICENSE](./LICENSE)。
