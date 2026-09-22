# GoModelHub 3D MCP

GoModelHub 3D 生成 API 的 MCP 服務 — 供 **Cursor** 等 AI Agent 以自然語言呼叫。

[English](./README.md) · [中文文檔](./README.zh-TW.md) · [日本語](./README.ja.md) · [Deutsch](./README.de.md) · [問題回報](https://github.com/kelouer/GoModelHub-MCP/issues) · [部署指南](./DEPLOY-BAOTA.md)

---

## 特性

- **零配置 Remote MCP** — Streamable HTTP，無需本機安裝
- **本機 stdio MCP** — 支援本機 `imagePath` 圖生 3D
- **3 個工具** — `generate_3d`、`get_3d_status`、`generate_3d_and_wait`
- **跨平台** — Windows / macOS / Linux

## 工具

| 工具 | 說明 |
|:-----|:-----|
| `generate_3d` | 提交 3D 工作，回傳 `taskId` |
| `get_3d_status` | 查詢工作狀態 |
| `generate_3d_and_wait` | 提交並輪詢至完成（推薦） |

## 前置條件

- **Node.js 18+**
- 平台 API Key（`gk-` / `sk-`）— 從 [GoModelHub](https://login.gomodelhub.com) 取得
- 模型市集的 **modelCode**（例如 `hyper3d`）

---

## 預設模型

| 模式 | 位置 | 範例 |
|:-----|:-----|:-----|
| Remote MCP | `headers` | `"X-GoModelHub-Default-Model": "hyper3d"` |
| 本機 MCP | `env` | `"GOMODELHUB_DEFAULT_MODEL": "hyper3d"` |

填模型市集顯示的 modelCode，不加 `tp-` 前綴。

---

## 方式一：Remote MCP（推薦，零安裝）

> Remote MCP **不支援**本機 `imagePath`，圖生請用公網 `image` URL。

```json
{
  "mcpServers": {
    "gomodelhub-3d": {
      "url": "https://login.gomodelhub.com/mcp/3d",
      "headers": {
        "Authorization": "Bearer gk-你的Key",
        "X-GoModelHub-Default-Model": "hyper3d"
      }
    }
  }
}
```

參見 [`examples/mcp.remote.json`](./examples/mcp.remote.json)。

---

## 方式二：本機 MCP（支援 imagePath）

### 安裝

```bash
git clone https://github.com/kelouer/GoModelHub-MCP.git
cd GoModelHub-MCP
npm install
npm install -g .
```

<details>
<summary>其他安裝指令</summary>

| 系統 | 指令 |
|:-----|:-----|
| Windows | `powershell -ExecutionPolicy Bypass -File scripts/install-global.ps1` |
| macOS / Linux | `bash scripts/install-global.sh` |

驗證：`where gomodelhub-3d-mcp`（Windows）或 `which gomodelhub-3d-mcp`。
</details>

### 設定

```json
{
  "mcpServers": {
    "gomodelhub-3d": {
      "command": "gomodelhub-3d-mcp",
      "env": {
        "GOMODELHUB_BASE_URL": "https://login.gomodelhub.com",
        "GOMODELHUB_API_KEY": "gk-你的Key",
        "GOMODELHUB_DEFAULT_MODEL": "hyper3d"
      }
    }
  }
}
```

參見 [`examples/mcp.local.json`](./examples/mcp.local.json)。儲存後 **Refresh**。

### 本機圖片圖生 3D

```json
{ "model": "v3.1-20260211", "imagePath": "D:/photos/chair.jpg", "mode": "image" }
```

支援 jpg / png / webp，最大 50MB。

---

## 比較

| | Remote MCP | 本機 MCP |
|:--|:-----------|:---------|
| 安裝 | 免安裝 | `npm install -g .` |
| 文生 3D | ✅ | ✅ |
| 公網 `image` URL | ✅ | ✅ |
| 本機 `imagePath` | ❌ | ✅ |

---

## 故障排查

| 現象 | 處理方式 |
|:-----|:---------|
| `disconnected` | 確認 `gomodelhub-3d-mcp` 已在 PATH 中 |
| `Missing GOMODELHUB_BASE_URL` | 檢查 `mcp.json` 的 `env` |
| `model is required` | 設定預設模型，或在呼叫時帶入 `model` |
| HTTP 401 / 403 | Key 無效或額度不足 |
| Remote 圖生失敗 | 改用公網 `image` URL 或本機 MCP |

---

## License

MIT — 參見 [LICENSE](./LICENSE)。
