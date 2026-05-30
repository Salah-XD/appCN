---
"@app-cn/mcp": patch
---

Report the MCP server version from `package.json` instead of a hardcoded constant, so `serverInfo.version` (and the `server.json` the registry publishes) never drifts from the published npm version.
