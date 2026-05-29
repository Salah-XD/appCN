import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { REGISTRY_BASE_URL } from "./lib/catalog";
import { registerGetComponent } from "./tools/get-component";
import { registerGetDesignGuide } from "./tools/get-design-guide";
import { registerGetInstallCommand } from "./tools/get-install-command";
import { registerListComponents } from "./tools/list-components";
import { registerSearchComponents } from "./tools/search-components";

// Kept in sync with package.json manually (the CLI does the same).
const SERVER_VERSION = "0.1.0";

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
