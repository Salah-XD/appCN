---
"@app-cn/mcp": minor
---

Add `@app-cn/mcp` — the appCN Model Context Protocol server. It gives AI coding
agents (Claude Code, Cursor, Windsurf, Codex) first-class access to appCN: five
tools to list, search, fetch (`get_component`), and install components, plus
`get_design_guide` so generated React Native code matches appCN's motion/haptic
tokens and house rules. The server live-fetches the published registry (like the
CLI), backed by a new `/r/catalog.json` endpoint on the docs site.
