# GoModelHub 3D MCP

GoModelHub 3D 生成 API 的 MCP 服务，供 **Cursor** 等 Agent 以自然语言调用。

| Tool | 说明 |
|------|------|
| `generate_3d` | 提交 3D 任务，返回 `taskId` |
| `get_3d_status` | 查询任务状态 |
| `generate_3d_and_wait` | 提交并轮询至完成（推荐） |

需要 **Node.js 18+** 与平台 API Key（`gk-` / `sk-`）。

[English](./README.md)

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
        "Authorization": "Bearer gk-你的平台Key"
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
        "GOMODELHUB_API_KEY": "gk-你的平台Key"
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

## 本地调试

```powershell
$env:GOMODELHUB_BASE_URL = "https://login.gomodelhub.com"
$env:GOMODELHUB_API_KEY = "gk-xxxx"
npm run inspector
```

## 平台部署 Remote MCP

服务器上 `npm install` 后运行 HTTP 服务（默认 `127.0.0.1:3110`，路径 `/mcp/3d`）：

```bash
GOMODELHUB_BASE_URL=http://127.0.0.1:8888 npm run start:http
```

经 Nginx 反代到 `https://login.gomodelhub.com/mcp/3d`。健康检查：`GET /mcp/3d/health`。

---

## 故障排查

| 现象 | 处理 |
|------|------|
| disconnected | 确认已全局安装，终端能找到 `gomodelhub-3d-mcp` |
| Missing GOMODELHUB_BASE_URL | 检查 `mcp.json` 的 `env` |
| HTTP 401 / 403 | Key 无效或额度不足 |
| Remote 图生失败 | 勿用 `imagePath`，改用公网 `image` URL 或本地 MCP |

## License

MIT — 见 [LICENSE](./LICENSE)。
