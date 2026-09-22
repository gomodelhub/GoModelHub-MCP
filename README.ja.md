# GoModelHub 3D MCP

GoModelHub 3D 生成 API の MCP サーバー — **Cursor** などの AI Agent で自然言語による呼び出しが可能です。

[English](./README.md) · [中文文檔](./README.zh-TW.md) · [日本語](./README.ja.md) · [Deutsch](./README.de.md) · [バグ報告](https://github.com/kelouer/GoModelHub-MCP/issues) · [デプロイガイド](./DEPLOY-BAOTA.md)

---

## 特徴

- **ゼロ設定 Remote MCP** — Streamable HTTP、ローカルインストール不要
- **ローカル stdio MCP** — ローカル `imagePath` による画像→3D に対応
- **3つのツール** — `generate_3d`、`get_3d_status`、`generate_3d_and_wait`
- **クロスプラットフォーム** — Windows / macOS / Linux

## ツール一覧

| ツール | 説明 |
|:-------|:-----|
| `generate_3d` | 3D ジョブを送信し、`taskId` を返します |
| `get_3d_status` | タスクのステータスを照会します |
| `generate_3d_and_wait` | 送信から完了までポーリング（推奨） |

## 前提条件

- **Node.js 18+**
- プラットフォーム API Key（`gk-` / `sk-`）— [GoModelHub](https://login.gomodelhub.com) から取得
- モデルマーケットの **modelCode**（例: `hyper3d`）

---

## デフォルトモデルの設定

| 方式 | 設定場所 | 例 |
|:-----|:---------|:---|
| Remote MCP | `headers` | `"X-GoModelHub-Default-Model": "hyper3d"` |
| ローカル MCP | `env` | `"GOMODELHUB_DEFAULT_MODEL": "hyper3d"` |

モデルマーケットの modelCode を指定してください（`tp-` プレフィックスは不要）。

---

## 方式1: Remote MCP（推奨、インストール不要）

> Remote MCP はローカル `imagePath` を**サポートしていません**。画像→3D には公開 `image` URL を使用してください。

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

[`examples/mcp.remote.json`](./examples/mcp.remote.json) を参照。

---

## 方式2: ローカル MCP（imagePath 対応）

### インストール

```bash
git clone https://github.com/kelouer/GoModelHub-MCP.git
cd GoModelHub-MCP
npm install
npm install -g .
```

<details>
<summary>その他のインストール方法</summary>

| OS | コマンド |
|:---|:--------|
| Windows | `powershell -ExecutionPolicy Bypass -File scripts/install-global.ps1` |
| macOS / Linux | `bash scripts/install-global.sh` |

確認: `where gomodelhub-3d-mcp`（Windows）または `which gomodelhub-3d-mcp`。
</details>

### 設定

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

[`examples/mcp.local.json`](./examples/mcp.local.json) を参照。保存後 **Refresh**。

### ローカル画像→3D

```json
{ "model": "v3.1-20260211", "imagePath": "D:/photos/chair.jpg", "mode": "image" }
```

jpg / png / webp 対応、最大 50MB。

---

## 比較

| | Remote MCP | ローカル MCP |
|:--|:-----------|:-------------|
| インストール | 不要 | `npm install -g .` |
| テキスト→3D | ✅ | ✅ |
| 公開 image URL | ✅ | ✅ |
| ローカル imagePath | ❌ | ✅ |

---

## トラブルシューティング

| 現象 | 対処 |
|:-----|:-----|
| `disconnected` | `gomodelhub-3d-mcp` が PATH に通っているか確認 |
| `Missing GOMODELHUB_BASE_URL` | `mcp.json` の `env` を確認 |
| `model is required` | デフォルトモデルを設定、または tool 呼び出しで `model` を指定 |
| HTTP 401 / 403 | Key 無効またはクォータ不足 |
| Remote 画像→3D 失敗 | 公開 `image` URL またはローカル MCP を使用 |

---

## License

MIT — [LICENSE](./LICENSE) を参照。
