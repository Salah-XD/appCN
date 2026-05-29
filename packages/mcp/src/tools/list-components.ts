import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { getCatalog } from "../lib/catalog";
import { errorResult, json } from "../lib/result";

export function registerListComponents(server: McpServer) {
  server.registerTool(
    "list_components",
    {
      title: "List appCN components",
      description:
        "List every appCN component, optionally filtered by category. Returns each component's slug, title, category, one-line description, and its signature 'delight' detail. Start here to see what's available, then call get_component for the full source and docs.",
      inputSchema: {
        category: z
          .enum(["base", "ai"])
          .optional()
          .describe(
            "Filter to 'base' (the broad mobile library) or 'ai' (the featured AI-native collection). Omit for all.",
          ),
      },
    },
    async ({ category }) => {
      try {
        const catalog = await getCatalog();
        const components = catalog.components
          .filter((c) => !category || c.category === category)
          .map((c) => ({
            slug: c.slug,
            title: c.title,
            category: c.category,
            description: c.description,
            delight: c.delight,
          }));
        return json({ count: components.length, components });
      } catch (err) {
        return errorResult(
          `Could not load the appCN catalog: ${(err as Error).message}`,
        );
      }
    },
  );
}
