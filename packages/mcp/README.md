# @app-cn/mcp

The **appCN MCP server** — gives AI coding agents (Claude Code, Cursor, Windsurf,
Codex, …) first-class access to the [appCN](https://appcn.vercel.app) React Native
component library. Agents can discover components, read their full docs (anatomy,
the delight detail, props, usage examples, a11y notes), get the exact install
command, and learn appCN's motion/haptic design tokens — so the code they write
matches the system instead of guessing.

It reads from the live appCN registry (`https://appcn.vercel.app/r`), so it always
reflects the latest published components — nothing to update on your side.

## Install

### Claude Code

```bash
claude mcp add appcn -- npx -y @app-cn/mcp
```

### Cursor / Windsurf (`mcp.json`)

```jsonc
{
  "mcpServers": {
    "appcn": {
      "command": "npx",
      "args": ["-y", "@app-cn/mcp"]
    }
  }
}
```

### VS Code (`.vscode/mcp.json`)

```jsonc
{
  "servers": {
    "appcn": {
      "command": "npx",
      "args": ["-y", "@app-cn/mcp"]
    }
  }
}
```

## Tools

| Tool | What it does |
| :-- | :-- |
| `list_components` | List every appCN component (optionally filtered to `base` or `ai`), with its one-line delight detail. |
| `search_components` | Find components by intent — e.g. "chat input", "voice indicator". |
| `get_component` | Full payload for one component: docs, source files, npm + registry dependencies, and the install command. |
| `get_install_command` | The exact command to add a component (appCN CLI, shadcn URL, or namespaced), per package manager. |
| `get_design_guide` | appCN's taste layer — motion/haptic tokens and the house rules — so generated code feels like appCN. |

## Configuration

| Env var | Default | Purpose |
| :-- | :-- | :-- |
| `APPCN_REGISTRY_URL` | `https://appcn.vercel.app/r` | Point the server at a different (e.g. local) registry. |

## How it relates to the shadcn MCP

appCN is a standard shadcn-compatible registry, so shadcn's own MCP can install
appCN components too (register `"@app-cn"` in your `components.json`). What this
server adds on top is the appCN-specific knowledge shadcn's generic registry JSON
doesn't carry: the delight detail, usage examples, a11y notes, and the motion/haptic
design guide — the things that make agent-authored code feel like appCN.

## License

MIT
