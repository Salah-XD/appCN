import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { getCatalog } from "../lib/catalog";
import { errorResult, json } from "../lib/result";

export function registerGetDesignGuide(server: McpServer) {
  server.registerTool(
    "get_design_guide",
    {
      title: "Get the appCN design guide",
      description:
        "appCN's taste layer: the motion duration/easing/spring tokens, the press-scale and haptics conventions, the variant API rules, accessibility requirements, and the explicit 'what NOT to do' list. Read this before writing or modifying any React Native component so the code feels like appCN — never hand-type durations or easings, reach for these tokens.",
      inputSchema: {},
    },
    async () => {
      try {
        const catalog = await getCatalog();
        return json(catalog.designGuide);
      } catch (err) {
        return errorResult(
          `Could not load the appCN design guide: ${(err as Error).message}`,
        );
      }
    },
  );
}
