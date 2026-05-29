import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { getCatalog, type CatalogComponent } from "../lib/catalog";
import { errorResult, json } from "../lib/result";

/** Field-weighted keyword score. Higher weight = a hit there matters more. */
function scoreComponent(component: CatalogComponent, terms: string[]): number {
  const fields: Array<{ text: string; weight: number }> = [
    { text: component.slug, weight: 5 },
    { text: component.title, weight: 5 },
    { text: component.description, weight: 3 },
    { text: component.delight, weight: 2 },
    { text: component.anatomy, weight: 1 },
    { text: component.category, weight: 1 },
  ];
  let score = 0;
  for (const term of terms) {
    for (const { text, weight } of fields) {
      if (text.toLowerCase().includes(term)) score += weight;
    }
  }
  return score;
}

export function registerSearchComponents(server: McpServer) {
  server.registerTool(
    "search_components",
    {
      title: "Search appCN components",
      description:
        "Find appCN components by intent or keyword — e.g. 'chat input', 'voice indicator', 'streaming message', 'reasoning'. Returns ranked matches with their delight detail. Use get_component on the best match for the full source and docs.",
      inputSchema: {
        query: z
          .string()
          .min(1)
          .describe("What you're looking for, in plain words (intent or keywords)."),
      },
    },
    async ({ query }) => {
      try {
        const catalog = await getCatalog();
        const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
        const matches = catalog.components
          .map((c) => ({ component: c, score: scoreComponent(c, terms) }))
          .filter((m) => m.score > 0)
          .sort((a, b) => b.score - a.score)
          .map(({ component, score }) => ({
            slug: component.slug,
            title: component.title,
            category: component.category,
            description: component.description,
            delight: component.delight,
            score,
          }));

        if (matches.length === 0) {
          return json({
            query,
            matches: [],
            hint: "No keyword matches. Call list_components to browse the full catalog.",
          });
        }
        return json({ query, count: matches.length, matches });
      } catch (err) {
        return errorResult(
          `Could not search the appCN catalog: ${(err as Error).message}`,
        );
      }
    },
  );
}
