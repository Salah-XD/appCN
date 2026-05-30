# @app-cn/mcp

## 0.1.2

### Patch Changes

- [#8](https://github.com/Salah-XD/appCN/pull/8) [`8226ddb`](https://github.com/Salah-XD/appCN/commit/8226ddbc0a24f06df5836bcd758287194073a82c) Thanks [@Salah-XD](https://github.com/Salah-XD)! - Report the MCP server version from `package.json` instead of a hardcoded constant, so `serverInfo.version` (and the `server.json` the registry publishes) never drifts from the published npm version.

## 0.1.1

### Patch Changes

- [#5](https://github.com/Salah-XD/appCN/pull/5) [`c8e144f`](https://github.com/Salah-XD/appCN/commit/c8e144fa948531b6aeafac9db31f731096de1bad) Thanks [@Salah-XD](https://github.com/Salah-XD)! - Add the `mcpName` field (`digital.shineup/appcn`) so the package can be verified and listed on the official MCP Registry.

## 0.1.0

### Minor Changes

- [#3](https://github.com/Salah-XD/appCN/pull/3) [`33fbad1`](https://github.com/Salah-XD/appCN/commit/33fbad13cc37131cc4303a2fbdef5f75ce95e8f6) Thanks [@Salah-XD](https://github.com/Salah-XD)! - Add `@app-cn/mcp` — the appCN Model Context Protocol server. It gives AI coding
  agents (Claude Code, Cursor, Windsurf, Codex) first-class access to appCN: five
  tools to list, search, fetch (`get_component`), and install components, plus
  `get_design_guide` so generated React Native code matches appCN's motion/haptic
  tokens and house rules. The server live-fetches the published registry (like the
  CLI), backed by a new `/r/catalog.json` endpoint on the docs site.
