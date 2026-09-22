# GoModelHub 3D MCP

MCP-Server für die GoModelHub 3D-Generierungs-API — Verwendung in **Cursor** und anderen AI-Agents mit natürlicher Sprache.

[English](./README.md) · [中文文檔](./README.zh-TW.md) · [日本語](./README.ja.md) · [Deutsch](./README.de.md) · [Bug melden](https://github.com/kelouer/GoModelHub-MCP/issues) · [Deploy-Anleitung](./DEPLOY-BAOTA.md)

---

## Funktionen

- **Zero-Config Remote MCP** — Streamable HTTP, keine lokale Installation erforderlich
- **Lokaler stdio MCP** — unterstützt lokales `imagePath` für Bild-zu-3D
- **3 Tools** — `generate_3d`, `get_3d_status`, `generate_3d_and_wait`
- **Plattformübergreifend** — Windows / macOS / Linux

## Tools

| Tool | Beschreibung |
|:-----|:-------------|
| `generate_3d` | 3D-Job senden; gibt `taskId` zurück |
| `get_3d_status` | Task-Status abfragen |
| `generate_3d_and_wait` | Senden und bis zum Abschluss pollen (empfohlen) |

## Voraussetzungen

- **Node.js 18+**
- Plattform-API-Key (`gk-` / `sk-`) — von [GoModelHub](https://login.gomodelhub.com) abrufen
- **modelCode** aus dem Model Marketplace (z.B. `hyper3d`)

---

## Standardmodell

| Modus | Ort | Beispiel |
|:------|:----|:---------|
| Remote MCP | `headers` | `"X-GoModelHub-Default-Model": "hyper3d"` |
| Lokaler MCP | `env` | `"GOMODELHUB_DEFAULT_MODEL": "hyper3d"` |

Verwende den modelCode aus dem Model Marketplace (kein `tp-`-Präfix).

---

## Option 1: Remote MCP (empfohlen, ohne Installation)

> Remote MCP unterstützt **kein** lokales `imagePath`. Für Bild-zu-3D eine öffentliche `image`-URL verwenden.

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

Siehe [`examples/mcp.remote.json`](./examples/mcp.remote.json).

---

## Option 2: Lokaler MCP (unterstützt imagePath)

### Installation

```bash
git clone https://github.com/kelouer/GoModelHub-MCP.git
cd GoModelHub-MCP
npm install
npm install -g .
```

<details>
<summary>Alternative Installationsskripte</summary>

| OS | Befehl |
|:---|:-------|
| Windows | `powershell -ExecutionPolicy Bypass -File scripts/install-global.ps1` |
| macOS / Linux | `bash scripts/install-global.sh` |

Überprüfen: `where gomodelhub-3d-mcp` (Windows) oder `which gomodelhub-3d-mcp`.
</details>

### Konfiguration

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

Siehe [`examples/mcp.local.json`](./examples/mcp.local.json). Speichern und **Refresh**.

### Lokales Bild-zu-3D

```json
{ "model": "v3.1-20260211", "imagePath": "D:/photos/chair.jpg", "mode": "image" }
```

Unterstützt jpg / png / webp, max. 50MB.

---

## Vergleich

| | Remote MCP | Lokaler MCP |
|:--|:-----------|:------------|
| Installation | Keine | `npm install -g .` |
| Text-zu-3D | ✅ | ✅ |
| Öffentliche `image`-URL | ✅ | ✅ |
| Lokales `imagePath` | ❌ | ✅ |

---

## Fehlerbehebung

| Symptom | Lösung |
|:--------|:-------|
| `disconnected` | Sicherstellen, dass `gomodelhub-3d-mcp` im PATH ist |
| `Missing GOMODELHUB_BASE_URL` | `env` in `mcp.json` prüfen |
| `model is required` | Standardmodell setzen oder `model` im Aufruf übergeben |
| HTTP 401 / 403 | Ungültiger Key oder unzureichendes Kontingent |
| Remote Bild-zu-3D schlägt fehl | Öffentliche `image`-URL oder lokalen MCP verwenden |

---

## License

MIT — siehe [LICENSE](./LICENSE).
