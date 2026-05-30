import { readFileSync } from "node:fs";

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { REGISTRY_BASE_URL } from "./lib/catalog";
import { registerGetComponent } from "./tools/get-component";
import { registerGetDesignGuide } from "./tools/get-design-guide";
import { registerGetInstallCommand } from "./tools/get-install-command";
import { registerListComponents } from "./tools/list-components";
import { registerSearchComponents } from "./tools/search-components";

// Read straight from package.json so the reported version never drifts from the
// published package (tsup bundles to dist/, package.json sits one level up).
const SERVER_VERSION = JSON.parse(
  readFileSync(new URL("../package.json", import.meta.url), "utf8"),
).version as string;

async function main() {
  const server = new McpServer({
    name: "appcn",
    version: SERVER_VERSION,
  });

  registerListComponents(server);
  registerSearchComponents(server);
  registerGetComponent(server);
  registerGetInstallCommand(server);
  registerGetDesignGuide(server);

  const transport = new StdioServerTransport();
  await server.connect(transport);

  // stdout is the JSON-RPC channel — log to stderr only.
  console.error(`appCN MCP server ready (registry: ${REGISTRY_BASE_URL})`);
}

main().catch((err) => {
  console.error("Fatal error starting appCN MCP server:", err);
  process.exit(1);
});
